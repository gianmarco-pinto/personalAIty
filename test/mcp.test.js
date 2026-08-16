// MCP server test: connect an in-process client and exercise the tools that
// need no API key (list / get / validate / compile). profile_model needs a live
// model, so we only assert it is registered, not that it runs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/mcp/server.js';

async function connected() {
  const server = createServer();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: 'test', version: '0' });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return client;
}
const textOf = (res) => res.content.filter((c) => c.type === 'text').map((c) => c.text).join('');

test('server registers the expected tools', async () => {
  const client = await connected();
  const { tools } = await client.listTools();
  const names = tools.map((t) => t.name).sort();
  assert.deepEqual(names, ['compile_persona', 'get_persona', 'list_personas', 'profile_model', 'validate_persona']);
});

test('list_personas returns the gallery', async () => {
  const client = await connected();
  const res = await client.callTool({ name: 'list_personas', arguments: {} });
  const list = JSON.parse(textOf(res));
  assert.ok(list.length >= 6);
  assert.ok(list.some((p) => p.id === 'honest-sparring'));
});

test('get_persona → validate_persona → compile_persona round-trips', async () => {
  const client = await connected();
  const got = await client.callTool({ name: 'get_persona', arguments: { id: 'honest-sparring' } });
  const yamlText = textOf(got);
  assert.match(yamlText, /persona_spec/);

  const valid = await client.callTool({ name: 'validate_persona', arguments: { persona: yamlText } });
  assert.equal(textOf(valid).trim(), 'VALID');

  const chat = await client.callTool({ name: 'compile_persona', arguments: { persona: yamlText, target: 'chat' } });
  assert.match(textOf(chat), /HOW YOU COMMUNICATE|WHO YOU ARE/);

  const npc = await client.callTool({ name: 'compile_persona', arguments: { persona: yamlText, target: 'npc' } });
  assert.match(textOf(npc), /BEHAVIOR WEIGHTS/);
});

test('get_persona rejects an unknown id; validate flags a broken persona', async () => {
  const client = await connected();
  const missing = await client.callTool({ name: 'get_persona', arguments: { id: 'nope' } });
  assert.ok(missing.isError);

  const bad = await client.callTool({ name: 'validate_persona', arguments: { persona: 'persona_spec: "0.1"\nid: x' } });
  assert.match(textOf(bad), /INVALID/);
});
