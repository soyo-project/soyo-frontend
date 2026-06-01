/* ================================
   Map JS - 카카오맵 + 백엔드 연동
   ================================ */

   const BASE_URL = 'http://127.0.0.1:8000';
   let kakaoMap = null;
   let markers  = [];
   
   function initMap() {
     const container = document.getElementById('kakaoMap');
     const options   = { center: new kakao.maps.LatLng(37.5665, 126.9780), level: 5 };
     kakaoMap = new kakao.maps.Map(container, options);
     locateMe();
     loadMapMarkers();
   }
   
   function locateMe() {
     if (!navigator.geolocation) return;
     navigator.geolocation.getCurrentPosition(
       (pos) => kakaoMap.setCenter(new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude)),
       () => {}
     );
   }
   
   function loadMapMarkers() {
     const token = localStorage.getItem('token');
     fetch(`${BASE_URL}/api/posts/map/`, {
       headers: { Authorization: `Bearer ${token}` }
     })
     .then(res => res.json())
     .then(data => {
       if (data.status === 'success') renderMarkers(data.data || []);
       else document.getElementById('mapBottomSheet').style.display = 'none';
     })
     .catch(() => {
       document.getElementById('mapBottomSheet').style.display = 'none';
     });
   }
   
   function renderMarkers(posts) {
     markers.forEach(m => m.setMap(null));
     markers = [];
   
     posts.forEach(post => {
       if (!post.latitude || !post.longitude) return;
       const latlng = new kakao.maps.LatLng(post.latitude, post.longitude);
       const marker = new kakao.maps.Marker({ position: latlng, map: kakaoMap });
       kakao.maps.event.addListener(marker, 'click', () => renderBottomSheet(post));
       markers.push(marker);
     });
   
     if (posts.length > 0) renderBottomSheet(posts[0]);
     else document.getElementById('mapBottomSheet').style.display = 'none';
   }
   
   function imgUrl(url) {
     if (!url) return '';
     return url.startsWith('http') ? url : `${BASE_URL}${url}`;
   }
   
   function renderBottomSheet(post) {
     document.getElementById('mapBottomSheet').style.display = 'block';
     const image    = imgUrl(post.images?.[0] || '');
     const location = post.start_location || post.location || '';
     const tags     = post.tags || [];
   
     document.getElementById('sheetPost').innerHTML = `
       <img class="sheet-post__image" src="${image}" alt="${post.title}"
         onerror="this.style.background='var(--gray-200)';this.removeAttribute('src')" />
       <div class="sheet-post__info">
         <div class="sheet-post__title">${post.title}</div>
         <div class="sheet-post__tags">${tags.map(t => `<span>#${t}</span>`).join('')}</div>
         <div class="sheet-post__footer">
           <div class="sheet-post__location">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
               <circle cx="12" cy="10" r="3"/>
             </svg>
             ${location}
           </div>
           <div class="sheet-post__actions">
             <button onclick="toggleLikeMap(event, ${post.post_id || post.id})">
               <svg width="20" height="20" viewBox="0 0 24 24"
                 fill="${post.is_liked ? '#e74c3c' : 'none'}"
                 stroke="${post.is_liked ? '#e74c3c' : '#bbb'}" stroke-width="2">
                 <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
               </svg>
             </button>
             <button onclick="toggleSaveMap(event, ${post.post_id || post.id})">
               <svg width="20" height="20" viewBox="0 0 24 24"
                 fill="${post.is_bookmarked ? '#2DB400' : 'none'}"
                 stroke="${post.is_bookmarked ? '#2DB400' : '#bbb'}" stroke-width="2">
                 <polygon points="19 21 12 16 5 21 5 3 19 3"/>
               </svg>
             </button>
           </div>
         </div>
       </div>`;
   
     document.getElementById('sheetPost').onclick = () =>
       window.location.href = `post-detail.html?id=${post.post_id || post.id}`;
   }
   
   function toggleLikeMap(e, postId) {
     e.stopPropagation();
     const token   = localStorage.getItem('token');
     const svg     = e.currentTarget.querySelector('svg');
     const isLiked = svg.getAttribute('fill') !== 'none';
   
     // 즉시 UI 반영
     svg.setAttribute('fill',   !isLiked ? '#e74c3c' : 'none');
     svg.setAttribute('stroke', !isLiked ? '#e74c3c' : '#bbb');
   
     fetch(`${BASE_URL}/api/posts/${postId}/likes/`, {
       method: 'POST',
       headers: { Authorization: `Bearer ${token}` }
     })
     .then(res => res.json())
     .then(data => {
       if (data.status !== 'success') {
         // 실패 시 되돌리기
         svg.setAttribute('fill',   isLiked ? '#e74c3c' : 'none');
         svg.setAttribute('stroke', isLiked ? '#e74c3c' : '#bbb');
       }
     })
     .catch(() => {
       svg.setAttribute('fill',   isLiked ? '#e74c3c' : 'none');
       svg.setAttribute('stroke', isLiked ? '#e74c3c' : '#bbb');
     });
   }
   
   function toggleSaveMap(e, postId) {
     e.stopPropagation();
     const token   = localStorage.getItem('token');
     const svg     = e.currentTarget.querySelector('svg');
     const isSaved = svg.getAttribute('fill') !== 'none';
   
     // 즉시 UI 반영
     svg.setAttribute('fill',   !isSaved ? '#2DB400' : 'none');
     svg.setAttribute('stroke', !isSaved ? '#2DB400' : '#bbb');
   
     fetch(`${BASE_URL}/api/posts/${postId}/bookmarks/`, {
       method: 'POST',
       headers: { Authorization: `Bearer ${token}` }
     })
     .then(res => res.json())
     .then(data => {
       if (data.status !== 'success') {
         svg.setAttribute('fill',   isSaved ? '#2DB400' : 'none');
         svg.setAttribute('stroke', isSaved ? '#2DB400' : '#bbb');
       }
     })
     .catch(() => {
       svg.setAttribute('fill',   isSaved ? '#2DB400' : 'none');
       svg.setAttribute('stroke', isSaved ? '#2DB400' : '#bbb');
     });
   }
   
   if (typeof kakao !== 'undefined' && kakao.maps) {
     kakao.maps.load(initMap);
   } else {
     window.addEventListener('load', () => {
       if (typeof kakao !== 'undefined' && kakao.maps) kakao.maps.load(initMap);
     });
   }