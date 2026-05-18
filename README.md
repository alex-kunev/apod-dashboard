# apod-dashboard

A simple HTML dashboard for NASA's Astronomy Picture of the Day (APOD) API.

## Features

- View today's APOD
- Load APOD by date with a calendar picker
- Navigate with "Last day" / "Next day" buttons
- Supports image and video entries
- Responsive single-page layout
- Basic loading and error handling

## Files

- `index.html` — app structure
- `styles.css` — page styling
- `script.js` — API integration and rendering logic

## API key

This starter is configured with a NASA APOD API key directly in `script.js`.

> Note: because this is a static frontend, the API key is visible in client-side code. For simple demos this may be acceptable, but for production usage consider a backend proxy or another secret-management approach.

## Run locally

Because this is a static app, you can open `index.html` in a browser. If your browser blocks some functionality in direct file mode, use a simple local server.

Examples:

```bash
python -m http.server
```

Then open:

```text
http://localhost:8000
```

## Publish with GitHub Pages

In the repository settings:

- Go to **Settings** → **Pages**
- Under **Build and deployment**
  - **Source**: `Deploy from a branch`
  - **Branch**: `main`
  - **Folder**: `/ (root)`

After saving, the site should publish at a URL similar to:

```text
https://alex-kunev.github.io/apod-dashboard/
```

## Future improvements

- Add loading skeletons
- Add “random picture” support
- Persist the last selected date
- Add tests and linting
