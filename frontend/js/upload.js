redirectIfNotLoggedIn();

const uploadForm = document.getElementById('uploadForm');
const msgEl = document.getElementById('message');

uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  msgEl.textContent = '';
  msgEl.className = '';

  const fileInput = document.getElementById('file');
  const privacy = document.getElementById('privacy').value;

  if (!fileInput.files.length) {
    msgEl.textContent = 'Please choose a file';
    msgEl.className = 'error';
    return;
  }

  const file = fileInput.files[0];
  const ext = file.name.split('.').pop().toLowerCase();
  const allowed = ['pdf', 'mp4'];

  if (!allowed.includes(ext)) {
    msgEl.textContent = 'Only .pdf or .mp4 allowed';
    msgEl.className = 'error';
    return;
  }
  if (file.size > 20 * 1024 * 1024) {
    msgEl.textContent = 'File too large (max 20 MB)';
    msgEl.className = 'error';
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
      msgEl.className = 'error';
    } else {
      msgEl.textContent = 'File uploaded successfully!';
      msgEl.className = 'success';
      uploadForm.reset();
    }
  } catch (err) {
    msgEl.textContent = 'Network error';
    msgEl.className = 'error';
  }
});