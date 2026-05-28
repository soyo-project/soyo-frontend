/* ================================
   Signup Email JS
   ================================ */

   let currentStep = 'email';
   let timerInterval = null;
   let timerSeconds = 180;
   
   function handleEmailStep() {
     if (currentStep === 'email') {
       submitEmail();
     } else {
       verifyCode();
     }
   }
   
   function submitEmail() {
     const username = document.getElementById('username').value.trim();
     const email    = document.getElementById('email').value.trim();
     const pw       = document.getElementById('password').value;
     const pwCheck  = document.getElementById('passwordConfirm').value;
     const errEl    = document.getElementById('emailError');
   
     // 유효성 검사
     if (!username) {
       showError(errEl, '아이디를 입력해주세요.'); return;
     }
     if (username.length < 2) {
       showError(errEl, '아이디는 2자 이상 입력해주세요.'); return;
     }
     if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
       showError(errEl, '올바른 이메일을 입력해주세요.'); return;
     }
     if (pw.length < 8) {
       showError(errEl, '비밀번호는 8자 이상이어야 합니다.'); return;
     }
     if (pw !== pwCheck) {
       showError(errEl, '비밀번호가 일치하지 않습니다.'); return;
     }
     hideError(errEl);
   
     // 세션에 임시 저장
     sessionStorage.setItem('signup_username', username);
     sessionStorage.setItem('signup_email', email);
     sessionStorage.setItem('signup_password', pw);
   
     // 백엔드 연동 전 임시: 인증코드 없이 바로 다음 단계
     // TODO: 백엔드 연동 시 아래 주석 해제
     // fetch('/api/auth/send-verify-email', { ... })
     switchToVerify();
   }
   
   function switchToVerify() {
     currentStep = 'verify';
     document.getElementById('stepEmail').style.display  = 'none';
     document.getElementById('stepVerify').style.display = 'block';
     document.getElementById('nextBtn').textContent = '인증하기';
   
     document.getElementById('step1').classList.add('done');
     document.getElementById('step2').classList.add('active');
     document.querySelectorAll('.step-label')[0].classList.remove('active');
     document.querySelectorAll('.step-label')[1].classList.add('active');
   
     startTimer();
   }
   
   function verifyCode() {
     const code  = document.getElementById('verifyCode').value.trim();
     const errEl = document.getElementById('verifyError');
   
     if (code.length !== 6) {
       showError(errEl, '6자리 코드를 입력해주세요.'); return;
     }
   
     // 백엔드 연동 전 임시: 코드 상관없이 통과
     // TODO: 백엔드 연동 시 실제 인증 요청으로 교체
     clearInterval(timerInterval);
     window.location.href = './signup-nickname.html';
   }
   
   function resendCode() {
     resetTimer();
   }
   
   function startTimer() {
     timerSeconds = 180;
     updateTimerDisplay();
     timerInterval = setInterval(() => {
       timerSeconds--;
       updateTimerDisplay();
       if (timerSeconds <= 0) {
         clearInterval(timerInterval);
         const el = document.getElementById('verifyTimer');
         el.textContent = '시간 초과. 재발송해주세요.';
         el.style.color = '#e74c3c';
       }
     }, 1000);
   }
   
   function resetTimer() {
     clearInterval(timerInterval);
     startTimer();
   }
   
   function updateTimerDisplay() {
     const m = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
     const s = String(timerSeconds % 60).padStart(2, '0');
     document.getElementById('verifyTimer').textContent = `${m}:${s}`;
   }
   
   function showError(el, msg) {
     el.textContent = msg;
     el.style.display = 'block';
   }
   
   function hideError(el) {
     el.style.display = 'none';
   }