import { Router } from "express";
import { randomUUID } from "crypto";
import { db } from "../db";

export const resourcesRouter = Router();

function nowIso() {
  return new Date().toISOString();
}
function clampInt(v: any, def: number, min: number, max: number) {
  const n = typeof v === "string" ? Number(v) : def;
  if (!Number.isFinite(n)) return def;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}
function safeJson(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}
function deserialize(row: any) {
  return { ...row, metadata: safeJson(row.metadata) };
}

/**
 * @openapi
 * /api/resources:
 *   post:
 *     summary: Create a resource
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CreateResourceInput"
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Resource"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
resourcesRouter.post("/", (req, res) => {
  const { name, type, status = "active", metadata = {} } = req.body ?? {};
  if (typeof name !== "string" || !name.trim())
    return res.status(400).json({ error: "name is required" });
  if (typeof type !== "string" || !type.trim())
    return res.status(400).json({ error: "type is required" });
  if (status !== "active" && status !== "inactive")
    return res.status(400).json({ error: "invalid status" });
  if (
    typeof metadata !== "object" ||
    metadata === null ||
    Array.isArray(metadata)
  )
    return res.status(400).json({ error: "metadata must be an object" });

  const id = randomUUID();
  const ts = nowIso();

  db.prepare(
    `INSERT INTO resources (id, name, type, status, metadata, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(id, name.trim(), type.trim(), status, JSON.stringify(metadata), ts, ts);

  const row = db.prepare(`SELECT * FROM resources WHERE id = ?`).get(id);
  return res.status(201).json(deserialize(row));
});

/**
 * @openapi
 * /api/resources:
 *   get:
 *     summary: List resources with filters
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, inactive] }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, minimum: 1, maximum: 100 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0, minimum: 0 }
 *     responses:
 *       200:
 *         description: List response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ListResponse"
 */
resourcesRouter.get("/", (req, res) => {
  const { type, status, q } = req.query as any;
  const limit = clampInt(req.query.limit, 20, 1, 100);
  const offset = clampInt(req.query.offset, 0, 0, 50000);

  const where: string[] = [];
  const params: any[] = [];

  if (typeof type === "string" && type) {
    where.push("type = ?");
    params.push(type);
  }
  if (typeof status === "string" && status) {
    where.push("status = ?");
    params.push(status);
  }
  if (typeof q === "string" && q) {
    where.push("LOWER(name) LIKE ?");
    params.push(`%${q.toLowerCase()}%`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const items = db
    .prepare(
      `SELECT * FROM resources ${whereSql}
     ORDER BY updated_at DESC
     LIMIT ? OFFSET ?`,
    )
    .all(...params, limit, offset);

  const total = db
    .prepare(`SELECT COUNT(*) as c FROM resources ${whereSql}`)
    .get(...params) as { c: number };

  res.json({ total: total.c, limit, offset, items: items.map(deserialize) });
});

/**
 * @openapi
 * /api/resources/{id}:
 *   get:
 *     summary: Get resource details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Resource
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Resource"
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
resourcesRouter.get("/:id", (req, res) => {
  const row = db
    .prepare(`SELECT * FROM resources WHERE id = ?`)
    .get(req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  return res.json(deserialize(row));
});

/**
 * @openapi
 * /api/resources/{id}:
 *   patch:
 *     summary: Update a resource (partial)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UpdateResourceInput"
 *     responses:
 *       200:
 *         description: Updated resource
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Resource"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
resourcesRouter.patch("/:id", (req, res) => {
  const existing = db
    .prepare(`SELECT * FROM resources WHERE id = ?`)
    .get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Not found" });

  const curr = deserialize(existing);
  const body = req.body ?? {};

  if (
    body.name !== undefined &&
    (typeof body.name !== "string" || !body.name.trim())
  )
    return res.status(400).json({ error: "name must be a non-empty string" });

  if (
    body.type !== undefined &&
    (typeof body.type !== "string" || !body.type.trim())
  )
    return res.status(400).json({ error: "type must be a non-empty string" });

  if (
    body.status !== undefined &&
    body.status !== "active" &&
    body.status !== "inactive"
  )
    return res.status(400).json({ error: "status must be active|inactive" });

  if (
    body.metadata !== undefined &&
    (typeof body.metadata !== "object" ||
      body.metadata === null ||
      Array.isArray(body.metadata))
  )
    return res.status(400).json({ error: "metadata must be an object" });

  const next = {
    ...curr,
    name: body.name !== undefined ? body.name.trim() : curr.name,
    type: body.type !== undefined ? body.type.trim() : curr.type,
    status: body.status !== undefined ? body.status : curr.status,
    metadata: body.metadata !== undefined ? body.metadata : curr.metadata,
    updated_at: nowIso(),
  };

  db.prepare(
    `UPDATE resources SET name=?, type=?, status=?, metadata=?, updated_at=? WHERE id=?`,
  ).run(
    next.name,
    next.type,
    next.status,
    JSON.stringify(next.metadata),
    next.updated_at,
    req.params.id,
  );

  const row = db
    .prepare(`SELECT * FROM resources WHERE id = ?`)
    .get(req.params.id);
  return res.json(deserialize(row));
});

/**
 * @openapi
 * /api/resources/{id}:
 *   delete:
 *     summary: Delete a resource
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Deleted (no content)
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
resourcesRouter.delete("/:id", (req, res) => {
  const info = db
    .prepare(`DELETE FROM resources WHERE id = ?`)
    .run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Not found" });
  return res.status(204).send();
});
