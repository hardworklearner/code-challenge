import request from "supertest";
import fs from "fs";
import path from "path";

const TEST_DB = path.join(process.cwd(), "data", "test.db");

beforeAll(() => {
  process.env.DB_PATH = TEST_DB;
});

afterAll(() => {
  try {
    fs.unlinkSync(TEST_DB);
  } catch {}
});

import { createApp } from "../app";

describe("Resources API", () => {
  const app = createApp();

  test("GET /health", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  test("POST creates resource", async () => {
    const res = await request(app)
      .post("/api/resources")
      .send({
        name: "Alpha",
        type: "token",
        status: "active",
        metadata: { note: "hello" },
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe("Alpha");
  });

  test("GET list supports filters", async () => {
    await request(app)
      .post("/api/resources")
      .send({ name: "Beta", type: "nft", status: "inactive" });

    const res = await request(app)
      .get("/api/resources")
      .query({ status: "inactive" });
    expect(res.status).toBe(200);
    expect(res.body.items.every((x: any) => x.status === "inactive")).toBe(
      true,
    );
  });

  test("GET details returns 200 then 404 after delete", async () => {
    const created = await request(app)
      .post("/api/resources")
      .send({ name: "Gamma", type: "token" });
    const id = created.body.id as string;

    const get1 = await request(app).get(`/api/resources/${id}`);
    expect(get1.status).toBe(200);

    const del = await request(app).delete(`/api/resources/${id}`);
    expect(del.status).toBe(204);
    expect(del.text).toBe("");

    const get2 = await request(app).get(`/api/resources/${id}`);
    expect(get2.status).toBe(404);
  });

  test("PATCH updates fields", async () => {
    const created = await request(app)
      .post("/api/resources")
      .send({ name: "Delta", type: "token" });
    const id = created.body.id as string;

    const patched = await request(app)
      .patch(`/api/resources/${id}`)
      .send({ status: "inactive", metadata: { reason: "manual" } });

    expect(patched.status).toBe(200);
    expect(patched.body.status).toBe("inactive");
    expect(patched.body.metadata).toEqual({ reason: "manual" });
  });

  test("Swagger endpoints exist", async () => {
    const docs = await request(app).get("/docs");
    expect([200, 301, 302]).toContain(docs.status); // swagger-ui may redirect

    const spec = await request(app).get("/openapi.json");
    expect(spec.status).toBe(200);
    expect(spec.body.openapi).toBeTruthy();
  });
});
