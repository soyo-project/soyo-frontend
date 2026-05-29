/* ================================
   Edit Profile JS - 백엔드 연동
   ================================ */

   const BASE_URL = 'http://127.0.0.1:8000';
   const DEFAULT_PROFILE = '../default-profile.jpeg';
   let selectedSchool = '';
   let newImageFile   = null;
   
   window.addEventListener('DOMContentLoaded', () => {
     const token = localStorage.getItem('token');
     fetch(`${BASE_URL}/api/auth/me/`, {
       headers: { Authorization: `Bearer ${token}` }
     })
     .then(res => res.json())
     .then(data => {
       if (data.status === 'success') {
         const u = data.data;
         document.getElementById('nicknameInput').value = u.nickname || '';
         if (u.profile_image) document.getElementById('profilePreview').src = u.profile_image;
         selectedSchool = u.school || '삼육대학교';
         document.querySelectorAll('.school-btn').forEach(btn => {
           btn.classList.toggle('active', btn.dataset.school === selectedSchool);
         });
       }
     })
     .catch(() => {
       const user = JSON.parse(localStorage.getItem('user') || '{}');
       document.getElementById('nicknameInput').value = user.nickname || '';
       if (user.avatar) document.getElementById('profilePreview').src = user.avatar;
       selectedSchool = user.school || '삼육대학교';
       document.querySelectorAll('.school-btn').forEach(btn => {
         btn.classList.toggle('active', btn.dataset.school === selectedSchool);
       });
     });
   });
   
   function enableEdit() {
     const input = document.getElementById('nicknameInput');
     input.removeAttribute('readonly');
     input.focus();
     input.select();
   }
   
   function selectSchool(btn) {
     document.querySelectorAll('.school-btn').forEach(b => b.classList.remove('active'));
     btn.classList.add('active');
     selectedSchool = btn.dataset.school;
   }
   
   function previewProfileImage(event) {
     const file = event.target.files[0];
     if (!file) return;
     newImageFile = file;
     const reader = new FileReader();
     reader.onload = (e) => document.getElementById('profilePreview').src = e.target.result;
     reader.readAsDataURL(file);
   }
   
   function saveProfile() {
     const nickname = document.getElementById('nicknameInput').value.trim();
     if (!nickname || nickname.length < 2) {
       showToast('닉네임은 두 글자 이상이어야 합니다.', 'error'); return;
     }
   
     const token    = localStorage.getItem('token');
     const formData = new FormData();
     formData.append('nickname', nickname);
     formData.append('school',   selectedSchool);
     if (newImageFile) formData.append('profile_image', newImageFile);
   
     fetch(`${BASE_URL}/api/auth/me/update/`, {
       method: 'POST',
       headers: { Authorization: `Bearer ${token}` },
       body: formData
     })
     .then(res => res.json())
     .then(data => {
       if (data.status === 'success') {
         const user = JSON.parse(localStorage.getItem('user') || '{}');
         user.nickname = nickname;
         user.school   = selectedSchool;
         if (data.data?.profile_image) user.avatar = data.data.profile_image;
         localStorage.setItem('user', JSON.stringify(user));
         showToast('저장되었습니다!', 'success');
         setTimeout(() => history.back(), 800);
       } else {
         showToast(data.message || '저장에 실패했습니다.', 'error');
       }
     })
     .catch(() => {
       showToast('서버 연결에 실패했습니다.', 'error');
     });
   }
   
   function showToast(msg, type = 'success') {
     const existing = document.getElementById('toast');
     if (existing) existing.remove();
     const toast = document.createElement('div');
     toast.id = 'toast';
     toast.textContent = msg;
     toast.style.cssText = `
       position:fixed;bottom:90px;left:50%;transform:translateX(-50%);
       background:${type === 'error' ? '#e74c3c' : '#2DB400'};
       color:white;padding:12px 24px;border-radius:24px;
       font-size:14px;font-weight:600;z-index:9999;
       white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,0.2);`;
     document.body.appendChild(toast);
     setTimeout(() => toast.remove(), 2000);
   }