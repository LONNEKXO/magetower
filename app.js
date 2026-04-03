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

music.volume = 0.03;

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
  musicToggle.textContent = musicEnabled ? '🔊' : '🔇';
  musicToggle.setAttribute('aria-label', musicEnabled ? 'Wycisz muzykę' : 'Włącz muzykę');
};

const hideIntro = () => {
  introOverlay.classList.add('is-hidden');
  introOverlay.classList.remove('is-leaving');
  document.body.style.overflow = 'auto';
  revealOnScroll();
};

const showIntro = () => {
  introOverlay.classList.remove('is-hidden');
  introOverlay.classList.remove('is-leaving');
  document.body.style.overflow = 'hidden';
};

const cinematicHideIntro = () => new Promise((resolve) => {
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

enterTowerBtn.addEventListener('click', async () => {
  musicEnabled = true;
  localStorage.setItem(MUSIC_KEY, 'true');
  await playMusic();
  await cinematicHideIntro();
});

enterSilentBtn.addEventListener('click', async () => {
  musicEnabled = false;
  localStorage.setItem(MUSIC_KEY, 'false');
  music.pause();
  music.muted = true;
  updateMusicButton();
  await cinematicHideIntro();
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && musicEnabled && introOverlay.classList.contains('is-hidden')) {
    playMusic();
  }
});

musicToggle.addEventListener('click', async () => {
  musicEnabled = !musicEnabled;
  localStorage.setItem(MUSIC_KEY, String(musicEnabled));

  if (musicEnabled) {
    await playMusic();
  } else {
    music.pause();
    music.muted = true;
    updateMusicButton();
  }
});

const fakePlay = document.getElementById('fakePlay');
if (fakePlay) {
  fakePlay.addEventListener('click', () => {
    const video = document.createElement('video');
    video.src = 'trailer.mp4';
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