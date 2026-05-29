/* ================================
   MyPage JS
   ================================ */

   const BASE_URL = 'http://127.0.0.1:8000';

   function loadProfile() {
     const token = localStorage.getItem('token');
     const user  = JSON.parse(localStorage.getItem('user') || '{}');
   
     if (user.nickname) document.getElementById('profileNickname').textContent = user.nickname;
     if (user.avatar)   document.getElementById('profileAvatar').src = user.avatar;
   
     fetch(`${BASE_URL}/api/auth/me/`, {
       headers: { Authorization: `Bearer ${token}` }
     })
     .then(res => res.json())
     .then(data => {
       if (data.status === 'success') {
         const u = data.data;
         document.getElementById('profileNickname').textContent = u.nickname || '닉네임';
         if (u.profile_image) document.getElementById('profileAvatar').src = u.profile_image;
         localStorage.setItem('user', JSON.stringify({
           ...user,
           nickname: u.nickname,
           school:   u.school,
           avatar:   u.profile_image
         }));
       }
     })
     .catch(() => {});
   }
   
   /* 그룹 만들기 모달 */
   function openCreateGroupModal() {
     // 그룹 코드 미리 생성 API 호출
     const token = localStorage.getItem('token');
     fetch(`${BASE_URL}/api/groups/code/`, {
       headers: { Authorization: `Bearer ${token}` }
     })
     .then(res => res.json())
     .then(data => {
       if (data.status === 'success') {
         document.getElementById('groupCodeInput').value = data.data.code || '';
       }
     })
     .catch(() => {});
   
     document.getElementById('createGroupModal').style.display = 'flex';
   }
   
   function closeCreateGroupModal() {
     document.getElementById('createGroupModal').style.display = 'none';
     document.getElementById('groupNameInput').value = '';
     document.getElementById('groupCodeInput').value = '';
   }
   
   function closeCreateGroupOutside(e) {
     if (e.target === document.getElementById('createGroupModal')) closeCreateGroupModal();
   }
   
   function createGroup() {
     const name = document.getElementById('groupNameInput').value.trim();
     const code = document.getElementById('groupCodeInput').value.trim();
   
     if (!name) { alert('그룹 이름을 입력해주세요.'); return; }
     if (!code) { alert('그룹 코드를 입력해주세요.'); return; }
   
     const token = localStorage.getItem('token');
     fetch(`${BASE_URL}/api/groups/`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         Authorization: `Bearer ${token}`
       },
       body: JSON.stringify({ name, code })
     })
     .then(res => res.json())
     .then(data => {
       if (data.status === 'success') {
         alert(`'${name}' 그룹이 생성되었습니다!`);
         closeCreateGroupModal();
         window.location.href = 'my-groups.html';
       } else {
         alert(data.message || '그룹 생성에 실패했습니다.');
       }
     })
     .catch(() => alert('그룹 생성에 실패했습니다.'));
   }
   
   /* 그룹 참여 모달 */
   function openJoinGroupModal() {
     document.getElementById('joinGroupModal').style.display = 'flex';
   }
   
   function closeJoinGroupModal() {
     document.getElementById('joinGroupModal').style.display = 'none';
   }
   
   function closeJoinGroupOutside(e) {
     if (e.target === document.getElementById('joinGroupModal')) closeJoinGroupModal();
   }
   
   function submitJoinCode() {
     const code  = document.getElementById('joinCodeInput').value.trim();
     if (!code) { alert('코드를 입력해주세요.'); return; }
   
     const token = localStorage.getItem('token');
     fetch(`${BASE_URL}/api/groups/join/`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         Authorization: `Bearer ${token}`
       },
       body: JSON.stringify({ code })
     })
     .then(res => res.json())
     .then(data => {
       if (data.status === 'success') {
         alert('그룹에 참여했습니다!');
         closeJoinGroupModal();
         window.location.href = 'my-groups.html';
       } else {
         alert(data.message || '유효하지 않은 코드입니다.');
       }
     })
     .catch(() => alert('그룹 참여에 실패했습니다.'));
   }
   
   function handleLogout() {
     if (!confirm('로그아웃 하시겠습니까?')) return;
     const token = localStorage.getItem('token');
     fetch(`${BASE_URL}/api/auth/logout/`, {
       method: 'POST',
       headers: { Authorization: `Bearer ${token}` }
     })
     .then(() => {})
     .catch(() => {})
     .finally(() => {
       localStorage.removeItem('token');
       localStorage.removeItem('user');
       window.location.href = 'login.html';
     });
   }
   
   function goEditProfile() { window.location.href = 'edit-profile.html'; }
   function goSettings()     { /* TODO */ }
   function goNotifications(){ /* TODO */ }
   function goChangeId()     { /* TODO */ }
   function goChangePassword(){ /* TODO */ }
   function goCustomerService(){ /* TODO */ }
   function goNotice()       { /* TODO */ }
   
   loadProfile();