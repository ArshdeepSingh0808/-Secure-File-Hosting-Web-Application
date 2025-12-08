const tbodyPublic = document.querySelector('#publicTable tbody');
const msgPublic = document.getElementById('message');

async function loadPublic() {
  msgPublic.textContent = 'Loading...';
  tbodyPublic.innerHTML = '';
  try {
    const res = await fetch(API_BASE + '/public-files');
    const data = await res.json();
    if (!res.ok) {
      msgPublic.textContent = data.message || 'Failed to load';
      return;
    }
    msgPublic.textContent = '';
    if (!data.length) {
      msgPublic.textContent = 'No public files yet.';
      return;
    }

    data.forEach((file) => {
      const tr = document.createElement('tr');
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const dateStr = new Date(file.uploaded_at).toLocaleString();

      tr.innerHTML = `
        <td>${file.filename}</td>
        <td>${file.uploader}</td>
        <td>${sizeMB}</td>
        <td>${dateStr}</td>
        <td><a href="${API_BASE}/files/${file.id}/download">Download</a></td>
      `;
      tbodyPublic.appendChild(tr);
    });
  } catch (err) {
    msgPublic.textContent = 'Network error';
  }
}

loadPublic();