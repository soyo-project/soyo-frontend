/* ================================
   Home JS
   ================================ */

   let currentTab = '추천';

   // ================================
   // 저장(북마크) 목록 관리
   // localStorage에 북마크된 postId 배열로 관리
   // ================================
   function getSavedIds() {
     return JSON.parse(localStorage.getItem('soyo_saved') || '[]');
   }
   
   function setSavedIds(ids) {
     localStorage.setItem('soyo_saved', JSON.stringify(ids));
   }
   
   function isSaved(postId) {
     return getSavedIds().includes(postId);
   }
   
   function toggleSavedId(postId) {
     const ids = getSavedIds();
     if (ids.includes(postId)) {
       setSavedIds(ids.filter(id => id !== postId));
       return false; // 저장 해제
     } else {
       setSavedIds([...ids, postId]);
       return true;  // 저장됨
     }
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
     // TODO: 백엔드 연동 시 아래 fetch 사용
     // fetch(`/api/posts?tab=${encodeURIComponent(tab)}`, {
     //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
     // })
     //   .then(res => res.json())
     //   .then(data => renderFeed(data.posts, tab))
     //   .catch(() => renderFeed([], tab));
   
     // 저장 탭: localStorage에서 북마크된 게시글만
     if (tab === '저장') {
       const savedIds = getSavedIds();
       if (savedIds.length === 0) {
         renderFeed([], tab);
         return;
       }
       // 백엔드 연동 시: GET /api/posts?ids=1,2,3
       // 지금은 localStorage에 저장된 게시글 데이터에서 필터링
       const allPosts = JSON.parse(localStorage.getItem('soyo_posts') || '[]');
       const savedPosts = allPosts.filter(p => savedIds.includes(p.id));
       renderFeed(savedPosts, tab);
       return;
     }
   
     // 추천/최신 탭: 백엔드 연동 전까지는 내가 직접 올린 게시글만 표시
     // TODO: 백엔드 연동 시 fetch로 교체
     const stored = JSON.parse(localStorage.getItem('soyo_posts') || '[]');
     let posts = [...stored];
   
     if (tab === '최신') {
       posts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
     }
   
     renderFeed(posts, tab);
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
         </div>
       `;
       return;
     }
   
     feed.innerHTML = posts.map(post => createPostCard(post)).join('');
   }
   
   // ================================
   // 포스트 카드 생성
   // ================================
   function createPostCard(post) {
     const saved  = isSaved(post.id);
     const liked  = post.liked || false;
   
     return `
       <div class="post-card" onclick="goPostDetail(${post.id})">
         <img
           class="post-card__image"
           src="${post.images?.[0] || post.image || ''}"
           alt="${post.title}"
           onerror="this.style.background='var(--gray-200)';this.removeAttribute('src')"
         />
         <div class="post-card__body">
           <div class="post-card__title">${post.title}</div>
           <div class="post-card__tags">
             ${(post.tags || []).map(t => `<span>${t}</span>`).join('')}
           </div>
           <div class="post-card__footer">
             <div class="post-card__location">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                 <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                 <circle cx="12" cy="10" r="3"/>
               </svg>
               ${post.location || ''}
             </div>
             <div class="post-card__actions">
               <button class="action-btn ${liked ? 'liked' : ''}"
                 onclick="toggleLike(event, ${post.id})">
                 <svg width="22" height="22" viewBox="0 0 24 24"
                   fill="${liked ? '#e74c3c' : 'none'}"
                   stroke="${liked ? '#e74c3c' : '#bbb'}" stroke-width="2">
                   <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                 </svg>
               </button>
               <button class="action-btn ${saved ? 'saved' : ''}"
                 onclick="toggleSave(event, ${post.id})">
                 <svg width="22" height="22" viewBox="0 0 24 24"
                   fill="${saved ? '#2DB400' : 'none'}"
                   stroke="${saved ? '#2DB400' : '#bbb'}" stroke-width="2">
                   <polygon points="19 21 12 16 5 21 5 3 19 3"/>
                 </svg>
               </button>
             </div>
           </div>
         </div>
       </div>
     `;
   }
   
   // ================================
   // 좋아요 토글
   // ================================
   function toggleLike(e, postId) {
     e.stopPropagation();
     // TODO: POST /api/posts/:id/like
     const btn = e.currentTarget;
     btn.classList.toggle('liked');
     const svg    = btn.querySelector('svg');
     const isLiked = btn.classList.contains('liked');
     svg.setAttribute('fill',   isLiked ? '#e74c3c' : 'none');
     svg.setAttribute('stroke', isLiked ? '#e74c3c' : '#bbb');
   }
   
   // ================================
   // 북마크 토글 → 저장 탭 연동
   // ================================
   function toggleSave(e, postId) {
     e.stopPropagation();
     // TODO: POST /api/posts/:id/save
     const btn    = e.currentTarget;
     const nowSaved = toggleSavedId(postId); // localStorage 업데이트
     const svg    = btn.querySelector('svg');
   
     btn.classList.toggle('saved', nowSaved);
     svg.setAttribute('fill',   nowSaved ? '#2DB400' : 'none');
     svg.setAttribute('stroke', nowSaved ? '#2DB400' : '#bbb');
   
     // 저장 탭 보고 있을 때 실시간 반영
     if (currentTab === '저장') {
       loadFeed('저장');
     }
   }
   
   // ================================
   // 게시글 상세 이동
   // ================================
   function goPostDetail(postId) {
     window.location.href = `post-detail.html?id=${postId}`;
   }
   
   function goNotifications() { /* TODO */ }
   
   // ================================
   // 초기 로드
   // ================================
   const user = JSON.parse(localStorage.getItem('user') || '{}');
   if (user.school) {
     document.getElementById('schoolName').textContent = user.school;
   }
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
       </button>
     `).join('');
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
     document.querySelector('.filter-trigger-btn')
       ?.classList.toggle('active', activeFilters.length > 0);
   
     // TODO: GET /api/posts?tags=...&sort=...
     let posts = JSON.parse(localStorage.getItem('soyo_posts') || '[]');
     if (activeFilters.length > 0) {
       posts = posts.filter(p =>
         (p.tags || []).some(t => activeFilters.some(f => t.includes(f)))
       );
     }
     renderFeed(posts, currentTab);
   }
   
   function handleSearch(query) {
     if (!query.trim()) { loadFeed(currentTab); return; }
     // TODO: GET /api/posts/search?q=...
     const posts = JSON.parse(localStorage.getItem('soyo_posts') || '[]');
     const result = posts.filter(p =>
       p.title?.includes(query) || (p.tags || []).some(t => t.includes(query))
     );
     renderFeed(result, currentTab);
   }