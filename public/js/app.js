const fileInput = document.querySelector("#video");
const fileName = document.querySelector("#fileName");
const videoPreview = document.querySelector("#videoPreview");
const videoPreviewShell = document.querySelector("#videoPreviewShell");
const uploadForm = document.querySelector("[data-upload-form]");
const generateButton = document.querySelector("[data-generate-button]");
const aiProgress = document.querySelector("[data-ai-progress]");
let isSubmittingWithFrames = false;

function initMotion() {
  if (!window.gsap || !window.ScrollTrigger) return;

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    gsap.set(".motion-hidden", { clearProps: "all" });
    return;
  }

  gsap.set(".sidebar, .topbar .eyebrow, .topbar h1, .topbar .primary-action, .topbar .secondary-action", {
    autoAlpha: 0,
    y: 18,
  });
  gsap.set(".hero-panel, .studio-hero, .result-hero, .media-uploader, .preview-note, .form-panel", {
    autoAlpha: 0,
    y: 28,
  });
  gsap.set(".stat-card, .panel, .platform-header", {
    autoAlpha: 0,
    y: 34,
  });
  gsap.set(".clean-list li, .score-row, .keyword-row, .running-row, .audio-card, .platform-option, .ai-feature-list div, .chip-cloud span", {
    autoAlpha: 0,
    y: 18,
  });
  gsap.set(".hero-meter", { autoAlpha: 0, scale: 0.92, y: 18 });
  gsap.set(".hero-platform-icon, .media-logo", { autoAlpha: 0, scale: 0.72, rotation: -8 });
  gsap.set(".bar-row i, .mini-bars i", { scaleY: 0, transformOrigin: "bottom center" });

  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
  intro
    .to(".sidebar", { autoAlpha: 1, y: 0, duration: 0.65 })
    .to(".topbar .eyebrow, .topbar h1, .topbar .primary-action, .topbar .secondary-action", {
      autoAlpha: 1,
      y: 0,
      duration: 0.72,
      stagger: 0.09,
    }, "-=0.38")
    .to(".hero-panel, .studio-hero, .result-hero, .media-uploader, .preview-note, .form-panel", {
      autoAlpha: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.1,
    }, "-=0.32")
    .to(".hero-meter", {
      autoAlpha: 1,
      scale: 1,
      y: 0,
      duration: 0.7,
    }, "-=0.48")
    .to(".hero-platform-icon, .media-logo", {
      autoAlpha: 1,
      scale: 1,
      rotation: 0,
      duration: 0.62,
      stagger: 0.08,
    }, "-=0.58");

  gsap.to(".hero-platform-icon", {
    y: -10,
    rotation: 3,
    duration: 2.8,
    ease: "sine.inOut",
    stagger: 0.25,
    repeat: -1,
    yoyo: true,
  });

  gsap.to(".media-logo", {
    y: -8,
    duration: 2.3,
    ease: "sine.inOut",
    stagger: 0.18,
    repeat: -1,
    yoyo: true,
  });

  document.querySelectorAll(".stat-grid, .platform-grid, .three-column").forEach((grid) => {
    gsap.to(grid.querySelectorAll(".stat-card, .panel"), {
      autoAlpha: 1,
      y: 0,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.08,
      scrollTrigger: {
        trigger: grid,
        start: "top 82%",
        once: true,
      },
    });
  });

  document.querySelectorAll(".panel, .platform-result, .form-panel").forEach((section) => {
    const revealItems = section.querySelectorAll(".clean-list li, .score-row, .keyword-row, .running-row, .audio-card, .platform-option, .ai-feature-list div, .chip-cloud span");
    if (!revealItems.length) return;

    gsap.to(revealItems, {
      autoAlpha: 1,
      y: 0,
      duration: 0.55,
      ease: "power2.out",
      stagger: 0.045,
      scrollTrigger: {
        trigger: section,
        start: "top 84%",
        once: true,
      },
    });
  });

  document.querySelectorAll(".trend-dashboard, .two-column, .analytics-grid, .platform-result > .two-column, .page > .panel").forEach((section) => {
    gsap.to(section.querySelectorAll(":scope > .panel, :scope > article"), {
      autoAlpha: 1,
      y: 0,
      duration: 0.72,
      ease: "power3.out",
      stagger: 0.09,
      scrollTrigger: {
        trigger: section,
        start: "top 82%",
        once: true,
      },
    });
  });

  document.querySelectorAll(".platform-result").forEach((platform) => {
    gsap.to(platform.querySelector(".platform-header"), {
      autoAlpha: 1,
      y: 0,
      duration: 0.65,
      ease: "power3.out",
      scrollTrigger: {
        trigger: platform,
        start: "top 82%",
        once: true,
      },
    });
  });

  document.querySelectorAll(".bar-row i, .mini-bars i").forEach((bar) => {
    gsap.to(bar, {
      scaleY: 1,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: bar,
        start: "top 88%",
        once: true,
      },
    });
  });

  document.querySelectorAll(".line-chart polyline").forEach((line) => {
    const length = line.getTotalLength();
    gsap.set(line, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });
    gsap.to(line, {
      strokeDashoffset: 0,
      duration: 1.25,
      ease: "power2.out",
      scrollTrigger: {
        trigger: line.closest(".line-chart"),
        start: "top 78%",
        once: true,
      },
    });
  });

  document.querySelectorAll(".primary-action, .secondary-action, .copy-link, .title-list button, .platform-option").forEach((item) => {
    item.addEventListener("mouseenter", () => gsap.to(item, { y: -2, duration: 0.18, ease: "power2.out" }));
    item.addEventListener("mouseleave", () => gsap.to(item, { y: 0, duration: 0.18, ease: "power2.out" }));
  });
}

document.addEventListener("DOMContentLoaded", initMotion);

if (fileInput && fileName) {
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    fileName.textContent = file ? `${file.name} - ${(file.size / 1024 / 1024).toFixed(1)} MB` : "Choose MP4, MOV, or WEBM content";

    if (file && videoPreview && videoPreviewShell) {
      const previewUrl = URL.createObjectURL(file);
      videoPreview.src = previewUrl;
      videoPreviewShell.classList.remove("is-empty");
      videoPreview.load();
    }
  });
}

function waitForSeek(video, time) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Video seek timed out.")), 5000);
    const done = () => {
      clearTimeout(timeout);
      video.removeEventListener("seeked", done);
      resolve();
    };

    video.addEventListener("seeked", done);
    video.currentTime = Math.min(Math.max(time, 0), Math.max(video.duration - 0.1, 0));
  });
}

function drawFrame(video) {
  const canvas = document.createElement("canvas");
  const maxWidth = 768;
  const scale = Math.min(1, maxWidth / video.videoWidth);
  canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
  canvas.height = Math.max(1, Math.round(video.videoHeight * scale));

  const context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.72);
}

async function captureVideoFrames(video) {
  if (!video.duration || !video.videoWidth) {
    await new Promise((resolve) => video.addEventListener("loadedmetadata", resolve, { once: true }));
  }

  const duration = video.duration || 1;
  const timestamps = [0.2, duration * 0.25, duration * 0.5, duration * 0.75, Math.max(duration - 0.3, 0.2)];
  const frames = [];

  for (const timestamp of timestamps) {
    await waitForSeek(video, timestamp);
    frames.push(drawFrame(video));
  }

  return frames;
}

function addFrameFields(form, frames) {
  form.querySelectorAll('input[name="frameData"]').forEach((input) => input.remove());

  frames.forEach((frame) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "frameData";
    input.value = frame;
    form.appendChild(input);
  });
}

if (uploadForm && generateButton && aiProgress) {
  uploadForm.addEventListener("submit", async (event) => {
    if (isSubmittingWithFrames) return;

    event.preventDefault();
    const checkedPlatforms = uploadForm.querySelectorAll('input[name="platform"]:checked');

    if (!checkedPlatforms.length) {
      alert("Please select at least one platform.");
      return;
    }

    if (!fileInput.files.length || !videoPreview || videoPreviewShell.classList.contains("is-empty")) {
      alert("Please select a video first.");
      return;
    }

    generateButton.disabled = true;
    generateButton.querySelector("span").textContent = "Capturing video frames...";
    aiProgress.classList.add("active");

    try {
      const frames = await captureVideoFrames(videoPreview);
      if (!frames.length) {
        throw new Error("No frames were captured from the selected video.");
      }
      addFrameFields(uploadForm, frames);
      generateButton.querySelector("span").textContent = `Sending ${frames.length} frames to OpenAI...`;
      isSubmittingWithFrames = true;
      uploadForm.submit();
    } catch (error) {
      alert(error.message || "Could not capture video frames. Please try another video.");
      generateButton.disabled = false;
      generateButton.querySelector("span").textContent = "Analyze Video And Auto Fill Content";
      aiProgress.classList.remove("active");
    }
  });
}

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    await navigator.clipboard.writeText(button.dataset.copy);
    const original = button.textContent;
    button.textContent = "Copied";
    setTimeout(() => {
      button.textContent = original;
    }, 1200);
  });
});

document.querySelectorAll("[data-copy-fields]").forEach((button) => {
  button.addEventListener("click", async () => {
    const panel = button.closest(".autofill-panel");
    const fields = [...panel.querySelectorAll("input, textarea")]
      .map((field) => `${field.previousElementSibling.textContent}: ${field.value}`)
      .join("\n\n");

    await navigator.clipboard.writeText(fields);
    const original = button.textContent;
    button.textContent = "Copied";
    setTimeout(() => {
      button.textContent = original;
    }, 1200);
  });
});
