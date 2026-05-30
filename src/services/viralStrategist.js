const { analyzeVideoWithOpenAI } = require("./openaiVideoAnalyzer");

const platformProfiles = {
  youtube: {
    label: "YouTube",
    key: "youtube",
    shortLabel: "YT",
    titleLimit: "55-70 characters",
    hook: "searchable curiosity plus clear payoff",
    hashtagCount: 5,
    bestTimes: ["6:00 PM", "8:30 PM", "11:00 AM"],
    format: "strong thumbnail promise, retention-first intro, searchable title"
  },
  instagram: {
    label: "Instagram",
    key: "instagram",
    shortLabel: "IG",
    titleLimit: "7-12 punchy words",
    hook: "fast emotion, identity, and shareability",
    hashtagCount: 8,
    bestTimes: ["12:30 PM", "7:00 PM", "9:30 PM"],
    format: "first-frame hook, caption with social proof, remix-friendly audio"
  },
  facebook: {
    label: "Facebook",
    key: "facebook",
    shortLabel: "FB",
    titleLimit: "conversational headline",
    hook: "relatable story and comment bait",
    hashtagCount: 4,
    bestTimes: ["1:00 PM", "5:30 PM", "8:00 PM"],
    format: "community angle, emotional caption, clear share trigger"
  },
  tiktok: {
    label: "TikTok",
    key: "tiktok",
    shortLabel: "TT",
    titleLimit: "short spoken caption",
    hook: "pattern interrupt and repeat viewing",
    hashtagCount: 6,
    bestTimes: ["10:00 AM", "4:00 PM", "9:00 PM"],
    format: "loopable ending, native caption, trending sound"
  }
};

const trendAudios = [
  { name: "Midnight Momentum", vibe: "luxury, glow-up, finance", lift: "High", bpm: 118 },
  { name: "Fast Cut Fever", vibe: "challenge, transformation, workout", lift: "Very High", bpm: 132 },
  { name: "Soft Proof", vibe: "storytime, before-after, lifestyle", lift: "Medium", bpm: 94 },
  { name: "Creator Sprint", vibe: "tutorial, productivity, business", lift: "High", bpm: 124 }
];

const sampleDashboard = {
  stats: [
    { label: "Predicted reach", value: "1.8M", trend: "+42%" },
    { label: "Average hook score", value: "91", trend: "+18%" },
    { label: "Best post window", value: "7 PM", trend: "Today" },
    { label: "Trend matches", value: "28", trend: "Live" }
  ],
  viralPatterns: [
    "Open with the result before the explanation in the first 2 seconds.",
    "Use one searchable keyword in the title and one emotional trigger in the caption.",
    "Keep reels under 35 seconds when the content is transformation or proof based.",
    "Ask a specific comment question instead of a generic call to action."
  ],
  contentTypes: [
    { name: "Short tutorial", reach: "900K-2.4M", score: 94 },
    { name: "Before and after", reach: "1.1M-3.2M", score: 97 },
    { name: "Trend reaction", reach: "650K-1.8M", score: 88 },
    { name: "Myth busting", reach: "780K-2.1M", score: 91 }
  ],
  trendLines: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    keywordDemand: "24,118 85,89 146,77 207,64 268,42 329,35 390,24",
    trendingVelocity: "24,138 85,128 146,101 207,88 268,66 329,48 390,32",
    contentCompetition: "24,72 85,82 146,76 207,96 268,104 329,118 390,122"
  },
  keywordSignals: [
    { keyword: "AI reel captions", score: 96, change: "+31%" },
    { keyword: "viral hook ideas", score: 93, change: "+24%" },
    { keyword: "trending audio reels", score: 89, change: "+18%" },
    { keyword: "shorts title generator", score: 86, change: "+15%" }
  ],
  runningContent: [
    { title: "Result-first reel edits", platform: "Instagram", velocity: "2.4M views/day" },
    { title: "AI caption breakdowns", platform: "YouTube Shorts", velocity: "1.7M views/day" },
    { title: "Before-after creator workflows", platform: "TikTok", velocity: "1.3M views/day" }
  ],
  audios: trendAudios
};

function normalizePlatforms(platformValue) {
  const raw = Array.isArray(platformValue) ? platformValue : [platformValue || "youtube"];
  const selected = raw.filter((platform) => platformProfiles[platform]);
  return selected.length ? [...new Set(selected)] : ["youtube"];
}

function normalizeAiList(value, fallback = []) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/,|\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return fallback;
}

function cleanWords(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function titleCase(value) {
  return value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1));
}

function inferTopicFromFile(file) {
  const baseName = String(file.originalName || "creator reel")
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\b(720p|1080p|4k|final|edit|reel|short|video|clip)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return baseName ? titleCase(baseName) : "Creator Reel";
}

function buildKeywordSet(fields, file) {
  const words = [
    ...cleanWords(fields.topic || inferTopicFromFile(file)),
    ...cleanWords(fields.audience),
    ...cleanWords(fields.goal),
    ...cleanWords(file.originalName)
  ];

  const useful = words.filter((word) => word.length > 2 && !["mp4", "mov", "reel", "short"].includes(word));
  return [...new Set(useful)].slice(0, 8);
}

function createTitles(topic, audience, platform) {
  const profile = platformProfiles[platform] || platformProfiles.youtube;
  const coreTopic = titleCase(topic || "This Viral Content Idea");
  const coreAudience = audience || "creators";

  return [
    `${coreTopic}: The Hook ${coreAudience} Cannot Ignore`,
    `I Tested ${coreTopic} So You Know What Actually Works`,
    `Stop Scrolling: ${coreTopic} Is Changing Fast`,
    `The ${coreTopic} Formula Built For ${profile.label} Reach`
  ];
}

function createPlatformStrategy(fields, file, platform, index) {
  const profile = platformProfiles[platform] || platformProfiles.youtube;
  const topic = fields.topic || inferTopicFromFile(file);
  const audience = fields.audience || "reel viewers";
  const goal = fields.goal || "maximum reach";
  const keywords = buildKeywordSet(fields, file);
  const mainKeyword = keywords[0] || "viral";
  const titles = createTitles(topic, audience, platform);
  const hashtags = [
    `#${mainKeyword}`,
    "#viralvideo",
    "#contentcreator",
    `#${platform}growth`,
    "#trendingnow",
    "#creatorstrategy",
    "#shorts",
    "#reels"
  ].slice(0, profile.hashtagCount);

  const platformBoost = { youtube: 4, instagram: 6, facebook: 2, tiktok: 7 }[platform] || 3;
  const reachScore = Math.min(98, 76 + keywords.length * 2 + platformBoost + (fields.contentType === "short" ? 6 : 2));
  const selectedAudio = trendAudios.find((audio) => audio.vibe.includes(fields.vibe || "")) || trendAudios[0];

  return {
    platform: profile,
    file,
    topic,
    audience,
    goal,
    reachScore,
    millionViewChance: reachScore >= 92 ? "Strong" : reachScore >= 85 ? "Promising" : "Needs sharper hook",
    primaryTitle: titles[0],
    titles,
    description: `Watch this ${topic.toLowerCase()} reel for a fast, visual story that is built for ${goal}. Save it if you want more content like this, and comment what you noticed first.`,
    tags: [...keywords, platform, "viral", "trending", "creator growth", "social media strategy"].slice(0, 12),
    hashtags,
    autoFill: {
      title: titles[0],
      description: `Watch this ${topic.toLowerCase()} reel for a fast, visual story that is built for ${goal}. Save it if you want more content like this, and comment what you noticed first.`,
      tags: [...keywords, platform, "viral", "trending", "creator growth", "social media strategy"].slice(0, 12).join(", "),
      hashtags: hashtags.join(" "),
      reelIdea: `Create the reel around a strong first-frame visual, a 2-second curiosity hook, three fast proof shots, and a clean ending that asks viewers to save or share.`,
      caption: `This is your sign to pay attention to ${topic.toLowerCase()}. What part would you replay?`
    },
    hooks: [
      `Wait for the moment this ${topic.toLowerCase()} changes.`,
      `Most people miss this detail in ${topic.toLowerCase()}.`,
      `This is why this reel can stop the scroll.`
    ],
    contentPlan: [
      "Frame 1: open with the most visually interesting moment.",
      "Frame 2: add a short text hook that creates curiosity.",
      "Middle: show 3 fast cuts that explain the moment without over-talking.",
      "End: loop back to the opening visual so viewers replay it."
    ],
    platformPlan: [
      `Title style: ${profile.titleLimit}; use ${profile.hook}.`,
      `Creative format: ${profile.format}.`,
      `Post windows to test: ${profile.bestTimes.join(", ")}.`
    ],
    audio: selectedAudio,
    chart: [
      { label: "Hook", value: Math.min(98, reachScore + 1) },
      { label: "Search", value: Math.max(70, reachScore - 8 + index * 2) },
      { label: "Share", value: Math.max(72, reachScore - 5 + platformBoost) },
      { label: "Retention", value: Math.min(96, reachScore - 2) }
    ],
    checklist: [
      "Show the final result in the first frame.",
      "Add captions for silent viewers.",
      "Use one clear promise and one curiosity gap.",
      "Pin a comment that asks for a specific reply.",
      "Repurpose the hook for every platform instead of copying the same caption."
    ]
  };
}

function createAiPlatformStrategy(aiPlatform, fields, file, platform, index, inferredTopic, audience) {
  const base = createPlatformStrategy(
    {
      ...fields,
      topic: inferredTopic,
      audience
    },
    file,
    platform,
    index
  );

  const tags = normalizeAiList(aiPlatform.tags, base.tags).slice(0, 14);
  const hashtags = normalizeAiList(aiPlatform.hashtags, base.hashtags)
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag.replace(/^#+/, "")}`))
    .slice(0, base.platform.hashtagCount);
  const hooks = normalizeAiList(aiPlatform.hooks, base.hooks).slice(0, 4);
  const shotPlan = normalizeAiList(aiPlatform.shotPlan, base.contentPlan).slice(0, 5);
  const scores = aiPlatform.scores || {};
  const reachScore = Math.min(
    98,
    Math.max(60, Math.round(((scores.hook || 88) + (scores.search || 84) + (scores.share || 86) + (scores.retention || 88)) / 4))
  );

  return {
    ...base,
    reachScore,
    millionViewChance: reachScore >= 92 ? "Strong" : reachScore >= 85 ? "Promising" : "Needs sharper hook",
    titles: [aiPlatform.title || base.primaryTitle, ...base.titles.filter((title) => title !== aiPlatform.title)].slice(0, 4),
    primaryTitle: aiPlatform.title || base.primaryTitle,
    description: aiPlatform.description || base.description,
    tags,
    hashtags,
    autoFill: {
      title: aiPlatform.title || base.autoFill.title,
      description: aiPlatform.description || base.autoFill.description,
      tags: tags.join(", "),
      hashtags: hashtags.join(" "),
      reelIdea: aiPlatform.reelIdea || base.autoFill.reelIdea,
      caption: aiPlatform.caption || base.autoFill.caption
    },
    hooks,
    contentPlan: shotPlan,
    audio: {
      name: aiPlatform.audioSuggestion?.name || base.audio.name,
      vibe: aiPlatform.audioSuggestion?.vibe || base.audio.vibe,
      bpm: aiPlatform.audioSuggestion?.bpm || base.audio.bpm,
      lift: base.audio.lift
    },
    chart: [
      { label: "Hook", value: Math.min(98, Math.max(60, scores.hook || base.chart[0].value)) },
      { label: "Search", value: Math.min(98, Math.max(60, scores.search || base.chart[1].value)) },
      { label: "Share", value: Math.min(98, Math.max(60, scores.share || base.chart[2].value)) },
      { label: "Retention", value: Math.min(98, Math.max(60, scores.retention || base.chart[3].value)) }
    ]
  };
}

function buildStrategyResponse(platformStrategies, aiMeta = {}) {
  const bestStrategy = [...platformStrategies].sort((a, b) => b.reachScore - a.reachScore)[0];
  const totalAudience = platformStrategies.reduce((sum, item) => sum + item.reachScore, 0);

  return {
    ...bestStrategy,
    platformStrategies,
    selectedPlatformCount: platformStrategies.length,
    averageReachScore: Math.round(totalAudience / platformStrategies.length),
    aiProvider: aiMeta.provider || "local-fallback",
    aiModel: aiMeta.model || "local-strategy-engine",
    aiNotice: aiMeta.notice || null,
    marketGraph: [
      { label: "YouTube", value: platformStrategies.find((item) => item.platform.key === "youtube")?.reachScore || 82 },
      { label: "Instagram", value: platformStrategies.find((item) => item.platform.key === "instagram")?.reachScore || 88 },
      { label: "Facebook", value: platformStrategies.find((item) => item.platform.key === "facebook")?.reachScore || 76 },
      { label: "TikTok", value: platformStrategies.find((item) => item.platform.key === "tiktok")?.reachScore || 91 }
    ]
  };
}

async function createContentStrategy(fields, file) {
  const platforms = normalizePlatforms(fields.platform);
  const aiResult = await analyzeVideoWithOpenAI(fields, file, platforms);

  if (!aiResult?.data?.platforms?.length) {
    throw new Error("OpenAI did not return platform content. Please try again with a clearer video.");
  }

  const inferredTopic = aiResult.data.inferredTopic || inferTopicFromFile(file);
  const audience = aiResult.data.audience || "reel viewers";
  const platformStrategies = platforms.map((platform, index) => {
    const aiPlatform = aiResult.data.platforms.find((item) => item.key === platform || item.platform === platform) || {};
    return createAiPlatformStrategy(aiPlatform, fields, file, platform, index, inferredTopic, audience);
  });

  return buildStrategyResponse(platformStrategies, {
    provider: "openai",
    model: aiResult.model,
    notice: `OpenAI analyzed ${aiResult.frameCount} captured frame(s) from this uploaded video.`
  });
}

module.exports = { createContentStrategy, sampleDashboard };
