// main.js - Core Liquid WebGL Shader & GSAP Scroll Control

document.addEventListener("DOMContentLoaded", () => {
  // --- Video Sources ---
  const videoSources = {
    video1: "Liquid_morphing_into_astronaut_1080p_202607031303.mp4",
    video2: "Astronaut_helmet_visor_zoom_1080p_202607031306.mp4",
    video3: "Glass_reflection_dissolves_open_._202607031308.mp4",
    video4: "Camera_accelerates_toward_black_._202607031313.mp4",
    video5: "White_House_exterior_natural_day._202607031321.mp4"
  };

  // Select DOM Elements
  const videoElements = {
    video1: document.getElementById("video-1"),
    video2: document.getElementById("video-2"),
    video3: document.getElementById("video-3"),
    video4: document.getElementById("video-4"),
    video5: document.getElementById("video-5")
  };

  const loaderOverlay = document.getElementById("loader-overlay");
  const loaderProgress = document.getElementById("loader-progress");
  const canvas = document.getElementById("liquid-canvas");
  const whiteFlash = document.getElementById("white-flash");
  
  const textOverlays = {
    scene1: document.getElementById("text-scene-1"),
    scene2: document.getElementById("text-scene-2"),
    scene3: document.getElementById("text-scene-3"),
    scene4: document.getElementById("text-scene-4"),
    scene5: document.getElementById("text-scene-5")
  };

  // --- Preloading & Lazy-Loading Strategy ---
  let loadedVideos = 0;
  const totalRequiredForLoad = 2; // video-1 and video-2 are required to start the site
  const blobUrls = {};

  // Initialize target times for interpolation
  const videoState = {
    video1: { targetTime: 0, currentTime: 0, duration: 0 },
    video2: { targetTime: 0, currentTime: 0, duration: 0 },
    video3: { targetTime: 0, currentTime: 0, duration: 0 },
    video4: { targetTime: 0, currentTime: 0, duration: 0 },
    video5: { targetTime: 0, currentTime: 0, duration: 0 }
  };

  // Fetch a video as blob to ensure instant memory-scrubbing
  async function preloadVideo(key, url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      blobUrls[key] = blobUrl;
      
      const video = videoElements[key];
      video.src = blobUrl;
      video.load();

      // Wait for metadata to get duration
      await new Promise((resolve) => {
        if (video.readyState >= 1) {
          videoState[key].duration = video.duration;
          resolve();
        } else {
          video.addEventListener("loadedmetadata", () => {
            videoState[key].duration = video.duration;
            resolve();
          }, { once: true });
        }
      });

      console.log(`Preloaded ${key} successfully. Duration: ${videoState[key].duration}s`);
      
      if (key === "video1" || key === "video2") {
        loadedVideos++;
        const percent = Math.round((loadedVideos / totalRequiredForLoad) * 100);
        loaderProgress.textContent = `ESTABLISHING CONNECTION... ${percent}%`;
        
        if (loadedVideos === totalRequiredForLoad) {
          startExperience();
        }
      }
    } catch (err) {
      console.error(`Failed to preload ${key}:`, err);
      // Fallback: assign direct source if fetch fails
      const video = videoElements[key];
      video.src = url;
      video.load();
      videoState[key].duration = 5; // fallback duration estimate
      if (key === "video1" || key === "video2") {
        loadedVideos++;
        if (loadedVideos === totalRequiredForLoad) startExperience();
      }
    }
  }

  // Preload critical assets first
  preloadVideo("video1", videoSources.video1);
  preloadVideo("video2", videoSources.video2);

  // Lazy-load other scenes in background
  function lazyLoadRemaining() {
    preloadVideo("video3", videoSources.video3);
    preloadVideo("video4", videoSources.video4);
    preloadVideo("video5", videoSources.video5);
  }

  // --- WebGL Liquid Ripple System ---
  let gl;
  let program;
  let ripples = []; // active ripples: { x, y, age, intensity }
  let lastMouseX = 0;
  let lastMouseY = 0;
  let lastTime = 0;
  let texture;
  let isExperienceStarted = false;
  let distortionFactor = 1.0; // controlled by scroll

  // Track cursor position
  const mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };

  window.addEventListener("mousemove", (e) => {
    mouse.targetX = e.clientX / window.innerWidth;
    mouse.targetY = e.clientY / window.innerHeight;

    // Spawn a ripple if mouse moves significantly
    const dist = Math.hypot(e.clientX - lastMouseX, e.clientY - lastMouseY);
    if (dist > 15 && isExperienceStarted) {
      addRipple(mouse.targetX, mouse.targetY);
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    }
  });

  function addRipple(x, y) {
    if (ripples.length >= 16) {
      ripples.shift(); // keep list to max 16 for performance
    }
    ripples.push({
      x: x,
      y: y,
      age: 0,
      intensity: 1.0
    });
  }

  function initWebGL() {
    gl = canvas.getContext("webgl", { alpha: false, depth: false, antialias: true });
    if (!gl) {
      console.warn("WebGL not supported. Falling back to CSS filters.");
      canvas.style.display = "none";
      return;
    }

    // Shaders
    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_uv = a_position * 0.5 + 0.5;
      }
    `;

    const fsSource = `
      precision mediump float;
      uniform sampler2D u_video_texture;
      uniform float u_distortion_factor;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_video_resolution;
      uniform vec4 u_ripples[16];
      uniform int u_ripple_count;
      varying vec2 v_uv;

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        vec2 tex_uv = uv;

        // Apply aspect ratio correction (object-fit: cover logic in WebGL)
        float screen_aspect = u_resolution.x / u_resolution.y;
        float video_aspect = u_video_resolution.x / u_video_resolution.y;
        if (screen_aspect > video_aspect) {
          float scale = screen_aspect / video_aspect;
          tex_uv.y = (uv.y - 0.5) * scale + 0.5;
        } else {
          float scale = video_aspect / screen_aspect;
          tex_uv.x = (uv.x - 0.5) * scale + 0.5;
        }

        vec2 displacement = vec2(0.0);

        if (u_distortion_factor > 0.0) {
          // 1. Subtle idle ripples
          float idle_wave_x = sin(uv.y * 8.0 + u_time * 1.2) * 0.004;
          float idle_wave_y = cos(uv.x * 8.0 + u_time * 1.2) * 0.004;
          displacement += vec2(idle_wave_x, idle_wave_y) * u_distortion_factor;

          // 2. Cursor dynamic ripples
          for (int i = 0; i < 16; i++) {
            if (i >= 16) break; // static clamp
            
            vec4 ripple = u_ripples[i];
            float age = ripple.z;
            if (age < 0.0) continue; // inactive marker

            vec2 ripple_pos = ripple.xy;
            float intensity = ripple.w;

            vec2 diff = uv - ripple_pos;
            diff.x *= u_resolution.x / u_resolution.y; // Correct aspect ratio
            float dist = length(diff);

            float wave_frequency = 42.0;
            float wave_speed = 5.0;
            float wave_decay = 2.0;

            float wave = sin(dist * wave_frequency - age * wave_speed);
            float dist_decay = exp(-dist * 5.0);
            float age_decay = exp(-age * wave_decay);

            float ripple_effect = wave * dist_decay * age_decay * intensity * 0.025;

            if (dist > 0.001) {
              displacement += (diff / dist) * ripple_effect * u_distortion_factor;
            }
          }
        }

        vec2 final_uv = tex_uv + displacement;
        final_uv = clamp(final_uv, 0.001, 0.999);
        
        gl_FragColor = texture2D(u_video_texture, final_uv);
      }
    `;

    // Compile & Link
    const vs = compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Shader program link failed:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Geometry setup (Full-screen quad)
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    // Texture setup
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Tell WebGL to flip textures vertically (matches HTML5 Video layout)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  }

  function compileShader(type, source) {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error("Shader compile error:", gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  function resizeCanvas() {
    if (!canvas) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      if (gl) gl.viewport(0, 0, width, height);
    }
  }
  window.addEventListener("resize", resizeCanvas);

  // WebGL Render Loop
  function render(time) {
    requestAnimationFrame(render);

    const currentTimeSec = time * 0.001;
    const deltaTime = currentTimeSec - lastTime;
    lastTime = currentTimeSec;

    // Smoothly interpolate mouse coordinates for general tracking
    mouse.x += (mouse.targetX - mouse.x) * 0.1;
    mouse.y += (mouse.targetY - mouse.y) * 0.1;

    // Smoothly interpolate video target times (flicker-free scrub interpolation)
    for (let key in videoState) {
      const state = videoState[key];
      const video = videoElements[key];
      
      if (state.duration > 0) {
        // Interpolation logic
        const diff = state.targetTime - state.currentTime;
        if (Math.abs(diff) > 0.001) {
          state.currentTime += diff * 0.15;
          // Clamp current time
          state.currentTime = Math.max(0, Math.min(state.duration - 0.02, state.currentTime));
          video.currentTime = state.currentTime;
        }
      }
    }

    if (!gl) return;

    // Clear Screen
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Active program
    gl.useProgram(program);

    // Res / Time uniforms
    gl.uniform2f(gl.getUniformLocation(program, "u_resolution"), canvas.width, canvas.height);
    const v1_el = videoElements.video1;
    gl.uniform2f(gl.getUniformLocation(program, "u_video_resolution"), (v1_el && v1_el.videoWidth) ? v1_el.videoWidth : 1920, (v1_el && v1_el.videoHeight) ? v1_el.videoHeight : 1080);
    gl.uniform1f(gl.getUniformLocation(program, "u_time"), currentTimeSec);
    gl.uniform1f(gl.getUniformLocation(program, "u_distortion_factor"), distortionFactor);

    // Update dynamic ripple objects ages
    const shaderRipples = [];
    ripples.forEach((r) => {
      r.age += deltaTime;
    });
    // filter out old ripples
    ripples = ripples.filter(r => r.age < 2.0);

    // Format ripple uniforms
    for (let i = 0; i < 16; i++) {
      if (i < ripples.length) {
        const r = ripples[i];
        shaderRipples.push(r.x, r.y, r.age, r.intensity);
      } else {
        shaderRipples.push(0, 0, -1, 0); // inactive sign
      }
    }

    const ripplesLoc = gl.getUniformLocation(program, "u_ripples");
    gl.uniform4fv(ripplesLoc, new Float32Array(shaderRipples));
    gl.uniform1i(gl.getUniformLocation(program, "u_ripple_count"), ripples.length);

    // Upload video frame to texture ONLY if Video 1 is ready
    const v1 = videoElements.video1;
    if (v1 && v1.readyState >= 2) {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, v1);
    }

    // Draw full-screen quad
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  // --- Start the Website Experience ---
  function startExperience() {
    isExperienceStarted = true;
    
    // Initialize WebGL
    initWebGL();
    resizeCanvas();
    
    // Hide Loader
    loaderOverlay.style.opacity = "0";
    loaderOverlay.style.visibility = "hidden";
    
    // Start WebGL render loop
    requestAnimationFrame(render);

    // Lazy load the remaining heavy space sequence videos
    setTimeout(lazyLoadRemaining, 100);

    // Initialize ScrollTrigger Control
    initScrollSequence();
  }

  // --- Scroll sequence animation mapping ---
  function initScrollSequence() {
    gsap.registerPlugin(ScrollTrigger);

    // Pin the sequence viewport container for 600vh
    ScrollTrigger.create({
      trigger: "#hero-scroll-container",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        updateScroll(self.progress);
      }
    });

    // Animate custom elements in the integrated Stitch section below
    // Set up scroll triggers for the ".reveal-text" class elements
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

    // Side navigation indicators activation in Stitch content
    const sideDots = document.querySelectorAll("aside a");
    const sections = [
      document.getElementById("hero-scroll-container"),
      document.getElementById("stitch-content-container"),
      document.getElementById("stitch-section")
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

  function updateScroll(progress) {
    // We break 0% to 100% (0.0 to 1.0) into the 5 scenes:
    // Scene 1: 0.0 - 0.2
    // Scene 2: 0.2 - 0.4
    // Scene 3: 0.4 - 0.55
    // Scene 4: 0.55 - 0.8
    // Scene 5: 0.8 - 1.0

    // Set transition overlap windows
    const fadeWindow = 0.02;

    // Initialize display states
    let v1Opacity = 0, v2Opacity = 0, v3Opacity = 0, v4Opacity = 0, v5Opacity = 0;
    let canvasOpacity = 0;
    let v2Scale = 1.0;
    let v4Blur = 0;
    let flashOpacity = 0;

    // --- Scene 1: Liquid Morph Astronaut (0.0 - 0.2) ---
    if (progress <= 0.20) {
      canvasOpacity = 1.0;
      distortionFactor = 1.0 - (progress / 0.20); // distortion goes from 1.0 to 0.0
      
      // Map scroll progress to video 1 playhead
      const relativeProgress = progress / 0.20;
      videoState.video1.targetTime = relativeProgress * videoState.video1.duration;

      // Transition to Scene 2 near boundary
      if (progress >= 0.20 - fadeWindow) {
        const mix = (progress - (0.20 - fadeWindow)) / fadeWindow; // 0 to 1
        canvasOpacity = 1.0 - mix;
        v2Opacity = mix;
      }
    }

    // --- Scene 2: Helmet Visor Zoom (0.2 - 0.4) ---
    if (progress >= 0.20 && progress <= 0.40) {
      v2Opacity = 1.0;
      
      // Zoom factor calculation: zoom continuously from scale 1.0 to 4.5
      const relativeProgress = (progress - 0.20) / 0.20; // 0 to 1
      videoState.video2.targetTime = relativeProgress * videoState.video2.duration;

      // Exponential continuous scale transform
      v2Scale = 1.0 + Math.pow(relativeProgress, 2.0) * 3.5;

      // Transition from Canvas
      if (progress <= 0.20 + fadeWindow) {
        const mix = (progress - 0.20) / fadeWindow; // 0 to 1
        canvasOpacity = 1.0 - mix;
        v2Opacity = mix;
      }
      
      // Transition to Scene 3
      if (progress >= 0.40 - fadeWindow) {
        const mix = (progress - (0.40 - fadeWindow)) / fadeWindow; // 0 to 1
        v2Opacity = 1.0 - mix;
        v3Opacity = mix;
      }
    }

    // --- Scene 3: Glass Visor Dissolves Open (0.4 - 0.55) ---
    if (progress >= 0.40 && progress <= 0.55) {
      v3Opacity = 1.0;
      const relativeProgress = (progress - 0.40) / 0.55; // 0 to 1 relative to scene
      const sceneLen = 0.55 - 0.40;
      const progressInScene = (progress - 0.40) / sceneLen;
      videoState.video3.targetTime = progressInScene * videoState.video3.duration;

      // Crossfade from Scene 2
      if (progress <= 0.40 + fadeWindow) {
        const mix = (progress - 0.40) / fadeWindow; // 0 to 1
        v2Opacity = 1.0 - mix;
        v3Opacity = mix;
      }

      // Crossfade to Scene 4
      if (progress >= 0.55 - fadeWindow) {
        const mix = (progress - (0.55 - fadeWindow)) / fadeWindow; // 0 to 1
        v3Opacity = 1.0 - mix;
        v4Opacity = mix;
      }
    }

    // --- Scene 4: Accelerate to Black Hole (0.55 - 0.8) ---
    if (progress >= 0.55 && progress <= 0.80) {
      v4Opacity = 1.0;
      const sceneLen = 0.80 - 0.55;
      const progressInScene = (progress - 0.55) / sceneLen;
      videoState.video4.targetTime = progressInScene * videoState.video4.duration;

      // Motion blur build-up as camera speeds forward
      // Increases up to 15px blur
      v4Blur = progressInScene * 16.0;

      // Crossfade from Scene 3
      if (progress <= 0.55 + fadeWindow) {
        const mix = (progress - 0.55) / fadeWindow; // 0 to 1
        v3Opacity = 1.0 - mix;
        v4Opacity = mix;
      }

      // Build white flash overlay starting at 76% scroll, fully white at 80%
      if (progress >= 0.76) {
        flashOpacity = (progress - 0.76) / (0.80 - 0.76); // 0 to 1
      }
    }

    // --- Scene 5: Resolve White Flash to White House (0.8 - 1.0) ---
    if (progress >= 0.80) {
      v5Opacity = 1.0;
      const sceneLen = 1.0 - 0.80;
      const progressInScene = (progress - 0.80) / sceneLen;
      videoState.video5.targetTime = progressInScene * videoState.video5.duration;

      // Fade out white flash overlay from 80% to 84%
      if (progress <= 0.84) {
        flashOpacity = 1.0 - ((progress - 0.80) / (0.84 - 0.80)); // 1 to 0
      } else {
        flashOpacity = 0.0;
      }
    }

    // Apply opacities to video layers
    videoElements.video2.style.opacity = v2Opacity;
    videoElements.video3.style.opacity = v3Opacity;
    videoElements.video4.style.opacity = v4Opacity;
    videoElements.video5.style.opacity = v5Opacity;
    
    // Apply canvas opacity
    canvas.style.opacity = canvasOpacity;

    // Apply specific scene transformations
    if (v2Opacity > 0) {
      videoElements.video2.style.transform = `scale(${v2Scale})`;
    } else {
      videoElements.video2.style.transform = `scale(1)`;
    }

    if (v4Opacity > 0) {
      videoElements.video4.style.filter = `blur(${v4Blur}px)`;
    } else {
      videoElements.video4.style.filter = `none`;
    }

    // Apply white flash opacity
    whiteFlash.style.opacity = flashOpacity;

    // --- Midpoint Text Reveals Control ---
    // Scene 1 midpoint: 10% (active 5% to 15%)
    // Scene 2 midpoint: 30% (active 25% to 35%)
    // Scene 3 midpoint: 47.5% (active 43.5% to 51.5%)
    // Scene 4 midpoint: 67.5% (active 62.5% to 72.5%)
    // Scene 5 midpoint: 90% (active 85% to 95%)

    toggleSceneText("scene1", progress >= 0.05 && progress <= 0.15);
    toggleSceneText("scene2", progress >= 0.25 && progress <= 0.35);
    toggleSceneText("scene3", progress >= 0.435 && progress <= 0.515);
    toggleSceneText("scene4", progress >= 0.625 && progress <= 0.725);
    toggleSceneText("scene5", progress >= 0.85 && progress <= 0.95);
  }

  function toggleSceneText(sceneKey, isVisible) {
    const textElement = textOverlays[sceneKey];
    if (isVisible) {
      textElement.classList.add("visible");
    } else {
      textElement.classList.remove("visible");
    }
  }
});
