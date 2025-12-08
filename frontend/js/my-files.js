redirectIfNotLoggedIn();

const tbody = document.querySelector('#filesTable tbody');
const msgEl = document.getElementById('message');

async function loadMyFiles() {
  msgEl.textContent = 'Loading...';
  tbody.innerHTML = '';
  try {
    const res = await authFetch(API_BASE + '/my-files');
    const data = await res.json();
    if (!res.ok) {
      msgEl.textContent = data.message || 'Failed to load';
      return;
    }
    msgEl.textContent = '';
    if (!data.length) {
      msgEl.textContent = 'No files uploaded yet.';
      return;
    }

    data.forEach((file) => {
      const tr = document.createElement('tr');

      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const dateStr = new Date(file.uploaded_at).toLocaleString();

      tr.innerHTML = `
        <td>${file.filename}</td>
        <td>${file.privacy}</td>
        <td>${sizeMB}</td>
        <td>${dateStr}</td>
        <td>${file.privacy === 'private' ? `<input type="text" value="${file.shareLink}" readonly class="share-link">` : ''}</td>
        <td>
          <button class="download-btn" data-id="${file.id}">Download</button>
          <button class="delete-btn" data-id="${file.id}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    msgEl.textContent = 'Network error';
  }
}

tbody.addEventListener('click', async (e) => {
  const id = e.target.getAttribute('data-id');
  if (!id) return;

  if (e.target.classList.contains('download-btn')) {
    const token = getToken();
    const url = API_BASE + `/files/${id}/download`;
    window.location.href = url + (token ? `?token=${encodeURIComponent(token)}` : '');
  }

  if (e.target.classList.contains('delete-btn')) {
    if (!confirm('Delete this file?')) return;
    try {
      const res = await authFetch(API_BASE + `/files/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Delete failed');
      } else {
        alert('Deleted');
        loadMyFiles();
      }
    } catch (err) {
      alert('Network error');
    }
  }
});

loadMyFiles();