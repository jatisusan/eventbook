import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "./app.js";

describe("health endpoint", () => {
  it("returns a healthy API response", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("rejects registration with invalid input", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "",
      email: "not-an-email",
      password: "short",
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      message: "Validation failed.",
    });
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "name" }),
        expect.objectContaining({ field: "email" }),
        expect.objectContaining({ field: "password" }),
      ]),
    );
  });
});
