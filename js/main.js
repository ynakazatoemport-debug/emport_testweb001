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
     PCの画面サイズ・アスペクト比によってIntersectionObserverの初回判定が
     うまく効かないケースがあったため、getBoundingClientRect を使った
     シンプルな判定方式に変更。load / scroll / resize の複数タイミングで
     チェックし、どんな画面サイズでも取りこぼさないようにしている。 */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls = Array.from(document.querySelectorAll('.reveal, .reveal-left, .reveal-right'));

  if (prefersReduced || revealEls.length === 0) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    let revealTicking = false;
    const checkReveal = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      revealEls.forEach(el => {
        if (el.classList.contains('is-visible')) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < vh * 0.94 && rect.bottom > 0) {
          el.classList.add('is-visible');
        }
      });
      revealTicking = false;
    };

    // 読み込み直後に checkReveal() を同期実行すると、ブラウザが「非表示状態」を
    // 一度も描画しないまま is-visible が付いてしまい、トランジションが視覚的に
    // 発生しないことがあった（画面内に最初から入っている要素が多い＝大きい画面ほど
    // 症状が起きやすかった）。rAFを2重に挟み、非表示状態を確実に1フレーム描画してから
    // 表示状態に切り替えることで、画面サイズに関わらずアニメーションが必ず再生されるようにする。
    requestAnimationFrame(() => {
      requestAnimationFrame(checkReveal);
    });

    window.addEventListener('scroll', () => {
      if (!revealTicking) {
        window.requestAnimationFrame(checkReveal);
        revealTicking = true;
      }
    }, { passive: true });
    window.addEventListener('resize', checkReveal);
    window.addEventListener('load', checkReveal);
    // 動画や画像の読み込みでレイアウトが後から変わる場合の保険
    setTimeout(checkReveal, 600);
    setTimeout(checkReveal, 1500);
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
