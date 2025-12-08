redirectIfNotLoggedIn();

const uploadForm = document.getElementById('uploadForm');
const msgEl = document.getElementById('message');

uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  msgEl.textContent = '';

  const fileInput = document.getElementById('file');
  const privacy = document.getElementById('privacy').value;

  if (!fileInput.files.length) {
    msgEl.textContent = 'Please choose a file';
    return;
  }

  const file = fileInput.files[0];
  const ext = file.name.split('.').pop().toLowerCase();
  const allowed = ['pdf', 'mp4'];

  if (!allowed.includes(ext)) {
    msgEl.textContent = 'Only .pdf or .mp4 allowed';
    return;
  }
  if (file.size > 20 * 1024 * 1024) {
    msgEl.textContent = 'File too large (max 20 MB)';
    return;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('privacy', privacy);

  try {
    const res = await authFetch(API_BASE + '/upload', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (!res.ok) {
      msgEl.textContent = data.message || 'Upload failed';
    } else {
      msgEl.textContent = 'File uploaded successfully';
      uploadForm.reset();
    }
  } catch (err) {
    msgEl.textContent = 'Network error';
  }
});