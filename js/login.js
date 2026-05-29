/* ================================
   Login JS
   ================================ */

   const BASE_URL = 'http://127.0.0.1:8000';

   function handleLogin() {
     const username = document.getElementById('username').value.trim();
     const password = document.getElementById('password').value.trim();
   
     if (!username || !password) {
       alert('아이디와 비밀번호를 입력해주세요.');
       return;
     }
   
     fetch(`${BASE_URL}/api/auth/login/`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ username, password })
     })
     .then(res => res.json())
     .then(data => {
       if (data.status === 'success') {
         localStorage.setItem('token', data.data.access_token);
         localStorage.setItem('user', JSON.stringify({
           id:       data.data.user_id,
           nickname: data.data.nickname,
           school:   data.data.school,
           email:    data.data.email
         }));
         const base = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
         window.location.href = base + 'home.html';
       } else {
         alert(data.message || '로그인에 실패했습니다.');
       }
     })
     .catch(() => alert('서버 연결에 실패했습니다.'));
   }
   
   document.addEventListener('keydown', (e) => {
     if (e.key === 'Enter') handleLogin();
   });