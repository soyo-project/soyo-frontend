/* ================================
   Post Detail JS
   ================================ */

const params = new URLSearchParams(window.location.search);
const postId = params.get('id');

// 샘플 데이터
const samplePost = {
  id: 1,
  title: '노을이 예쁜 산책길',
  tags: ['#노을맞집', '#혼자걷기좋은', '#사람적은'],
  description: '노을 맞집 발견~\n조용해서 혼자 걷기 딱 좋았어요',
  location: '태릉입구역',
  liked: true,
  saved: true,
  author: { nickname: '닉네임', avatar: 'https://via.placeholder.com/44/2DB400/white?text=U' },
  images: [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600',
    'https://images.unsplash.com/photo-1513836279014-a89f7d76ae86?w=600',
  ]
};

let postData = null;

function renderPost(post) {
  postData = post;

  // Author
  document.getElementById('authorAvatar').src = post.author.avatar;
  document.getElementById('authorName').textContent = post.author.nickname;

  // Slider
  const slider = document.getElementById('postSlider');
  slider.innerHTML = post.images.map(img => `
    <div class="post-slide"><img src="${img}" alt="post" /></div>
  `).join('');

  // Dots
  const dots = document.getElementById('postDots');
  dots.innerHTML = post.images.map((_, i) =>
    `<div class="post-dot ${i === 0 ? 'active' : ''}"></div>`
  ).join('');

  slider.addEventListener('scroll', () => {
    const idx = Math.round(slider.scrollLeft / slider.offsetWidth);
    dots.querySelectorAll('.post-dot').forEach((d, i) =>
      d.classList.toggle('active', i === idx)
    );
  });

  // Info
  document.getElementById('postTitle').textContent = post.title;
  document.getElementById('postTags').innerHTML = post.tags.map(t => `<span>${t}</span>`).join('');
  document.getElementById('postDesc').textContent = post.description;
  document.getElementById('postLocation').querySelector('span').textContent = post.location;

  // Like / Save state
  if (post.liked) document.getElementById('likeBtn').classList.add('liked');
  if (post.saved) document.getElementById('saveBtn').classList.add('saved');
}

function toggleLike() {
  const btn = document.getElementById('likeBtn');
  btn.classList.toggle('liked');
  // TODO: POST /api/posts/:id/like
}

function toggleSave() {
  const btn = document.getElementById('saveBtn');
  btn.classList.toggle('saved');
  // TODO: POST /api/posts/:id/save
}

function sharePost() {
  if (navigator.share) {
    navigator.share({ title: postData?.title, url: window.location.href });
  } else {
    navigator.clipboard.writeText(window.location.href).then(() => alert('링크가 복사되었습니다.'));
  }
}

function sendPost() { /* TODO: 친구에게 공유 */ }

function openPostOptions() {
  // TODO: 수정/삭제 바텀시트
}

function loadPost() {
  // 백엔드 연동 시: GET /api/posts/:id 로 교체
  try {
    const stored = JSON.parse(localStorage.getItem('soyo_posts') || '[]');
    const found  = stored.find(p => p.id == postId);
    if (found) {
      renderPost(found);
    } else {
      // localStorage에 없으면 샘플 데이터
      renderPost(samplePost);
    }
  } catch {
    renderPost(samplePost);
  }
}

loadPost();

/* ================================
   Post Options (수정/삭제/신고)
   플로우차트 4단계: 내 게시글인가?
   ================================ */

function openPostOptions() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isOwner = postData && postData.author && postData.author.id === user.id;

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
  if (!confirm('게시글을 삭제하시겠습니까?\n삭제 후 복구할 수 없습니다.')) return;

  // TODO: DELETE /api/posts/:id
  fetch(`/api/posts/${postId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert('게시글이 삭제되었습니다.');
        window.location.href = 'home.html';
      } else {
        alert(data.message || '삭제에 실패했습니다.');
      }
    })
    .catch(() => {
      alert('삭제에 실패했습니다.');
    });
}

function reportPost() {
  closePostOptions();
  // TODO: POST /api/posts/:id/report
  if (confirm('이 게시글을 신고하시겠습니까?')) {
    fetch(`/api/posts/${postId}/report`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(() => alert('신고가 접수되었습니다.'))
      .catch(() => alert('신고 접수에 실패했습니다.'));
  }
}