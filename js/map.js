/* ================================
   Map JS - 카카오맵 연동
   ================================ */

   let kakaoMap = null;
   let markers  = [];
   
   // 샘플 마커 데이터 없음 — localStorage 게시글만 사용
   const sampleMarkers = [];
   
   /* ================================
      카카오맵 초기화
      ================================ */
   function initMap() {
     const container = document.getElementById('kakaoMap');
     const options = {
       center: new kakao.maps.LatLng(37.5665, 126.9780),
       level: 5,
     };
   
     kakaoMap = new kakao.maps.Map(container, options);
   
     // 현재 위치로 이동
     locateMe();
   
     // 마커 로드
     loadMapMarkers();
   }
   
   /* ================================
      현위치 이동
      ================================ */
   function locateMe() {
     if (!navigator.geolocation) return;
     navigator.geolocation.getCurrentPosition(
       (pos) => {
         const { latitude, longitude } = pos.coords;
         const latlng = new kakao.maps.LatLng(latitude, longitude);
         kakaoMap.setCenter(latlng);
       },
       () => {
         // 위치 거부 시 서울 기본값 유지
       }
     );
   }
   
   /* ================================
      마커 렌더링
      ================================ */
   function loadMapMarkers() {
     // TODO: GET /api/posts/map
     fetch('/api/posts/map', {
       headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
     })
       .then(res => res.json())
       .then(data => renderMarkers(data.posts))
       .catch(() => renderMarkers(sampleMarkers));
   }
   
   function renderMarkers(posts) {
     // 기존 마커 제거
     markers.forEach(m => m.setMap(null));
     markers = [];
   
     posts.forEach(post => {
       const latlng = new kakao.maps.LatLng(post.latitude, post.longitude);
   
       // 커스텀 마커 이미지 (초록 원형)
       const marker = new kakao.maps.Marker({
         position: latlng,
         map: kakaoMap,
       });
   
       // 마커 클릭 시 하단 시트 업데이트
       kakao.maps.event.addListener(marker, 'click', () => {
         renderBottomSheet(post);
       });
   
       markers.push(marker);
     });
   
     // 게시글 있으면 첫 번째 하단 시트에 표시
     if (posts.length > 0) renderBottomSheet(posts[0]);
     else document.getElementById('mapBottomSheet').style.display = 'none';
   }
   
   /* ================================
      하단 시트 렌더링
      ================================ */
   function renderBottomSheet(post) {
     const sheet = document.getElementById('sheetPost');
     sheet.innerHTML = `
       <img class="sheet-post__image" src="${post.image}" alt="${post.title}"
         onerror="this.style.background='var(--gray-200)';this.src=''" />
       <div class="sheet-post__info">
         <div class="sheet-post__title">${post.title}</div>
         <div class="sheet-post__tags">
           ${post.tags.map(t => `<span>${t}</span>`).join('')}
         </div>
         <div class="sheet-post__footer">
           <div class="sheet-post__location">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
               <circle cx="12" cy="10" r="3"/>
             </svg>
             ${post.location}
           </div>
           <div class="sheet-post__actions">
             <button onclick="toggleLikeMap(event, ${post.id})">
               <svg width="20" height="20" viewBox="0 0 24 24"
                 fill="${post.liked ? '#e74c3c' : 'none'}"
                 stroke="${post.liked ? '#e74c3c' : '#bbb'}" stroke-width="2">
                 <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
               </svg>
             </button>
             <button onclick="toggleSaveMap(event, ${post.id})">
               <svg width="20" height="20" viewBox="0 0 24 24"
                 fill="${post.saved ? '#2DB400' : 'none'}"
                 stroke="${post.saved ? '#2DB400' : '#bbb'}" stroke-width="2">
                 <polygon points="19 21 12 16 5 21 5 3 19 3"/>
               </svg>
             </button>
           </div>
         </div>
       </div>
     `;
     sheet.onclick = () => window.location.href = `post-detail.html?id=${post.id}`;
   }
   
   function toggleLikeMap(e, postId) {
     e.stopPropagation();
     const svg = e.currentTarget.querySelector('svg');
     const isLiked = svg.getAttribute('fill') !== 'none';
     svg.setAttribute('fill', isLiked ? 'none' : '#e74c3c');
     svg.setAttribute('stroke', isLiked ? '#bbb' : '#e74c3c');
     // TODO: POST /api/posts/:id/like
   }
   
   function toggleSaveMap(e, postId) {
     e.stopPropagation();
     const svg = e.currentTarget.querySelector('svg');
     const isSaved = svg.getAttribute('fill') !== 'none';
     svg.setAttribute('fill', isSaved ? 'none' : '#2DB400');
     svg.setAttribute('stroke', isSaved ? '#bbb' : '#2DB400');
     // TODO: POST /api/posts/:id/save
   }
   
   /* ================================
      카카오맵 SDK 로드 후 초기화
      ================================ */
   if (typeof kakao !== 'undefined' && kakao.maps) {
     kakao.maps.load(initMap);
   } else {
     window.addEventListener('load', () => {
       if (typeof kakao !== 'undefined' && kakao.maps) {
         kakao.maps.load(initMap);
       }
     });
   }