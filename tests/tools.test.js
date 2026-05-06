import { test } from 'node:test';
import assert from 'node:assert/strict';

import { registerTools } from '../dist/lib/tools.js';

function captureRegistrations() {
  const tools = {};
  const fakeServer = {
    tool(name, description, schema, handler) {
      tools[name] = { description, schema, handler };
    },
  };
  registerTools(fakeServer, async () => ({ async fetch() { throw new Error('client not used'); } }));
  return tools;
}

test('registerTools registers the expected MCP tools', () => {
  const tools = captureRegistrations();
  const expected = ['list_products', 'list_orders', 'get_order', 'list_customers', 'get_customer'];
  for (const name of expected) {
    assert.ok(tools[name], `missing tool: ${name}`);
    assert.equal(typeof tools[name].handler, 'function');
    assert.equal(typeof tools[name].description, 'string');
  }
});

test('limit schema enforces 1..500 bound on list tools', () => {
  const tools = captureRegistrations();
  for (const name of ['list_products', 'list_orders', 'list_customers']) {
    const schema = tools[name].schema.limit;
    assert.equal(schema.safeParse(undefined).success, true, `${name} accepts undefined`);
    assert.equal(schema.safeParse(1).success, true, `${name} accepts 1`);
    assert.equal(schema.safeParse(500).success, true, `${name} accepts 500`);
    assert.equal(schema.safeParse(0).success, false, `${name} rejects 0`);
    assert.equal(schema.safeParse(501).success, false, `${name} rejects 501`);
    assert.equal(schema.safeParse(1.5).success, false, `${name} rejects non-int`);
  }
});

test('id schema rejects traversal and disallowed characters', () => {
  const tools = captureRegistrations();
  for (const name of ['get_order', 'get_customer']) {
    const schema = tools[name].schema.id;
    assert.equal(schema.safeParse('123').success, true);
    assert.equal(schema.safeParse('abc_DEF-1').success, true);
    assert.equal(schema.safeParse('').success, false);
    assert.equal(schema.safeParse('../etc/passwd').success, false);
    assert.equal(schema.safeParse('id with space').success, false);
    assert.equal(schema.safeParse('a'.repeat(65)).success, false);
  }
});
