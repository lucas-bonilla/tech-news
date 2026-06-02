# tech-news

The signal in the noise — top tech headlines from across the web, sorted, filtered, and summarized by Claude.

A single-page tech news aggregator that pulls RSS feeds from multiple sources (The Verge, TechCrunch, Ars Technica, WIRED, Xataka, and more), classifies items by topic (AI, Infra, Security, Business), and lets you filter by language, topic, and source.

## Structure

- `index.html` — the entire front-end (markup, styles, and client logic).
- `api/feed.js` — serverless function that fetches and normalizes the RSS feeds.
- `vercel.json` — Vercel project configuration.

## Deployment

Deployed on Vercel. Pushes to `main` deploy to production automatically.
