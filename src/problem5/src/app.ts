import express from "express";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";
import { resourcesRouter } from "./routes/resources";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "256kb" }));
  app.use(morgan("dev"));

  app.get("/health", (_req, res) => res.json({ ok: true }));

  // Swagger
  app.get("/openapi.json", (_req, res) => res.json(swaggerSpec));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // API
  app.use("/api/resources", resourcesRouter);

  // optional error handler (helps tests + debugging)
  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error(err);
    res.status(500).json({ error: err?.message ?? "Internal Server Error" });
  });

  return app;
}
