// main.js - Particle Intro & Pinned Image Sequence Scroll Scrub

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const loaderOverlay = document.getElementById("loader-overlay");
  const loaderProgress = document.getElementById("loader-progress");
  const introCanvas = document.getElementById("intro-canvas");
  const seqCanvas = document.getElementById("sequence-canvas");
  const whiteFlash = document.getElementById("white-flash");
  
  const textLines = [
    // Scene 1 (0–20% scroll)
    { el: document.querySelectorAll("#text-scene-1 .scene-text-line")[0], range: [0.02, 0.07] },
    { el: document.querySelectorAll("#text-scene-1 .scene-text-line")[1], range: [0.07, 0.13] },
    { el: document.querySelectorAll("#text-scene-1 .scene-text-line")[2], range: [0.13, 0.19] },

    // Scene 2 (20–40% scroll)
    { el: document.querySelectorAll("#text-scene-2 .scene-text-line")[0], range: [0.22, 0.27] },
    { el: document.querySelectorAll("#text-scene-2 .scene-text-line")[1], range: [0.27, 0.33] },
    { el: document.querySelectorAll("#text-scene-2 .scene-text-line")[2], range: [0.33, 0.39] },

    // Scene 3 (40–55% scroll)
    { el: document.querySelectorAll("#text-scene-3 .scene-text-line")[0], range: [0.41, 0.45] },
    { el: document.querySelectorAll("#text-scene-3 .scene-text-line")[1], range: [0.45, 0.50] },
    { el: document.querySelectorAll("#text-scene-3 .scene-text-line")[2], range: [0.50, 0.54] },

    // Scene 4 (55–80% scroll)
    { el: document.querySelectorAll("#text-scene-4 .scene-text-line")[0], range: [0.57, 0.63] },
    { el: document.querySelectorAll("#text-scene-4 .scene-text-line")[1], range: [0.63, 0.70] },
    { el: document.querySelectorAll("#text-scene-4 .scene-text-line")[2], range: [0.70, 0.77] },

    // Scene 5 (80–100% scroll)
    { el: document.querySelectorAll("#text-scene-5 .scene-text-line")[0], range: [0.82, 0.87] },
    { el: document.querySelectorAll("#text-scene-5 .scene-text-line")[1], range: [0.87, 0.93] },
    { el: document.querySelectorAll("#text-scene-5 .scene-text-line")[2], range: [0.93, 0.98] }
  ];

  const seqCtx = seqCanvas.getContext("2d");

  // --- Scenes Configuration ---
  const scenesInfo = [
    { id: 1, folder: "ezgif-80c0441ccdb353c4-jpg", range: [0.0, 0.20], totalFrames: 240 },
    { id: 2, folder: "ezgif-8cb88a895c9144a2-jpg", range: [0.20, 0.40], totalFrames: 240 },
    { id: 3, folder: "ezgif-8c5fe55976d441d8-jpg", range: [0.40, 0.55], totalFrames: 240 },
    { id: 4, folder: "ezgif-8aaca086d62b2dfd-jpg", range: [0.55, 0.80], totalFrames: 240 },
    { id: 5, folder: "ezgif-810e2fb0a7bad480-jpg", range: [0.80, 1.00], totalFrames: 240 }
  ];

  // Images cache: key "sceneId_frameIndex" -> Image element
  const imagesCache = {};
  
  // --- Interpolation States for Smooth Scrubbing ---
  let targetProgress = 0;
  let currentProgress = 0;
  let lastDrawnFrameKey = "";

  // --- Preloading & Background Loading Queue ---
  let loadQueue = [];
  let currentLoadingIndex = 0;
  let scene1Loaded = 0;

  // Build the preloading queue (Scene 1 fully first, then Scenes 2, 3, 4, 5 sequentially)
  function initPreloader() {
    // 1. Add all frames of Scene 1 to critical load list
    for (let f = 1; f <= 240; f++) {
      loadQueue.push({ sceneId: 1, frameIdx: f });
    }
    
    // 2. Add remaining scenes in order
    for (let s = 2; s <= 5; s++) {
      for (let f = 1; f <= 240; f++) {
        loadQueue.push({ sceneId: s, frameIdx: f });
      }
    }

    // Start loading workers (parallel load jobs to speed up loading)
    const workers = 4;
    for (let i = 0; i < workers; i++) {
      processNextInQueue();
    }
  }

  function processNextInQueue() {
    if (currentLoadingIndex >= loadQueue.length) return;
    
    const task = loadQueue[currentLoadingIndex++];
    const { sceneId, frameIdx } = task;
    const key = `${sceneId}_${frameIdx}`;

    const img = new Image();
    const folder = scenesInfo[sceneId - 1].folder;
    const padFrame = String(frameIdx).padStart(3, '0');
    img.src = `${folder}/ezgif-frame-${padFrame}.jpg`;

    img.onload = () => {
      imagesCache[key] = img;
      
      // Update loading status for Scene 1
      if (sceneId === 1) {
        scene1Loaded++;
        const percent = Math.round((scene1Loaded / 240) * 100);
        loaderProgress.textContent = `INITIALIZING SCANNERS... ${percent}%`;
        
        if (scene1Loaded === 240) {
          startIntroAnimation();
        }
      }
      
      processNextInQueue(); // continue to next file in queue
    };

    img.onerror = () => {
      console.warn(`Failed to preload frame ${padFrame} in scene ${sceneId}`);
      processNextInQueue(); // continue despite failure
    };
  }

  // --- Layer 1: Text-Materialization Particle Animation ---
  function startIntroAnimation() {
    // Hide loading overlay
    loaderOverlay.style.opacity = "0";
    loaderOverlay.style.visibility = "hidden";
    setTimeout(() => {
      loaderOverlay.style.display = "none";
    }, 800);

    const ctx = introCanvas.getContext("2d");
    let width = (introCanvas.width = window.innerWidth);
    let height = (introCanvas.height = window.innerHeight);

    // Create offscreen canvas to render target text and scan pixels
    const offCanvas = document.createElement("canvas");
    const offCtx = offCanvas.getContext("2d");
    offCanvas.width = 1000;
    offCanvas.height = 250;
    
    offCtx.fillStyle = "#ffffff";
    // Responsive font scaling
    const fontSize = width < 768 ? 60 : 100;
    offCtx.font = `bold ${fontSize}px Montserrat`;
    offCtx.textAlign = "center";
    offCtx.textBaseline = "middle";
    offCtx.fillText("AETHERIS", offCanvas.width / 2, offCanvas.height / 2);

    // Scan pixels for points
    const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
    const points = [];
    const step = width < 768 ? 3 : 4; // higher density on mobile to maintain readability
    for (let y = 0; y < offCanvas.height; y += step) {
      for (let x = 0; x < offCanvas.width; x += step) {
        const idx = (y * offCanvas.width + x) * 4;
        if (imgData.data[idx + 3] > 120) {
          points.push({
            x: x - offCanvas.width / 2,
            y: y - offCanvas.height / 2
          });
        }
      }
    }

    // Initialize particles
    const particles = points.map(pt => {
      // Color choices: Space Cyan, Ice Blue, Silver White
      const colors = [
        { r: 255, g: 255, b: 255 }, // White
        { r: 173, g: 198, b: 255 }, // Ice Blue
        { r: 59,  g: 130, b: 246 }  // Space Blue
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      
      return {
        // Starts scattered at random positions on screen
        x: Math.random() * width,
        y: Math.random() * height,
        startX: Math.random() * width,
        startY: Math.random() * height,
        // Target snapped coordinates relative to center
        tx: pt.x,
        ty: pt.y,
        // Dissipation speeds
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 0,
        size: Math.random() * 1.5 + 1.0,
        r: color.r,
        g: color.g,
        b: color.b,
        seed: Math.random() * 100
      };
    });

    // Resize listener for intro canvas
    window.addEventListener("resize", () => {
      width = introCanvas.width = window.innerWidth;
      height = introCanvas.height = window.innerHeight;
    });

    // Particle animation clock
    const duration = 2800; // 2.8 seconds total
    const startAnimTime = performance.now();

    function animateParticles(time) {
      const elapsed = time - startAnimTime;

      if (elapsed >= duration) {
        // Intro complete: unlock scroll, fade out, and start scroll experience
        introCanvas.style.opacity = "0";
        document.body.classList.remove("overflow-hidden");
        setTimeout(() => {
          introCanvas.style.display = "none";
        }, 1000);
        
        // Initialize ScrollTrigger scrub experience
        initScrollExperience();
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Centered coordinate anchor
      const centerX = width / 2;
      const centerY = height / 2;

      // Phase 1 (0 to 1200ms): Gather/Fly Inward
      // Phase 2 (1200 to 1900ms): Hold & Hover
      // Phase 3 (1900 to 2800ms): Dissipate/Explode
      
      particles.forEach(p => {
        const destX = centerX + p.tx;
        const destY = centerY + p.ty;

        if (elapsed < 1200) {
          const t = elapsed / 1200;
          const ease = 1 - Math.pow(1 - t, 3); // cubic ease-out
          p.x = p.startX + (destX - p.startX) * ease;
          p.y = p.startY + (destY - p.startY) * ease;
          p.alpha = ease;
        } else if (elapsed < 1900) {
          const hoverTime = (elapsed - 1200) * 0.004;
          // Hover floating noise
          p.x = destX + Math.sin(p.seed + hoverTime) * 1.2;
          p.y = destY + Math.cos(p.seed * 2 + hoverTime) * 1.2;
          p.alpha = 1.0;
        } else {
          const t = (elapsed - 1900) / 900;
          // Explode outwards
          p.x += p.vx * 1.8;
          p.y += p.vy * 1.8;
          p.alpha = 1.0 - t;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${p.alpha})`;
        ctx.fill();
      });

      requestAnimationFrame(animateParticles);
    }

    requestAnimationFrame(animateParticles);
  }

  // --- Resize & Draw loop for Sequence Canvas ---
  function resizeSeqCanvas() {
    if (!seqCanvas) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    if (seqCanvas.width !== width || seqCanvas.height !== height) {
      seqCanvas.width = width;
      seqCanvas.height = height;
      // Force redrawing of last frames
      drawFrame(currentProgress);
    }
  }
  window.addEventListener("resize", resizeSeqCanvas);

  function drawFrame(progress) {
    // 1. Identify which scene matches this progress percentage
    let activeScene = scenesInfo[0];
    for (let i = 0; i < scenesInfo.length; i++) {
      const s = scenesInfo[i];
      if (progress >= s.range[0] && progress <= s.range[1]) {
        activeScene = s;
        break;
      }
    }

    // 2. Map relative scroll progress inside active scene to frame index (1 to 240)
    const sceneLen = activeScene.range[1] - activeScene.range[0];
    const progressInScene = (progress - activeScene.range[0]) / sceneLen;
    const frameIdx = Math.max(1, Math.min(240, Math.floor(progressInScene * 239) + 1));

    const key = `${activeScene.id}_${frameIdx}`;
    
    // Draw the image on canvas (using object-fit: cover logic)
    const img = imagesCache[key];
    if (img) {
      const canvasWidth = seqCanvas.width;
      const canvasHeight = seqCanvas.height;
      const imgWidth = img.width;
      const imgHeight = img.height;
      
      const canvasRatio = canvasWidth / canvasHeight;
      const imgRatio = imgWidth / imgHeight;
      
      let sWidth = imgWidth;
      let sHeight = imgHeight;
      let sx = 0;
      let sy = 0;
      
      if (canvasRatio > imgRatio) {
        sHeight = imgWidth / canvasRatio;
        sy = (imgHeight - sHeight) / 2;
      } else {
        sWidth = imgHeight * canvasRatio;
        sx = (imgWidth - sWidth) / 2;
      }
      
      seqCtx.clearRect(0, 0, canvasWidth, canvasHeight);
      seqCtx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvasWidth, canvasHeight);
      lastDrawnFrameKey = key;
    } else {
      // Fallback: If target image is not loaded yet, redraw the last successfully rendered image to prevent flickering
      if (lastDrawnFrameKey && imagesCache[lastDrawnFrameKey]) {
        const lastImg = imagesCache[lastDrawnFrameKey];
        // repeat crop math for last drawn
        const canvasWidth = seqCanvas.width;
        const canvasHeight = seqCanvas.height;
        const imgRatio = lastImg.width / lastImg.height;
        let sWidth = lastImg.width;
        let sHeight = lastImg.height;
        let sx = 0, sy = 0;
        
        if (canvasWidth / canvasHeight > imgRatio) {
          sHeight = lastImg.width / (canvasWidth / canvasHeight);
          sy = (lastImg.height - sHeight) / 2;
        } else {
          sWidth = lastImg.height * (canvasWidth / canvasHeight);
          sx = (lastImg.width - sWidth) / 2;
        }
        seqCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        seqCtx.drawImage(lastImg, sx, sy, sWidth, sHeight, 0, 0, canvasWidth, canvasHeight);
      }
    }
  }

  // --- Easing rendering loop ---
  // Interpolates targetProgress -> currentProgress for ultra-smooth 60fps easing
  function renderLoop() {
    requestAnimationFrame(renderLoop);
    
    const diff = targetProgress - currentProgress;
    if (Math.abs(diff) > 0.0001) {
      currentProgress += diff * 0.15; // easing factor
      
      // Keep boundaries exact
      if (currentProgress < 0.0005) currentProgress = 0;
      if (currentProgress > 0.9995) currentProgress = 1;
      
      // Update canvas frame draw
      drawFrame(currentProgress);
      
      // Update opacity values based on smoothed progress
      updateTransitionsAndTexts(currentProgress);
    }
  }

  function updateTransitionsAndTexts(progress) {
    // 1. Scene Transition overlays (White Flash)
    // Starts at 76% scroll, peaks fully white at 80%, fades completely by 84%
    let flashOpacity = 0;
    if (progress >= 0.76 && progress <= 0.80) {
      flashOpacity = (progress - 0.76) / (0.80 - 0.76);
    } else if (progress > 0.80 && progress <= 0.84) {
      flashOpacity = 1.0 - ((progress - 0.80) / (0.84 - 0.80));
    }
    whiteFlash.style.opacity = flashOpacity;

    // 2. Sequential Text Line reveals matching the active ranges
    textLines.forEach(line => {
      if (line.el) {
        if (progress >= line.range[0] && progress <= line.range[1]) {
          line.el.classList.add("visible");
        } else {
          line.el.classList.remove("visible");
        }
      }
    });
  }

  // --- Layer 2: GSAP ScrollTrigger Sequence Initialization ---
  function initScrollExperience() {
    gsap.registerPlugin(ScrollTrigger);

    resizeSeqCanvas();
    
    // Draw initial first frame (0% scroll)
    drawFrame(0);

    // Start requestAnimationFrame easing loop
    requestAnimationFrame(renderLoop);

    // Create the pinned ScrollTrigger timeline
    ScrollTrigger.create({
      trigger: "#hero-scroll-container",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        // Set target scroll progress; easing loop will smoothly pull rendering towards this progress
        targetProgress = self.progress;
      }
    });

    // Reveal custom text elements in Stitch design below
    const revealElements = document.querySelectorAll(".reveal-text");
    revealElements.forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        end: "bottom 20%",
        onEnter: () => el.classList.add("visible"),
        onLeaveBack: () => el.classList.remove("visible")
      });
    });

    // Sticky side indicator activation logic matching scroll positions
    const sideDots = document.querySelectorAll("aside a");
    const sections = [
      document.getElementById("hero-scroll-container"),
      document.getElementById("stitch-section"),
      document.getElementById("chronicle-section")
    ];

    window.addEventListener("scroll", () => {
      let currentIdx = 0;
      const scrollPos = window.scrollY + window.innerHeight / 2;
      
      sections.forEach((sec, idx) => {
        if (sec && scrollPos >= sec.offsetTop) {
          currentIdx = idx;
        }
      });

      sideDots.forEach((dot, idx) => {
        if (idx === currentIdx || (idx === 3 && currentIdx === 2)) {
          dot.className = "text-primary scale-125 transition-all duration-700 ease-out";
          dot.querySelector("span").style.fontVariationSettings = "'FILL' 1";
        } else {
          dot.className = "text-white/20 scale-100 hover:text-primary/50 transition-all duration-700 ease-out";
          dot.querySelector("span").style.fontVariationSettings = "'FILL' 0";
        }
      });
    });
  }

  // Start initialization process
  initPreloader();
});
