const test = require("node:test");
const assert = require("node:assert/strict");
const { app } = require("../app");

test("health endpoint reports API and database status", async (context) => {
  const server = app.listen(0);
  context.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));
  await new Promise((resolve) => server.once("listening", resolve));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/health`);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.status, "ok");
  assert.ok(["connected", "disconnected"].includes(body.database));
});

test("API routes report a clear unavailable-database response", async (context) => {
  const server = app.listen(0);
  context.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));
  await new Promise((resolve) => server.once("listening", resolve));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/courses`);
  const body = await response.json();
  assert.equal(response.status, 503);
  assert.match(body.message, /database is unavailable/i);
});

test("logout clears the HttpOnly same-site session cookie", async (context) => {
  const server = app.listen(0);
  context.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));
  await new Promise((resolve) => server.once("listening", resolve));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/auth/logout`, { method: "POST" });
  const cookie = response.headers.get("set-cookie") || "";
  assert.equal(response.status, 200);
  assert.match(cookie, /orbit_session=/);
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=Strict/i);
});
