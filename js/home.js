/* ================================
   Home JS
   ================================ */

   const BASE_URL = 'http://127.0.0.1:8000';
   let currentTab = '추천';
   
   // ================================
   // 저장(북마크) 토글
   // ================================
   function toggleSavedId(postId) {
     const ids = JSON.parse(localStorage.getItem('soyo_saved') || '[]');
     if (ids.includes(postId)) {
       localStorage.setItem('soyo_saved', JSON.stringify(ids.filter(id => id !== postId)));
       return false;
     } else {
       localStorage.setItem('soyo_saved', JSON.stringify([...ids, postId]));
       return true;
     }
   }
   
   function isSaved(postId) {
     return JSON.parse(localStorage.getItem('soyo_saved') || '[]').includes(postId);
   }
   
   // ================================
   // 탭 전환
   // ================================
   function switchTab(btn) {
     document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
     btn.classList.add('active');
     currentTab = btn.dataset.tab;
     loadFeed(currentTab);
   }
   
   // ================================
   // 피드 로드
   // ================================
   function loadFeed(tab) {
     const token = localStorage.getItem('token');
   
     if (tab === '저장') {
       fetch(`${BASE_URL}/api/posts/bookmarks/`, {
         headers: { Authorization: `Bearer ${token}` }
       })
       .then(res => res.json())
       .then(data => {
         if (data.status === 'success') renderFeed(data.data, tab);
         else renderFeed([], tab);
       })
       .catch(() => renderFeed([], tab));
       return;
     }
   
     fetch(`${BASE_URL}/api/posts/`, {
       headers: { Authorization: `Bearer ${token}` }
     })
     .then(res => res.json())
     .then(data => {
       if (data.status === 'success') {
         let posts = data.data || [];
         if (tab === '최신') {
           posts = posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
         }
         renderFeed(posts, tab);
       } else {
         renderFeed([], tab);
       }
     })
     .catch(() => renderFeed([], tab));
   }
   
   // ================================
   // 피드 렌더링
   // ================================
   function renderFeed(posts, tab) {
     const feed = document.getElementById('homeFeed');
     if (!posts || posts.length === 0) {
       const emptyMsg = {
         '추천': '아직 게시글이 없어요.\n첫 번째 코스를 등록해보세요!',
         '최신': '아직 게시글이 없어요.',
         '저장': '저장한 게시글이 없어요.\n마음에 드는 코스를 북마크해보세요!',
       };
       feed.innerHTML = `
         <div class="feed-empty">
           <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
             <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
             <circle cx="12" cy="10" r="3"/>
           </svg>
           <p>${(emptyMsg[tab] || '게시글이 없어요.').replace('\n', '<br>')}</p>
         </div>`;
       return;
     }
     feed.innerHTML = posts.map(post => createPostCard(post)).join('');
   }
   
   // ================================
   // 포스트 카드 생성
   // ================================
   function createPostCard(post) {
     const saved = isSaved(post.post_id || post.id);
     const liked = post.is_liked || false;
     const image = (post.images && post.images[0]) ? post.images[0] : '';
     const tags  = post.tags || [];
     const location = post.start_location || post.location || '';
   
     return `
       <div class="post-card" onclick="goPostDetail(${post.post_id || post.id})">
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
               ${location}
             </div>
             <div class="post-card__actions">
               <button class="action-btn ${liked ? 'liked' : ''}" onclick="toggleLike(event, ${post.post_id || post.id})">
                 <svg width="22" height="22" viewBox="0 0 24 24"
                   fill="${liked ? '#e74c3c' : 'none'}"
                   stroke="${liked ? '#e74c3c' : '#bbb'}" stroke-width="2">
                   <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                 </svg>
               </button>
               <button class="action-btn ${saved ? 'saved' : ''}" onclick="toggleSave(event, ${post.post_id || post.id})">
                 <svg width="22" height="22" viewBox="0 0 24 24"
                   fill="${saved ? '#2DB400' : 'none'}"
                   stroke="${saved ? '#2DB400' : '#bbb'}" stroke-width="2">
                   <polygon points="19 21 12 16 5 21 5 3 19 3"/>
                 </svg>
               </button>
             </div>
           </div>
         </div>
       </div>`;
   }
   
   // ================================
   // 좋아요 토글
   // ================================
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
         const btn = e.currentTarget;
         btn.classList.toggle('liked');
         const svg    = btn.querySelector('svg');
         const isLiked = btn.classList.contains('liked');
         svg.setAttribute('fill',   isLiked ? '#e74c3c' : 'none');
         svg.setAttribute('stroke', isLiked ? '#e74c3c' : '#bbb');
       }
     })
     .catch(() => {});
   }
   
   // ================================
   // 북마크 토글
   // ================================
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
         const nowSaved = toggleSavedId(postId);
         btn.classList.toggle('saved', nowSaved);
         const svg = btn.querySelector('svg');
         svg.setAttribute('fill',   nowSaved ? '#2DB400' : 'none');
         svg.setAttribute('stroke', nowSaved ? '#2DB400' : '#bbb');
         if (currentTab === '저장') loadFeed('저장');
       }
     })
     .catch(() => {});
   }
   
   function goPostDetail(postId) {
     window.location.href = `post-detail.html?id=${postId}`;
   }
   
   function goNotifications() { /* TODO */ }
   
   // 초기 로드
   const user = JSON.parse(localStorage.getItem('user') || '{}');
   if (user.school) document.getElementById('schoolName').textContent = user.school;
   loadFeed(currentTab);
   
   /* ================================
      필터 & 검색
      ================================ */
   const FILTER_TAGS = [
     '조용한', '노을', '포토스팟', '사람적은', '혼자걷기좋은',
     '감성', '밤산책', '시원한', '공강추천', '힐링', '여유로운'
   ];
   
   let activeFilters = [];
   let activeSort    = '추천순';
   
   function openFilter() {
     renderFilterTags();
     document.getElementById('filterModal').style.display = 'flex';
   }
   
   function closeFilterOutside(e) {
     if (e.target === document.getElementById('filterModal'))
       document.getElementById('filterModal').style.display = 'none';
   }
   
   function renderFilterTags() {
     document.getElementById('filterTags').innerHTML = FILTER_TAGS.map(tag => `
       <button class="tag ${activeFilters.includes(tag) ? 'selected' : ''}"
         onclick="toggleFilterTag('${tag}')">
         ${tag}
       </button>`).join('');
     document.querySelectorAll('.sort-btn').forEach(btn => {
       btn.classList.toggle('active', btn.dataset.sort === activeSort);
     });
   }
   
   function toggleFilterTag(tag) {
     activeFilters = activeFilters.includes(tag)
       ? activeFilters.filter(t => t !== tag)
       : [...activeFilters, tag];
     renderFilterTags();
   }
   
   function selectSort(btn) {
     document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
     btn.classList.add('active');
     activeSort = btn.dataset.sort;
   }
   
   function resetFilters() {
     activeFilters = [];
     activeSort    = '추천순';
     renderFilterTags();
   }
   
   function applyFilters() {
     document.getElementById('filterModal').style.display = 'none';
     document.querySelector('.filter-trigger-btn')?.classList.toggle('active', activeFilters.length > 0);
   
     const token = localStorage.getItem('token');
     const tagQuery = activeFilters.map(t => `tags=${encodeURIComponent(t)}`).join('&');
     fetch(`${BASE_URL}/api/posts/${tagQuery ? '?' + tagQuery : ''}`, {
       headers: { Authorization: `Bearer ${token}` }
     })
     .then(res => res.json())
     .then(data => {
       if (data.status === 'success') renderFeed(data.data, currentTab);
     })
     .catch(() => {});
   }
   
   function handleSearch(query) {
     if (!query.trim()) { loadFeed(currentTab); return; }
     const token = localStorage.getItem('token');
     fetch(`${BASE_URL}/api/posts/?search=${encodeURIComponent(query)}`, {
       headers: { Authorization: `Bearer ${token}` }
     })
     .then(res => res.json())
     .then(data => {
       if (data.status === 'success') renderFeed(data.data, currentTab);
     })
     .catch(() => {});
   }