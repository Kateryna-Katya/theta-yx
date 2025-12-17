document.addEventListener('DOMContentLoaded', () => {

    /* ================================================================
       1. ИНИЦИАЛИЗАЦИЯ БИБЛИОТЕК (С ЗАЩИТОЙ ОТ ОШИБОК)
       ================================================================ */
    
    // --- ICONS ---
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // --- SMOOTH SCROLL (LENIS) ---
    let lenis;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smooth: true,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    } else {
        console.warn('Lenis не загружен. Используется стандартный скролл.');
        document.documentElement.style.scrollBehavior = 'smooth';
    }

    // --- GSAP SETUP ---
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    /* ================================================================
       2. МОБИЛЬНОЕ МЕНЮ
       ================================================================ */
    const burger = document.querySelector('.header__burger');
    const nav = document.querySelector('.header__nav');
    const links = document.querySelectorAll('.header__link, .header__actions .btn');

    function toggleMenu() {
        if (!nav) return;
        const isActive = nav.classList.toggle('is-active');
        
        // Блокируем скролл страницы, когда меню открыто
        document.body.style.overflow = isActive ? 'hidden' : '';
    }

    if (burger) {
        burger.addEventListener('click', toggleMenu);
    }

    // Закрываем меню при клике на любую ссылку
    links.forEach(link => {
        link.addEventListener('click', () => {
            if (nav && nav.classList.contains('is-active')) {
                toggleMenu();
            }
        });
    });

    /* ================================================================
       3. FAQ АККОРДЕОН
       ================================================================ */
    const faqItems = document.querySelectorAll('.faq__item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq__question');
        const answer = item.querySelector('.faq__answer');

        if (question && answer) {
            question.addEventListener('click', () => {
                // Если хотим, чтобы открывался только один за раз — раскомментируй строки ниже:
                /*
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                        otherItem.querySelector('.faq__answer').style.maxHeight = null;
                    }
                });
                */

                const isActive = item.classList.toggle('active');

                if (isActive) {
                    answer.style.maxHeight = answer.scrollHeight + "px";
                } else {
                    answer.style.maxHeight = null;
                }
            });
        }
    });

    /* ================================================================
       4. ФОРМА КОНТАКТОВ (ВАЛИДАЦИЯ + КАПЧА)
       ================================================================ */
    const form = document.getElementById('leadForm');
    
    if (form) {
        const phoneInput = document.getElementById('phoneInput');
        const captchaQ = document.getElementById('captchaQuestion');
        const captchaInput = document.getElementById('captchaInput');
        const msgBox = document.getElementById('formMessage');

        // Валидация телефона (удаляем буквы)
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9+\s-]/g, '');
            });
        }

        // Генерация математической капчи
        let num1 = Math.floor(Math.random() * 10);
        let num2 = Math.floor(Math.random() * 10);
        if (captchaQ) captchaQ.textContent = `${num1} + ${num2} = ?`;

        // Обработка отправки
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (!msgBox || !captchaInput) return;

            msgBox.style.display = 'none';
            msgBox.className = 'form-message';

            // 1. Проверка капчи
            if (parseInt(captchaInput.value) !== (num1 + num2)) {
                msgBox.textContent = "Ошибка: Неверный ответ на пример.";
                msgBox.classList.add('error');
                msgBox.style.display = 'block';
                return;
            }

            // 2. Имитация AJAX отправки
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            
            btn.textContent = "Отправка...";
            btn.disabled = true;

            setTimeout(() => {
                // Успех
                btn.textContent = originalText;
                btn.disabled = false;
                form.reset();
                
                // Генерируем новый пример
                num1 = Math.floor(Math.random() * 10);
                num2 = Math.floor(Math.random() * 10);
                if (captchaQ) captchaQ.textContent = `${num1} + ${num2} = ?`;

                msgBox.textContent = "Спасибо! Данные успешно отправлены. Мы свяжемся с вами.";
                msgBox.classList.add('success');
                msgBox.style.display = 'block';
                
                // Сохраняем флаг отправки
                localStorage.setItem('lead_sent', 'true');
            }, 1500);
        });
    }

    /* ================================================================
       5. АНИМАЦИИ (GSAP)
       ================================================================ */
    if (typeof gsap !== 'undefined') {
        
        // Hero Анимация (Timeline)
        const heroTl = gsap.timeline();
        
        // Проверяем наличие элементов перед анимацией
        if (document.querySelector('.hero__title')) {
            heroTl.from('.hero__label', { y: 20, opacity: 0, duration: 0.8, delay: 0.2 })
                  .from('.hero__title', { y: 50, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.4")
                  .to('.hero__subtitle', { opacity: 1, duration: 1 }, "-=0.6")
                  .from('.hero__actions', { scale: 0.9, opacity: 0, duration: 0.5 }, "-=0.4");
        }

        // ScrollTrigger для всех секций
        const sections = document.querySelectorAll('section:not(.hero)');
        sections.forEach(section => {
            gsap.from(section.children, {
                scrollTrigger: {
                    trigger: section,
                    start: "top 80%", // Начинать анимацию, когда верх секции достигает 80% экрана
                    toggleActions: "play none none reverse"
                },
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1 // Задержка между появлением дочерних элементов
            });
        });
    }

    /* ================================================================
       6. COOKIE POPUP
       ================================================================ */
    if (!localStorage.getItem('cookiesAccepted')) {
        const cookieDiv = document.createElement('div');
        cookieDiv.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; 
            background: #141A29; border: 1px solid rgba(255,255,255,0.1); 
            padding: 20px; max-width: 300px; z-index: 999; 
            border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            display: flex; flex-direction: column; gap: 10px;
        `;
        
        cookieDiv.innerHTML = `
            <p style="font-size: 13px; color: #94A3B8; margin: 0;">Этот сайт использует cookies для улучшения работы.</p>
            <button id="acceptCookies" style="
                background: #6366F1; color: white; border: none; 
                padding: 8px 16px; border-radius: 6px; cursor: pointer; 
                font-size: 12px; align-self: flex-start; font-weight: 600;
            ">Принять</button>
        `;
        document.body.appendChild(cookieDiv);

        const acceptBtn = document.getElementById('acceptCookies');
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                localStorage.setItem('cookiesAccepted', 'true');
                cookieDiv.style.opacity = '0';
                setTimeout(() => cookieDiv.remove(), 300);
            });
        }
    }
});