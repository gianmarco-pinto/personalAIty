// PersonalAIty MCP server: exposes the toolkit to agents (Claude Code, Cursor, …).
// Four tools cover "define" (list/get/validate/compile a persona) and one covers
// "measure" (profile a model), so an agent can both build personas and test models.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { parsePersona } from '../load.js';
import { compileChat } from '../compile/chat.js';
import { compileSocial } from '../compile/social.js';
import { compileVoice } from '../compile/voice.js';
import { compileNpc } from '../compile/npc.js';
import { profileModel, formatModelProfile } from '../eval/index.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const personasDir = join(root, 'personas');
const COMPILERS = { chat: compileChat, social: compileSocial, voice: compileVoice, npc: compileNpc };

const text = (s) => ({ content: [{ type: 'text', text: s }] });
const errorText = (s) => ({ content: [{ type: 'text', text: s }], isError: true });

function galleryFiles() {
  return readdirSync(personasDir).filter((f) => f.endsWith('.persona.yaml'));
}
function galleryList() {
  return galleryFiles().map((f) => {
    const p = yaml.load(readFileSync(join(personasDir, f), 'utf8'));
    return { id: p.id, name: p.name, description: p.description ?? '' };
  });
}

export function createServer() {
  const server = new McpServer({ name: 'personalaity', version: '0.5.0' });

  server.registerTool('list_personas', {
    description: 'List the built-in PersonalAIty persona gallery (id, name, description). Start here, then get_persona to fetch one to edit or compile.',
    inputSchema: {},
  }, async () => text(JSON.stringify(galleryList(), null, 2)));

  server.registerTool('get_persona', {
    description: 'Return a gallery persona as a YAML string, by id (see list_personas). Use it as a starting point.',
    inputSchema: { id: z.string().describe('persona id, e.g. honest-sparring') },
  }, async ({ id }) => {
    const match = galleryFiles().find((f) => f === `${id}.persona.yaml`);
    if (!match) return errorText(`no gallery persona with id '${id}' (see list_personas)`);
    return text(readFileSync(join(personasDir, match), 'utf8'));
  });

  server.registerTool('validate_persona', {
    description: 'Validate a persona (YAML or JSON string) against the PersonalAIty spec. Returns VALID or a list of errors.',
    inputSchema: { persona: z.string().describe('the persona as a YAML or JSON string') },
  }, async ({ persona }) => {
    const { errors } = parsePersona(persona);
    return text(errors.length ? `INVALID:\n- ${errors.join('\n- ')}` : 'VALID');
  });

  server.registerTool('compile_persona', {
    description: 'Compile a persona (YAML/JSON string) into an artifact for a target medium: chat (an LLM system prompt), social (a content style guide), voice (prosody parameters), or npc (behavior weights + dialogue profile). This is the "define once, render anywhere" core.',
    inputSchema: {
      persona: z.string().describe('the persona as a YAML or JSON string'),
      target: z.enum(['chat', 'social', 'voice', 'npc']).default('chat'),
      level: z.enum(['full', 'style']).default('full').describe('chat target only: style is ~50% fewer tokens, boundaries always kept'),
      lang: z.enum(['en', 'it']).default('en'),
    },
  }, async ({ persona, target, level, lang }) => {
    const { persona: p, errors } = parsePersona(persona);
    if (errors.length) return errorText(`persona failed validation:\n- ${errors.join('\n- ')}`);
    const compile = COMPILERS[target];
    const out = target === 'chat' ? compile(p, { lang, level }) : compile(p, { lang });
    return text(out);
  });

  server.registerTool('profile_model', {
    description: "Measure a model's own default HEXACO personality with the PI-50 inventory (no persona attached). Requires OPENROUTER_API_KEY or ANTHROPIC_API_KEY in the server environment. Returns the measured six-domain profile and a sycophancy index.",
    inputSchema: {
      model: z.string().describe('e.g. openai/gpt-4o (openrouter) or claude-opus-4-8 (anthropic)'),
      provider: z.enum(['openrouter', 'anthropic']).default('openrouter'),
      runs: z.number().int().min(1).max(10).default(3),
    },
  }, async ({ model, provider, runs }) => {
    try {
      const r = await profileModel({ provider, model, runs });
      return text(formatModelProfile(r));
    } catch (e) {
      return errorText(`profile failed: ${e.message}`);
    }
  });

  return server;
}
