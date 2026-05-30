# TrendForge AI

Node.js + EJS app for uploading reels/shorts and generating AI-filled titles, descriptions, tags, hashtags, hooks, and content ideas.

## Run

```bash
npm start
```

Open:

```text
http://localhost:3000/upload
```

## Enable AI API analysis

Create a `.env` file from `.env.example`:

```bash
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4.1-mini
PORT=3000
```

When `OPENAI_API_KEY` is present, the browser captures visual frames from the selected reel/short, sends them with the upload, and the backend asks the OpenAI Responses API to return structured platform content. The Generate flow requires the API key; it does not silently use local placeholder output.
