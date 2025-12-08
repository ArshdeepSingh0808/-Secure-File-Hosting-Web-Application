function redirectIfNotLoggedIn() {
  if (!getToken()) {
    window.location.href = 'login.html';
  }
}

function redirectIfLoggedIn() {
  if (getToken()) {
    window.location.href = 'upload.html';
  }
}

function logout() {
  clearToken();
  window.location.href = 'login.html';
}