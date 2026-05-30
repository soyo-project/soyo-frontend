/* ================================
   Calendar JS - 백엔드 연동
   ================================ */

   const BASE_URL = 'http://127.0.0.1:8000';
   let currentYear  = new Date().getFullYear();
   let currentMonth = new Date().getMonth();
   let postsByDate  = {};
   
   /* 이미지 경로 변환: /media/... → http://127.0.0.1:8000/media/... */
   function imgUrl(url) {
     if (!url) return '';
     return url.startsWith('http') ? url : `${BASE_URL}${url}`;
   }
   
   
   function changeMonth(delta) {
     currentMonth += delta;
     if (currentMonth > 11) { currentMonth = 0; currentYear++; }
     if (currentMonth < 0)  { currentMonth = 11; currentYear--; }
     loadCalendarData();
     document.getElementById('calDetail').style.display = 'none';
   }
   
   function loadCalendarData() {
     const token = localStorage.getItem('token');
     fetch(`${BASE_URL}/api/posts/?year=${currentYear}&month=${currentMonth + 1}`, {
       headers: { Authorization: `Bearer ${token}` }
     })
     .then(res => res.json())
     .then(data => {
       postsByDate = {};
       if (data.status === 'success') {
         (data.data || []).forEach(post => {
           const date = (post.created_at || '').substring(0, 10);
           if (!date) return;
           if (!postsByDate[date]) postsByDate[date] = [];
           postsByDate[date].push({ image: imgUrl(post.images?.[0] || '') });
         });
       }
       renderCalendar();
     })
     .catch(() => renderCalendar());
   }
   
   function renderCalendar() {
     document.getElementById('calMonthTitle').textContent =
       `${currentYear}년 ${currentMonth + 1}월`;
   
     const grid        = document.getElementById('calGrid');
     const firstDay    = new Date(currentYear, currentMonth, 1).getDay();
     const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
     const daysInPrev  = new Date(currentYear, currentMonth, 0).getDate();
     const today       = new Date();
     let cells = '';
   
     for (let i = firstDay - 1; i >= 0; i--) {
       cells += `<div class="cal-cell other-month"><div class="cal-day">${daysInPrev - i}</div></div>`;
     }
   
     for (let d = 1; d <= daysInMonth; d++) {
       const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
       const posts   = postsByDate[dateStr] || [];
       const isToday = today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === d;
       const hasPost = posts.length > 0;
   
       cells += `
         <div class="cal-cell ${isToday ? 'today' : ''} ${hasPost ? 'has-post' : ''}"
              onclick="selectDate('${dateStr}')">
           ${hasPost ? `<img class="cal-thumb" src="${posts[0].image}" alt="" />` : ''}
           <span class="${isToday ? 'cal-day-circle' : 'cal-day'}">${d}</span>
         </div>`;
     }
   
     const totalCells = firstDay + daysInMonth;
     const remaining  = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
     for (let d = 1; d <= remaining; d++) {
       cells += `<div class="cal-cell other-month"><div class="cal-day">${d}</div></div>`;
     }
   
     grid.innerHTML = cells;
   }
   
   function selectDate(dateStr) {
     // 날짜별 게시글 조회
     const token = localStorage.getItem('token');
     fetch(`${BASE_URL}/api/posts/?date=${dateStr}`, {
       headers: { Authorization: `Bearer ${token}` }
     })
     .then(res => res.json())
     .then(data => {
       const posts = data.status === 'success' ? (data.data || []) : [];
       if (posts.length === 0) return;
   
       const detail = document.getElementById('calDetail');
       detail.style.display = 'flex';
       detail.style.flexDirection = 'column';
   
       document.getElementById('calSlider').innerHTML = posts.map(p => `
         <div class="cal-slide">
           <img src="${imgUrl(p.images?.[0] || '')}" alt="post"
             onerror="this.style.background='var(--gray-200)'" />
         </div>`).join('');
   
       renderDots(posts.length);
   
       document.getElementById('calSlider').onscroll = function() {
         const idx = Math.round(this.scrollLeft / this.offsetWidth);
         updateDots(idx);
       };
     })
     .catch(() => {});
   }
   
   function renderDots(count) {
     document.getElementById('calDots').innerHTML =
       Array.from({ length: count }, (_, i) =>
         `<div class="cal-dot ${i === 0 ? 'active' : ''}"></div>`).join('');
   }
   
   function updateDots(activeIdx) {
     document.querySelectorAll('.cal-dot').forEach((dot, i) => {
       dot.classList.toggle('active', i === activeIdx);
     });
   }
   
   loadCalendarData();