# GAS26 Quiz

Live quiz for https://gas26-quiz.blankon.id. Players join at `/`, the host runs the game from `/admin`.

Questions and the session code are in `src/lib/quiz.ts`. The admin passphrase can be overridden with the `ADMIN_PASSPHRASE` environment variable.

Run locally:

```bash
npm install && npm run dev
```

Build and run the container:

```bash
docker build -t gas26-quiz . && docker run -d --name gas26-quiz --restart unless-stopped -p 3000:3000 gas26-quiz
```

Game state is kept in memory, so restarting the container clears the game. Run a single instance only. A reverse proxy in front of it should forward `X-Forwarded-Proto` and must not buffer `/api/stream` or `/api/admin/stream`.

# License

MIT


The logo was from the GAS26 organizers ( https://events.gnome.org/event/376 )
