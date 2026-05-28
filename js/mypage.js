/* ================================
   MyPage JS
   ================================ */

// 프로필 로드
function loadProfile() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.nickname) {
    document.getElementById('profileNickname').textContent = user.nickname;
  }
  if (user.avatar) {
    document.getElementById('profileAvatar').src = user.avatar;
  }

  // TODO: GET /api/user/profile
  fetch('/api/user/profile', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById('profileNickname').textContent = data.nickname;
      if (data.avatar) document.getElementById('profileAvatar').src = data.avatar;
    })
    .catch(() => {});
}

// 그룹 만들기 모달
function openCreateGroupModal() {
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

  // TODO: POST /api/groups { name, code }
  fetch('/api/groups', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ name, code })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success || data.id) {
        alert(`'${name}' 그룹이 생성되었습니다!`);
        closeCreateGroupModal();
        window.location.href = 'my-groups.html';
      } else {
        alert(data.message || '그룹 생성에 실패했습니다.');
      }
    })
    .catch(() => {
      // 백엔드 연동 전 임시: localStorage에 저장
      const groups = JSON.parse(localStorage.getItem('soyo_groups') || '[]');
      groups.push({ id: Date.now(), name, code, members: [] });
      localStorage.setItem('soyo_groups', JSON.stringify(groups));
      alert(`'${name}' 그룹이 생성되었습니다!`);
      closeCreateGroupModal();
      window.location.href = 'my-groups.html';
    });
}

// 그룹 참여 모달
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
  const code = document.getElementById('joinCodeInput').value.trim();
  if (!code) { alert('코드를 입력해주세요.'); return; }

  // TODO: POST /api/groups/join { code }
  fetch('/api/groups/join', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ code })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
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
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

function goSettings() { /* TODO */ }
function goNotifications() { /* TODO */ }
function goEditProfile() { window.location.href = 'edit-profile.html'; }
function goChangeId() { /* TODO */ }
function goChangePassword() { /* TODO */ }
function goCustomerService() { /* TODO */ }
function goNotice() { /* TODO */ }

loadProfile();