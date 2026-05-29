/* ================================
   Groups JS
   ================================ */

   const BASE_URL = 'http://127.0.0.1:8000';

   function renderGroups(groups) {
     const list = document.getElementById('groupsList');
   
     const cards = (groups || []).map(g => `
       <div class="group-card" onclick="showGroupCode('${g.name}', '${g.code}')">
         <div>
           <div class="group-card__name">${g.name}</div>
           <div class="group-code-badge">코드: ${g.code}</div>
         </div>
         <div class="group-card__members">
           ${(g.members && g.members.length > 0)
             ? g.members.slice(0, 4).map(m => `
                 <img class="group-member-avatar"
                   src="${m.profile_image || '../default-profile.jpeg'}"
                   alt="${m.nickname || '멤버'}"
                   onerror="this.src='../default-profile.jpeg'" />`).join('')
             : `<div style="width:40px;height:40px;border-radius:50%;background:var(--primary-bg);
                   display:flex;align-items:center;justify-content:center;font-size:18px;">👤</div>`
           }
         </div>
       </div>`).join('');
   
     const emptyMsg = (!groups || groups.length === 0) ? `
       <div class="feed-empty">
         <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
           <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
           <polyline points="9 22 9 12 15 12 15 22"/>
         </svg>
         <p>아직 참여한 그룹이 없어요.<br>+ 버튼을 눌러 그룹을 만들어보세요!</p>
       </div>` : '';
   
     const addBtn = `
       <button class="group-add-btn" onclick="openJoinModal()">+</button>`;
   
     list.innerHTML = emptyMsg + cards + addBtn;
   }
   
   function showGroupCode(name, code) {
     const existing = document.getElementById('groupCodeModal');
     if (existing) existing.remove();
   
     const overlay = document.createElement('div');
     overlay.id = 'groupCodeModal';
     overlay.className = 'modal-overlay';
     overlay.style.cssText = 'display:flex;align-items:center;justify-content:center;';
     overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
   
     overlay.innerHTML = `
       <div class="group-code-modal">
         <button class="modal-close-btn" onclick="document.getElementById('groupCodeModal').remove()"
           style="position:absolute;top:16px;right:16px;">✕</button>
         <div class="modal-title">${name}</div>
         <p style="font-size:13px;color:var(--gray-500);margin-bottom:16px;">그룹 코드를 공유해서 친구를 초대해요!</p>
         <div class="group-code-display">${code}</div>
         <button class="group-code-copy-btn" onclick="copyGroupCode('${code}')">코드 복사</button>
       </div>`;
   
     document.body.appendChild(overlay);
   }
   
   function copyGroupCode(code) {
     navigator.clipboard.writeText(code)
       .then(() => alert('코드가 복사되었습니다!'))
       .catch(() => {
         const el = document.createElement('textarea');
         el.value = code;
         document.body.appendChild(el);
         el.select();
         document.execCommand('copy');
         document.body.removeChild(el);
         alert('코드가 복사되었습니다!');
       });
   }
   
   function openJoinModal() {
     const existing = document.getElementById('joinModal');
     if (existing) existing.remove();
   
     const overlay = document.createElement('div');
     overlay.id = 'joinModal';
     overlay.className = 'modal-overlay';
     overlay.style.cssText = 'display:flex;align-items:center;justify-content:center;';
     overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
   
     overlay.innerHTML = `
       <div style="background:white;border-radius:16px;width:calc(100% - 48px);max-width:400px;padding:28px 24px;position:relative;">
         <button onclick="document.getElementById('joinModal').remove()"
           style="position:absolute;top:16px;right:16px;background:none;border:none;font-size:22px;cursor:pointer;color:#666;">✕</button>
         <div style="font-size:14px;font-weight:600;color:#666;margin-bottom:8px;">코드 입력</div>
         <div style="display:flex;border:1.5px solid #222;border-radius:8px;overflow:hidden;align-items:center;">
           <input type="text" id="joinCodeInput" placeholder="코드를 입력하세요"
             style="flex:1;border:none;padding:14px 16px;font-size:15px;outline:none;" />
           <button onclick="document.getElementById('joinCodeInput').value=''"
             style="background:none;border:none;padding:0 14px;font-size:18px;color:#999;cursor:pointer;">×</button>
         </div>
         <div style="display:flex;justify-content:flex-end;margin-top:24px;">
           <button onclick="submitJoin()"
             style="background:#2DB400;color:white;border:none;border-radius:24px;padding:12px 28px;font-size:16px;font-weight:700;cursor:pointer;">
             참가
           </button>
         </div>
       </div>`;
   
     document.body.appendChild(overlay);
   }
   
   function submitJoin() {
     const code  = document.getElementById('joinCodeInput')?.value.trim();
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
         document.getElementById('joinModal')?.remove();
         loadGroups();
       } else {
         alert(data.message || '유효하지 않은 코드입니다.');
       }
     })
     .catch(() => alert('그룹 참여에 실패했습니다.'));
   }
   
   function loadGroups() {
     const token = localStorage.getItem('token');
     fetch(`${BASE_URL}/api/groups/me/`, {
       headers: { Authorization: `Bearer ${token}` }
     })
     .then(res => res.json())
     .then(data => {
       if (data.status === 'success') renderGroups(data.data || []);
       else renderGroups([]);
     })
     .catch(() => renderGroups([]));
   }
   
   loadGroups();