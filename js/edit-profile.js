/* ================================
   Edit Profile JS
   ================================ */

   const DEFAULT_PROFILE = '../default-profile.jpeg';
   let selectedSchool = '';
   let newImageBase64 = null;
   
   // 기존 데이터 로드
   window.addEventListener('DOMContentLoaded', () => {
     const user = JSON.parse(localStorage.getItem('user') || '{}');
   
     // 닉네임
     document.getElementById('nicknameInput').value = user.nickname || '닉네임';
   
     // 프로필 사진
     const avatar = user.avatar || DEFAULT_PROFILE;
     document.getElementById('profilePreview').src = avatar;
   
     // 학교
     selectedSchool = user.school || '삼육대학교';
     document.querySelectorAll('.school-btn').forEach(btn => {
       btn.classList.toggle('active', btn.dataset.school === selectedSchool);
     });
   });
   
   // 닉네임 수정 활성화
   function enableEdit() {
     const input = document.getElementById('nicknameInput');
     input.removeAttribute('readonly');
     input.focus();
     input.select();
   }
   
   // 학교 선택
   function selectSchool(btn) {
     document.querySelectorAll('.school-btn').forEach(b => b.classList.remove('active'));
     btn.classList.add('active');
     selectedSchool = btn.dataset.school;
   }
   
   // 프로필 사진 미리보기
   function previewProfileImage(event) {
     const file = event.target.files[0];
     if (!file) return;
   
     const reader = new FileReader();
     reader.onload = (e) => {
       newImageBase64 = e.target.result;
       document.getElementById('profilePreview').src = newImageBase64;
     };
     reader.readAsDataURL(file);
   }
   
   // 저장
   function saveProfile() {
     const nickname = document.getElementById('nicknameInput').value.trim();
   
     if (!nickname || nickname.length < 2) {
       showToast('닉네임은 두 글자 이상이어야 합니다.', 'error');
       return;
     }
   
     // localStorage 업데이트
     const user = JSON.parse(localStorage.getItem('user') || '{}');
     user.nickname = nickname;
     user.school   = selectedSchool;
     if (newImageBase64) user.avatar = newImageBase64;
     localStorage.setItem('user', JSON.stringify(user));
   
     // TODO: PATCH /api/user/profile (백엔드 연동 시)
     // const formData = new FormData();
     // formData.append('nickname', nickname);
     // formData.append('school', selectedSchool);
     // if (newImageFile) formData.append('avatar', newImageFile);
     // fetch('/api/user/profile', { method: 'PATCH', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, body: formData })
   
     showToast('저장되었습니다!', 'success');
     setTimeout(() => history.back(), 800);
   }
   
   function showToast(msg, type = 'success') {
     const existing = document.getElementById('toast');
     if (existing) existing.remove();
     const toast = document.createElement('div');
     toast.id = 'toast';
     toast.textContent = msg;
     toast.style.cssText = `
       position: fixed; bottom: 90px; left: 50%; transform: translateX(-50%);
       background: ${type === 'error' ? '#e74c3c' : '#2DB400'};
       color: white; padding: 12px 24px; border-radius: 24px;
       font-size: 14px; font-weight: 600; z-index: 9999;
       white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
     `;
     document.body.appendChild(toast);
     setTimeout(() => toast.remove(), 2000);
   }