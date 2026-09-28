# AdSpark — Random Ad Generator

AdSpark is a Next.js prototype for creating ad copy, saving clickable image creatives, configuring display sizes, and previewing ad rotation.

## Run locally

1. Install Node.js LTS.
2. In this repository, run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Add your OpenAI API key to `OPENAI_API_KEY` in `.env.local`.
5. Run `npm run dev` and open http://localhost:3000.

The AI copy generator uses the OpenAI Responses API through the server route at `/api/generate-ad`. The API key is never sent to the browser. Set `OPENAI_TEXT_MODEL` if you want to use a different model available to your API project. API usage may incur charges.

## Ad library

The upload workspace accepts GIF, JPEG, and PNG creatives, click-through URLs, alt text, and preset or custom placements. Saved ads and rotation preferences are stored in this browser so you can test the workflow without configuring a database.

Browser storage is for this prototype only: ads do not sync between browsers or users, and clearing site data removes them. The current app does not yet publish a cross-site embed or provide a shared production ad-serving backend.

## Checks

```bash
npm run lint
npm run build
```
