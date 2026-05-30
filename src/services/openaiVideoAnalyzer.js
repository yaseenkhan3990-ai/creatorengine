const OPENAI_API_BASE = "https://api.openai.com/v1";

function hasOpenAIConfig() {
  return Boolean(process.env.OPENAI_API_KEY);
}

async function openaiRequest(path, options = {}) {
  const response = await fetch(`${OPENAI_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      ...(options.headers || {})
    }
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload.error?.message || `OpenAI request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

function getResponseText(response) {
  if (response.output_text) return response.output_text;

  return (response.output || [])
    .flatMap((item) => item.content || [])
    .map((content) => content.text || "")
    .join("\n")
    .trim();
}

function parseJsonFromModel(text) {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const cleaned = jsonMatch ? jsonMatch[0] : text.trim();
  return JSON.parse(cleaned);
}

function normalizeFrameData(frameData) {
  const frames = Array.isArray(frameData) ? frameData : [frameData].filter(Boolean);
  return frames
    .filter((frame) => typeof frame === "string" && frame.startsWith("data:image/"))
    .slice(0, 6);
}

function buildPrompt(fields, file, platforms, frameCount) {
  return [
    "You are an expert short-form video strategist.",
    "Analyze the attached frames from the user's uploaded reel/short. Base the output on what you can visually infer from the frames: objects, scene, mood, action, niche, hook potential, and likely audience.",
    "Generate fresh platform-specific metadata. Do not reuse generic examples.",
    "Return ONLY valid JSON. No markdown. No explanation outside JSON.",
    "",
    `Video filename: ${file.originalName}`,
    `Captured frames: ${frameCount}`,
    `Selected platforms: ${platforms.join(", ")}`,
    "",
    "For each selected platform, create a title, description, tags, hashtags, hooks, reel idea, caption, shot plan, audio suggestion, and scores.",
    "JSON shape:",
    JSON.stringify({
      inferredTopic: "string based on the frames",
      audience: "string",
      overallScore: 90,
      platforms: [
        {
          key: "youtube",
          title: "string",
          description: "string",
          tags: ["tag"],
          hashtags: ["#hashtag"],
          hooks: ["hook"],
          reelIdea: "string",
          caption: "string",
          shotPlan: ["step"],
          audioSuggestion: {
            name: "string",
            vibe: "string",
            bpm: 120
          },
          scores: {
            hook: 90,
            search: 85,
            share: 88,
            retention: 92
          }
        }
      ]
    })
  ].join("\n");
}

async function analyzeVideoWithOpenAI(fields, file, platforms) {
  if (!hasOpenAIConfig()) {
    throw new Error("OPENAI_API_KEY is missing. Add it to your .env file and restart the server.");
  }

  const frames = normalizeFrameData(fields.frameData);
  if (!frames.length) {
    throw new Error("Video frames were not captured. Select a video, wait for preview, then click Generate again.");
  }

  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const prompt = buildPrompt(fields, file, platforms, frames.length);
  const content = [
    {
      type: "input_text",
      text: prompt
    },
    ...frames.map((frame) => ({
      type: "input_image",
      image_url: frame
    }))
  ];

  const response = await openaiRequest("/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "user",
          content
        }
      ]
    })
  });

  return {
    frameCount: frames.length,
    model,
    data: parseJsonFromModel(getResponseText(response))
  };
}

module.exports = { analyzeVideoWithOpenAI, hasOpenAIConfig };
