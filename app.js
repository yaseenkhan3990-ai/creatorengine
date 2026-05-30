const path = require("path");
require("dotenv").config();
const express = require("express");
const { parseMultipartUpload } = require("./src/utils/multipart");
const { createContentStrategy, sampleDashboard } = require("./src/services/viralStrategist");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("dashboard", {
    page: "dashboard",
    dashboard: sampleDashboard,
    latestStrategy: null
  });
});

app.get("/upload", (req, res) => {
  res.render("upload", {
    page: "upload",
    form: {},
    error: null
  });
});

app.get("/api/ai-status", (req, res) => {
  res.json({
    hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini"
  });
});

app.post(
  "/analyze",
  express.raw({ type: "multipart/form-data", limit: "120mb" }),
  async (req, res) => {
    try {
      const upload = parseMultipartUpload(req);
      const frameCount = Array.isArray(upload.fields.frameData)
        ? upload.fields.frameData.length
        : upload.fields.frameData
          ? 1
          : 0;
      console.log(`Analyzing ${upload.file.originalName} with ${frameCount} captured frame(s).`);
      const strategy = await createContentStrategy(upload.fields, upload.file);

      res.render("results", {
        page: "results",
        strategy,
        upload
      });
    } catch (error) {
      console.error("Analyze failed:", error.message);
      res.status(400).render("upload", {
        page: "upload",
        form: {},
        error: error.message || "Could not analyze this upload. Please try another video."
      });
    }
  }
);

app.get("/insights", (req, res) => {
  res.render("insights", {
    page: "insights",
    dashboard: sampleDashboard
  });
});

app.listen(PORT, () => {
  console.log(`TrendForge is running at http://localhost:${PORT}`);
});
