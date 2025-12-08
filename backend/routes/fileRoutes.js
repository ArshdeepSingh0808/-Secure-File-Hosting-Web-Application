const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const File = require('../models/File');
const dotenv = require('dotenv');
dotenv.config();

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const maxSizeBytes = (Number(process.env.MAX_FILE_SIZE_MB) || 20) * 1024 * 1024;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = crypto.randomBytes(8).toString('hex');
    cb(null, `${Date.now()}-${base}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.mp4'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    return cb(new Error('Only .pdf and .mp4 files are allowed'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: maxSizeBytes },
  fileFilter
}).single('file');

router.post('/upload', auth, (req, res) => {
  upload(req, res, async function (err) {
    try {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File too large (max 20 MB)' });
        }
        return res.status(400).json({ message: err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }

      const { privacy } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: 'File is required' });
      }
      if (!['public', 'private'].includes(privacy)) {
        return res.status(400).json({ message: 'Invalid privacy option' });
      }

      const shareId = crypto.randomBytes(12).toString('hex');

      const fileDoc = await File.create({
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        privacy,
        uploaded_by: req.user.id,
        shareId
      });

      res.status(201).json({
        message: 'File uploaded successfully',
        file: {
          id: fileDoc._id,
          originalName: fileDoc.originalName,
          privacy: fileDoc.privacy,
          size: fileDoc.size,
          uploaded_at: fileDoc.uploaded_at,
          shareId: fileDoc.shareId
        }
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Server error' });
    }
  });
});

router.get('/public-files', async (req, res) => {
  try {
    const files = await File.find({ privacy: 'public' })
      .populate('uploaded_by', 'username')
      .sort({ uploaded_at: -1 });

    const result = files.map((f) => ({
      id: f._id,
      filename: f.originalName,
      size: f.size,
      uploaded_at: f.uploaded_at,
      uploader: f.uploaded_by?.username || 'Unknown'
    }));

    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/my-files', auth, async (req, res) => {
  try {
    const files = await File.find({ uploaded_by: req.user.id }).sort({ uploaded_at: -1 });

    const result = files.map((f) => ({
      id: f._id,
      filename: f.originalName,
      size: f.size,
      uploaded_at: f.uploaded_at,
      privacy: f.privacy,
      shareLink: `${process.env.CLIENT_URL}/api/files/${f._id}/download?share=${f.shareId}`
    }));

    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/files/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const { share } = req.query;

    const fileDoc = await File.findById(id).populate('uploaded_by');
    if (!fileDoc) return res.status(404).json({ message: 'File not found' });

    if (fileDoc.privacy === 'public') {
      return res.download(fileDoc.path, fileDoc.originalName);
    }

    const authHeader = req.headers['authorization'];
    let userId = null;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (_) {}
    }

    const isOwner = userId && userId.toString() === fileDoc.uploaded_by._id.toString();
    const hasShare = share && share === fileDoc.shareId;

    if (!isOwner && !hasShare) {
      return res.status(403).json({ message: 'Not allowed to download this file' });
    }

    return res.download(fileDoc.path, fileDoc.originalName);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/files/:id', auth, async (req, res) => {
  try {
    const fileDoc = await File.findById(req.params.id);
    if (!fileDoc) return res.status(404).json({ message: 'File not found' });

    if (fileDoc.uploaded_by.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can delete only your own files' });
    }

    if (fs.existsSync(fileDoc.path)) {
      fs.unlinkSync(fileDoc.path);
    }

    await File.deleteOne({ _id: fileDoc._id });
    res.json({ message: 'File deleted successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;