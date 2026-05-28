/* ================================
   Signup School JS
   ================================ */

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
   
     // 백엔드 연동 전 임시: localStorage에 저장 후 홈으로
     // TODO: 백엔드 연동 시 아래 fetch로 교체
     // fetch('/api/auth/signup', {
     //   method: 'POST',
     //   headers: { 'Content-Type': 'application/json' },
     //   body: JSON.stringify({ username, email, password, nickname, school: selectedSchool })
     // })
   
     const user = { id: 'me', username, email, nickname, school: selectedSchool };
     localStorage.setItem('token', 'dev-token');
     localStorage.setItem('user', JSON.stringify(user));
   
     // sessionStorage 정리
     sessionStorage.removeItem('signup_username');
     sessionStorage.removeItem('signup_email');
     sessionStorage.removeItem('signup_password');
     sessionStorage.removeItem('signup_nickname');
   
     window.location.href = './home.html';
   }