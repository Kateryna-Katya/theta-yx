document.addEventListener('DOMContentLoaded', () => {

  // --- 1. SETUP ICONS & SCROLL ---
  lucide.createIcons();

  const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
  });

  function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Register GSAP ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);


  // --- 2. MOBILE MENU LOGIC ---
  const burger = document.querySelector('.header__burger');
  const nav = document.querySelector('.header__nav');
  const links = document.querySelectorAll('.header__link');

  function toggleMenu() {
      nav.classList.toggle('is-active');
      document.body.style.overflow = nav.classList.contains('is-active') ? 'hidden' : '';
  }

  burger.addEventListener('click', toggleMenu);

  // Закрываем меню при клике на ссылку
  links.forEach(link => {
      link.addEventListener('click', () => {
          if(nav.classList.contains('is-active')) {
              toggleMenu();
          }
      });
  });


  // --- 3. ANIMATIONS (GSAP) ---

  // Hero Text Reveal
  const heroTl = gsap.timeline();
  heroTl.from('.hero__label', { y: 20, opacity: 0, duration: 0.8, delay: 0.2 })
        .from('.hero__title', { y: 50, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.4")
        .to('.hero__subtitle', { opacity: 1, duration: 1 }, "-=0.6")
        .from('.hero__actions', { scale: 0.9, opacity: 0, duration: 0.5 }, "-=0.4");

  // Scroll Animations for Sections
  const sections = document.querySelectorAll('section:not(.hero)');
  sections.forEach(section => {
      gsap.from(section.children, {
          scrollTrigger: {
              trigger: section,
              start: "top 80%",
              toggleActions: "play none none reverse"
          },
          y: 50,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1
      });
  });


  // --- 4. FORM LOGIC ---

  const form = document.getElementById('leadForm');
  const phoneInput = document.getElementById('phoneInput');
  const captchaQ = document.getElementById('captchaQuestion');
  const captchaInput = document.getElementById('captchaInput');
  const msgBox = document.getElementById('formMessage');

  // Phone Validation (Only digits allowed visually)
  phoneInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9+\s-]/g, '');
  });

  // Math Captcha Generation
  let num1 = Math.floor(Math.random() * 10);
  let num2 = Math.floor(Math.random() * 10);
  captchaQ.textContent = `${num1} + ${num2} = ?`;

  // Form Submit
  form.addEventListener('submit', (e) => {
      e.preventDefault();
      msgBox.style.display = 'none';
      msgBox.className = 'form-message';

      // 1. Check Captcha
      if(parseInt(captchaInput.value) !== (num1 + num2)) {
          msgBox.textContent = "Ошибка: Неверный ответ на пример.";
          msgBox.classList.add('error');
          msgBox.style.display = 'block';
          return;
      }

      // 2. Simulate AJAX
      const btn = form.querySelector('button');
      const originalText = btn.textContent;
      btn.textContent = "Отправка...";
      btn.disabled = true;

      setTimeout(() => {
          // Success
          btn.textContent = originalText;
          btn.disabled = false;
          form.reset();

          // Re-generate captcha
          num1 = Math.floor(Math.random() * 10);
          num2 = Math.floor(Math.random() * 10);
          captchaQ.textContent = `${num1} + ${num2} = ?`;

          msgBox.textContent = "Спасибо! Данные успешно отправлены. Мы свяжемся с вами.";
          msgBox.classList.add('success');
          msgBox.style.display = 'block';

          // Save to localStorage (simulate cookie/tracker)
          localStorage.setItem('lead_sent', 'true');
      }, 1500);
  });

  // --- 5. COOKIE POPUP (Simple implementation) ---
  if (!localStorage.getItem('cookiesAccepted')) {
      const cookieDiv = document.createElement('div');
      cookieDiv.style.cssText = "position: fixed; bottom: 20px; right: 20px; background: #141A29; border: 1px solid rgba(255,255,255,0.1); padding: 20px; max-width: 300px; z-index: 999; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);";
      cookieDiv.innerHTML = `
          <p style="font-size: 13px; color: #94A3B8; margin-bottom: 12px;">Этот сайт использует cookies для улучшения работы.</p>
          <button id="acceptCookies" style="background: #6366F1; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px;">Принять</button>
      `;
      document.body.appendChild(cookieDiv);

      document.getElementById('acceptCookies').addEventListener('click', () => {
          localStorage.setItem('cookiesAccepted', 'true');
          cookieDiv.remove();
      });
  }
});