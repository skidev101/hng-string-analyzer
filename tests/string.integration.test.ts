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

  //
  // POST /strings
  //
  it("should return 400 if no value", async () => {
    const res = await request(app).post("/strings").send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: "Invalid request body or missing 'value' field",
    });
  });

  it("should return 422 if value is not a string", async () => {
    const res = await request(app).post("/strings").send({ value: 123 });
    expect(res.status).toBe(422);
    expect(res.body.error).toBe("Invalid data type for 'value' (string)");
  });

  it("should return 422 if string is empty", async () => {
    const res = await request(app).post("/strings").send({ value: "" });
    expect(res.status).toBe(422);
    expect(res.body.error).toBe("value cannot be empty");
  });

  it("should return 409 if String already exists in the system", async () => {
    // Create a string
    await request(app).post("/strings").send({ value: "hello" });

    // Try creating again
    const res = await request(app).post("/strings").send({ value: "hello" });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe("String already exists in the system");
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

  //
  // GET /strings/:value
  //
  it("should return 404 if not found", async () => {
    const res = await request(app).get("/strings/nonexistent");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("String does not exist in the system");
  });

  it("should return 200 with document data", async () => {
    // Create a string
    const createRes = await request(app)
      .post("/strings")
      .send({ value: "food" });

    const res = await request(app).get("/strings/food");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: createRes.body.id,
      value: "food",
      properties: expect.any(Object),
    });
  });

  //
  // GET /strings (filters)
  //
  it("should return all strings with count", async () => {
    await request(app).post("/strings").send({ value: "hello" });
    await request(app).post("/strings").send({ value: "madam" });

    const res = await request(app).get("/strings");
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("should filter by is_palindrome=true", async () => {
    await request(app).post("/strings").send({ value: "madam" });
    await request(app).post("/strings").send({ value: "hello" });

    const res = await request(app).get("/strings?is_palindrome=true");
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].value).toBe("madam");
  });

  it("should return 400 for invalid is_palindrome value", async () => {
    const res = await request(app).get("/strings?is_palindrome=maybe");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid value for is_palindrome");
  });

  it("should filter by min_length and max_length", async () => {
    await request(app).post("/strings").send({ value: "short" });
    await request(app).post("/strings").send({ value: "averylongword" });

    const res = await request(app).get("/strings?min_length=10");
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].value).toBe("averylongword");

    const res2 = await request(app).get("/strings?max_length=6");
    expect(res2.status).toBe(200);
    expect(res2.body.count).toBe(1);
    expect(res2.body.data[0].value).toBe("short");
  });

  it("should return 400 for invalid min_length or max_length", async () => {
    const res = await request(app).get("/strings?min_length=abc");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid value for min_length");

    const res2 = await request(app).get("/strings?max_length=abc");
    expect(res2.status).toBe(400);
    expect(res2.body.error).toBe("Invalid value for max_length");
  });

  it("should filter by word_count", async () => {
    await request(app).post("/strings").send({ value: "hello world" });
    await request(app).post("/strings").send({ value: "single" });

    const res = await request(app).get("/strings?word_count=2");
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].value).toBe("hello world");
  });

  it("should return 400 for invalid word_count", async () => {
    const res = await request(app).get("/strings?word_count=abc");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid value for word_count");
  });

  it("should filter by contains_character", async () => {
    await request(app).post("/strings").send({ value: "apple" });
    await request(app).post("/strings").send({ value: "orange" });

    const res = await request(app).get("/strings?contains_character=p");
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].value).toBe("apple");
  });

  it("should return 400 if contains_character is not single letter", async () => {
    const res = await request(app).get("/strings?contains_character=abc");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("contains_character must be single character");
  });

  //
  // GET /strings/filter-by-natural-language
  //
  it("should return 400 if no query string provided", async () => {
    const res = await request(app).get("/strings/filter-by-natural-language");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Unable to parse natural language query");
  });

  it("should interpret 'palindrome words' and filter correctly", async () => {
    await request(app).post("/strings").send({ value: "madam" });
    await request(app).post("/strings").send({ value: "hello" });

    const res = await request(app).get(
      "/strings/filter-by-natural-language?query=show palindrome words"
    );

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].value).toBe("madam");
  });

  it("should interpret 'longer than 5 letters' correctly", async () => {
    await request(app).post("/strings").send({ value: "short" });
    await request(app).post("/strings").send({ value: "longerword" });

    const res = await request(app).get(
      "/strings/filter-by-natural-language?query=words longer than 5"
    );

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].value).toBe("longerword");
  });

  it("should return 422 for conflicting filters", async () => {
    const res = await request(app).get(
      "/strings/filter-by-natural-language?query=longer than 10 and shorter than 5"
    );
    expect(res.status).toBe(422);
    expect(res.body.error).toBe(
      "Query parsed but resulted in conflicting filters"
    );
  });

  //
  // DELETE /strings/:value
  //
  it("should return 404 if String does not exist in the system", async () => {
    const res = await request(app).delete("/strings/nonexistent");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "String does not exist in the system" });
  });

  it("should delete document and return 204", async () => {
    // Create a string first
    await request(app).post("/strings").send({ value: "hello" });

    // Delete string
    const res = await request(app).delete("/strings/hello");

    expect(res.status).toBe(204);
    expect(res.text).toBe("");

    // Verify delete
    const getRes = await request(app).get("/strings/hello");
    expect(getRes.status).toBe(404);
  });
});
