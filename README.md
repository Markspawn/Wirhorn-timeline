# Wirhorn Timeline

A self-hosted, Dockerized, player-facing fantasy campaign timeline for the World of Wirhorn. The app is a fully client-side Vite + React + TypeScript application served by nginx in production, with timeline data loaded from a local JSON file.

## Features

- Interactive horizontal timeline powered by `vis-timeline`.
- Zoomable and pannable timeline with lane/group organization.
- Dark fantasy parchment/map-inspired visual design.
- Large player-facing title: **Timeline of the World**.
- Group and era filters.
- Search across titles, dates, groups, eras, summaries, and details.
- Player Mode toggle that hides entries marked with `"spoiler": true`.
- Clickable lore entries with a detail modal.
- Fantasy display dates kept separate from sortable numeric dates.
- Docker Compose setup suitable for Unraid.
- Timeline data and static assets mounted as volumes so you can edit lore without rebuilding the container.

## Project Structure

```text
.
├── data/events.json              # Editable timeline data mounted into Docker
├── assets/                       # Host-mounted image/static asset folder for Docker
├── public/assets/                # Development/static fallback asset folder
├── src/                          # React app source
├── Dockerfile                    # Multi-stage build, served with nginx
├── docker-compose.yml            # Unraid-friendly compose file
└── README.md
```

## Run Locally for Development

Install dependencies:

```bash
npm install
```

Start the Vite dev server:

```bash
npm run dev
```

Open the local URL Vite prints in your terminal, usually:

```text
http://localhost:5173
```

The app loads timeline data from:

```text
/data/events.json
```

During local development, Vite serves files from `public/`, so if you need to test images locally, put them in `public/assets/` or run with Docker and use the mounted `assets/` folder.

## Build Locally

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Preview runs on port `8080` by default.

## Run with Docker Compose

From the project directory:

```bash
docker compose up -d --build
```

Then open:

```text
http://localhost:8080
```

Stop the app:

```bash
docker compose down
```

## Deploy on Unraid with Docker Compose

1. Copy this project folder to an Unraid share, for example:

   ```text
   /mnt/user/appdata/wirhorn-timeline
   ```

2. Make sure these folders exist inside the project folder:

   ```text
   data/
   assets/
   ```

3. Keep your timeline file at:

   ```text
   /mnt/user/appdata/wirhorn-timeline/data/events.json
   ```

4. Put optional lore images in:

   ```text
   /mnt/user/appdata/wirhorn-timeline/assets/
   ```

5. In the Unraid Docker Compose plugin, create or open a compose stack that points at this project's `docker-compose.yml`.

6. Start the stack. The compose file maps:

   ```text
   host port 8080 -> container port 80
   ./data -> /usr/share/nginx/html/data
   ./assets -> /usr/share/nginx/html/assets
   ```

7. Visit the app from your LAN:

   ```text
   http://YOUR-UNRAID-IP:8080
   ```

If port `8080` is already in use, change the left side of the port mapping in `docker-compose.yml`, for example:

```yaml
ports:
  - "8090:80"
```

Then open `http://YOUR-UNRAID-IP:8090`.

## Edit Timeline Data

Edit:

```text
data/events.json
```

No database is required. The browser fetches this file directly from `/data/events.json`.

After editing only `data/events.json`, you do **not** need to rebuild the container. Refresh the browser page. The app requests the JSON with `cache: no-store`, so updates should appear immediately.

## Add Images

1. Put your image in the mounted assets folder:

   ```text
   assets/my-map.jpg
   ```

2. Reference it in an event with a web path:

   ```json
   "media": "/assets/my-map.jpg"
   ```

3. Refresh the app.

For local Vite development without Docker, place the same file under:

```text
public/assets/my-map.jpg
```

## Add New Timeline Entries

Add a new object to `data/events.json`:

```json
{
  "id": "unique-event-id",
  "title": "Event Title",
  "displayDate": "1001ps",
  "start": 1001,
  "era": "Post Shattering",
  "group": "Campaigns",
  "summary": "Short player-safe summary.",
  "details": "Longer lore text shown in the detail modal.",
  "spoiler": false,
  "media": null
}
```

For ranges, include `end`:

```json
{
  "displayDate": "4000bs-2000bs",
  "start": -4000,
  "end": -2000
}
```

Use negative numbers for **Before Shattering** dates and positive numbers for **Post Shattering** dates. The Shattering is year `0`.

Supported groups are:

- Eras
- Ancient History
- New World
- Divine Events
- Cataclysms
- Nations
- Wars
- Arcane Events
- Characters
- Organizations
- Artifacts
- Discoveries
- Diplomacy
- Campaigns

## Date Formatting Rules

- `4000bs` becomes numeric year `-4000`.
- `230bs` becomes numeric year `-230`.
- `0ps` becomes numeric year `0`.
- `1001ps` becomes numeric year `1001`.
- Ranges use both `start` and `end`.
- Odd display dates such as `948ps Octs` should keep `displayDate` exactly as written and use `948` for the numeric `start`.

The helper in `src/lib/dateParser.ts` validates and normalizes fantasy dates when the app loads JSON.

## Rebuild After Code Changes

If you change React, TypeScript, CSS, Docker, or package files, rebuild the image:

```bash
docker compose up -d --build
```

On Unraid, use the Docker Compose plugin's rebuild/update action for the stack, or run the command from the project directory over SSH.

## Update Only Data Without Rebuilding

If you only edit files in:

```text
data/
assets/
```

just refresh the browser. The Docker Compose volume mounts those directories into nginx, so a rebuild is unnecessary.

## Troubleshooting

- If the app shows an archive loading error, validate that `data/events.json` is valid JSON.
- If images do not appear, confirm they are inside the mounted `assets/` folder and referenced as `/assets/file-name.ext`.
- If Unraid cannot start the container, check whether host port `8080` is already used by another service.
