const startDate = new Date("2024-05-28T00:00:00");

function updateTimer() {
  const now = new Date();
  const diff = now - startDate;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / 1000 / 60) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  const timer = document.getElementById("love-timer");
  if (timer) {
    timer.textContent = `${days} Days, ${hours} Hours, ${mins} Minutes, and ${secs} Seconds of Us.`;
  }
}

function typeText() {
  const typingEl = document.querySelector(".typing");
  if (!typingEl) return;

  const text = typingEl.dataset.text || "To [Name], My Forever Valentine.";
  let idx = 0;

  const step = () => {
    typingEl.textContent = text.slice(0, idx);
    if (idx < text.length) {
      idx += 1;
      setTimeout(step, 90);
    }
  };

  step();
}

function observeMoments() {
  const moments = document.querySelectorAll(".moment");
  if (!moments.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.35 }
  );

  moments.forEach((moment) => observer.observe(moment));
}

const slideshowKeys = [
  "cluster-a-1",
  "cluster-a-2",
  "cluster-a-3",
  "timeline-1",
  "timeline-2",
  "timeline-3",
  "cluster-b-1",
  "cluster-b-2",
  "cluster-b-3",
  "letter-1",
  "letter-2",
];

const maxItemsPerSlideshow = 15;

let slideshowData = Object.fromEntries(slideshowKeys.map((key) => [key, []]));

function isVideoFile(item) {
  return /\.(mp4|webm|ogg)$/i.test(item);
}

function createSlide(item) {
  const wrapper = document.createElement("div");
  wrapper.className = "slide";

  if (isVideoFile(item)) {
    const video = document.createElement("video");
    video.src = item;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    wrapper.appendChild(video);
    return wrapper;
  }

  const img = document.createElement("img");
  img.src = item;
  img.alt = "Memory";
  wrapper.appendChild(img);
  return wrapper;
}

function getImageDelay() {
  return 5000 + Math.random() * 5000;
}

function getVideoDelay(slide) {
  const video = slide.querySelector("video");
  if (video && Number.isFinite(video.duration) && video.duration > 0) {
    return Math.min(15000, video.duration * 1000);
  }
  return 15000;
}

function initSlideshows() {
  const slideshows = document.querySelectorAll(".slideshow");
  slideshows.forEach((slideshow) => {
    const key = slideshow.dataset.slideshow;
    const items = (slideshowData[key] || []).slice(0, maxItemsPerSlideshow);

    if (!items.length) {
      slideshow.classList.add("empty");
      slideshow.textContent = "Add images to images/manifest.json.";
      return;
    }

    const stage = document.createElement("div");
    stage.className = "slideshow-stage";

    items.forEach((item, index) => {
      const slide = createSlide(item);
      if (index === 0) slide.classList.add("active");
      stage.appendChild(slide);
    });

    const controls = document.createElement("div");
    controls.className = "slideshow-controls";

    const prev = document.createElement("button");
    prev.className = "slideshow-btn";
    prev.type = "button";
    prev.textContent = "‹";

    const next = document.createElement("button");
    next.className = "slideshow-btn";
    next.type = "button";
    next.textContent = "›";

    const dots = document.createElement("div");
    dots.className = "slideshow-dots";

    items.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      if (index === 0) dot.classList.add("active");
      dots.appendChild(dot);
    });

    controls.appendChild(prev);
    controls.appendChild(dots);
    controls.appendChild(next);

    slideshow.appendChild(stage);
    slideshow.appendChild(controls);

    let current = 0;
    const slides = stage.querySelectorAll(".slide");
    const dotButtons = dots.querySelectorAll("button");
    let timerId = null;

    const update = (index) => {
      slides[current].classList.remove("active");
      dotButtons[current].classList.remove("active");
      current = (index + slides.length) % slides.length;
      slides[current].classList.add("active");
      dotButtons[current].classList.add("active");
      scheduleNext();
    };

    const scheduleNext = () => {
      if (slides.length <= 1) return;
      if (timerId) clearTimeout(timerId);
      const delay = slides[current].querySelector("video")
        ? getVideoDelay(slides[current])
        : getImageDelay();
      timerId = setTimeout(() => update(current + 1), delay);
    };

    prev.addEventListener("click", () => update(current - 1));
    next.addEventListener("click", () => update(current + 1));
    dotButtons.forEach((dot, index) => {
      dot.addEventListener("click", () => update(index));
    });

    scheduleNext();
  });
}

function normalizeImagePath(item) {
  if (typeof item !== "string") return null;
  const trimmed = item.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http") || trimmed.startsWith("/")) return trimmed;
  if (trimmed.startsWith("images/")) return trimmed;
  return `images/${trimmed}`;
}

function shuffle(list) {
  const array = list.slice();
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const defaultMusicPlaylist = [
  "audio/track-1.mp3",
  "audio/track-2.mp3",
  "audio/track-3.mp3",
];

async function loadMusicManifest() {
  try {
    const response = await fetch("audio/manifest.json", { cache: "no-store" });
    if (!response.ok) throw new Error("manifest-not-found");
    const data = await response.json();
    const files = Array.isArray(data) ? data.map(normalizeAudioPath).filter(Boolean) : [];
    return files.length ? files : defaultMusicPlaylist;
  } catch (error) {
    return defaultMusicPlaylist;
  }
}

function normalizeAudioPath(item) {
  if (typeof item !== "string") return null;
  const trimmed = item.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http") || trimmed.startsWith("/")) return trimmed;
  if (trimmed.startsWith("audio/")) return trimmed;
  return `audio/${trimmed}`;
}

async function initMusicPlayer() {
  const audio = document.getElementById("bg-music");
  const toggle = document.getElementById("music-toggle");
  const prompt = document.getElementById("music-prompt");
  if (!audio || !toggle) return;

  const musicPlaylist = await loadMusicManifest();
  if (!musicPlaylist.length) {
    toggle.style.display = "none";
    return;
  }

  let queue = shuffle(musicPlaylist);
  let index = 0;
  let baseVolume = 0.6;
  audio.volume = baseVolume;

  const playCurrent = async () => {
    audio.src = queue[index];
    try {
      await audio.play();
      toggle.setAttribute("aria-pressed", "true");
      toggle.textContent = "Music: On";
      if (prompt) prompt.classList.remove("show");
    } catch (error) {
      if (prompt) prompt.classList.add("show");
      toggle.setAttribute("aria-pressed", "false");
      toggle.textContent = "Music: Off";
    }
  };

  const nextTrack = () => {
    index += 1;
    if (index >= queue.length) {
      queue = shuffle(musicPlaylist);
      index = 0;
    }
    playCurrent();
  };

  audio.addEventListener("ended", nextTrack);

  toggle.addEventListener("click", () => {
    if (audio.paused) {
      playCurrent();
    } else {
      audio.pause();
      toggle.setAttribute("aria-pressed", "false");
      toggle.textContent = "Music: Off";
    }
  });

  const resumeHandler = () => {
    playCurrent();
  };

  if (prompt) {
    prompt.addEventListener("click", resumeHandler);
    prompt.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        resumeHandler();
      }
    });
  }

  playCurrent();

  return {
    getVolume: () => baseVolume,
    setVolume: (value) => {
      baseVolume = value;
      audio.volume = value;
    },
    getAudio: () => audio,
  };
}

function initVoiceNotes(music) {
  const notes = document.querySelectorAll(".voice-note");
  if (!notes.length || !music) return;
  const audio = music.getAudio();
  let activeCount = 0;
  let wasPlaying = false;

  notes.forEach((note) => {
    note.addEventListener("play", () => {
      activeCount += 1;
      if (!audio.paused) {
        wasPlaying = true;
        audio.pause();
      }
    });

    const handlePause = () => {
      activeCount = Math.max(0, activeCount - 1);
      if (activeCount === 0 && wasPlaying) {
        audio.play().catch(() => {});
        wasPlaying = false;
      }
    };

    note.addEventListener("pause", handlePause);
    note.addEventListener("ended", handlePause);
  });
}

function initRandomizer() {
  const reasonEl = document.getElementById("random-reason");
  const button = document.getElementById("reason-btn");
  if (!reasonEl || !button) return;

  const reasons = [
    "You make every ordinary day feel like a celebration.",
    "Your laugh is the melody I never want to stop hearing.",
    "You make me feel safe, seen, and deeply loved.",
    "The way you care is my favorite kind of magic.",
    "You are my calm, my spark, and my forever.",
    "You inspire me to be softer and stronger at the same time.",
    "You turn little moments into memories I treasure.",
    "Your smile reminds me that love is real.",
    "You are the sweetest part of my every day.",
  ];

  let lastIndex = -1;

  button.addEventListener("click", () => {
    let nextIndex = Math.floor(Math.random() * reasons.length);
    if (reasons.length > 1 && nextIndex === lastIndex) {
      nextIndex = (nextIndex + 1) % reasons.length;
    }
    lastIndex = nextIndex;
    reasonEl.textContent = reasons[nextIndex];
  });
}

function initLetterModal() {
  const modal = document.getElementById("letter-modal");
  const openBtn = document.getElementById("open-letter");
  const closeBtn = modal ? modal.querySelector(".modal-close") : null;
  const letterInput = document.getElementById("love-letter");
  const letterBody = document.getElementById("letter-body");
  if (!modal || !openBtn || !closeBtn || !letterInput || !letterBody) return;

  const openModal = () => {
    letterBody.textContent = letterInput.value;
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
  };

  const closeModal = () => {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  };

  openBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
}

function initCarousel() {
  const carousels = document.querySelectorAll(".carousel");
  carousels.forEach((carousel) => {
    const viewport = carousel.querySelector(".carousel-viewport");
    const track = carousel.querySelector(".carousel-track");
    const prev = carousel.querySelector(".carousel-btn.prev");
    const next = carousel.querySelector(".carousel-btn.next");
    if (!viewport || !track || !prev || !next) return;

    const getStep = () => {
      const card = track.querySelector(".memory-card");
      if (!card) return 0;
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      return card.offsetWidth + gap;
    };

    prev.addEventListener("click", () => {
      viewport.scrollBy({ left: -getStep(), behavior: "smooth" });
    });

    next.addEventListener("click", () => {
      viewport.scrollBy({ left: getStep(), behavior: "smooth" });
    });
  });
}

function initGuestbook() {
  const form = document.getElementById("guestbook-form");
  const entriesEl = document.getElementById("guestbook-entries");
  if (!form || !entriesEl) return;

  const storageKey = "guestbookEntries";

  const renderEntries = (entries) => {
    entriesEl.innerHTML = "";
    entries.forEach((entry) => {
      const card = document.createElement("div");
      card.className = "guestbook-entry";

      const name = document.createElement("strong");
      name.textContent = entry.name;

      const message = document.createElement("p");
      message.textContent = entry.message;

      card.appendChild(name);
      card.appendChild(message);
      entriesEl.appendChild(card);
    });
  };

  const loadEntries = () => {
    const stored = localStorage.getItem(storageKey);
    const entries = stored ? JSON.parse(stored) : [];
    renderEntries(entries);
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const nameInput = form.querySelector("#guest-name");
    const messageInput = form.querySelector("#guest-message");
    if (!nameInput || !messageInput) return;

    const entry = {
      name: nameInput.value.trim(),
      message: messageInput.value.trim(),
    };

    if (!entry.name || !entry.message) return;

    const stored = localStorage.getItem(storageKey);
    const entries = stored ? JSON.parse(stored) : [];
    entries.unshift(entry);
    localStorage.setItem(storageKey, JSON.stringify(entries));
    nameInput.value = "";
    messageInput.value = "";
    renderEntries(entries);
  });

  loadEntries();
}

async function loadManifestAndInitSlideshows() {
  try {
    const response = await fetch("images/manifest.json", { cache: "no-store" });
    if (!response.ok) throw new Error("manifest-not-found");
    const data = await response.json();
    const pool = Array.isArray(data) ? data.map(normalizeImagePath).filter(Boolean) : [];

    const shuffled = shuffle(pool);
    slideshowData = Object.fromEntries(slideshowKeys.map((key) => [key, []]));

    let index = 0;
    shuffled.forEach((item) => {
      const key = slideshowKeys[index % slideshowKeys.length];
      if (slideshowData[key].length < maxItemsPerSlideshow) {
        slideshowData[key].push(item);
      }
      index += 1;
    });
  } catch (error) {
    slideshowData = Object.fromEntries(slideshowKeys.map((key) => [key, []]));
  }

  initSlideshows();
}

function initHeartsCanvas() {
  const canvas = document.getElementById("hearts-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  const hearts = [];

  const resize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };

  const createHeart = () => {
    return {
      x: Math.random() * width,
      y: height + 20 + Math.random() * 60,
      size: 6 + Math.random() * 8,
      speed: 0.6 + Math.random() * 1.2,
      sway: (Math.random() - 0.5) * 0.6,
      alpha: 0.6 + Math.random() * 0.4,
    };
  };

  for (let i = 0; i < 40; i += 1) {
    hearts.push(createHeart());
  }

  const drawHeart = (x, y, size, alpha) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 10, size / 10);
    ctx.beginPath();
    ctx.moveTo(0, 3);
    ctx.bezierCurveTo(-5, -4, -12, 2, 0, 12);
    ctx.bezierCurveTo(12, 2, 5, -4, 0, 3);
    ctx.closePath();
    ctx.fillStyle = `rgba(200, 90, 106, ${alpha})`;
    ctx.fill();
    ctx.restore();
  };

  const animate = () => {
    ctx.clearRect(0, 0, width, height);
    hearts.forEach((heart) => {
      heart.y -= heart.speed;
      heart.x += Math.sin(heart.y * 0.02) * heart.sway;
      if (heart.y < -20) {
        heart.y = height + 40;
        heart.x = Math.random() * width;
      }
      drawHeart(heart.x, heart.y, heart.size, heart.alpha);
    });
    requestAnimationFrame(animate);
  };

  resize();
  window.addEventListener("resize", resize);
  animate();
}

updateTimer();
setInterval(updateTimer, 1000);
typeText();
observeMoments();
loadManifestAndInitSlideshows();
initHeartsCanvas();
initMusicPlayer().then((music) => {
  initVoiceNotes(music);
});
initRandomizer();
initLetterModal();
initCarousel();
initGuestbook();
