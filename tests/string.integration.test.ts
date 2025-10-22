import request from "supertest";
import { app } from "../src/app";
import { StringModel } from "../src/models/stringModel";
import { setupTestDB, teardownTestDB, clearTestDB } from "./setup";

describe("String API", () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  // -------------------------
  // POST /strings
  // -------------------------
  it("should return 400 if no value", async () => {
    const res = await request(app).post("/strings").send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "missing value" });
  });

  it("should return 422 if value is not a string", async () => {
    const res = await request(app).post("/strings").send({ value: 123 });
    expect(res.status).toBe(422);
    expect(res.body.error).toBe("value must be a string");
  });

  it("should return 409 if value already exists", async () => {
    // Create a string first
    await request(app).post("/strings").send({ value: "hello" });
    
    // Try creating again
    const res = await request(app).post("/strings").send({ value: "hello" });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe("value already exists");
  });

  it("should create new string and return 201", async () => {
    const res = await request(app).post("/strings").send({ value: "biscuits" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: expect.any(String),
      value: "biscuits",
      properties: expect.objectContaining({
        length: 8,
      }),
    });

    // Verify in DB
    const doc = await StringModel.findById(res.body.id);
    expect(doc).toBeTruthy();
    expect(doc?.value).toBe("biscuits");
  });

  // -------------------------
  // GET /strings/:value
  // -------------------------
  it("should return 404 if not found", async () => {
    const res = await request(app).get("/strings/nonexistent");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("value not found");
  });

  it("should return 200 with document data", async () => {
    // Create a string first
    const createRes = await request(app).post("/strings").send({ value: "food" });

    // Now get it
    const res = await request(app).get("/strings/food");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: createRes.body.id,
      value: "food",
      properties: expect.any(Object),
    });
  });

  // -------------------------
  // DELETE /strings/:value
  // -------------------------
  it("should return 404 if value not found", async () => {
    const res = await request(app).delete("/strings/nonexistent");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "value not found" });
  });

  it("should delete document and return 204", async () => {
    // Create a string first
    await request(app).post("/strings").send({ value: "hello" });

    // Delete it
    const res = await request(app).delete("/strings/hello");

    expect(res.status).toBe(204);
    expect(res.text).toBe("");

    // Verify it's actually deleted
    const getRes = await request(app).get("/strings/hello");
    expect(getRes.status).toBe(404);
  });
});