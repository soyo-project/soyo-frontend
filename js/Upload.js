/* ================================
   Upload JS
   API 명세서 기준 연동
   POST /api/posts  (multipart/form-data)
   Authorization: Bearer {access_token}
   ================================ */

   const ALL_TAGS = [
    '조용한', '노을', '포토스팟', '사람적은', '혼자걷기좋은',
    '감성', '밤산책', '시원한', '공강추천', '벚꽃명소',
    '단풍명소', '여유로운', '비오는날좋은', '힐링',
    '멍때리기좋은', '야경명소', '햇살좋은'
  ];
  
  let selectedPhotos   = [];    // { file, url }
  let selectedTags     = [];    // string[]
  let selectedLocation = null;  // { latitude, longitude, address }
  let selectedVisibility = 'school'; // 'school' | 'public' | 'private'
  let kakaoMap         = null;
  let kakaoMarker      = null;
  
  const editParams = new URLSearchParams(window.location.search);
  const editPostId = editParams.get('edit');
  
  /* ================================
     초기화
     ================================ */
  window.addEventListener('DOMContentLoaded', () => {
    initMap();
    if (editPostId) {
      document.querySelector('.header-title').textContent = '게시글 수정';
      loadEditData(editPostId);
    }
  });
  
  /* ================================
     카카오맵 초기화
     ================================ */
  function initMap() {
    if (typeof kakao === 'undefined' || !kakao.maps) {
      // SDK 미로드 시 안내 표시
      document.getElementById('locationMap').innerHTML = `
        <div class="map-unavailable">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <p>upload.html의 YOUR_KAKAO_API_KEY를<br>발급받은 키로 교체해주세요</p>
        </div>
      `;
      return;
    }
  
    const container = document.getElementById('locationMap');
    const options = {
      center: new kakao.maps.LatLng(37.5665, 126.9780), // 서울 기본
      level: 4,
    };
  
    kakaoMap = new kakao.maps.Map(container, options);
  
    // 현재 위치로 자동 이동
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latlng = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
          kakaoMap.setCenter(latlng);
        },
        () => {} // 위치 거부 시 서울 기본값 유지
      );
    }
  
    // 클릭 시 마커 & 좌표 저장
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
      address: `${latlng.getLat().toFixed(4)}, ${latlng.getLng().toFixed(4)}`,
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
  
  /* ================================
     사진 선택 & 미리보기
     ================================ */
  function handlePhotoSelect(event) {
    const files = Array.from(event.target.files);
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
    const list = document.getElementById('photoList');
    const items = selectedPhotos.map((p, i) => `
      <div class="photo-item">
        <img src="${p.url}" alt="사진 ${i + 1}" />
        <button class="photo-remove" onclick="removePhoto(${i})">×</button>
      </div>
    `).join('');
  
    const addBtn = selectedPhotos.length < 5 ? `
      <label class="photo-add-btn" for="photoInput">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        <input type="file" id="photoInput" accept="image/*" multiple style="display:none" onchange="handlePhotoSelect(event)" />
      </label>
    ` : '';
  
    list.innerHTML = items + addBtn;
  }
  
  /* ================================
     태그 선택
     ================================ */
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
        onclick="toggleTag('${tag}')">
        ${tag}
      </button>
    `).join('');
  }
  
  function toggleTag(tag) {
    if (selectedTags.includes(tag)) {
      selectedTags = selectedTags.filter(t => t !== tag);
    } else {
      if (selectedTags.length >= 5) {
        showToast('태그는 최대 5개까지 선택할 수 있습니다.', 'error');
        return;
      }
      selectedTags.push(tag);
    }
    renderTagGrid();
  }
  
  function renderSelectedTags() {
    document.getElementById('selectedTags').innerHTML = selectedTags.map(tag => `
      <span class="selected-tag">
        ${tag}
        <button onclick="removeTag('${tag}')">×</button>
      </span>
    `).join('');
  }
  
  function removeTag(tag) {
    selectedTags = selectedTags.filter(t => t !== tag);
    renderSelectedTags();
  }
  
  /* ================================
     공개 범위 선택
     ================================ */
  function selectVisibility(btn) {
    document.querySelectorAll('.visibility-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedVisibility = btn.dataset.value;
  }
  
  /* ================================
     게시글 등록 (API 명세서 기준)
     POST /api/posts
     multipart/form-data
     ================================ */
  async function submitPost() {
    const title         = document.getElementById('courseTitle').value.trim();
    const content       = document.getElementById('content').value.trim();
    const distance      = parseFloat(document.getElementById('distance').value) || null;
    const duration      = parseInt(document.getElementById('duration').value)   || null;
    const startLocation = document.getElementById('startLocation').value.trim();
    const endLocation   = document.getElementById('endLocation').value.trim();
  
    // ── 유효성 검사 ──────────────────────────
    if (selectedPhotos.length === 0) {
      showToast('사진을 최소 1장 선택해주세요.', 'error'); return;
    }
    if (!title) {
      showToast('코스 제목을 입력해주세요.', 'error'); return;
    }
  
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('로그인이 필요합니다.', 'error');
      setTimeout(() => window.location.href = 'login.html', 1000);
      return;
    }
  
    // ── 버튼 로딩 상태 ───────────────────────
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.textContent = '저장 중...';
    submitBtn.disabled = true;
  
    try {
      // ── FormData 구성 (명세서 필드명 그대로) ─
      const formData = new FormData();
  
      formData.append('title',          title);
      formData.append('content',        content);
      formData.append('is_public',      selectedVisibility);
  
      // 태그 배열 — 각각 append
      selectedTags.forEach(tag => formData.append('tags', tag));
  
      // 선택 입력값 (값 있을 때만 전송)
      if (distance      !== null) formData.append('distance',       distance);
      if (duration      !== null) formData.append('duration',       duration);
      if (startLocation)          formData.append('start_location', startLocation);
      if (endLocation)            formData.append('end_location',   endLocation);
  
      // 위도/경도
      if (selectedLocation) {
        formData.append('latitude',  selectedLocation.latitude);
        formData.append('longitude', selectedLocation.longitude);
      }
  
      // 이미지 파일들
      selectedPhotos.forEach(p => {
        if (p.file) formData.append('images', p.file);
      });
  
      // ── API 호출 ──────────────────────────
      const url    = editPostId ? `/api/posts/${editPostId}` : '/api/posts';
      const method = editPostId ? 'PATCH' : 'POST';
  
      const res  = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        // Content-Type은 FormData 사용 시 자동 설정 (직접 넣으면 boundary 깨짐)
        body: formData,
      });
  
      const data = await res.json();
  
      // ── 응답 처리 (명세서 기준) ───────────
      if (res.ok && data.status === 'success') {
        showToast(data.message || '게시글이 작성되었습니다.', 'success');
        setTimeout(() => window.location.href = 'home.html', 800);
  
      } else if (res.status === 401) {
        // 토큰 만료
        showToast(data.message || '로그인이 필요합니다.', 'error');
        localStorage.removeItem('token');
        setTimeout(() => window.location.href = 'login.html', 1000);
  
      } else {
        // 400 등 기타 에러
        showToast(data.message || '등록에 실패했습니다.', 'error');
        submitBtn.textContent = editPostId ? '수정' : '등록';
        submitBtn.disabled = false;
      }
  
    } catch (err) {
      console.error(err);
      showToast('네트워크 오류가 발생했습니다.', 'error');
      submitBtn.textContent = editPostId ? '수정' : '등록';
      submitBtn.disabled = false;
    }
  }
  
  /* ================================
     수정 모드: 기존 데이터 불러오기
     GET /api/posts/:id
     ================================ */
  async function loadEditData(id) {
    try {
      const res  = await fetch(`/api/posts/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
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
  
        // 공개범위 버튼 상태 복원
        document.querySelectorAll('.visibility-btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.value === post.is_public);
        });
        selectedVisibility = post.is_public || 'school';
  
        // 기존 이미지 미리보기 (URL만, file=null)
        if (post.images?.length) {
          selectedPhotos = post.images.map(url => ({ file: null, url }));
          renderPhotoList();
        }
      }
    } catch (err) {
      console.error('수정 데이터 로드 실패:', err);
    }
  }
  
  /* ================================
     토스트 메시지
     ================================ */
  function showToast(msg, type = 'success') {
    const existing = document.getElementById('upload-toast');
    if (existing) existing.remove();
  
    const toast = document.createElement('div');
    toast.id = 'upload-toast';
    toast.textContent = msg;
    toast.style.cssText = `
      position: fixed;
      bottom: 90px;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'error' ? '#e74c3c' : '#2DB400'};
      color: white;
      padding: 12px 24px;
      border-radius: 24px;
      font-size: 14px;
      font-weight: 600;
      z-index: 9999;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }