#!/usr/bin/env node
// PersonalAIty MCP server entry point (stdio transport). Wire it into an agent:
//   { "command": "npx", "args": ["-y", "personalaity-mcp"] }
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from '../src/mcp/server.js';

const server = createServer();
await server.connect(new StdioServerTransport());
