#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadManifest } from "./manifest.js";
import { createCedarMcpServer } from "./server.js";

const manifest = await loadManifest();
const server = createCedarMcpServer(manifest);

await server.connect(new StdioServerTransport());
