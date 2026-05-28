/* ================================
   Calendar JS
   ================================ */

   let currentYear  = new Date().getFullYear();
   let currentMonth = new Date().getMonth(); // 0-indexed
   
   // localStorage에서 게시글 날짜별로 정리
   function getPostsByDate() {
     const posts = JSON.parse(localStorage.getItem('soyo_posts') || '[]');
     const byDate = {};
     posts.forEach(post => {
       if (!post.createdAt) return;
       const date = post.createdAt.substring(0, 10); // 'YYYY-MM-DD'
       if (!byDate[date]) byDate[date] = [];
       byDate[date].push({ image: post.images?.[0] || post.image || '' });
     });
     return byDate;
   }
   
   let selectedDate = null;
   let currentSlide = 0;
   
   function changeMonth(delta) {
     currentMonth += delta;
     if (currentMonth > 11) { currentMonth = 0; currentYear++; }
     if (currentMonth < 0)  { currentMonth = 11; currentYear--; }
     renderCalendar();
     document.getElementById('calDetail').style.display = 'none';
   }
   
   function renderCalendar() {
     document.getElementById('calMonthTitle').textContent =
       `${currentYear}년 ${currentMonth + 1}월`;
   
     const postsByDate = getPostsByDate();
     const grid      = document.getElementById('calGrid');
     const firstDay  = new Date(currentYear, currentMonth, 1).getDay();
     const daysInMonth     = new Date(currentYear, currentMonth + 1, 0).getDate();
     const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
     const today = new Date();
   
     let cells = '';
   
     // 이전 달
     for (let i = firstDay - 1; i >= 0; i--) {
       cells += `<div class="cal-cell other-month"><div class="cal-day">${daysInPrevMonth - i}</div></div>`;
     }
   
     // 현재 달
     for (let d = 1; d <= daysInMonth; d++) {
       const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
       const posts   = postsByDate[dateStr] || [];
       const isToday = today.getFullYear() === currentYear &&
                       today.getMonth() === currentMonth &&
                       today.getDate() === d;
       const hasPost = posts.length > 0;
   
       cells += `
         <div class="cal-cell ${isToday ? 'today' : ''} ${hasPost ? 'has-post' : ''}"
              onclick="selectDate('${dateStr}')">
           ${hasPost ? `<img class="cal-thumb" src="${posts[0].image}" alt="" />` : ''}
           <span class="${isToday ? 'cal-day-circle' : 'cal-day'}">${d}</span>
         </div>
       `;
     }
   
     // 다음 달
     const totalCells = firstDay + daysInMonth;
     const remaining  = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
     for (let d = 1; d <= remaining; d++) {
       cells += `<div class="cal-cell other-month"><div class="cal-day">${d}</div></div>`;
     }
   
     grid.innerHTML = cells;
   }
   
   function selectDate(dateStr) {
     const postsByDate = getPostsByDate();
     const posts = postsByDate[dateStr] || [];
     if (posts.length === 0) return;
   
     selectedDate = dateStr;
     currentSlide = 0;
   
     const detail = document.getElementById('calDetail');
     detail.style.display = 'flex';
     detail.style.flexDirection = 'column';
   
     const slider = document.getElementById('calSlider');
     slider.innerHTML = posts.map(p => `
       <div class="cal-slide">
         <img src="${p.image}" alt="post" onerror="this.style.background='var(--gray-200)'" />
       </div>
     `).join('');
   
     renderDots(posts.length);
   
     slider.onscroll = () => {
       const idx = Math.round(slider.scrollLeft / slider.offsetWidth);
       updateDots(idx, posts.length);
     };
   }
   
   function renderDots(count) {
     document.getElementById('calDots').innerHTML =
       Array.from({ length: count }, (_, i) =>
         `<div class="cal-dot ${i === 0 ? 'active' : ''}"></div>`
       ).join('');
   }
   
   function updateDots(activeIdx) {
     document.querySelectorAll('.cal-dot').forEach((dot, i) => {
       dot.classList.toggle('active', i === activeIdx);
     });
   }
   
   // TODO: 백엔드 연동 시 아래 사용
   // function loadCalendarData() {
   //   fetch(`/api/calendar?year=${currentYear}&month=${currentMonth + 1}`, {
   //     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
   //   })
   //     .then(res => res.json())
   //     .then(() => renderCalendar())
   //     .catch(() => renderCalendar());
   // }
   
   renderCalendar();