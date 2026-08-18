export const CHUNK_SIZE = 16;
export const WORLD_RADIUS = 32;
export const BLOCKS = Object.freeze({
  air: { solid: false, hardness: 0 },
  grass: { solid: true, hardness: 0.55, drop: "grass" },
  dirt: { solid: true, hardness: 0.45, drop: "dirt" },
  stone: { solid: true, hardness: 1.25, drop: "stone", tool: "pickaxe" },
  log: { solid: true, hardness: 0.9, drop: "log" },
  leaves: { solid: true, hardness: 0.22, drop: "leaves" },
  planks: { solid: true, hardness: 0.65, drop: "planks" },
  chest: { solid: true, hardness: 0.8, drop: "planks", container: true },
  torch: { solid: false, hardness: 0.05, drop: "torch" },
  crafting_table: { solid: true, hardness: 0.75, drop: "crafting_table", semantic: "workbench" },
  model_chest: { solid: true, hardness: 0.9, drop: "planks", container: true, semantic: "models" },
  plugin_chest: { solid: true, hardness: 0.9, drop: "planks", container: true, semantic: "capabilities" },
  enchant_table: { solid: true, hardness: 1.4, drop: "stone", semantic: "reasoning" },
  bookshelf: { solid: true, hardness: 0.7, drop: "planks", semantic: "read" },
  terminal: { solid: true, hardness: 1.0, drop: "stone", semantic: "terminal" },
  sign: { solid: false, hardness: 0.4, drop: "planks", semantic: "tutorial" }
});
export const keyOf = (x, y, z) => `${x}|${y}|${z}`;
export const chunkKey = (x, z) => `${Math.floor(x / CHUNK_SIZE)}|${Math.floor(z / CHUNK_SIZE)}`;

export function hash(seed, x, z) {
  let h = (seed ^ Math.imul(x, 374761393) ^ Math.imul(z, 668265263)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
export function terrainHeight(seed, x, z) {
  const broad = Math.sin((x + seed % 31) * 0.13) * 1.35 + Math.cos((z - seed % 19) * 0.11) * 1.15;
  const noise = (hash(seed, Math.floor(x / 2), Math.floor(z / 2)) - 0.5) * 2.2;
  return Math.max(2, Math.min(9, Math.floor(5 + broad + noise)));
}

export function buildStarterHouse(blocks) {
  const floorY = 11, facilities = {};
  for (let x=-5;x<=5;x++) for(let z=-4;z<=6;z++) {
    for(let y=floorY+1;y<=floorY+5;y++) blocks.delete(keyOf(x,y,z));
    blocks.set(keyOf(x,floorY,z),"planks");
    const edge=x===-5||x===5||z===-4||z===6;
    if(edge) for(let y=floorY+1;y<=floorY+4;y++) {
      if(z===-4&&x===0&&y<=floorY+2) continue;
      blocks.set(keyOf(x,y,z),(x===-5||x===5)&&z%3===0?"log":"planks");
    }
    blocks.set(keyOf(x,floorY+5,z),"planks");
  }
  const place=(name,x,z,type)=>{const value={x,y:floorY+1,z,key:keyOf(x,floorY+1,z),type};blocks.set(value.key,type);facilities[name]=value;};
  place("workbench",0,4,"crafting_table");place("modelChest",-3,1,"model_chest");place("pluginChest",3,1,"plugin_chest");place("enchantTable",-3,4,"enchant_table");place("bookshelf",-4,4,"bookshelf");place("terminal",3,4,"terminal");place("tutorial",-2,5,"sign");
  return { floorY, facilities, spawn:{x:.5,y:floorY+1.01,z:-.5,yaw:Math.PI,pitch:-.2} };
}

export function generateWorld(seed = 1337, radius = WORLD_RADIUS) {
  const blocks = new Map();
  const chests = [];
  for (let x = -radius; x < radius; x += 1) {
    for (let z = -radius; z < radius; z += 1) {
      const top = terrainHeight(seed, x, z);
      for (let y = 0; y <= top; y += 1) {
        const type = y === top ? "grass" : y >= top - 2 ? "dirt" : "stone";
        blocks.set(keyOf(x, y, z), type);
      }
      const tree = hash(seed + 77, x, z);
      if (tree > 0.986 && Math.abs(x) > 3 && Math.abs(z) > 3) {
        for (let y = top + 1; y <= top + 4; y += 1) blocks.set(keyOf(x, y, z), "log");
        for (let dx = -2; dx <= 2; dx += 1) for (let dz = -2; dz <= 2; dz += 1) for (let dy = 3; dy <= 5; dy += 1) {
          if (Math.abs(dx) + Math.abs(dz) + Math.abs(dy - 4) <= 4) blocks.set(keyOf(x + dx, top + dy, z + dz), "leaves");
        }
      }
    }
  }
  const chestCoords = [[5, 5], [-8, 7], [11, -10], [-13, -9]];
  for (const [x, z] of chestCoords) {
    const y = terrainHeight(seed, x, z) + 1;
    blocks.set(keyOf(x, y, z), "chest");
    chests.push({ x, y, z, key: keyOf(x, y, z) });
  }
  const starter = buildStarterHouse(blocks);
  return { seed, radius, blocks, chests, diffs: new Map(), facilities: starter.facilities, spawn: starter.spawn, structureVersion: 1 };
}

export function getBlock(world, x, y, z) { return world.blocks.get(keyOf(Math.floor(x), Math.floor(y), Math.floor(z))) ?? "air"; }
export function setBlock(world, x, y, z, type) {
  const key = keyOf(x, y, z);
  if (!type || type === "air") world.blocks.delete(key);
  else world.blocks.set(key, type);
  world.diffs.set(key, type || "air");
}
export function isSolid(world, x, y, z) { return BLOCKS[getBlock(world, x, y, z)]?.solid === true; }
export function highestSolid(world, x, z) {
  for (let y = 24; y >= 0; y -= 1) if (isSolid(world, x, y, z)) return y;
  return 0;
}
export function playerSpawn(world) { return world.spawn ? { ...world.spawn } : { x: 0.5, y: highestSolid(world, 0, 0) + 1.01, z: 0.5, yaw: 0, pitch: 0 }; }
export function serializeWorld(world) { return { version: 1, seed: world.seed, diffs: [...world.diffs.entries()] }; }
export function applyWorldSave(save, radius = WORLD_RADIUS) {
  const world = generateWorld(save?.seed ?? 1337, radius);
  for (const [key, type] of save?.diffs ?? []) {
    if (type === "air") world.blocks.delete(key); else if (BLOCKS[type]) world.blocks.set(key, type);
    world.diffs.set(key, type);
  }
  return world;
}
