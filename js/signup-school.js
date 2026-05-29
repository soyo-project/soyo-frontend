/* ================================
   Signup School JS
   ================================ */

   const BASE_URL = 'http://127.0.0.1:8000';

   let selectedSchool = null;
   
   function selectSchool(btn) {
     document.querySelectorAll('.school-btn').forEach(b => b.classList.remove('selected'));
     btn.classList.add('selected');
     selectedSchool = btn.dataset.school;
     document.getElementById('nextBtn').disabled = false;
   }
   
   function handleSchoolNext() {
     if (!selectedSchool) return;
   
     const username = sessionStorage.getItem('signup_username');
     const email    = sessionStorage.getItem('signup_email');
     const password = sessionStorage.getItem('signup_password');
     const nickname = sessionStorage.getItem('signup_nickname');
   
     fetch(`${BASE_URL}/api/auth/signup/`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ username, email, password, nickname, school: selectedSchool })
     })
     .then(res => res.json())
     .then(data => {
       if (data.status === 'success') {
         sessionStorage.removeItem('signup_username');
         sessionStorage.removeItem('signup_email');
         sessionStorage.removeItem('signup_password');
         sessionStorage.removeItem('signup_nickname');
         // 회원가입 후 로그인 페이지로 이동
         window.location.href = './login.html';
       } else {
         alert(data.message || '회원가입에 실패했습니다.');
       }
     })
     .catch(() => alert('서버 연결에 실패했습니다.'));
   }