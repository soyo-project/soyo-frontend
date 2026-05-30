/* ================================
   Upload JS - 백엔드 연동
   POST /api/posts/ (multipart/form-data)
   ================================ */

   const BASE_URL = 'http://127.0.0.1:8000';

   const ALL_TAGS = [
     '조용한', '노을', '포토스팟', '사람적은', '혼자걷기좋은',
     '감성', '밤산책', '시원한', '공강추천', '벚꽃명소',
     '단풍명소', '여유로운', '비오는날좋은', '힐링',
     '멍때리기좋은', '야경명소', '햇살좋은'
   ];
   
   let selectedPhotos    = [];
   let selectedTags      = [];
   let selectedLocation  = null;
   let selectedVisibility = 'school';
   let kakaoMap          = null;
   let kakaoMarker       = null;
   
   const editParams = new URLSearchParams(window.location.search);
   const editPostId = editParams.get('edit');
   
   window.addEventListener('DOMContentLoaded', () => {
     initMap();
     loadTags();
     if (editPostId) {
       document.querySelector('.header-title').textContent = '게시글 수정';
       loadEditData(editPostId);
     }
   });
   
   /* 태그 목록 조회 */
   function loadTags() {
     fetch(`${BASE_URL}/api/posts/tags/`)
     .then(res => res.json())
     .then(data => {
       if (data.status === 'success' && data.data?.length > 0) {
         ALL_TAGS.length = 0;
         data.data.forEach(t => ALL_TAGS.push(t.name || t));
       }
     })
     .catch(() => {});
   }
   
   /* 카카오맵 초기화 */
   function initMap() {
     if (typeof kakao === 'undefined' || !kakao.maps) {
       document.getElementById('locationMap').innerHTML = `
         <div class="map-unavailable">
           <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
             <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
             <circle cx="12" cy="10" r="3"/>
           </svg>
           <p>upload.html의 YOUR_KAKAO_API_KEY를<br>발급받은 키로 교체해주세요</p>
         </div>`;
       return;
     }
     const container = document.getElementById('locationMap');
     const options   = { center: new kakao.maps.LatLng(37.5665, 126.9780), level: 4 };
     kakaoMap = new kakao.maps.Map(container, options);
   
     if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(
         (pos) => kakaoMap.setCenter(new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude)),
         () => {}
       );
     }
   
     kakao.maps.event.addListener(kakaoMap, 'click', (mouseEvent) => {
       const latlng = mouseEvent.latLng;
       placeMarker(latlng);
       reverseGeocode(latlng);
     });
   }
   
   function placeMarker(latlng) {
     if (kakaoMarker) kakaoMarker.setMap(null);
     kakaoMarker = new kakao.maps.Marker({ position: latlng });
     kakaoMarker.setMap(kakaoMap);
     selectedLocation = {
       latitude:  latlng.getLat(),
       longitude: latlng.getLng(),
       address:   `${latlng.getLat().toFixed(4)}, ${latlng.getLng().toFixed(4)}`
     };
   }
   
   function reverseGeocode(latlng) {
     const geocoder = new kakao.maps.services.Geocoder();
     geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result, status) => {
       if (status === kakao.maps.services.Status.OK) {
         const addr = result[0].road_address
           ? result[0].road_address.address_name
           : result[0].address.address_name;
         selectedLocation.address = addr;
         document.getElementById('locationText').textContent = addr;
         document.getElementById('locationSelected').style.display = 'flex';
       }
     });
   }
   
   function clearLocation() {
     selectedLocation = null;
     if (kakaoMarker) { kakaoMarker.setMap(null); kakaoMarker = null; }
     document.getElementById('locationSelected').style.display = 'none';
   }
   
   /* 사진 */
   function handlePhotoSelect(event) {
     const files    = Array.from(event.target.files);
     const remaining = 5 - selectedPhotos.length;
     files.slice(0, remaining).forEach(file => {
       selectedPhotos.push({ file, url: URL.createObjectURL(file) });
     });
     renderPhotoList();
     event.target.value = '';
   }
   
   function removePhoto(index) {
     URL.revokeObjectURL(selectedPhotos[index].url);
     selectedPhotos.splice(index, 1);
     renderPhotoList();
   }
   
   function renderPhotoList() {
     const list  = document.getElementById('photoList');
     const items = selectedPhotos.map((p, i) => `
       <div class="photo-item">
         <img src="${p.url}" alt="사진 ${i + 1}" />
         <button class="photo-remove" onclick="removePhoto(${i})">×</button>
       </div>`).join('');
     const addBtn = selectedPhotos.length < 5 ? `
       <label class="photo-add-btn" for="photoInput">
         <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
           <line x1="12" y1="5" x2="12" y2="19"/>
           <line x1="5" y1="12" x2="19" y2="12"/>
         </svg>
         <input type="file" id="photoInput" accept="image/*" multiple style="display:none" onchange="handlePhotoSelect(event)" />
       </label>` : '';
     list.innerHTML = items + addBtn;
   }
   
   /* 태그 */
   function openTagModal() {
     renderTagGrid();
     document.getElementById('tagModal').style.display = 'flex';
   }
   
   function closeTagModal() {
     document.getElementById('tagModal').style.display = 'none';
     renderSelectedTags();
   }
   
   function closeTagModalOutside(e) {
     if (e.target === document.getElementById('tagModal')) closeTagModal();
   }
   
   function renderTagGrid() {
     document.getElementById('tagGrid').innerHTML = ALL_TAGS.map(tag => `
       <button class="tag ${selectedTags.includes(tag) ? 'selected' : ''}"
         onclick="toggleTag('${tag}')">${tag}</button>`).join('');
   }
   
   function toggleTag(tag) {
     if (selectedTags.includes(tag)) {
       selectedTags = selectedTags.filter(t => t !== tag);
     } else {
       if (selectedTags.length >= 5) { showToast('태그는 최대 5개까지 선택할 수 있습니다.', 'error'); return; }
       selectedTags.push(tag);
     }
     renderTagGrid();
   }
   
   function renderSelectedTags() {
     document.getElementById('selectedTags').innerHTML = selectedTags.map(tag => `
       <span class="selected-tag">${tag}
         <button onclick="removeTag('${tag}')">×</button>
       </span>`).join('');
   }
   
   function removeTag(tag) {
     selectedTags = selectedTags.filter(t => t !== tag);
     renderSelectedTags();
   }
   
   /* 공개 범위 */
   function selectVisibility(btn) {
     document.querySelectorAll('.visibility-btn').forEach(b => b.classList.remove('active'));
     btn.classList.add('active');
     selectedVisibility = btn.dataset.value;
   }
   
   /* 게시글 등록/수정 */
   async function submitPost() {
     const title         = document.getElementById('courseTitle').value.trim();
     const content       = document.getElementById('content').value.trim();
     const distance      = parseFloat(document.getElementById('distance').value) || null;
     const duration      = parseInt(document.getElementById('duration').value)   || null;
     const startLocation = document.getElementById('startLocation').value.trim();
     const endLocation   = document.getElementById('endLocation').value.trim();
   
     if (selectedPhotos.length === 0) { showToast('사진을 최소 1장 선택해주세요.', 'error'); return; }
     if (!title) { showToast('코스 제목을 입력해주세요.', 'error'); return; }
   
     const token = localStorage.getItem('token');
     if (!token) {
       showToast('로그인이 필요합니다.', 'error');
       setTimeout(() => window.location.href = 'login.html', 1000);
       return;
     }
   
     const submitBtn = document.getElementById('submitBtn');
     submitBtn.textContent = '저장 중...';
     submitBtn.disabled = true;
   
     try {
       const formData = new FormData();
       formData.append('title',    title);
       formData.append('content',  content);
       formData.append('is_public', selectedVisibility);
       selectedTags.forEach(tag => formData.append('tags', tag));
       if (distance      !== null) formData.append('distance',       distance);
       if (duration      !== null) formData.append('duration',       duration);
       if (startLocation)          formData.append('start_location', startLocation);
       if (endLocation)            formData.append('end_location',   endLocation);
       if (selectedLocation) {
         formData.append('latitude',  selectedLocation.latitude);
         formData.append('longitude', selectedLocation.longitude);
       }
       selectedPhotos.forEach(p => { if (p.file) formData.append('images', p.file); });
   
       const url    = editPostId ? `${BASE_URL}/api/posts/${editPostId}/` : `${BASE_URL}/api/posts/`;
       const method = editPostId ? 'PATCH' : 'POST';
   
       const res  = await fetch(url, {
         method,
         headers: { Authorization: `Bearer ${token}` },
         body: formData
       });
       const data = await res.json();
   
       if (data.status === 'success') {
         showToast(data.message || '게시글이 등록되었습니다!', 'success');
         setTimeout(() => window.location.href = 'home.html', 800);
       } else if (res.status === 401) {
         showToast('로그인이 필요합니다.', 'error');
         localStorage.removeItem('token');
         setTimeout(() => window.location.href = 'login.html', 1000);
       } else {
         showToast(data.message || '등록에 실패했습니다.', 'error');
         submitBtn.textContent = editPostId ? '수정' : '등록';
         submitBtn.disabled = false;
       }
     } catch (err) {
       showToast('네트워크 오류가 발생했습니다.', 'error');
       submitBtn.textContent = editPostId ? '수정' : '등록';
       submitBtn.disabled = false;
     }
   }
   
   /* 수정 모드 데이터 로드 */
   async function loadEditData(id) {
     const token = localStorage.getItem('token');
     try {
       const res  = await fetch(`${BASE_URL}/api/posts/${id}/`, {
         headers: { Authorization: `Bearer ${token}` }
       });
       const data = await res.json();
       if (data.status === 'success') {
         const post = data.data;
         document.getElementById('courseTitle').value   = post.title       || '';
         document.getElementById('content').value       = post.content     || '';
         document.getElementById('distance').value      = post.distance    || '';
         document.getElementById('duration').value      = post.duration    || '';
         document.getElementById('startLocation').value = post.start_location || '';
         document.getElementById('endLocation').value   = post.end_location   || '';
         selectedTags = post.tags || [];
         renderSelectedTags();
         document.querySelectorAll('.visibility-btn').forEach(btn => {
           btn.classList.toggle('active', btn.dataset.value === post.is_public);
         });
         selectedVisibility = post.is_public || 'school';
         if (post.images?.length) {
           selectedPhotos = post.images.map(url => ({ file: null, url }));
           renderPhotoList();
         }
       }
     } catch (err) { console.error(err); }
   }
   
   function showToast(msg, type = 'success') {
     const existing = document.getElementById('upload-toast');
     if (existing) existing.remove();
     const toast = document.createElement('div');
     toast.id = 'upload-toast';
     toast.textContent = msg;
     toast.style.cssText = `
       position:fixed;bottom:90px;left:50%;transform:translateX(-50%);
       background:${type === 'error' ? '#e74c3c' : '#2DB400'};
       color:white;padding:12px 24px;border-radius:24px;
       font-size:14px;font-weight:600;z-index:9999;
       white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,0.2);`;
     document.body.appendChild(toast);
     setTimeout(() => toast.remove(), 2500);
   }