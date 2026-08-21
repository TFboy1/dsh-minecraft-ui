import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import Schema from "@deepseek-ai/schemastery";

export const name = "minecraft-ui";
export const inject = ["connection", "agents", "tools"];

export const DEFAULT_CONFIG = Object.freeze({
  dataDirectory: "dshcraft",
  catalogUrl: "https://awesome-dsh-plugin.com/plugins.json",
  catalogCacheTtlMs: 6 * 60 * 60 * 1000,
  catalogLimit: 2000,
  confirmationTtlMs: 60 * 1000,
});

export const Config = Schema.object({
  dataDirectory: Schema.string()
    .default(DEFAULT_CONFIG.dataDirectory)
    .description("Relative directory under DSH_HOME used for DSHcraft state."),
  catalogUrl: Schema.string()
    .default(DEFAULT_CONFIG.catalogUrl)
    .description("HTTP(S) endpoint for the curated community plugin catalog."),
  catalogCacheTtlMs: Schema.number()
    .min(60 * 1000)
    .max(7 * 24 * 60 * 60 * 1000)
    .default(DEFAULT_CONFIG.catalogCacheTtlMs)
    .description("Community catalog cache lifetime in milliseconds."),
  catalogLimit: Schema.number()
    .min(1)
    .max(5000)
    .default(DEFAULT_CONFIG.catalogLimit)
    .description("Maximum number of community catalog entries to retain."),
  confirmationTtlMs: Schema.number()
    .min(5000)
    .max(10 * 60 * 1000)
    .default(DEFAULT_CONFIG.confirmationTtlMs)
    .description("Lifetime of one community installation confirmation token."),
}).description("DSHcraft host and community catalog settings.");

const CHANNEL = "/minecraft-ui";
const ok = value => ({ ok: true, value });
const fail = message => ({
  ok: false,
  error: {
    code: "bad-request",
    message,
    details: { issues: [{ message }] },
  },
});

const FALLBACK = [
  {
    name: "dsh-market",
    owner: "dsh-market",
    url: "https://github.com/dsh-market/dsh-market",
    category: "tool",
    description: { zh: "DSH 社区插件市场。" },
    npm: "dshmarket",
    stars: 0,
    install: "dsh plugin --profile web add dshmarket",
  },
  {
    name: "modlens",
    owner: "liustack",
    url: "https://github.com/liustack/modlens",
    category: "vision",
    description: { zh: "为 Agent 增加视觉与 OCR 能力。" },
    npm: "@liustack/modlens",
    stars: 0,
    install: "dsh plugin --profile web add @liustack/modlens",
  },
  {
    name: "dsh-pets",
    owner: "hellosz",
    url: "https://github.com/hellosz/dsh-pets",
    category: "fun",
    description: { zh: "跟随 Agent 状态变化的像素宠物。" },
    npm: "@hellosz/dsh-pets",
    stars: 0,
    install: "dsh plugin --profile web add @hellosz/dsh-pets",
  },
];

export function resolveDataDirectory(root, value) {
  const input = String(value || "").trim();
  if (!input || isAbsolute(input)) throw new Error("dataDirectory must be a non-empty relative path");
  const base = resolve(root);
  const target = resolve(base, input);
  const rel = relative(base, target);
  if (!rel || rel === ".." || rel.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`) || isAbsolute(rel)) {
    throw new Error("dataDirectory must stay inside DSH_HOME");
  }
  return target;
}

export function validateCatalogUrl(value) {
  let parsed;
  try {
    parsed = new URL(String(value));
  } catch {
    throw new Error("catalogUrl must be a valid HTTP(S) URL");
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("catalogUrl must use HTTP or HTTPS");
  }
  return parsed.href;
}

export function parseInstallCommand(command) {
  const match = /^dsh plugin --profile web add ([A-Za-z0-9@._+\-/:#]+)$/.exec(String(command || "").trim());
  return match ? { profile: "web", packageSpec: match[1] } : null;
}

export function normalizePlugin(row, index = 0) {
  const pluginName = String(row?.name || row?.npm || `community-${index}`).slice(0, 120);
  const installCommand = String(row?.install || "").slice(0, 400);
  return {
    id: `${String(row?.owner || "community")}/${pluginName}`,
    name: pluginName,
    packageName: row?.npm ? String(row.npm) : null,
    description: String(row?.description?.zh || row?.description?.en || row?.description || "社区 DSH 插件").slice(0, 800),
    author: String(row?.owner || "community").slice(0, 120),
    stars: Number.isFinite(row?.stars) ? row.stars : 0,
    tags: [String(row?.category || "other").slice(0, 80)],
    repository: String(row?.url || "").slice(0, 500),
    sourceUrl: String(row?.page || row?.url || "").slice(0, 500),
    installCommand,
    riskFlags: [
      ...(installCommand.includes("github:") ? ["github-source"] : []),
      ...(/terminal|shell|command/i.test(`${pluginName} ${row?.description?.en || ""}`) ? ["command-capability"] : []),
    ],
  };
}

export function apply(ctx, config = {}) {
  const settings = { ...DEFAULT_CONFIG, ...config };
  const dshHome = process.env.DSH_HOME || join(homedir(), ".dsh");
  const dataRoot = resolveDataDirectory(dshHome, settings.dataDirectory);
  const catalogUrl = validateCatalogUrl(settings.catalogUrl);
  const capabilityFile = join(dataRoot, "capabilities.json");
  const communityFile = join(dataRoot, "community.json");
  const cacheFile = join(dataRoot, "community-cache.json");
  const disabled = new Map();
  const liveDisposers = new Map();
  const installTokens = new Map();
  const requests = new Set();
  let active = true;
  let community = { collected: [], installed: [] };
  let catalogCache = null;

  const ready = Promise.all([
    readFile(capabilityFile, "utf8")
      .then(raw => {
        const data = JSON.parse(raw);
        for (const [id, names] of Object.entries(data.sessions || {})) {
          disabled.set(id, new Set(Array.isArray(names) ? names.map(String) : []));
        }
      })
      .catch(() => {}),
    readFile(communityFile, "utf8")
      .then(raw => {
        const data = JSON.parse(raw);
        community = {
          collected: Array.isArray(data.collected) ? data.collected.map(String) : [],
          installed: Array.isArray(data.installed) ? data.installed.map(String) : [],
        };
      })
      .catch(() => {}),
    readFile(cacheFile, "utf8")
      .then(raw => {
        const data = JSON.parse(raw);
        if (Array.isArray(data.items)) {
          catalogCache = { items: data.items, at: Number(data.at) || 0, offline: true };
        }
      })
      .catch(() => {}),
  ]);

  const persistCapabilities = async () => {
    const sessions = Object.fromEntries([...disabled].map(([id, set]) => [id, [...set].sort()]));
    await mkdir(dirname(capabilityFile), { recursive: true });
    await writeFile(capabilityFile, JSON.stringify({ version: 1, sessions }, null, 2), "utf8");
  };

  const persistCommunity = async () => {
    await mkdir(dirname(communityFile), { recursive: true });
    await writeFile(communityFile, JSON.stringify({ version: 1, ...community }, null, 2), "utf8");
  };

  const agentFor = id => {
    const agent = ctx.agents.get(id);
    if (!agent) throw new Error(`session agent not live: ${id}`);
    return agent;
  };

  const applyMask = id => {
    liveDisposers.get(id)?.dispose?.();
    liveDisposers.delete(id);
    const known = new Set(ctx.tools.schemas().map(item => item.name));
    const deny = [...(disabled.get(id) || [])].filter(toolName => known.has(toolName) && toolName !== "run_code");
    if (!deny.length) return;
    const agent = agentFor(id);
    liveDisposers.set(id, { agent, dispose: agent.ctx.tools.restrict({ deny }) });
  };

  const listCapabilities = id => {
    const agent = agentFor(id);
    const denied = disabled.get(id) || new Set();
    const globalTools = ctx.tools.schemas();
    const visibleTools = ctx.tools.schemas(agent);
    const globalNames = new Set(globalTools.map(item => item.name));
    const rows = globalTools
      .filter(item => item.name !== "run_code")
      .map(item => ({
        id: item.name,
        name: item.name,
        description: item.description || "",
        enabled: !denied.has(item.name),
        locked: false,
      }));
    for (const item of visibleTools) {
      if (!globalNames.has(item.name) && item.name !== "run_code") {
        rows.push({
          id: item.name,
          name: item.name,
          description: item.description || "",
          enabled: true,
          locked: true,
        });
      }
    }
    return rows;
  };

  const loadCatalog = async (force = false) => {
    if (!force && catalogCache && Date.now() - catalogCache.at < settings.catalogCacheTtlMs) return catalogCache;
    const controller = new AbortController();
    requests.add(controller);
    try {
      const response = await fetch(catalogUrl, {
        headers: { accept: "application/json" },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`catalog HTTP ${response.status}`);
      const raw = await response.json();
      const sourceRows = Array.isArray(raw) ? raw : Array.isArray(raw?.plugins) ? raw.plugins : [];
      const items = sourceRows
        .slice(0, settings.catalogLimit)
        .map(normalizePlugin)
        .filter(item => parseInstallCommand(item.installCommand));
      if (!items.length) throw new Error("community catalog is empty");
      catalogCache = { items, at: Date.now(), offline: false };
      await mkdir(dirname(cacheFile), { recursive: true });
      await writeFile(cacheFile, JSON.stringify({ at: catalogCache.at, items }, null, 2), "utf8");
      return catalogCache;
    } catch (error) {
      if (catalogCache) return { ...catalogCache, offline: true, error: String(error) };
      return {
        items: FALLBACK.map(normalizePlugin),
        at: Date.now(),
        offline: true,
        error: String(error),
      };
    } finally {
      requests.delete(controller);
    }
  };

  const disposeRpc = ctx.connection.rpc.handle(
    CHANNEL,
    async (endpoint, payload = {}) => {
      await ready;
      if (!active) return fail("minecraft-ui is no longer active");
      try {
        const sessionId = String(payload.sessionId || "");
        if (endpoint === "capabilities.list") {
          if (!sessionId) throw new Error("sessionId required");
          applyMask(sessionId);
          return ok({ items: listCapabilities(sessionId) });
        }
        if (endpoint === "capabilities.set") {
          if (!sessionId) throw new Error("sessionId required");
          const id = String(payload.id || "");
          const known = new Set(ctx.tools.schemas().map(item => item.name));
          if (!known.has(id) || id === "run_code") throw new Error(`capability is not restrictable: ${id}`);
          const set = disabled.get(sessionId) || new Set();
          payload.enabled ? set.delete(id) : set.add(id);
          disabled.set(sessionId, set);
          applyMask(sessionId);
          await persistCapabilities();
          return ok({ items: listCapabilities(sessionId) });
        }
        if (endpoint === "agent.describe") {
          const agent = agentFor(sessionId);
          return ok({
            sessionId,
            preset: agent.preset || agent.agentPreset || null,
            status: agent.running ? "running" : "idle",
            capabilities: listCapabilities(sessionId),
          });
        }
        if (endpoint === "community.catalog") {
          const data = await loadCatalog(Boolean(payload.force));
          return ok({
            items: data.items,
            offline: Boolean(data.offline),
            updatedAt: data.at,
            ...(data.error ? { warning: data.error } : {}),
          });
        }
        if (endpoint === "community.collection.get") {
          const data = await loadCatalog();
          const byId = new Map(data.items.map(item => [item.id, item]));
          return ok({
            items: community.collected.map(id => byId.get(id)).filter(Boolean),
            installed: [...community.installed],
          });
        }
        if (endpoint === "community.collection.claim") {
          const id = String(payload.id || "");
          const data = await loadCatalog();
          if (!data.items.some(item => item.id === id)) throw new Error("plugin is not in curated catalog");
          if (!community.collected.includes(id)) community.collected.push(id);
          await persistCommunity();
          return ok({ claimed: true, id });
        }
        if (endpoint === "community.install.prepare") {
          const id = String(payload.id || "");
          const data = await loadCatalog();
          const plugin = data.items.find(item => item.id === id);
          if (!plugin || !community.collected.includes(id)) throw new Error("collect this curated plugin first");
          const token = `install-${Date.now()}-${Math.random().toString(36).slice(2)}`;
          installTokens.set(token, {
            id,
            command: plugin.installCommand,
            expires: Date.now() + settings.confirmationTtlMs,
          });
          return ok({
            token,
            plugin,
            command: plugin.installCommand,
            mode: "dry-run",
            requiresGuardian: true,
            warnings: ["第三方插件会在 Host 中执行代码", "候选插件必须经过 Guardian stage 与 canary", ...plugin.riskFlags],
          });
        }
        if (endpoint === "community.install.confirm") {
          const token = String(payload.token || "");
          const row = installTokens.get(token);
          installTokens.delete(token);
          if (!row || row.expires < Date.now()) throw new Error("install confirmation expired");
          return ok({
            status: "dry-run",
            id: row.id,
            command: row.command,
            requiresGuardian: true,
            message: "未修改任何 profile；请通过 Guardian stage/canary 安装候选插件。",
          });
        }
        return fail(`unknown endpoint: ${endpoint}`);
      } catch (error) {
        return fail(error?.message || String(error));
      }
    },
    { authority: "loopback" },
  );

  const offCreated = ctx.on("agent/created", ({ agent }) => {
    ready.then(() => {
      if (active && disabled.has(agent.sessionId)) applyMask(agent.sessionId);
    }).catch(() => {});
  });
  const offDisposed = ctx.on("agent/disposed", ({ agent }) => {
    const row = liveDisposers.get(agent.sessionId);
    if (row?.agent === agent) {
      row.dispose();
      liveDisposers.delete(agent.sessionId);
    }
  });

  return () => {
    active = false;
    for (const controller of requests) controller.abort();
    requests.clear();
    disposeRpc?.();
    offCreated?.();
    offDisposed?.();
    for (const row of liveDisposers.values()) row.dispose();
    liveDisposers.clear();
    installTokens.clear();
  };
}
