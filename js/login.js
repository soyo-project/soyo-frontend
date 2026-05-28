/* ================================
   Login JS
   ================================ */

   function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
  
    if (!username || !password) {
      alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }
  
    const user = { id: 'me', nickname: '닉네임', school: '삼육대학교' };
    localStorage.setItem('token', 'dev-token');
    localStorage.setItem('user', JSON.stringify(user));
  
    const currentUrl = window.location.href;
    const homeUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/') + 1) + 'home.html';
    window.location.href = homeUrl;
  }
  
  // 엔터키로 로그인
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
  });