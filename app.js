const revealElements = Array.from(document.querySelectorAll('.reveal'));

revealElements.forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 90}ms`;
  element.classList.remove('is-visible');
});

const revealOnScroll = () => {
  const viewportHeight = window.innerHeight;

  revealElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    const entersViewport = rect.top <= viewportHeight * 0.78;
    const stillOnScreen = rect.bottom >= viewportHeight * 0.12;

    if (entersViewport && stillOnScreen) {
      element.classList.add('is-visible');
    }
  });
};

window.addEventListener('load', revealOnScroll);
window.addEventListener('scroll', revealOnScroll, { passive: true });
window.addEventListener('resize', revealOnScroll);
document.addEventListener('DOMContentLoaded', revealOnScroll);
setTimeout(revealOnScroll, 120);

const music = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
const introOverlay = document.getElementById('introOverlay');
const enterTowerBtn = document.getElementById('enterTowerBtn');
const enterSilentBtn = document.getElementById('enterSilentBtn');
const MUSIC_KEY = 'wieza-maga-music-enabled';

if (music) {
  music.volume = 0.03;
}

let musicEnabled = localStorage.getItem(MUSIC_KEY) !== 'false';

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});

window.addEventListener('load', () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
});

const updateMusicButton = () => {
  if (!musicToggle) return;
  musicToggle.textContent = musicEnabled ? '🔊' : '🔇';
  musicToggle.setAttribute('aria-label', musicEnabled ? 'Wycisz muzykę' : 'Włącz muzykę');
};

const hideIntro = () => {
  if (!introOverlay) return;
  introOverlay.classList.add('is-hidden');
  introOverlay.classList.remove('is-leaving');
  document.body.style.overflow = 'auto';
  revealOnScroll();
};

const showIntro = () => {
  if (!introOverlay) return;
  introOverlay.classList.remove('is-hidden');
  introOverlay.classList.remove('is-leaving');
  document.body.style.overflow = 'hidden';
};

const cinematicHideIntro = () => new Promise((resolve) => {
  if (!introOverlay) {
    resolve();
    return;
  }

  if (introOverlay.classList.contains('is-leaving') || introOverlay.classList.contains('is-hidden')) {
    resolve();
    return;
  }

  introOverlay.classList.add('is-leaving');
  window.setTimeout(() => {
    hideIntro();
    resolve();
  }, 850);
});

const playMusic = async () => {
  if (!music) return;

  if (!musicEnabled) {
    music.pause();
    music.muted = true;
    updateMusicButton();
    return;
  }

  music.muted = false;

  try {
    await music.play();
  } catch (error) {
    console.warn('Nie udało się odtworzyć muzyki.', error);
  }

  updateMusicButton();
};

showIntro();
updateMusicButton();

if (enterTowerBtn) {
  enterTowerBtn.addEventListener('click', async () => {
    musicEnabled = true;
    localStorage.setItem(MUSIC_KEY, 'true');
    await playMusic();
    await cinematicHideIntro();
  });
}

if (enterSilentBtn) {
  enterSilentBtn.addEventListener('click', async () => {
    musicEnabled = false;
    localStorage.setItem(MUSIC_KEY, 'false');

    if (music) {
      music.pause();
      music.muted = true;
    }

    updateMusicButton();
    await cinematicHideIntro();
  });
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && musicEnabled && introOverlay && introOverlay.classList.contains('is-hidden')) {
    playMusic();
  }
});

if (musicToggle) {
  musicToggle.addEventListener('click', async () => {
    musicEnabled = !musicEnabled;
    localStorage.setItem(MUSIC_KEY, String(musicEnabled));

    if (musicEnabled) {
      await playMusic();
    } else if (music) {
      music.pause();
      music.muted = true;
      updateMusicButton();
    }
  });
}

const fakePlay = document.getElementById('fakePlay');

if (fakePlay) {
  fakePlay.addEventListener('click', () => {
    const video = document.createElement('video');
    video.src = 'trailer3.mp4';
    video.volume = 0.03;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.style.width = '100%';
    video.style.borderRadius = '24px';
    video.style.background = '#000';

    const trailerCard = fakePlay.closest('.card');

    if (trailerCard) {
      trailerCard.innerHTML = '';
      trailerCard.appendChild(video);
    }
  });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ===== LIGHTBOX GALLERY ===== */

const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
const lightbox = document.getElementById('lightbox');
const lightboxBackdrop = document.getElementById('lightboxBackdrop');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

const galleryData = galleryItems.map((item, index) => ({
  index,
  image: item.dataset.image || '',
  title: item.dataset.title || '',
  description: item.dataset.description || '',
}));

let currentGalleryIndex = 0;
let lastFocusedGalleryItem = null;

const renderLightboxItem = (index) => {
  const item = galleryData[index];
  if (!item || !lightboxImage || !lightboxTitle || !lightboxCaption) return;

  currentGalleryIndex = index;
  lightboxImage.src = item.image;
  lightboxImage.alt = item.title;
  lightboxTitle.textContent = item.title;
  lightboxCaption.textContent = item.description;
};

const openLightbox = (index) => {
  if (!lightbox || !galleryData.length) return;

  lastFocusedGalleryItem = document.activeElement;
  renderLightboxItem(index);

  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lightbox-open');

  if (lightboxClose) {
    lightboxClose.focus();
  }
};

const closeLightbox = () => {
  if (!lightbox) return;

  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lightbox-open');

  if (lastFocusedGalleryItem instanceof HTMLElement) {
    lastFocusedGalleryItem.focus();
  }
};

const showNextImage = () => {
  if (!galleryData.length) return;
  const nextIndex = (currentGalleryIndex + 1) % galleryData.length;
  renderLightboxItem(nextIndex);
};

const showPrevImage = () => {
  if (!galleryData.length) return;
  const prevIndex = (currentGalleryIndex - 1 + galleryData.length) % galleryData.length;
  renderLightboxItem(prevIndex);
};

galleryItems.forEach((item, index) => {
  item.addEventListener('click', () => {
    openLightbox(index);
  });
});

if (lightboxClose) {
  lightboxClose.addEventListener('click', closeLightbox);
}

if (lightboxBackdrop) {
  lightboxBackdrop.addEventListener('click', closeLightbox);
}

if (lightboxNext) {
  lightboxNext.addEventListener('click', showNextImage);
}

if (lightboxPrev) {
  lightboxPrev.addEventListener('click', showPrevImage);
}

document.addEventListener('keydown', (event) => {
  if (!lightbox || !lightbox.classList.contains('is-open')) return;

  if (event.key === 'Escape') {
    closeLightbox();
  }

  if (event.key === 'ArrowRight') {
    showNextImage();
  }

  if (event.key === 'ArrowLeft') {
    showPrevImage();
  }
});
/* ===== PREMIUM SCROLL INDICATOR ===== */

const scrollIndicator = document.querySelector('.scroll-indicator');
const scrollIndicatorBar = document.getElementById('scrollIndicatorBar');
const scrollIndicatorGlow = document.getElementById('scrollIndicatorGlow');
const themedSections = Array.from(document.querySelectorAll('[data-scroll-theme]'));

const scrollThemes = {
  violet: {
    accent1: 'rgba(131,96,255,0.95)',
    accent2: 'rgba(177,140,255,0.75)',
    glow: 'rgba(131,96,255,0.35)',
  },
  gold: {
    accent1: 'rgba(227,149,243,0.95)',
    accent2: 'rgba(255,214,143,0.72)',
    glow: 'rgba(227,149,243,0.34)',
  },
  blue: {
    accent1: 'rgba(94,166,255,0.95)',
    accent2: 'rgba(128,209,255,0.72)',
    glow: 'rgba(94,166,255,0.34)',
  },
  pink: {
    accent1: 'rgba(255,107,138,0.95)',
    accent2: 'rgba(255,164,196,0.76)',
    glow: 'rgba(255,107,138,0.34)',
  },
  red: {
    accent1: 'rgba(255,92,122,0.95)',
    accent2: 'rgba(255,140,110,0.72)',
    glow: 'rgba(255,92,122,0.34)',
  },
};

let scrollIndicatorTimeout = null;

const updateScrollIndicatorTheme = () => {
  if (!themedSections.length) return;

  const viewportMiddle = window.innerHeight * 0.42;
  let activeSection = themedSections[0];

  themedSections.forEach((section) => {
    const rect = section.getBoundingClientRect();

    if (rect.top <= viewportMiddle && rect.bottom >= viewportMiddle) {
      activeSection = section;
    }
  });

  const themeName = activeSection.dataset.scrollTheme || 'violet';
  const theme = scrollThemes[themeName] || scrollThemes.violet;

  document.documentElement.style.setProperty('--scroll-accent-1', theme.accent1);
  document.documentElement.style.setProperty('--scroll-accent-2', theme.accent2);
  document.documentElement.style.setProperty('--scroll-glow', theme.glow);
};

const updateScrollIndicatorProgress = () => {
  if (!scrollIndicatorBar || !scrollIndicatorGlow || !scrollIndicator) return;

  const scrollTop = window.scrollY || window.pageYOffset;
  const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = documentHeight > 0 ? scrollTop / documentHeight : 0;
  const indicatorHeight = scrollIndicator.clientHeight;
  const barHeight = Math.max(42, indicatorHeight * progress);

  scrollIndicatorBar.style.height = `${barHeight}px`;

  const glowY = Math.max(0, barHeight - 24);
  scrollIndicatorGlow.style.transform = `translate(-50%, ${glowY}px)`;

  scrollIndicator.classList.add('is-scrolling');

  window.clearTimeout(scrollIndicatorTimeout);
  scrollIndicatorTimeout = window.setTimeout(() => {
    scrollIndicator.classList.remove('is-scrolling');
  }, 120);
};

const updatePremiumScrollUI = () => {
  updateScrollIndicatorTheme();
  updateScrollIndicatorProgress();
};

window.addEventListener('scroll', updatePremiumScrollUI, { passive: true });
window.addEventListener('resize', updatePremiumScrollUI);
window.addEventListener('load', updatePremiumScrollUI);
document.addEventListener('DOMContentLoaded', updatePremiumScrollUI);

updatePremiumScrollUI();
