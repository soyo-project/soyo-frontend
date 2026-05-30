/* ================================
   Post Detail JS
   ================================ */

   const BASE_URL = 'http://127.0.0.1:8000';
   const params = new URLSearchParams(window.location.search);
   const postId = params.get('id');
   let postData = null;
   
   /* 이미지 경로 변환: /media/... → http://127.0.0.1:8000/media/... */
   function imgUrl(url) {
     if (!url) return '';
     return url.startsWith('http') ? url : `${BASE_URL}${url}`;
   }
   
   
   function renderPost(post) {
     postData = post;
     const avatar = imgUrl(post.author?.profile_image) || '../default-profile.jpeg';
     document.getElementById('authorAvatar').src = avatar;
     document.getElementById('authorName').textContent = post.author?.nickname || '닉네임';
   
     const slider = document.getElementById('postSlider');
     const images = post.images || [];
     slider.innerHTML = images.map(img => `
       <div class="post-slide"><img src="${imgUrl(img)}" alt="post" /></div>`).join('');
   
     const dots = document.getElementById('postDots');
     dots.innerHTML = images.map((_, i) =>
       `<div class="post-dot ${i === 0 ? 'active' : ''}"></div>`).join('');
   
     slider.addEventListener('scroll', () => {
       const idx = Math.round(slider.scrollLeft / slider.offsetWidth);
       dots.querySelectorAll('.post-dot').forEach((d, i) =>
         d.classList.toggle('active', i === idx));
     });
   
     document.getElementById('postTitle').textContent = post.title || '';
     document.getElementById('postTags').innerHTML = (post.tags || []).map(t => `<span>#${t}</span>`).join('');
     document.getElementById('postDesc').textContent = post.content || '';
     document.getElementById('postLocation').querySelector('span').textContent = post.start_location || post.location || '';
   
     if (post.is_liked) document.getElementById('likeBtn').classList.add('liked');
     if (post.is_bookmarked) document.getElementById('saveBtn').classList.add('saved');
   }
   
   function loadPost() {
     const token = localStorage.getItem('token');
     fetch(`${BASE_URL}/api/posts/${postId}/`, {
       headers: { Authorization: `Bearer ${token}` }
     })
     .then(res => res.json())
     .then(data => {
       if (data.status === 'success') renderPost(data.data);
       else alert(data.message);
     })
     .catch(() => alert('게시글을 불러오지 못했습니다.'));
   }
   
   function toggleLike() {
     const token = localStorage.getItem('token');
     fetch(`${BASE_URL}/api/posts/${postId}/likes/`, {
       method: 'POST',
       headers: { Authorization: `Bearer ${token}` }
     })
     .then(res => res.json())
     .then(data => {
       if (data.status === 'success') {
         const btn = document.getElementById('likeBtn');
         btn.classList.toggle('liked');
         const svg    = btn.querySelector('svg');
         const isLiked = btn.classList.contains('liked');
         svg.setAttribute('fill',   isLiked ? '#e74c3c' : 'none');
         svg.setAttribute('stroke', isLiked ? '#e74c3c' : 'currentColor');
       }
     })
     .catch(() => {});
   }
   
   function toggleSave() {
     const token = localStorage.getItem('token');
     fetch(`${BASE_URL}/api/posts/${postId}/bookmarks/`, {
       method: 'POST',
       headers: { Authorization: `Bearer ${token}` }
     })
     .then(res => res.json())
     .then(data => {
       if (data.status === 'success') {
         const btn    = document.getElementById('saveBtn');
         btn.classList.toggle('saved');
         const svg    = btn.querySelector('svg');
         const isSaved = btn.classList.contains('saved');
         svg.setAttribute('fill',   isSaved ? '#2DB400' : 'none');
         svg.setAttribute('stroke', isSaved ? '#2DB400' : 'currentColor');
       }
     })
     .catch(() => {});
   }
   
   function sharePost() {
     if (navigator.share) {
       navigator.share({ title: postData?.title, url: window.location.href });
     } else {
       navigator.clipboard.writeText(window.location.href)
         .then(() => alert('링크가 복사되었습니다.'));
     }
   }
   
   function sendPost() {
     // 내 그룹 목록 가져와서 선택 모달 띄우기
     const token = localStorage.getItem('token');
     fetch(`${BASE_URL}/api/groups/me/`, {
       headers: { Authorization: `Bearer ${token}` }
     })
     .then(res => res.json())
     .then(data => {
       const groups = data.status === 'success' ? (data.data || []) : [];
       if (groups.length === 0) {
         alert('참여 중인 그룹이 없어요!');
         return;
       }
       showGroupShareModal(groups);
     })
     .catch(() => alert('그룹 목록을 불러오지 못했습니다.'));
   }
   
   function showGroupShareModal(groups) {
     const existing = document.getElementById('groupShareModal');
     if (existing) existing.remove();
   
     const overlay = document.createElement('div');
     overlay.id = 'groupShareModal';
     overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:200;display:flex;align-items:flex-end;justify-content:center;';
     overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
   
     overlay.innerHTML = `
       <div style="background:white;border-radius:24px 24px 0 0;width:100%;max-width:430px;padding:24px 20px 40px;">
         <div style="width:40px;height:4px;background:#ddd;border-radius:2px;margin:0 auto 20px;"></div>
         <div style="font-size:17px;font-weight:700;margin-bottom:16px;">그룹에 공유하기</div>
         ${groups.map(g => `
           <button onclick="shareToGroup(${g.group_id || g.id}, '${g.name}')"
             style="width:100%;padding:16px;border:1.5px solid #2DB400;border-radius:12px;background:white;
                    font-size:15px;font-weight:600;color:#222;cursor:pointer;margin-bottom:10px;text-align:left;">
             ${g.name}
           </button>`).join('')}
       </div>`;
   
     document.body.appendChild(overlay);
   }
   
   function shareToGroup(groupId, groupName) {
     const token = localStorage.getItem('token');
     fetch(`${BASE_URL}/api/groups/${groupId}/posts/`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         Authorization: `Bearer ${token}`
       },
       body: JSON.stringify({ post_id: postId })
     })
     .then(res => res.json())
     .then(data => {
       document.getElementById('groupShareModal')?.remove();
       if (data.status === 'success') {
         alert(`'${groupName}'에 공유되었습니다!`);
       } else {
         alert(data.message || '공유에 실패했습니다.');
       }
     })
     .catch(() => alert('공유에 실패했습니다.'));
   }
   
   function openPostOptions() {
     const user    = JSON.parse(localStorage.getItem('user') || '{}');
     const isOwner = String(postData?.author?.user_id) === String(user.id);
     document.getElementById('ownerOptions').style.display = isOwner ? 'block' : 'none';
     document.getElementById('guestOptions').style.display = isOwner ? 'none' : 'block';
     document.getElementById('postOptionsModal').style.display = 'flex';
   }
   
   function closePostOptions() {
     document.getElementById('postOptionsModal').style.display = 'none';
   }
   
   function closeOptionsModalOutside(e) {
     if (e.target === document.getElementById('postOptionsModal')) closePostOptions();
   }
   
   function editPost() {
     closePostOptions();
     window.location.href = `upload.html?edit=${postId}`;
   }
   
   function confirmDeletePost() {
     closePostOptions();
     if (!confirm('게시글을 삭제하시겠습니까?')) return;
     const token = localStorage.getItem('token');
     fetch(`${BASE_URL}/api/posts/${postId}/`, {
       method: 'DELETE',
       headers: { Authorization: `Bearer ${token}` }
     })
     .then(res => res.json())
     .then(data => {
       if (data.status === 'success') {
         alert('게시글이 삭제되었습니다.');
         window.location.href = 'home.html';
       } else {
         alert(data.message || '삭제에 실패했습니다.');
       }
     })
     .catch(() => alert('삭제에 실패했습니다.'));
   }
   
   function reportPost() {
     closePostOptions();
     if (confirm('이 게시글을 신고하시겠습니까?')) {
       alert('신고가 접수되었습니다.');
     }
   }
   
   loadPost();