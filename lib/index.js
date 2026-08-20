import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { homedir } from "node:os";
import { spawn } from "node:child_process";
export const name = "minecraft-ui";
export const inject = ["connection", "agents", "tools"];
const CHANNEL = "/minecraft-ui";
const CATALOG_URL = "https://awesome-dsh-plugin.com/plugins.json";
const ok = value => ({ ok: true, value });
const fail = message => ({ ok: false, error: { code: "bad-request", message, details: { issues: [{ message }] } } });
const FALLBACK = [
  {name:"dsh-market",owner:"dsh-market",url:"https://github.com/dsh-market/dsh-market",category:"tool",description:{zh:"DSH 社区插件市场。"},npm:"dshmarket",stars:0,install:"dsh plugin --profile web add dshmarket"},
  {name:"modlens",owner:"liustack",url:"https://github.com/liustack/modlens",category:"vision",description:{zh:"为 Agent 增加视觉与 OCR 能力。"},npm:"@liustack/modlens",stars:0,install:"dsh plugin --profile web add @liustack/modlens"},
  {name:"dsh-pets",owner:"hellosz",url:"https://github.com/hellosz/dsh-pets",category:"fun",description:{zh:"跟随 Agent 状态变化的像素宠物。"},npm:"@hellosz/dsh-pets",stars:0,install:"dsh plugin --profile web add @hellosz/dsh-pets"}
];
const normalizePlugin = (row,index) => {
  const name=String(row?.name||row?.npm||`community-${index}`).slice(0,120);
  const install=String(row?.install||"").slice(0,400);
  return {id:`${String(row?.owner||"community")}/${name}`,name,packageName:row?.npm?String(row.npm):null,description:String(row?.description?.zh||row?.description?.en||row?.description||"社区 DSH 插件").slice(0,800),author:String(row?.owner||"community"),stars:Number.isFinite(row?.stars)?row.stars:0,tags:[String(row?.category||"other")],repository:String(row?.url||"").slice(0,500),sourceUrl:String(row?.page||row?.url||"").slice(0,500),installCommand:install,riskFlags:[...(install.includes("github:")?["github-source"]:[]),...(/terminal|shell|command/i.test(`${name} ${row?.description?.en||""}`)?["command-capability"]:[])]};
};
export function apply(ctx) {
  const root=process.env.DSH_HOME||join(homedir(),".dsh"), capabilityFile=join(root,"dshcraft","capabilities.json"), communityFile=join(root,"dshcraft","community.json"), cacheFile=join(root,"dshcraft","community-cache.json");
  const disabled=new Map(),liveDisposers=new Map(),installTokens=new Map();
  let community={collected:[],installed:[]},catalogCache=null;
  const ready=Promise.all([
    readFile(capabilityFile,"utf8").then(raw=>{const data=JSON.parse(raw);for(const[id,names]of Object.entries(data.sessions||{}))disabled.set(id,new Set(names));}).catch(()=>{}),
    readFile(communityFile,"utf8").then(raw=>{const data=JSON.parse(raw);community={collected:Array.isArray(data.collected)?data.collected:[],installed:Array.isArray(data.installed)?data.installed:[]};}).catch(()=>{}),
    readFile(cacheFile,"utf8").then(raw=>{const data=JSON.parse(raw);if(Array.isArray(data.items))catalogCache={items:data.items,at:Number(data.at)||0,offline:true};}).catch(()=>{})
  ]);
  const persistCapabilities=async()=>{const sessions=Object.fromEntries([...disabled].map(([id,set])=>[id,[...set].sort()]));await mkdir(dirname(capabilityFile),{recursive:true});await writeFile(capabilityFile,JSON.stringify({version:1,sessions},null,2),"utf8");};
  const persistCommunity=async()=>{await mkdir(dirname(communityFile),{recursive:true});await writeFile(communityFile,JSON.stringify({version:1,...community},null,2),"utf8");};
  const agentFor=id=>{const a=ctx.agents.get(id);if(!a)throw new Error(`session agent not live: ${id}`);return a;};
  const applyMask=id=>{liveDisposers.get(id)?.dispose?.();liveDisposers.delete(id);const known=new Set(ctx.tools.schemas().map(x=>x.name));const deny=[...(disabled.get(id)||[])].filter(name=>known.has(name)&&name!=="run_code");if(!deny.length)return;const agent=agentFor(id);liveDisposers.set(id,{agent,dispose:agent.ctx.tools.restrict({deny})});};
  const list=id=>{const agent=agentFor(id),denied=disabled.get(id)||new Set(),global=ctx.tools.schemas(),visible=ctx.tools.schemas(agent),globalNames=new Set(global.map(x=>x.name)),rows=global.filter(x=>x.name!=="run_code").map(x=>({id:x.name,name:x.name,description:x.description||"",enabled:!denied.has(x.name),locked:false}));for(const x of visible)if(!globalNames.has(x.name)&&x.name!=="run_code")rows.push({id:x.name,name:x.name,description:x.description||"",enabled:true,locked:true});return rows;};
  const loadCatalog=async(force=false)=>{if(!force&&catalogCache&&Date.now()-catalogCache.at<6*60*60*1000)return catalogCache;try{const response=await fetch(CATALOG_URL,{headers:{accept:"application/json"}});if(!response.ok)throw new Error(`catalog HTTP ${response.status}`);const raw=await response.json(),rows=Array.isArray(raw)?raw:Array.isArray(raw?.plugins)?raw.plugins:[];const items=rows.slice(0,2000).map(normalizePlugin).filter(x=>x.installCommand.startsWith("dsh plugin --profile web add "));if(!items.length)throw new Error("community catalog is empty");catalogCache={items,at:Date.now(),offline:false};await mkdir(dirname(cacheFile),{recursive:true});await writeFile(cacheFile,JSON.stringify({at:catalogCache.at,items},null,2),"utf8");return catalogCache;}catch(error){if(catalogCache)return{...catalogCache,offline:true,error:String(error)};return{items:FALLBACK.map(normalizePlugin),at:Date.now(),offline:true,error:String(error)};}};
  const runInstall=command=>new Promise((resolve,reject)=>{const parts=command.trim().split(/\s+/);if(parts[0]!=="dsh"||parts[1]!=="plugin"||parts[2]!=="--profile"||parts[3]!=="web"||parts[4]!=="add"||!parts[5])return reject(new Error("unsupported install command"));const child=spawn("dsh",parts.slice(1),{shell:false,windowsHide:true});let output="";child.stdout?.on("data",x=>output+=String(x));child.stderr?.on("data",x=>output+=String(x));child.on("error",reject);child.on("close",code=>code===0?resolve(output.slice(-4000)):reject(new Error(`installer exited ${code}: ${output.slice(-1000)}`)));});
  const disposeRpc=ctx.connection.rpc.handle(CHANNEL,async(endpoint,payload={})=>{await ready;try{
    const sessionId=String(payload.sessionId||"");
    if(endpoint==="capabilities.list"){if(!sessionId)throw new Error("sessionId required");applyMask(sessionId);return ok({items:list(sessionId)});}
    if(endpoint==="capabilities.set"){if(!sessionId)throw new Error("sessionId required");const id=String(payload.id||""),known=new Set(ctx.tools.schemas().map(x=>x.name));if(!known.has(id)||id==="run_code")throw new Error(`capability is not restrictable: ${id}`);const set=disabled.get(sessionId)||new Set();payload.enabled?set.delete(id):set.add(id);disabled.set(sessionId,set);applyMask(sessionId);await persistCapabilities();return ok({items:list(sessionId)});}
    if(endpoint==="agent.describe"){const agent=agentFor(sessionId);return ok({sessionId,preset:agent.preset||agent.agentPreset||null,status:agent.running?"running":"idle",capabilities:list(sessionId)});}
    if(endpoint==="community.catalog"){const data=await loadCatalog(Boolean(payload.force));return ok({items:data.items,offline:Boolean(data.offline),updatedAt:data.at,...(data.error?{warning:data.error}:{})});}
    if(endpoint==="community.collection.get"){const data=await loadCatalog();const byId=new Map(data.items.map(x=>[x.id,x]));return ok({items:community.collected.map(id=>byId.get(id)).filter(Boolean),installed:[...community.installed]});}
    if(endpoint==="community.collection.claim"){const id=String(payload.id||""),data=await loadCatalog();if(!data.items.some(x=>x.id===id))throw new Error("plugin is not in curated catalog");if(!community.collected.includes(id))community.collected.push(id);await persistCommunity();return ok({claimed:true,id});}
    if(endpoint==="community.install.prepare"){const id=String(payload.id||""),data=await loadCatalog(),plugin=data.items.find(x=>x.id===id);if(!plugin||!community.collected.includes(id))throw new Error("collect this curated plugin first");const token=`install-${Date.now()}-${Math.random().toString(36).slice(2)}`;installTokens.set(token,{id,command:plugin.installCommand,expires:Date.now()+60000});return ok({token,plugin,command:plugin.installCommand,mode:process.env.DSHCRAFT_COMMUNITY_INSTALL==="enabled"?"live":"dry-run",warnings:["第三方插件会在 Host 中执行代码",...plugin.riskFlags]});}
    if(endpoint==="community.install.confirm"){const token=String(payload.token||""),row=installTokens.get(token);installTokens.delete(token);if(!row||row.expires<Date.now())throw new Error("install confirmation expired");if(process.env.DSHCRAFT_COMMUNITY_INSTALL!=="enabled")return ok({status:"dry-run",id:row.id,command:row.command,message:"测试环境未修改 web profile"});await runInstall(row.command);if(!community.installed.includes(row.id))community.installed.push(row.id);await persistCommunity();return ok({status:"installed",id:row.id});}
    return fail(`unknown endpoint: ${endpoint}`);
  }catch(error){return fail(error?.message||String(error));}},{authority:"loopback"});
  const offCreated=ctx.on("agent/created",({agent})=>{ready.then(()=>{if(disabled.has(agent.sessionId))applyMask(agent.sessionId);}).catch(()=>{});});
  const offDisposed=ctx.on("agent/disposed",({agent})=>{const row=liveDisposers.get(agent.sessionId);if(row?.agent===agent){row.dispose();liveDisposers.delete(agent.sessionId);}});
  return()=>{disposeRpc?.();offCreated?.();offDisposed?.();for(const row of liveDisposers.values())row.dispose();liveDisposers.clear();installTokens.clear();};
}
