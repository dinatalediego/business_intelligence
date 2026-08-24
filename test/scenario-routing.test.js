import test from "node:test";
import assert from "node:assert/strict";

import { findClosestScenario } from "../lib/routing.js";

const scenarios = [
  { id: "customer", keywords: ["cliente", "conversión"] },
  { id: "pricing", keywords: ["precio", "descuento"] },
  { id: "operations", keywords: ["demora", "proceso"] },
];

test("routes a pricing question to the pricing lens", () => {
  assert.equal(
    findClosestScenario("¿Qué descuento cambia el precio sin perder margen?", scenarios).id,
    "pricing",
  );
});

test("normalizes accented Spanish keywords", () => {
  assert.equal(
    findClosestScenario("¿Por qué cae la conversion de clientes?", scenarios).id,
    "customer",
  );
});

test("falls back deterministically when no keyword matches", () => {
  assert.equal(findClosestScenario("¿Qué está ocurriendo?", scenarios).id, "customer");
});
