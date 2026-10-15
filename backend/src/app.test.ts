import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "./app.js";

describe("health endpoint", () => {
  it("returns a healthy API response", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
