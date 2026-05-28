/* ================================
   Signup Nickname JS
   ================================ */

   function handleNicknameNext() {
    const nickname = document.getElementById('nickname').value.trim();
  
    if (nickname.length < 2) {
      alert('닉네임은 두 글자 이상이어야합니다.');
      return;
    }
  
    // 세션에 닉네임 임시 저장
    sessionStorage.setItem('signup_nickname', nickname);
  
    // 학교 선택 페이지로 이동
    window.location.href = 'signup-school.html';
  }
  
  document.getElementById('nickname').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleNicknameNext();
  });