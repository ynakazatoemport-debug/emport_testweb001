document.addEventListener('DOMContentLoaded', () => {

  /* ---- Mobile nav toggle ---- */
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (navToggle && mainNav) {
    const closeNav = () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeNav);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
    });
    // ウィンドウ幅がハンバーガー表示のブレークポイントを超えたら、
    // 開いたままのメニューが残らないよう自動で閉じる
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1040) closeNav();
    });
  }

  /* ---- Footer year ---- */
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  /* ---- Scroll reveal (subtle, respects reduced motion) ----
     以前はスクロールのたびに全要素の位置をgetBoundingClientRectで計算する方式に
     していたが、非力なノートPC（省電力設定・内蔵グラフィックスなど）ではこの
     計算処理自体が重く、メインスレッドが詰まってアニメーションが機能しないことが
     あった。ブラウザ側で最適化されているIntersectionObserverに戻し、要素が画面内に
     入ったときだけ処理する（＝スクロール中に毎回全要素を計算しない）ことで負荷を
     大きく減らしている。あわせて、既に画面内にある要素でもアニメーションが必ず
     再生されるよう、表示直前に1フレーム分の「非表示状態」を挟む処理は維持する。 */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls = Array.from(document.querySelectorAll('.reveal, .reveal-left, .reveal-right'));

  const showReveal = (el) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => el.classList.add('is-visible'));
    });
  };

  if (prefersReduced || revealEls.length === 0) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          showReveal(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    // IntersectionObserver非対応の古いブラウザ向けフォールバック
    revealEls.forEach(el => showReveal(el));
  }

  /* ---- Hero video: gentle parallax (disabled for reduced motion) ---- */
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo && !prefersReduced) {
    let ticking = false;
    const updateParallax = () => {
      const shift = Math.min(window.scrollY * 0.12, 60);
      heroVideo.style.setProperty('--parallax', shift + 'px');
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }
});
