import { test } from "node:test";
import assert from "node:assert/strict";
import { slugify } from "./index.js";

test("basic slugify", () => {
  assert.equal(slugify("Hello World"), "hello-world");
});

test("acento removal", () => {
  assert.equal(slugify("São Paulo"), "sao-paulo");
});

test("custom separator", () => {
  assert.equal(slugify("Hello World", { separator: "_" }), "hello_world");
});

test("empty string", () => {
  assert.equal(slugify(""), "");
});
