/* ================================
   Group Feed JS
   ================================ */

   const BASE_URL = 'http://127.0.0.1:8000';

   /* 이미지 경로 변환: /media/... → http://127.0.0.1:8000/media/... */
   function imgUrl(url) {
     if (!url) return '';
     return url.startsWith('http') ? url : `${BASE_URL}${url}`;
   }
   
   const params    = new URLSearchParams(window.location.search);
   const groupId   = params.get('id');
   const groupName = decodeURIComponent(params.get('name') || '그룹 피드');
   const groupCode = decodeURIComponent(params.get('code') || '');
   
   // 헤더 그룹 이름
   document.getElementById('groupTitle').textContent = groupName;
   
   // 코드 표시
   document.getElementById('groupCode').textContent = groupCode;
   
   // 그룹 멤버 + 피드 로드
   function loadGroupFeed() {
     const token = localStorage.getItem('token');
   
     fetch(`${BASE_URL}/api/groups/${groupId}/feed/`, {
       headers: { Authorization: `Bearer ${token}` }
     })
     .then(res => res.json())
     .then(data => {
       if (data.status === 'success') {
         // 멤버 아바타
         const members = data.data?.members || [];
         renderMembers(members);
   
         // 게시글
         const posts = data.data?.posts || data.data || [];
         renderFeed(posts);
       } else {
         renderFeed([]);
       }
     })
     .catch(() => renderFeed([]));
   }
   
   function renderMembers(members) {
     const container = document.getElementById('groupMembers');
     if (!members || members.length === 0) {
       container.innerHTML = '';
       return;
     }
     container.innerHTML = members.slice(0, 5).map(m => `
       <img class="group-feed-avatar"
         src="${imgUrl(m.profile_image) || '../default-profile.jpeg'}"
         alt="${m.nickname || '멤버'}"
         onerror="this.src='../default-profile.jpeg'" />
     `).join('');
   }
   
   function renderFeed(posts) {
     const feed = document.getElementById('groupFeed');
   
     if (!posts || posts.length === 0) {
       feed.innerHTML = `
         <div class="feed-empty">
           <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
             <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
             <polyline points="9 22 9 12 15 12 15 22"/>
           </svg>
           <p>아직 공유된 게시글이 없어요.<br>게시글 상세에서 그룹에 공유해보세요!</p>
         </div>`;
       return;
     }
   
     feed.innerHTML = posts.map(post => {
       const id    = post.post_id || post.id;
       const image = imgUrl(post.images?.[0] || '');
       const tags  = post.tags || [];
   
       return `
         <div class="post-card" onclick="location.href='post-detail.html?id=${id}'">
           <img class="post-card__image" src="${image}" alt="${post.title}"
             onerror="this.style.background='var(--gray-200)';this.removeAttribute('src')" />
           <div class="post-card__body">
             <div class="post-card__title">${post.title}</div>
             <div class="post-card__tags">
               ${tags.map(t => `<span>#${t}</span>`).join('')}
             </div>
             <div class="post-card__footer">
               <div class="post-card__location">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                   <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                   <circle cx="12" cy="10" r="3"/>
                 </svg>
                 ${post.start_location || ''}
               </div>
               <div class="post-card__actions">
                 <button class="action-btn ${post.is_liked ? 'liked' : ''}"
                   onclick="toggleLike(event, ${id})">
                   <svg width="22" height="22" viewBox="0 0 24 24"
                     fill="${post.is_liked ? '#e74c3c' : 'none'}"
                     stroke="${post.is_liked ? '#e74c3c' : '#bbb'}" stroke-width="2">
                     <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                   </svg>
                 </button>
                 <button class="action-btn ${post.is_bookmarked ? 'saved' : ''}"
                   onclick="toggleSave(event, ${id})">
                   <svg width="22" height="22" viewBox="0 0 24 24"
                     fill="${post.is_bookmarked ? '#2DB400' : 'none'}"
                     stroke="${post.is_bookmarked ? '#2DB400' : '#bbb'}" stroke-width="2">
                     <polygon points="19 21 12 16 5 21 5 3 19 3"/>
                   </svg>
                 </button>
               </div>
             </div>
           </div>
         </div>`;
     }).join('');
   }
   
   function toggleLike(e, postId) {
     e.stopPropagation();
     const token = localStorage.getItem('token');
     fetch(`${BASE_URL}/api/posts/${postId}/likes/`, {
       method: 'POST',
       headers: { Authorization: `Bearer ${token}` }
     })
     .then(res => res.json())
     .then(data => {
       if (data.status === 'success') {
         const btn     = e.currentTarget;
         const svg     = btn.querySelector('svg');
         const isLiked = !btn.classList.contains('liked');
         btn.classList.toggle('liked', isLiked);
         svg.setAttribute('fill',   isLiked ? '#e74c3c' : 'none');
         svg.setAttribute('stroke', isLiked ? '#e74c3c' : '#bbb');
       }
     }).catch(() => {});
   }
   
   function toggleSave(e, postId) {
     e.stopPropagation();
     const token = localStorage.getItem('token');
     fetch(`${BASE_URL}/api/posts/${postId}/bookmarks/`, {
       method: 'POST',
       headers: { Authorization: `Bearer ${token}` }
     })
     .then(res => res.json())
     .then(data => {
       if (data.status === 'success') {
         const btn     = e.currentTarget;
         const svg     = btn.querySelector('svg');
         const isSaved = !btn.classList.contains('saved');
         btn.classList.toggle('saved', isSaved);
         svg.setAttribute('fill',   isSaved ? '#2DB400' : 'none');
         svg.setAttribute('stroke', isSaved ? '#2DB400' : '#bbb');
       }
     }).catch(() => {});
   }
   
   loadGroupFeed();