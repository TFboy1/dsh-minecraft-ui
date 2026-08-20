import * as THREE from "three";
import { BLOCKS, WORLD_RADIUS, getBlock, highestSolid, isSolid, keyOf, setBlock } from "./world.js";
import { ITEM_DEFS, insertStack } from "./inventory.js";
import { movementVector } from "./movement.js";
import { createBlockModel, createItemModel, disposeModelCache } from "./models/factory.js";
import { modelDefinition } from "./models/registry.js";
import { classifyToolActivity } from "./dsh/tool-activity-router.js";
import { canPickupDrop, dropLaunchVelocity } from "./drop-physics.js";

const PLAYER_WIDTH = 0.6;
const PLAYER_HEIGHT = 1.8;
const EYE_HEIGHT = 1.62;
const GRAVITY = 24;
const JUMP_SPEED = 8.4;
const REACH = 6;
function requestLock(element) {
  try {
    const pending = element?.requestPointerLock?.();
    if (pending && typeof pending.catch === "function") pending.catch(() => {});
  } catch {}
}

function pixelTexture(type) {
  const canvas = document.createElement("canvas");
  canvas.width = 16; canvas.height = 16;
  const ctx = canvas.getContext("2d");
  const palette = {
    grass: ["#6da63f", "#7db64b", "#4f7d30"], dirt: ["#79563b", "#68472f", "#8b6547"],
    stone: ["#777a70", "#65695f", "#8b8e83"], log: ["#6f4a2e", "#805537", "#4f321f"],
    leaves: ["#3f7837", "#4e8d40", "#2d5e2a"], planks: ["#a47a4b", "#91663e", "#bd8f59"],
    chest: ["#9b6b34", "#b07a3b", "#60411f"], torch: ["#e6b548", "#9a5e2a", "#ffdc68"]
  }[type] ?? ["#888", "#777", "#999"];
  ctx.fillStyle = palette[0]; ctx.fillRect(0, 0, 16, 16);
  let seed = [...type].reduce((a, c) => a + c.charCodeAt(0), 1);
  for (let i = 0; i < 58; i += 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const x = seed & 15; const y = (seed >>> 4) & 15;
    ctx.fillStyle = palette[(seed >>> 9) % palette.length]; ctx.fillRect(x, y, 1 + ((seed >>> 15) & 1), 1);
  }
  if (type === "grass") { ctx.fillStyle = "#95c95a"; ctx.fillRect(0, 0, 16, 3); }
  if (type === "planks") { ctx.fillStyle = "#6f4b2e"; for (let y = 3; y < 16; y += 4) ctx.fillRect(0, y, 16, 1); }
  if (type === "chest") { ctx.fillStyle = "#35291b"; ctx.fillRect(0, 7, 16, 2); ctx.fillStyle = "#d7b74f"; ctx.fillRect(7, 6, 3, 4); }
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter; texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeWorkDog(label,color=0x92948d){
  const root=new THREE.Group(),fur=new THREE.MeshLambertMaterial({color}),cream=new THREE.MeshLambertMaterial({color:0xd9dbd2}),dark=new THREE.MeshLambertMaterial({color:0x343732}),collar=new THREE.MeshLambertMaterial({color:0xd94b3d});
  const box=(w,h,d,material,x,y,z,parent=root)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);parent.add(mesh);return mesh};
  box(1.05,.52,.48,fur,0,.62,0);box(.46,.36,.08,cream,0,.61,.27);const head=box(.55,.52,.55,fur,0,.82,.55);box(.42,.24,.28,cream,0,.7,.92);box(.6,.12,.58,collar,0,.57,.42);
  box(.18,.3,.13,dark,-.2,1.11,.5);box(.18,.3,.13,dark,.2,1.11,.5);box(.075,.075,.05,dark,-.13,.9,.84);box(.075,.075,.05,dark,.13,.9,.84);box(.11,.09,.06,dark,0,.74,1.08);box(.05,.08,.04,collar,0,.48,.73);
  const legSpots=[[-.36,.25,.24],[.36,.25,.24],[-.36,.25,-.24],[.36,.25,-.24]],legs=legSpots.map(([x,y,z])=>box(.18,.5,.18,fur,x,y,z));legSpots.forEach(([x,,z])=>box(.22,.12,.28,dark,x,.07,z+.04));
  const tailPivot=new THREE.Group();tailPivot.position.set(0,.73,-.48);root.add(tailPivot);const tail=box(.13,.13,.44,fur,0,.1,-.17,tailPivot);tail.rotation.x=-.42;
  const c=document.createElement("canvas");c.width=512;c.height=96;const cx=c.getContext("2d"),texture=new THREE.CanvasTexture(c);texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.NearestFilter;
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false}));sprite.position.set(0,1.58,0);sprite.scale.set(2.65,.5,1);root.add(sprite);
  root.userData.npc=true;root.userData.label=label;root.userData.labelSprite=sprite;root.userData.labelCanvas=c;root.userData.labelContext=cx;root.userData.labelText="";root.userData.legs=legs;root.userData.tail=tailPivot;root.userData.head=head;
  return root;
}
function setNpcBadge(npc,text,visible=true,color="#9cff65"){const sprite=npc?.userData?.labelSprite,cx=npc?.userData?.labelContext,canvas=npc?.userData?.labelCanvas;if(!sprite||!cx||!canvas)return;sprite.visible=visible;if(!visible||npc.userData.labelText===`${text}|${color}`)return;npc.userData.labelText=`${text}|${color}`;const w=canvas.width,h=canvas.height;cx.clearRect(0,0,w,h);cx.fillStyle="rgba(8,8,6,.82)";cx.fillRect(0,6,w,h-12);cx.strokeStyle="rgba(255,255,255,.3)";cx.strokeRect(2,7,w-4,h-14);cx.font="26px Monocraft, monospace";cx.textAlign="center";cx.fillStyle=color;cx.fillText(String(text).slice(0,34),w/2,h*.62);sprite.material.map.needsUpdate=true;}

export class VoxelGame {
  constructor(mount, options) {
    this.mount = mount; this.options = options; this.world = options.world;
    this.position = new THREE.Vector3(options.player.x, options.player.y, options.player.z);
    this.velocity = new THREE.Vector3(); this.yaw = options.player.yaw || 0; this.pitch = options.player.pitch || 0;
    this.keys = new Set(); this.selected = options.selected || 0; this.grounded = false; this.running = true;
    this.mining = null; this.breakProgress = 0; this.dropMeshes = [];
    this.scene = new THREE.Scene(); this.scene.background = new THREE.Color(0x87b8d8); this.scene.fog = new THREE.Fog(0x87b8d8, 22, 62);
    this.camera = new THREE.PerspectiveCamera(72, 1, .05, 100);
    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.className = "mc-canvas"; this.mount.appendChild(this.renderer.domElement);
    this.pickupToast=document.createElement("div");this.pickupToast.className="mc-pickup-toast";this.mount.appendChild(this.pickupToast);
    this.scene.add(new THREE.HemisphereLight(0xddeeff, 0x52613f, 1.55));
    const sun = new THREE.DirectionalLight(0xfff1c7, 1.45); sun.position.set(-18, 30, 12); this.scene.add(sun);
    this.geometry = new THREE.BoxGeometry(1, 1, 1); this.blockMeshes = [];
    this.materials = {}; for (const type of Object.keys(BLOCKS).filter((x) => x !== "air")) this.materials[type] = new THREE.MeshLambertMaterial({ map: pixelTexture(type), transparent: type === "leaves", opacity: type === "leaves" ? .94 : 1 });
    this.raycaster = new THREE.Raycaster(); this.raycaster.far = REACH;
    this.specialGroup = new THREE.Group(); this.specialColliders = []; this.scene.add(this.specialGroup);
    this.npcGroup = new THREE.Group(); this.scene.add(this.npcGroup);
    this.heldMain = new THREE.Group(); this.heldOff = new THREE.Group(); this.camera.add(this.heldMain,this.heldOff); this.scene.add(this.camera); this.heldIds = { main:null, off:null };
    this.buildWorld(); this.updateHeldModels(); this.updateWorkDogs(options.workActivities || []);
    this.bindEvents(); this.resize(); this.clock = new THREE.Clock(); this.lastSave = performance.now();
    this.animate = this.animate.bind(this); requestAnimationFrame(this.animate);
  }

  bindEvents() {
    const canvas = this.renderer.domElement;
    this.onResize = () => this.resize();
    this.onKeyDown = (event) => {
      if (event.repeat && ["KeyT", "KeyE", "Escape"].includes(event.code)) return;
      if (event.code === "Tab" && !this.options.isUiOpen()) { event.preventDefault(); this.options.onTab?.(true); return; }
      if (this.options.isSessionListOpen?.() && /^Digit[1-9]$/.test(event.code)) { event.preventDefault(); this.options.onTabSelect?.(Number(event.code.slice(5)) - 1); return; }
      if (event.code === "KeyT" && !this.options.isUiOpen()) { event.preventDefault(); document.exitPointerLock?.(); this.options.onChat(); return; }
      if (event.code === "KeyE" && !this.options.isUiOpen()) { event.preventDefault(); document.exitPointerLock?.(); this.options.onInventory(); return; }
      if (["KeyM","KeyP","KeyR","KeyG","KeyN","KeyL"].includes(event.code) && !this.options.isUiOpen()) { event.preventDefault(); this.releaseForUi(); const map={KeyM:"models",KeyP:"capabilities",KeyR:"reasoning",KeyG:"workbench",KeyN:"workspace-map",KeyL:"community"};this.options.onFacility?.(map[event.code]); return; }
      if (event.code === "KeyF" && !this.options.isUiOpen()) { event.preventDefault(); this.options.onOffhandSwap?.(); return; }
      if (event.code === "Escape" && !this.options.isUiOpen()) { document.exitPointerLock?.(); this.options.onPause(); return; }
      if (this.options.isUiOpen()) return;
      if (/^Digit[1-9]$/.test(event.code)) { this.selected = Number(event.code.slice(5)) - 1; this.options.onSelect(this.selected); }
      this.keys.add(event.code);
    };
    this.onKeyUp = (event) => { this.keys.delete(event.code); if (event.code === "Tab") this.options.onTab?.(false); };
    this.onBlur = () => this.keys.clear();
    this.onMouseMove = (event) => { if (document.pointerLockElement !== canvas || this.options.isUiOpen()) return; this.yaw -= event.movementX * .0022; this.pitch -= event.movementY * .0022; this.pitch = Math.max(-1.53, Math.min(1.53, this.pitch)); };
    this.onMouseDown = (event) => {
      if (this.options.isUiOpen()) return;
      if (document.pointerLockElement !== canvas) { requestLock(canvas); return; }
      event.preventDefault();
      if (event.button === 0) { const hit = this.targetBlock(); if (hit) this.mining = { key: keyOf(...hit.coord), hit, elapsed: 0 }; }
      if (event.button === 2) this.useTarget();
      if (event.button === 1) { const hit = this.targetBlock(); if (hit) this.pickBlock(hit.type); }
    };
    this.onMouseUp = (event) => { if (event.button === 0) { this.mining = null; this.breakProgress = 0; } };
    this.onWheel = (event) => { if (this.options.isUiOpen()) return; this.selected = (this.selected + (event.deltaY > 0 ? 1 : 8)) % 9; this.options.onSelect(this.selected); };
    this.onContext = (event) => event.preventDefault();
    window.addEventListener("resize", this.onResize); window.addEventListener("keydown", this.onKeyDown); window.addEventListener("keyup", this.onKeyUp); window.addEventListener("blur", this.onBlur);
    document.addEventListener("mousemove", this.onMouseMove); document.addEventListener("mouseup", this.onMouseUp);
    canvas.addEventListener("mousedown", this.onMouseDown); canvas.addEventListener("wheel", this.onWheel, { passive: true }); canvas.addEventListener("contextmenu", this.onContext);
  }

  resize() { const w = this.mount.clientWidth || innerWidth; const h = this.mount.clientHeight || innerHeight; this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.renderer.setSize(w, h, false); }

  isExposed(x, y, z) { return [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]].some(([a,b,c]) => getBlock(this.world, x+a, y+b, z+c) === "air"); }
  buildWorld() {
    for (const mesh of this.blockMeshes) this.scene.remove(mesh);
    this.blockMeshes = []; this.specialColliders = [];
    while(this.specialGroup.children.length){const child=this.specialGroup.children.pop();child.traverse?.(o=>{o.geometry?.dispose?.();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose?.());else o.material?.dispose?.();});}
    const byType = {};
    for (const [key, type] of this.world.blocks) {
      const [x,y,z] = key.split("|").map(Number); const kind=modelDefinition(type).kind;
      if(!["cube","column"].includes(kind)){
        const model=createBlockModel(type);model.position.set(x+.5,y,z+.5);model.userData.coord=[x,y,z];model.userData.type=type;this.specialGroup.add(model);
        const collider=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));collider.position.set(x+.5,y+.5,z+.5);collider.userData.coord=[x,y,z];collider.userData.type=type;this.specialGroup.add(collider);this.specialColliders.push(collider);continue;
      }
      if (!this.isExposed(x,y,z)) continue;
      (byType[type] ||= []).push([x,y,z]);
    }
    const matrix = new THREE.Matrix4();
    for (const [type, coords] of Object.entries(byType)) {
      const mesh = new THREE.InstancedMesh(this.geometry, this.materials[type], coords.length);
      coords.forEach(([x,y,z], i) => { matrix.makeTranslation(x+.5, y+.5, z+.5); mesh.setMatrixAt(i, matrix); });
      mesh.instanceMatrix.needsUpdate = true; mesh.userData.coords = coords; mesh.userData.type = type; mesh.name = `blocks:${type}`;
      this.scene.add(mesh); this.blockMeshes.push(mesh);
    }
  }
  updateHeldModels(){
    const main=this.options.getInventory()[27+this.selected]?.id||null,off=this.options.getOffhand?.()?.id||null;
    const mount=(root,id,left)=>{while(root.children.length)root.remove(root.children[0]);if(!id)return;const model=createItemModel(id);model.position.set(left?-.58:.58,-.62,-1.15);model.rotation.set(-.25,left ? .45 : -.45,left ? .2 : -.2);model.scale.setScalar(.42);root.add(model);};
    if(main!==this.heldIds.main){this.heldIds.main=main;mount(this.heldMain,main,false);}if(off!==this.heldIds.off){this.heldIds.off=off;mount(this.heldOff,off,true);}
  }

  updateWorkDogs(activities=[]) {
    const wanted=new Set(activities.map(work=>work.sessionId));
    for(const dog of [...this.npcGroup.children])if(!wanted.has(dog.userData.sessionId))this.npcGroup.remove(dog);
    const floorY=this.world.facilities?.workbench?.y||12,spots=[[0,2],[-2,0],[2,0],[0,-2],[-3,3],[3,3]];
    activities.forEach((work,index)=>{
      let dog=this.npcGroup.children.find(row=>row.userData.sessionId===work.sessionId);
      if(!dog){const[x,z]=spots[index%spots.length];dog=makeWorkDog(work.title,index%2?0x85877f:0xa2a49c);dog.position.set(x+.5,floorY,z+.5);dog.rotation.y=Math.PI;dog.userData.sessionId=work.sessionId;dog.userData.home=dog.position.clone();dog.userData.target=dog.position.clone();dog.userData.idlePhase="rest";dog.userData.nextIdleMove=performance.now()+2200+Math.random()*2800;this.npcGroup.add(dog)}
      dog.userData.label=work.title;dog.userData.progress=work.progress;dog.userData.workKind=work.kind;dog.userData.workActive=true;
      const tool=work.toolName||"",route=tool?classifyToolActivity(tool):null,facility=route?.facility?this.world.facilities?.[route.facility]:null,routeKey=`${work.callId||""}:${route?.facility||""}`;
      dog.userData.activityKind=route?.kind||work.kind;dog.userData.toolName=tool;
      if(facility&&dog.userData.routeKey!==routeKey){dog.userData.routeKey=routeKey;dog.userData.target=new THREE.Vector3(facility.x+.3+(index%3)*.28,facility.y,facility.z-.65-(index%2)*.2);dog.userData.idlePhase="tool"}
      else if(!facility&&dog.userData.routeKey){dog.userData.routeKey="";dog.userData.target=dog.userData.home.clone();dog.userData.idlePhase="rest";dog.userData.nextIdleMove=performance.now()+1800}
      setNpcBadge(dog,work.progress,true,tool?"#ffe77a":"#b9ef8a");
    });
    this.mount.dataset.workDogCount=String(activities.length);this.mount.dataset.outdoorWorkDogCount="0";this.mount.dataset.workProgress=activities.map(work=>work.progress).join(" | ");
  }
  updateNpcMotion(dt){const now=performance.now();for(const dog of this.npcGroup.children){const toolMode=!!dog.userData.toolName;if(!toolMode&&now>(dog.userData.nextIdleMove||0)){if(dog.userData.idlePhase==="wander"){dog.userData.idlePhase="rest";dog.userData.nextIdleMove=now+2600+Math.random()*4200;}else{const angle=Math.random()*Math.PI*2,radius=.65+Math.random()*1.25;dog.userData.idlePhase="wander";dog.userData.target=dog.userData.home.clone().add(new THREE.Vector3(Math.cos(angle)*radius,0,Math.sin(angle)*radius));dog.userData.nextIdleMove=now+4800+Math.random()*4200;}}const target=dog.userData.target||dog.userData.home,dx=target.x-dog.position.x,dz=target.z-dog.position.z,dist=Math.hypot(dx,dz),legs=dog.userData.legs||[],tail=dog.userData.tail,head=dog.userData.head,time=now*.009;if(dist>.075){const speed=toolMode?1.65:.92,step=Math.min(dist,dt*speed);dog.position.x+=dx/dist*step;dog.position.z+=dz/dist*step;dog.rotation.y=Math.atan2(dx,dz);legs.forEach((leg,i)=>leg.rotation.x=Math.sin(time+i%2*Math.PI)*(toolMode?.55:.42));if(tail)tail.rotation.y=Math.sin(time*1.5)*.32;if(head)head.rotation.x=Math.sin(time*.5)*.04;}else{legs.forEach(leg=>leg.rotation.x=0);if(toolMode){legs.slice(0,2).forEach((leg,i)=>leg.rotation.x=-.35+Math.sin(time*1.8+i*Math.PI)*.32);if(head)head.rotation.x=-.12+Math.sin(time*.7)*.1;if(tail)tail.rotation.y=Math.sin(time*2.4)*.42;}else{if(head)head.rotation.x=Math.sin(now*.002)*.07;if(tail)tail.rotation.y=Math.sin(now*.006)*.28;}}dog.position.y=dog.userData.home.y+Math.sin(now*.004+dog.position.x)*.012;}}


  collides(pos) {
    const minX = Math.floor(pos.x - PLAYER_WIDTH/2), maxX = Math.floor(pos.x + PLAYER_WIDTH/2);
    const minY = Math.floor(pos.y), maxY = Math.floor(pos.y + PLAYER_HEIGHT - .001);
    const minZ = Math.floor(pos.z - PLAYER_WIDTH/2), maxZ = Math.floor(pos.z + PLAYER_WIDTH/2);
    for (let x=minX;x<=maxX;x++) for(let y=minY;y<=maxY;y++) for(let z=minZ;z<=maxZ;z++) if(isSolid(this.world,x,y,z)) return true;
    return false;
  }
  moveAxis(axis, amount) { if (!amount) return true; this.position[axis] += amount; if (this.collides(this.position)) { this.position[axis] -= amount; return false; } return true; }
  updateMovement(dt) {
    if (this.options.isUiOpen() || document.pointerLockElement !== this.renderer.domElement) { this.velocity.x=0; this.velocity.z=0; }
    else {
      let strafe = 0, forward = 0; if(this.keys.has("KeyW"))forward+=1;if(this.keys.has("KeyS"))forward-=1;if(this.keys.has("KeyA"))strafe-=1;if(this.keys.has("KeyD"))strafe+=1;
      const move=movementVector(this.yaw,strafe,forward); const speed=this.keys.has("ControlLeft")?7.2:this.keys.has("ShiftLeft")?2.1:4.7;
      this.velocity.x=move.x*speed; this.velocity.z=move.z*speed;
      if(this.keys.has("Space")&&this.grounded){this.velocity.y=JUMP_SPEED;this.grounded=false;}
    }
    this.velocity.y -= GRAVITY*dt;
    this.moveAxis("x", this.velocity.x*dt); this.moveAxis("z", this.velocity.z*dt);
    const movedY=this.moveAxis("y", this.velocity.y*dt); if(!movedY){this.grounded=this.velocity.y<0;this.velocity.y=0;}else this.grounded=false;
    if(this.position.y < -10){ const y=highestSolid(this.world,0,0)+1.01;this.position.set(.5,y,.5);this.velocity.set(0,0,0);this.options.onHurt?.(4); }
  }

  targetBlock() {
    this.raycaster.setFromCamera(new THREE.Vector2(0,0), this.camera);
    const hits=this.raycaster.intersectObjects([...this.blockMeshes,...this.specialColliders],false);
    const hit=hits[0]; if(!hit)return null;
    const coord=hit.instanceId==null?hit.object.userData.coord:hit.object.userData.coords[hit.instanceId]; const type=hit.object.userData.type;
    const normal=hit.face?.normal?.clone()||new THREE.Vector3(0,1,0);
    return {coord,type,normal,point:hit.point,distance:hit.distance};
  }
  targetNpc() {
    this.raycaster.setFromCamera(new THREE.Vector2(0,0),this.camera);
    const hits=this.raycaster.intersectObjects(this.npcGroup.children,true);
    if(!hits[0]||hits[0].distance>REACH)return null;
    let node=hits[0].object;while(node&&node.parent!==this.npcGroup)node=node.parent;
    if(node?.userData?.sessionId){node.userData.rayDistance=hits[0].distance;return node}return null;
  }
  publishTarget(){for(const dog of this.npcGroup.children)dog.userData.focused=false;if(this.options.isUiOpen()||document.pointerLockElement!==this.renderer.domElement){this.options.onTarget?.(null);return}const npc=this.targetNpc(),hit=this.targetBlock();if(npc&&(!hit||npc.userData.rayDistance<hit.distance)){npc.userData.focused=true;this.options.onTarget?.({kind:"npc",label:`${npc.userData.label||"运行中的工作"} · ${npc.userData.progress||"处理中"}`,action:"打开这项工作"});return}if(!hit){this.options.onTarget?.(null);return}const semantic=BLOCKS[hit.type]?.semantic;const labels={workbench:["DSH 工作台","打开"],models:["模型箱","打开"],capabilities:["插件箱","打开"],reasoning:["附魔台","调整推理强度"],tutorial:["公告牌","阅读"],terminal:["Agent 终端","查看工具状态"],read:["资料书架","查看"],"workspace-map":["制图台","查看 Project 地图"],community:["社区插件宝箱","探索"]};const row=labels[semantic]||[hit.type,hit.type==="chest"?"打开":"使用"];this.options.onTarget?.({kind:"block",label:row[0],action:row[1],coord:hit.coord});}
  releaseForUi(){this.keys.clear();this.mining=null;this.breakProgress=0;document.exitPointerLock?.();}
  useTarget() {
    const npc=this.targetNpc(),hit=this.targetBlock();if(npc&&(!hit||npc.userData.rayDistance<hit.distance)){this.releaseForUi();this.options.onSelectSession(npc.userData.sessionId);this.options.onFacility?.("workbench",{sessionId:npc.userData.sessionId});return;}
    const held=this.options.getInventory()[27+this.selected]?.id||null;if(!hit){if(held==="workspace_map"){this.releaseForUi();this.options.onFacility?.("workspace-map");}return;}
    if(hit.type==="chest"){this.releaseForUi();this.options.onOpenChest(keyOf(...hit.coord));return;}
    if(BLOCKS[hit.type]?.semantic){this.releaseForUi();this.options.onFacility?.(BLOCKS[hit.type].semantic,{...hit,key:keyOf(...hit.coord)});return;}
    if(held==="workspace_map"){this.releaseForUi();this.options.onFacility?.("workspace-map");return;}
    let item=this.options.getInventory()[27+this.selected]; let def=ITEM_DEFS[item?.id]; let fromOffhand=false;
    if(!def?.place){item=this.options.getOffhand?.();def=ITEM_DEFS[item?.id];fromOffhand=true;} if(!def?.place)return;
    const [x,y,z]=hit.coord; const px=x+Math.round(hit.normal.x),py=y+Math.round(hit.normal.y),pz=z+Math.round(hit.normal.z);
    const previous=getBlock(this.world,px,py,pz); if(previous!=="air")return;
    setBlock(this.world,px,py,pz,def.place); if(this.collides(this.position)){setBlock(this.world,px,py,pz,"air");return;}
    if(fromOffhand)this.options.consumeOffhand?.();else this.options.consumeSelected();this.buildWorld();this.options.onWorldChange();
  }
  pickBlock(type) { const slots=this.options.getInventory(); const index=slots.findIndex((s)=>s?.id===type); if(index>=27){this.selected=index-27;this.options.onSelect(this.selected);} }
  breakBlock(hit) {
    const [x,y,z]=hit.coord; if(y<=0)return; setBlock(this.world,x,y,z,"air");
    const drop=BLOCKS[hit.type]?.drop;if(drop)this.spawnDrop(hit.point,{id:drop,count:1});
    if(hit.type==="chest")this.options.breakChest(keyOf(x,y,z),hit.point);
    this.buildWorld();this.options.onWorldChange();
  }
  showPickup(stack,count){if(!count||!this.pickupToast)return;const name=ITEM_DEFS[stack.id]?.name||stack.id;this.pickupToast.textContent=`拾取 +${count} ${name}`;this.pickupToast.classList.remove("show");void this.pickupToast.offsetWidth;this.pickupToast.classList.add("show");clearTimeout(this.pickupToastTimer);this.pickupToastTimer=setTimeout(()=>this.pickupToast?.classList.remove("show"),1350);}
  spawnDrop(point,stack){const mesh=createItemModel(stack.id),launch=dropLaunchVelocity();mesh.scale.multiplyScalar(.72);mesh.position.set(point.x,point.y+.18,point.z);mesh.userData.stack={...stack};this.scene.add(mesh);this.dropMeshes.push({mesh,age:0,nextPickupAt:.45,velocity:new THREE.Vector3(launch.x,launch.y,launch.z)});}
  updateDrops(dt){for(let i=this.dropMeshes.length-1;i>=0;i--){const d=this.dropMeshes[i],mesh=d.mesh;d.age+=dt;mesh.rotation.y+=dt*2.4;d.velocity.y-=10*dt;mesh.position.x+=d.velocity.x*dt;mesh.position.y+=d.velocity.y*dt;mesh.position.z+=d.velocity.z*dt;const footY=mesh.position.y-.17,cellY=Math.floor(footY);if(d.velocity.y<=0&&isSolid(this.world,Math.floor(mesh.position.x),cellY,Math.floor(mesh.position.z))){const restY=cellY+1.17;if(mesh.position.y<=restY){mesh.position.y=restY;if(Math.abs(d.velocity.y)>.65)d.velocity.y*=-.26;else d.velocity.y=0;d.velocity.x*=Math.max(0,1-dt*4);d.velocity.z*=Math.max(0,1-dt*4);}}if(d.age>=d.nextPickupAt&&canPickupDrop(mesh.position,this.position,d.age)){d.nextPickupAt=d.age+.16;const before=mesh.userData.stack.count,inserted=insertStack(this.options.getInventory(),mesh.userData.stack),moved=before-(inserted.remainder?.count||0);if(moved){this.options.setInventory(inserted.slots);this.showPickup(mesh.userData.stack,moved)}if(!inserted.remainder){this.scene.remove(mesh);this.dropMeshes.splice(i,1);continue}mesh.userData.stack=inserted.remainder;}if(d.age>300){this.scene.remove(mesh);this.dropMeshes.splice(i,1);}}}
  updateMining(dt) {
    if(!this.mining)return;
    const hit=this.targetBlock(); if(!hit||keyOf(...hit.coord)!==this.mining.key){this.mining=null;this.breakProgress=0;return;}
    const tool=this.options.getInventory()[27+this.selected]; const def=ITEM_DEFS[tool?.id]; const base=BLOCKS[hit.type]?.hardness||.5; const speed=def?.tool==="pickaxe"?def.speed:1;
    this.mining.elapsed+=dt*speed; this.breakProgress=Math.min(1,this.mining.elapsed/base); if(this.breakProgress>=1){this.breakBlock(hit);this.mining=null;this.breakProgress=0;}
  }

  animate() {
    if(!this.running)return; requestAnimationFrame(this.animate); const dt=Math.min(.05,this.clock.getDelta());
    this.updateMovement(dt); this.updateMining(dt); this.updateDrops(dt); this.updateHeldModels(); this.updateNpcMotion(dt);if(!this.lastTargetAt||performance.now()-this.lastTargetAt>100){this.lastTargetAt=performance.now();this.publishTarget();}
    const swing=this.breakProgress>0?Math.sin(this.breakProgress*Math.PI*5)*.28:0;this.heldMain.rotation.x=swing;this.heldMain.rotation.z=-swing*.6;
    this.camera.position.set(this.position.x,this.position.y+EYE_HEIGHT,this.position.z);this.camera.rotation.order="YXZ";this.camera.rotation.y=this.yaw;this.camera.rotation.x=this.pitch;
    this.renderer.render(this.scene,this.camera);
    this.options.onHud({x:this.position.x,y:this.position.y,z:this.position.z,selected:this.selected,breakProgress:this.breakProgress,locked:document.pointerLockElement===this.renderer.domElement,drawCalls:this.renderer.info.render.calls});
    if(performance.now()-this.lastSave>5000){this.lastSave=performance.now();this.options.onSave();}
  }

  snapshotPlayer(){return{x:this.position.x,y:this.position.y,z:this.position.z,yaw:this.yaw,pitch:this.pitch};}
  focus(){requestLock(this.renderer.domElement);}
  dispose(){this.running=false;window.removeEventListener("resize",this.onResize);window.removeEventListener("keydown",this.onKeyDown);window.removeEventListener("keyup",this.onKeyUp);window.removeEventListener("blur",this.onBlur);document.removeEventListener("mousemove",this.onMouseMove);document.removeEventListener("mouseup",this.onMouseUp);const c=this.renderer.domElement;c.removeEventListener("mousedown",this.onMouseDown);c.removeEventListener("wheel",this.onWheel);c.removeEventListener("contextmenu",this.onContext);this.geometry.dispose();Object.values(this.materials).forEach((m)=>{m.map?.dispose();m.dispose();});disposeModelCache();clearTimeout(this.pickupToastTimer);this.pickupToast?.remove();this.renderer.dispose();c.remove();}
}
