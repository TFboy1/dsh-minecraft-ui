import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { homedir } from "node:os";
export const name = "minecraft-ui";
export const inject = ["connection", "agents", "tools"];
const CHANNEL = "/minecraft-ui";
const ok = (value) => ({ ok: true, value });
const fail = (message) => ({ ok: false, error: { code: "bad-request", message, details: { issues: [{ message }] } } });
export function apply(ctx) {
  const file = join(process.env.DSH_HOME || join(homedir(), ".dsh"), "dshcraft", "capabilities.json");
  const disabled = new Map();
  const liveDisposers = new Map();
  const ready = readFile(file, "utf8").then(raw => { const data=JSON.parse(raw); for(const [id,names] of Object.entries(data.sessions||{})) disabled.set(id,new Set(names)); }).catch(()=>{});
  const persist = async () => { const sessions=Object.fromEntries([...disabled].map(([id,set])=>[id,[...set].sort()])); await mkdir(dirname(file),{recursive:true}); await writeFile(file,JSON.stringify({version:1,sessions},null,2),"utf8"); };
  const agentFor = (id) => { const a=ctx.agents.get(id); if(!a) throw new Error(`session agent not live: ${id}`); return a; };
  const applyMask = (id) => { liveDisposers.get(id)?.dispose?.(); liveDisposers.delete(id); const known=new Set(ctx.tools.schemas().map(x=>x.name)); const deny=[...(disabled.get(id)||[])].filter(name=>known.has(name)&&name!=="run_code"); if(!deny.length)return; const agent=agentFor(id); liveDisposers.set(id,{agent,dispose:agent.ctx.tools.restrict({deny})}); };
  const list = (id) => { const tools=ctx.tools; const agent=agentFor(id); const denied=disabled.get(id)||new Set(); const global=tools.schemas(); const visible=tools.schemas(agent); const globalNames=new Set(global.map(x=>x.name)); const rows=global.filter(x=>x.name!=="run_code").map(x=>({id:x.name,name:x.name,description:x.description||"",enabled:!denied.has(x.name),locked:false})); for(const x of visible)if(!globalNames.has(x.name)&&x.name!=="run_code")rows.push({id:x.name,name:x.name,description:x.description||"",enabled:true,locked:true}); return rows; };
  const disposeRpc = ctx.connection.rpc.handle(CHANNEL, async (endpoint,payload={}) => { await ready; try { const sessionId=String(payload.sessionId||""); if(endpoint==="capabilities.list"){if(!sessionId)throw new Error("sessionId required");applyMask(sessionId);return ok({items:list(sessionId)});} if(endpoint==="capabilities.set"){if(!sessionId)throw new Error("sessionId required");const id=String(payload.id||"");const tools=ctx.tools;const known=new Set((tools?.schemas()||[]).map(x=>x.name));if(!known.has(id)||id==="run_code")throw new Error(`capability is not restrictable: ${id}`);const set=disabled.get(sessionId)||new Set();payload.enabled?set.delete(id):set.add(id);disabled.set(sessionId,set);applyMask(sessionId);await persist();return ok({items:list(sessionId)});} if(endpoint==="agent.describe"){const agent=agentFor(sessionId);return ok({sessionId,preset:agent.preset||agent.agentPreset||null,status:agent.running?"running":"idle",capabilities:list(sessionId)});} return fail(`unknown endpoint: ${endpoint}`); } catch(error){return fail(error?.message||String(error));} },{authority:"loopback"});
  const offCreated=ctx.on("agent/created",({agent})=>{ready.then(()=>{if(disabled.has(agent.sessionId))applyMask(agent.sessionId);}).catch(()=>{});});
  const offDisposed=ctx.on("agent/disposed",({agent})=>{const row=liveDisposers.get(agent.sessionId);if(row?.agent===agent){row.dispose();liveDisposers.delete(agent.sessionId);}});
  return () => { disposeRpc?.(); offCreated?.(); offDisposed?.(); for(const row of liveDisposers.values())row.dispose(); liveDisposers.clear(); };
}
