const fileInput = document.querySelector("#video");
const fileName = document.querySelector("#fileName");
const videoPreview = document.querySelector("#videoPreview");
const videoPreviewShell = document.querySelector("#videoPreviewShell");
const uploadForm = document.querySelector("[data-upload-form]");
const generateButton = document.querySelector("[data-generate-button]");
const aiProgress = document.querySelector("[data-ai-progress]");
let isSubmittingWithFrames = false;

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
