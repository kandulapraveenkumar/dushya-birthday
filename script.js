/* 
========================================================================
   Dushya's 1st Birthday Invitation JS
   Features: Envelope Reveal, Canvas Confetti, Language Toggle,
             Web Audio API Music Box Synth, Countdown Timer, Blessings Wall
========================================================================
*/

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const revealScreen = document.getElementById('reveal-screen');
  const envelopeInteractive = document.getElementById('envelope-interactive');
  const mainContent = document.getElementById('main-content');
  const langToggleBtn = document.getElementById('lang-toggle');
  const musicToggleBtn = document.getElementById('music-toggle');
  const blessingForm = document.getElementById('blessing-form');
  const blessingsFeed = document.getElementById('blessings-feed');
  
  // --- Language Toggle Logic ---
  // Retrieve language preference or default to English
  let currentLang = localStorage.getItem('dushya_lang') || 'en';
  if (currentLang === 'te') {
    document.body.classList.add('lang-te');
    document.body.classList.remove('lang-en');
  } else {
    document.body.classList.add('lang-en');
    document.body.classList.remove('lang-te');
  }

  langToggleBtn.addEventListener('click', () => {
    if (document.body.classList.contains('lang-en')) {
      document.body.classList.replace('lang-en', 'lang-te');
      localStorage.setItem('dushya_lang', 'te');
    } else {
      document.body.classList.replace('lang-te', 'lang-en');
      localStorage.setItem('dushya_lang', 'en');
    }
  });

  // --- Countdown Timer Logic ---
  // Event Date: July 16, 2026, 11:00 AM (11:00) IST
  const targetDate = new Date("2026-07-16T11:00:00+05:30").getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      document.getElementById('days').innerText = "00";
      document.getElementById('hours').innerText = "00";
      document.getElementById('minutes').innerText = "00";
      document.getElementById('seconds').innerText = "00";
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    document.getElementById('days').innerText = days.toString().padStart(2, '0');
    document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
    document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0');
  }

  // Run countdown immediately and then every second
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // --- Confetti & Heart Particles Engine ---
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  let animationFrameId;
  let particles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 8 + 4;
      this.speedX = Math.random() * 10 - 5;
      this.speedY = Math.random() * -15 - 5;
      this.gravity = 0.3;
      this.color = this.getRandomColor();
      this.opacity = 1;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 4 - 2;
      this.isHeart = Math.random() > 0.4; // 60% hearts, 40% shiny dots
    }

    getRandomColor() {
      const colors = [
        '#FFB6C1', // Pastel Pink
        '#FF69B4', // Hot Pink
        '#BA68C8', // Lavender
        '#FFD700', // Soft Gold
        '#FFF5F7', // Warm White
        '#E6E6FA'  // Lavender Light
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);

      if (this.isHeart) {
        // Draw Heart
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-this.size/2, -this.size/2, -this.size, 0, 0, this.size);
        ctx.bezierCurveTo(this.size, 0, this.size/2, -this.size/2, 0, 0);
        ctx.fill();
      } else {
        // Draw Shiny Confetti Rectangle
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size * 0.6);
      }

      ctx.restore();
    }

    update() {
      this.speedY += this.gravity;
      this.x += this.speedX;
      this.y += this.speedY;
      this.rotation += this.rotationSpeed;
      this.opacity -= 0.008;
    }
  }

  function spawnConfettiExplosion() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height * 0.6;
    for (let i = 0; i < 150; i++) {
      particles.push(new Particle(centerX, centerY));
    }
  }

  // Periodic gentle falling particles in the background
  function spawnGentleDrift() {
    if (particles.length < 50 && Math.random() < 0.15) {
      const x = Math.random() * canvas.width;
      const p = new Particle(x, -20);
      p.speedY = Math.random() * 2 + 1;
      p.speedX = Math.random() * 2 - 1;
      p.gravity = 0.05;
      particles.push(p);
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background drift
    spawnGentleDrift();

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();
      if (particles[i].opacity <= 0 || particles[i].y > canvas.height) {
        particles.splice(i, 1);
      }
    }
    animationFrameId = requestAnimationFrame(animateParticles);
  }

  // --- Web Audio API Music Box Lullaby ---
  // Beautiful self-contained chimes music box playing Twinkle Twinkle Little Star
  class MusicBox {
    constructor() {
      this.audioCtx = null;
      this.isPlaying = false;
      this.tempo = 100; // BPM (slightly slower for a dreamy lullaby)
      this.noteLength = 60 / this.tempo;
      this.schedulerTimerId = null;
      this.nextNoteTime = 0.0;
      this.currentNoteIndex = 0;
      this.currentBeatCount = 0;
      
      // Melody Notes Mapping to Frequencies (Hz)
      this.NOTES = {
        'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46,
        'G5': 783.99, 'A5': 880.00, 'Bb5': 932.33, 'B5': 987.77,
        'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'F6': 1396.91,
        'G6': 1567.98, 'REST': 0
      };

      // Twinkle Twinkle Little Star Melody (Pastel Baby Lullaby)
      // Array: [Note Name, Duration in Beats]
      this.melody = [
        ['G5', 1], ['G5', 1], ['D6', 1], ['D6', 1], ['E6', 1], ['E6', 1], ['D6', 2],
        ['C6', 1], ['C6', 1], ['B5', 1], ['B5', 1], ['A5', 1], ['A5', 1], ['G5', 2],
        ['D6', 1], ['D6', 1], ['C6', 1], ['C6', 1], ['B5', 1], ['B5', 1], ['A5', 2],
        ['D6', 1], ['D6', 1], ['C6', 1], ['C6', 1], ['B5', 1], ['B5', 1], ['A5', 2],
        ['G5', 1], ['G5', 1], ['D6', 1], ['D6', 1], ['E6', 1], ['E6', 1], ['D6', 2],
        ['C6', 1], ['C6', 1], ['B5', 1], ['B5', 1], ['A5', 1], ['A5', 1], ['G5', 2],
        ['REST', 2] // Pause before loop restarts
      ];
    }

    init() {
      if (this.audioCtx) return;
      
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      
      // Create a master volume control node
      this.masterVolume = this.audioCtx.createGain();
      this.masterVolume.gain.setValueAtTime(0.25, this.audioCtx.currentTime);
      
      // Create Delay Node (Reverberation effect for music box magic)
      this.delay = this.audioCtx.createDelay();
      this.delay.delayTime.value = 0.35;
      
      this.feedback = this.audioCtx.createGain();
      this.feedback.gain.value = 0.45; // Sweet resonance feedback
      
      // Hook up Delay Node loop
      this.delay.connect(this.feedback);
      this.feedback.connect(this.delay);
      
      // Connect nodes: masterVolume -> destination AND delay -> destination
      this.masterVolume.connect(this.audioCtx.destination);
      this.masterVolume.connect(this.delay);
      this.delay.connect(this.audioCtx.destination);
    }

    // Play a single metal pluck chime sound
    playNote(freq, startTime, duration) {
      if (freq === 0) return; // Silent rest note
      
      // Osc 1: Triangle wave for the rich body of the chime
      const osc = this.audioCtx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      
      // Osc 2: Sine wave at double frequency (harmonic chime chime overtone)
      const oscOver = this.audioCtx.createOscillator();
      oscOver.type = 'sine';
      oscOver.frequency.setValueAtTime(freq * 2, startTime);
      
      // Volume gain envelope to shape the music box plucks
      const gainNode = this.audioCtx.createGain();
      gainNode.gain.setValueAtTime(0, startTime);
      // Instant rise (plucking movement)
      gainNode.gain.linearRampToValueAtTime(0.5, startTime + 0.01);
      // Long, metallic resonance ring out
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 1.8);
      
      // Connect sound nodes
      osc.connect(gainNode);
      oscOver.connect(gainNode);
      gainNode.connect(this.masterVolume);
      
      osc.start(startTime);
      oscOver.start(startTime);
      osc.stop(startTime + duration * 2.0);
      oscOver.stop(startTime + duration * 2.0);
    }

    // Accompaniment bass pluck chimes
    playAccompaniment(noteName, startTime, duration) {
      const bassNotes = {
        'G5': 196.00,  // G3 bass for G chord
        'D6': 146.83,  // D3 bass for D chord
        'E6': 130.81,  // C3 bass
        'C6': 130.81,  // C3 bass
        'B5': 196.00,  // G3 bass
        'A5': 146.83   // D3 bass
      };
      
      const bassFreq = bassNotes[noteName];
      if (!bassFreq) return;

      const osc = this.audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(bassFreq, startTime);

      const gainNode = this.audioCtx.createGain();
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 2.5);

      osc.connect(gainNode);
      gainNode.connect(this.masterVolume);
      
      osc.start(startTime);
      osc.stop(startTime + duration * 2.8);
    }

    // Look-ahead Scheduler Loop
    scheduler() {
      // Schedule notes up to 200ms in advance
      while (this.nextNoteTime < this.audioCtx.currentTime + 0.2) {
        const note = this.melody[this.currentNoteIndex];
        const freq = this.NOTES[note[0]];
        const duration = note[1] * this.noteLength;

        // Schedule melody note
        this.playNote(freq, this.nextNoteTime, duration);
        
        // Schedule root harmony notes on strong beats (every 4 beats)
        if (this.currentBeatCount % 4 === 0) {
          this.playAccompaniment(note[0], this.nextNoteTime, duration);
        }

        // Move timeline forward
        this.nextNoteTime += duration;
        this.currentBeatCount += note[1];
        
        // Cycle loop
        this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melody.length;
      }
      this.schedulerTimerId = setTimeout(() => this.scheduler(), 50);
    }

    play() {
      this.init();
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      this.isPlaying = true;
      this.nextNoteTime = this.audioCtx.currentTime + 0.05;
      this.currentNoteIndex = 0;
      this.currentBeatCount = 0;
      this.scheduler();
    }

    stop() {
      this.isPlaying = false;
      clearTimeout(this.schedulerTimerId);
      // Clean ramp volume down to avoid pops
      if (this.masterVolume) {
        this.masterVolume.gain.setValueAtTime(this.masterVolume.gain.value, this.audioCtx.currentTime);
        this.masterVolume.gain.linearRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.1);
      }
    }

    resume() {
      this.isPlaying = true;
      if (this.audioCtx) {
        this.masterVolume.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
        this.masterVolume.gain.linearRampToValueAtTime(0.25, this.audioCtx.currentTime + 0.2);
        this.nextNoteTime = this.audioCtx.currentTime + 0.05;
        this.currentBeatCount = 0;
        this.scheduler();
      }
    }
  }

  // Instantiate Music Box Synth
  const musicBox = new MusicBox();

  // --- Music Button Toggle Click ---
  musicToggleBtn.addEventListener('click', () => {
    if (musicBox.isPlaying) {
      musicBox.stop();
      musicToggleBtn.classList.remove('playing');
    } else {
      musicBox.resume();
      musicToggleBtn.classList.add('playing');
    }
  });

  // --- Synthesized Interactive Sound Effects ---
  function playSynthSFX(type) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      
      if (type === 'break') {
        // High chime bells for wax breaking
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc1.frequency.setValueAtTime(1600, ctx.currentTime);
        osc2.frequency.setValueAtTime(2200, ctx.currentTime);
        osc1.type = 'sine';
        osc2.type = 'triangle';
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.25);
        osc2.stop(ctx.currentTime + 0.25);
      } else if (type === 'rustle') {
        // Soft white noise burst mimicking paper sliding/rustling
        const bufferSize = ctx.sampleRate * 0.25; // 250ms
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(900, ctx.currentTime);
        filter.Q.setValueAtTime(1.5, ctx.currentTime);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.24);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        noise.start();
        noise.stop(ctx.currentTime + 0.3);
      }
    } catch(err) {
      console.log("Synthesized sound blocked or unsupported", err);
    }
  }

  // --- 3D Envelope Cursor Tilt Hover ---
  envelopeInteractive.addEventListener('mousemove', (e) => {
    const stage = envelopeInteractive.getAttribute('data-stage');
    if (stage === 'done') return;
    
    const rect = envelopeInteractive.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((centerY - y) / centerY) * 14; // max 14 degrees
    const rotateY = ((x - centerX) / centerX) * 14; // max 14 degrees
    
    envelopeInteractive.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
  });

  envelopeInteractive.addEventListener('mouseleave', () => {
    const stage = envelopeInteractive.getAttribute('data-stage');
    if (stage === 'done') {
      envelopeInteractive.style.transform = 'scale(1.02)';
    } else {
      envelopeInteractive.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    }
  });

  // --- 1. Opening Reveal Envelope Action (Single-tap Automatic Flow) ---
  let envelopeStage = 'seal'; // 'seal' | 'opening' | 'done'
  const waxSeal = document.getElementById('wax-seal');
  const revealInstruction = document.getElementById('reveal-instruction');
  let isOpeningTriggered = false;

  function updateRevealInstructions() {
    document.querySelectorAll('.stage-instruction').forEach(el => el.classList.add('d-none'));
    if (envelopeStage === 'opening') {
      document.querySelectorAll('.opening-inst').forEach(el => el.classList.remove('d-none'));
    } else if (envelopeStage === 'done') {
      if (revealInstruction) revealInstruction.remove();
    }
  }

  function triggerEnvelopeOpening() {
    if (isOpeningTriggered) return;
    isOpeningTriggered = true;

    // Step 1: Break the Wax Seal immediately
    playSynthSFX('break');
    waxSeal.classList.add('broken');
    envelopeStage = 'opening';
    updateRevealInstructions();

    // Step 2: Open top envelope flap automatically after 500ms
    setTimeout(() => {
      playSynthSFX('rustle');
      envelopeInteractive.classList.add('flap-open');
      envelopeInteractive.setAttribute('data-stage', 'card');

      // Step 3: Slide out invitation card automatically after another 800ms (flap animation duration)
      setTimeout(() => {
        playSynthSFX('rustle');
        envelopeInteractive.classList.add('card-pulled');
        envelopeStage = 'done';
        envelopeInteractive.setAttribute('data-stage', 'done');
        updateRevealInstructions();

        // Trigger chimes melody box music
        try {
          musicBox.play();
        } catch (e) {
          console.log("Audio play blocked by browser:", e);
        }

        // Spawn full screen heart & sparkles explosion
        spawnConfettiExplosion();
        animateParticles();

        // Transition to main layout
        setTimeout(() => {
          revealScreen.classList.add('fade-out');
          mainContent.classList.remove('d-none');
          
          // Initialize scratch canvases now that mainContent is visible and has dimensions!
          initScratchCards();
        }, 1500);

        setTimeout(() => {
          revealScreen.remove();
        }, 2600);

      }, 800);

    }, 500);
  }

  // Trigger automated opening flow on clicking the wax seal or the envelope itself
  waxSeal.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent duplicate bubble trigger
    triggerEnvelopeOpening();
  });

  envelopeInteractive.addEventListener('click', () => {
    triggerEnvelopeOpening();
  });

  // --- 11. Blessings Wall Logic (With LocalStorage) ---
  
  // Default Initial Blessings List (Prepopulated)
  const defaultBlessings = [
    {
      name_en: "Grandma & Grandpa",
      name_te: "అమ్మమ్మ & తాతయ్య",
      message_en: "Happy 1st Birthday our little angel Dushya! May God bless you with a healthy, beautiful, and joyful life ahead.",
      message_te: "మా చిన్నారి దేవత దుష్యకు మొదటి పుట్టినరోజు శుభాకాంక్షలు! దేవుడు నీకు మంచి ఆరోగ్యం, సంతోషం, ప్రకాశవంతమైన భవిష్యత్తును ప్రసాదించాలని కోరుకుంటున్నాము.",
      date: new Date(Date.now() - 3600000 * 24).toLocaleDateString() // 1 day ago
    },
    {
      name_en: "Uday Babai",
      name_te: "ఉదయ్ బాబాయి",
      message_en: "Wishing the sweetest baby girl a wonderful 1st birthday! Keep spreading smiles and laughter, little princess.",
      message_te: "అందమైన బుజ్జి పాపాయికి మొదటి పుట్టినరోజు శుభాకాంక్షలు! నీ చిరునవ్వులతో మా అందరి ఇళ్లల్లో వెలుగులు నింపాలి.",
      date: new Date(Date.now() - 3600000 * 5).toLocaleDateString() // 5 hours ago
    },
    {
      name_en: "Sai",
      name_te: "సాయి",
      message_en: "Happy Birthday Dushya! Sending loads of virtual hugs, kisses, and blessings to you. Have an amazing party!",
      message_te: "పుట్టినరోజు శుభాకాంక్షలు దుష్య! నీకు ఎనలేని ప్రేమ, ఆశీస్సులు. ఈ వేడుక నీ జీవితంలో మరెన్నో సంతోషాలు తేవాలి!",
      date: new Date().toLocaleDateString() // Today
    }
  ];

  // Retrieve existing blessings list from LocalStorage, or initialize defaults
  let blessings = JSON.parse(localStorage.getItem('dushya_blessings'));
  
  // Auto-reset cached defaults if they contain old names to prevent caching issues
  if (blessings && blessings.length > 0) {
    const hasOldNames = blessings.some(b => 
      b.name_te === "అనిల్ అంకుల్" || 
      b.name_te === "సరిత ఆంటీ" || 
      b.name_en === "Anil Uncle" || 
      b.name_en === "Saritha Aunt"
    );
    if (hasOldNames) {
      blessings = null;
    }
  }

  if (!blessings || blessings.length === 0) {
    blessings = defaultBlessings;
    localStorage.setItem('dushya_blessings', JSON.stringify(blessings));
  }

  // Render blessings to feed
  function renderBlessings() {
    blessingsFeed.innerHTML = "";
    
    // Sort in reverse-chronological order (newest blessing at the top)
    const sortedBlessings = [...blessings].reverse();

    sortedBlessings.forEach(item => {
      const card = document.createElement('div');
      card.className = "blessing-feed-card shadow-sm";
      
      // Card structure supporting EN / TE display
      card.innerHTML = `
        <span class="blessing-time">${item.date}</span>
        
        <p class="blessing-msg-text lang-en">"${item.message_en || item.message}"</p>
        <p class="blessing-msg-text lang-te">"${item.message_te || item.message}"</p>
        
        <div class="blessing-author lang-en">— ${item.name_en || item.name}</div>
        <div class="blessing-author lang-te">— ${item.name_te || item.name}</div>
      `;
      
      blessingsFeed.appendChild(card);
    });
  }

  // Handle new blessing form submissions
  blessingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nameInput = document.getElementById('guest-name').value.trim();
    const msgInput = document.getElementById('blessing-msg').value.trim();

    if (!nameInput || !msgInput) return;

    // Create a new blessing entry (save message to both fields for unified display)
    const newBlessing = {
      name: nameInput,
      name_en: nameInput,
      name_te: nameInput,
      message: msgInput,
      message_en: msgInput,
      message_te: msgInput,
      date: new Date().toLocaleDateString()
    };

    // Push new entry to blessings array
    blessings.push(newBlessing);
    
    // Update LocalStorage
    localStorage.setItem('dushya_blessings', JSON.stringify(blessings));
    
    // Refresh blessings wall view
    renderBlessings();
    
    // Reset form inputs
    blessingForm.reset();

    // Trigger localized small confetti burst on success!
    spawnConfettiExplosion();
  });

  // --- 13. Scratch Cards logic (Save the Date surprise) ---
  function initScratchCards() {
    const canvases = document.querySelectorAll('.scratch-canvas');
    
    canvases.forEach(canvas => {
      const container = canvas.closest('.scratch-card-container');
      if (!container) return;
      
      // Sync canvas dimensions with parent card size
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      const ctx = canvas.getContext('2d');
      let isDrawing = false;
      
      // Function to draw scratch overlay paint
      function drawOverlay() {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        
        // Gradient fill: Cute baby pink/lavender blend
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, '#FFC0CB'); // Pink
        grad.addColorStop(0.5, '#FFE4E1'); // Misty Rose
        grad.addColorStop(1, '#E6E6FA'); // Lavender
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw golden dashed border
        ctx.strokeStyle = '#DAA520';
        ctx.lineWidth = 4;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        
        // Draw some little gold stars
        ctx.fillStyle = 'rgba(218, 165, 32, 0.4)';
        for (let i = 0; i < 15; i++) {
          const x = 20 + Math.random() * (canvas.width - 40);
          const y = 20 + Math.random() * (canvas.height - 40);
          ctx.beginPath();
          ctx.arc(x, y, Math.random() * 3 + 1, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Draw text based on active language
        const isTe = document.body.classList.contains('lang-te');
        ctx.fillStyle = '#C71585'; // Deep Pink
        ctx.font = 'bold 15px "Quicksand", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (isTe) {
          ctx.font = 'bold 16px "Mandali", sans-serif';
          ctx.fillText('✨ రుద్ది చూడండి ✨', canvas.width / 2, canvas.height / 2 - 8);
          ctx.font = '12px "Mandali", sans-serif';
          ctx.fillStyle = '#8E7B79';
          ctx.fillText('(తేదీని వెలికితీయండి)', canvas.width / 2, canvas.height / 2 + 15);
        } else {
          ctx.fillText('✨ Scratch to Reveal ✨', canvas.width / 2, canvas.height / 2 - 8);
          ctx.font = '11px "Quicksand", sans-serif';
          ctx.fillStyle = '#8E7B79';
          ctx.fillText('(Reveal Save the Date)', canvas.width / 2, canvas.height / 2 + 14);
        }
        
        ctx.restore();
      }
      
      drawOverlay();
      
      // Redraw overlay when language button toggles (only if not scratched yet)
      langToggleBtn.addEventListener('click', () => {
        if (!container.classList.contains('scratched')) {
          drawOverlay();
        }
      });
      
      // Scratching movement handlers
      let moveCount = 0;
      function scratch(e) {
        if (!isDrawing) return;
        
        const rect = canvas.getBoundingClientRect();
        // Support touch and mouse coordinates
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 38, 0, Math.PI * 2); // 38px scratch radius
        ctx.fill();
        ctx.restore();

        // Check progress in real-time (every 5 movement events) so it reveals mid-swipe
        moveCount++;
        if (moveCount % 5 === 0) {
          checkScratchProgress();
        }
      }
      
      function checkScratchProgress() {
        if (container.classList.contains('scratched')) return;
        
        // Fast sampling loop to check transparency
        const w = canvas.width;
        const h = canvas.height;
        const numSamples = 30; // Fast sampling count
        let transparentPixels = 0;
        
        for (let i = 0; i < numSamples; i++) {
          const sampleX = Math.floor(Math.random() * (w - 20) + 10);
          const sampleY = Math.floor(Math.random() * (h - 20) + 10);
          const pixel = ctx.getImageData(sampleX, sampleY, 1, 1).data;
          
          // pixel[3] is the alpha channel
          if (pixel[3] < 50) {
            transparentPixels++;
          }
        }
        
        const percentage = transparentPixels / numSamples;
        if (percentage > 0.20) { // 20% threshold (approx 2-3 quick swipes to reveal)
          // Mark as scratched
          container.classList.add('scratched');
          canvas.classList.add('faded');
          
          // Play clean success bell chime
          playSynthSFX('break');
          
          // Clean canvas node from DOM after transition
          setTimeout(() => {
            window.removeEventListener('resize', resizeScratchCanvas);
            canvas.remove();
          }, 600);
        }
      }
      
      // Pointer event listeners (combines mouse & touch)
      canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        scratch(e);
      });
      
      canvas.addEventListener('mousemove', scratch);
      
      canvas.addEventListener('mouseup', () => {
        isDrawing = false;
        checkScratchProgress();
      });
      
      canvas.addEventListener('mouseleave', () => {
        isDrawing = false;
      });
      
      // Touch Support
      canvas.addEventListener('touchstart', (e) => {
        isDrawing = true;
        scratch(e);
      });
      
      canvas.addEventListener('touchmove', (e) => {
        scratch(e);
      });
      
      canvas.addEventListener('touchend', () => {
        isDrawing = false;
        checkScratchProgress();
      });

      // Resize listener to adapt canvas size dynamically on orientation changes
      function resizeScratchCanvas() {
        if (container.classList.contains('scratched')) return;
        const newRect = container.getBoundingClientRect();
        canvas.width = newRect.width;
        canvas.height = newRect.height;
        drawOverlay();
      }
      window.addEventListener('resize', resizeScratchCanvas);
    });
  }

  // Initial render of greetings feed
  renderBlessings();
});
