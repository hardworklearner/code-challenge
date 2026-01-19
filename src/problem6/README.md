# Problem 6 - Live Scoreboard Module (API Service Specification)

Website with a scoreboard, which shows the top 10 user's scores. This website provide live scoreboard, also supports score increments triggered by user actions, delivers real-time updates, and includes controls to prevent unauthorized or malicious score inflation.

## Goals

1. Display the **top 10 users' score** on a website.
2. Provide **live updates** to th scoreboard.
3. Allow a user action to increase the user's scoree via an API call.
4. Prevent malicious users from increasing scores without authorization

Non-goals:

- Defining what the user action is.
- Frontend implementation details (except integration points like SSE/WebSocket).

---

## High-Level Design

### Components

- **API Service (this module)**: validates requests, updates scores, publishes updates.
- **Database**: authoritative score storage and user metadata.
- **Cache** (recommended): stores precomputed top-10 for fast reads.
- **Realtime Channel**: WebSocket or Server-Sent Events (SSE) for pushing updates to clients.
- **Auth Service / JWT issuer**: provides user identity and session authorization.

### Key Principles

- **Server authoritative**: scores are never accepted “as-is” from clients; clients only request increments.
- **Authenticated & authorized**: every increment request must be associated with a valid user identity.
- **Replay protection / idempotency**: prevents repeating the same action to inflate scores.
- **Rate limiting & abuse controls**: stops automated spam and anomalies.

---

## Data Model

### Score

- **id** (UUID)
- **user_id** (UUID)
- **score** (integer)

### User

- **id** (UUID)
- **name** (string)
- **email** (string)
- **status** (enum: active, inactive)
- **created_at** (datetime)
- **updated_at** (datetime)

### `score_events` (anti-replay ledger)

Tracks action completions to ensure idempotency and auditing.

- `event_id` (UUID, PK) — unique per action completion
- `user_id` (UUID, FK)
- `delta` (int) — how much score increased (typically +1 or server-defined)
- `source` (string) — e.g., `web`, `mobile`
- `created_at` (datetime)
- `request_ip`, `user_agent` (optional for fraud analysis)

---

## API

### 1) Get Top 10 Scores

**GET** `/api/scoreboard/top?limit=10`

Response (200):

```json
{
  "asOf": "2026-01-17T21:00:00.000Z",
  "items": [
    { "userId": "uuid", "displayName": "Alice", "score": 1234, "rank": 1 },
    { "userId": "uuid", "displayName": "Bob", "score": 1200, "rank": 2 }
  ]
}
```

Notes:

- limit defaults to 10; max 100.

- Backed by cache for performance.

### 2) Increment User Score

POST /api/scores/increment

Headers:

- Authorization: Bearer <JWT>

- Idempotency-Key: <uuid> (required) OR include eventId in body

```json
{
  "eventId": "6b7a3c72-cc34-4b8e-9f91-1db7e8a3e72d",
  "delta": 1
}
```

Rules:

- delta is optional; server may override with policy (recommended).

- eventId must be unique per action completion.

Responses:

- 200 OK (increment applied or idempotent replay)

```json
{
  "eventId": "6b7a3c72-cc34-4b8e-9f91-1db7e8a3e72d",
  "delta": 1
}
```

Rules:

- delta is optional; server may override with policy (recommended).

- eventId must be unique per action completion.

Responses:

- 200 OK (increment applied or idempotent replay)

```json
{
  "userId": "uuid",
  "newScore": 101,
  "applied": true,
  "rankHint": 7
}
```

- 409 Conflict (duplicate event with mismatched payload)

```json
{ "error": "Duplicate eventId with different payload" }
```

- 401 Unauthorized invalid/missing JWT

- 403 Forbidden user banned/not allowed

- 404 Not Found user not found
- 429 Too Many Requests rate limit triggered

---

## Live Updates (Realtime)

Using WebSocket.

### Web Socket

#### WS /ws/scoreboard

- Client subscribes to _scoreboard.top10_.

- Server pushes updates similarly.

#### When to publish updates

- Publish only when the top 10 set or ordering changes, to reduce noise.

-Optionally publish every N seconds as a keep-alive with _asOf_.

## Authorization & Anti-Abuse Controls

### Authentication

- Use JWTs issued by a trusted Auth Service.
- Validate JWTs to ensure user is authorized.
- Prevent abuse
- JWT must include:
  - sub = userId

  - exp expiration

  - signature verified server-side

- Reject missing/invalid tokens (401).

### Authorization

- Validate user status (active).

- Optionally validate action entitlement (scope/claims), e.g. score:write.

### Idempotency (required)

- Require eventId (UUID) per action completion.

- Store event in score_events.

- If eventId already exists:
  - If payload matches → return 200 with applied=false or same response.

  - If payload differs → return 409.

### Rate Limiting (required)

- Apply per-user and per-IP limits to /api/scores/increment.

- Example:
  - 10 requests / 10 seconds per user

  - 50 requests / minute per IP

- Use a token bucket in Redis (recommended) or in-memory for single-instance.

### Server authoritative scoring (recommended)

- Do not trust client delta.

- Decide delta from server policy:
  - fixed increment (+1), OR

  - derived from server-side verification of the action.

### Fraud signals (recommended)

- Log: *userId, *eventId*, *ip*, *userAgent*, *latency*, *frequency\*.

- Add heuristics:
  - spikes in event rate

  - many distinct eventIds from same IP

  - unusual patterns → flag user / throttle / require re-auth.

---

## Consistency & Performance

### Score update transaction (must be atomic)

On increment request:

1. Insert score_events (fail if duplicate)

2. Update scores.score = scores.score + delta

3. Commit

This prevents partial updates.

### Caching top-10

Recommended approach:

- Maintain scoreboard:top10 in Redis

- On successful increment:
  - Recompute top-10 if the user’s score could affect it

  - Or recompute periodically (e.g., every 1–2 seconds) in a background job

- Store with _asOf_ timestamp.

### Scaling

- Multiple API instances:
  - Use Redis for:
    - rate limits

    - cache

    - pub/sub to fan out updates to SSE/WebSocket servers

---

## Observability

- Metrics:
  - increment requests: success/401/403/409/429

  - latency p95/p99

  - top-10 recompute time

- Logs:
  - structured logs with requestId, userId, eventId

- Alerts:
  - abnormal spikes in increments

  - high 409 rate (replay attempts)

  - high 429 rate (abuse)

---

## Diagram

1. Execution Flow Diagram

![Live score flow diagram](images/Live%20scoreboard-2026-flow-diagram-websocket.png)

- Clients **connect once** via WebSocket
- Frontend explicitly **subscribes** to `scoreboard.top10`
- Server **pushes updates** only when the top-10 changes
- Better for:
  - frequent updates
  - bidirectional communication
  - future extensions (chat, notifications, presence)

2. Component Diagram
   ![Component Diagram](<images/Component%20Diagram%20(API%20_%20WS%20_%20Redis%20_%20DB).png>)

- Redis is used for caching the Top-10 leaderboard and rate limiting.

- In multi-instance deployments, Redis Pub/Sub (or a message broker) is recommended so any API instance can publish updates and all WS instances can broadcast.

3. Deployment Diagram

![Deployment Diagram](images/Deployment%20%20diagram-2026.png)

- The load balancer must support WebSocket upgrade and ideally enable sticky sessions for WS (helpful but not strictly required if your WS layer is stateless).

- For scale and reliability:
  - Run multiple API instances behind the LB.

  - Run multiple WS instances behind the LB.

  - Use Redis Pub/Sub (or a message broker) so scoreboard updates propagate across instances.

- Database remains the source of truth; Redis is an optimization layer.

## Further Improvements

- Using message broker (Kafka/NATS/RabbitMQ) if update volume is high or if you need stronger delivery guarantees than Redis Pub/Sub.

- If score updates are extremely frequent, consider batching updates (e.g., broadcast top-10 at most every 250–500ms).

- Add a circuit breaker/fallback for Redis: API can still function using DB-only reads if Redis is unavailable (with degraded performance).
