export const HOTBAR_SIZE = 9;
export const MAIN_SIZE = 27;
export const PLAYER_SIZE = HOTBAR_SIZE + MAIN_SIZE;
export const CHEST_SIZE = 27;

export const ITEM_DEFS = Object.freeze({
  grass: { id: "grass", name: "草方块", max: 64, place: "grass" },
  dirt: { id: "dirt", name: "泥土", max: 64, place: "dirt" },
  stone: { id: "stone", name: "石头", max: 64, place: "stone" },
  log: { id: "log", name: "橡木原木", max: 64, place: "log" },
  leaves: { id: "leaves", name: "橡树树叶", max: 64, place: "leaves" },
  planks: { id: "planks", name: "橡木木板", max: 64, place: "planks" },
  torch: { id: "torch", name: "火把", max: 64, place: "torch" },
  apple: { id: "apple", name: "苹果", max: 64, food: 4 },
  wood_pickaxe: { id: "wood_pickaxe", name: "木镐", max: 1, tool: "pickaxe", speed: 1.8, durability: 59 },
  stone_pickaxe: { id: "stone_pickaxe", name: "石镐", max: 1, tool: "pickaxe", speed: 3.2, durability: 131 },
  stick: { id: "stick", name: "木棍", max: 64 },
  coal: { id: "coal", name: "煤炭", max: 64 },
  crafting_table: { id: "crafting_table", name: "工作台", max: 64, place: "crafting_table" },
  iron_helmet: { id: "iron_helmet", name: "铁头盔", max: 1, armorSlot: "head", armor: 2, durability: 165 },
  iron_chestplate: { id: "iron_chestplate", name: "铁胸甲", max: 1, armorSlot: "chest", armor: 6, durability: 240 },
  iron_leggings: { id: "iron_leggings", name: "铁护腿", max: 1, armorSlot: "legs", armor: 5, durability: 225 },
  iron_boots: { id: "iron_boots", name: "铁靴子", max: 1, armorSlot: "feet", armor: 2, durability: 195 },
  shield: { id: "shield", name: "盾牌", max: 1, offhand: true, durability: 336 },
  chest: { id: "chest", name: "箱子", max: 64, place: "chest" },
  model_chest: { id: "model_chest", name: "模型箱", max: 64, place: "model_chest" },
  plugin_chest: { id: "plugin_chest", name: "插件箱", max: 64, place: "plugin_chest" },
  enchant_table: { id: "enchant_table", name: "附魔台", max: 64, place: "enchant_table" },
  bookshelf: { id: "bookshelf", name: "资料书架", max: 64, place: "bookshelf" },
  terminal: { id: "terminal", name: "Agent 终端", max: 64, place: "terminal" },
  cartography_table: { id: "cartography_table", name: "制图台", max: 64, place: "cartography_table" },
  community_chest: { id: "community_chest", name: "社区插件宝箱", max: 64, place: "community_chest" },
  workspace_map: { id: "workspace_map", name: "Workspace 地图", max: 1, action: "workspace-map" },
  paper: { id: "paper", name: "纸", max: 64 },
  compass: { id: "compass", name: "指南针", max: 1 },
  sign_item: { id: "sign_item", name: "橡木告示牌", max: 16, place: "sign" }
});

export function maxStack(stackOrId) {
  const id = typeof stackOrId === "string" ? stackOrId : stackOrId?.id;
  return ITEM_DEFS[id]?.max ?? 64;
}
export function stack(id, count = 1, extra = {}) {
  if (!ITEM_DEFS[id]) throw new Error(`unknown item ${id}`);
  return { id, count: Math.max(1, Math.min(count, maxStack(id))), ...extra };
}
export function cloneStack(value) { return value ? { ...value } : null; }
export function sameItem(a, b) {
  if (!a || !b || a.id !== b.id) return false;
  const aa = { ...a, count: 0 };
  const bb = { ...b, count: 0 };
  return JSON.stringify(aa) === JSON.stringify(bb);
}
export function emptySlots(size) { return Array.from({ length: size }, () => null); }
export function defaultPlayerInventory() {
  const slots = emptySlots(PLAYER_SIZE);
  slots[27] = stack("grass", 32);
  slots[28] = stack("dirt", 32);
  slots[29] = stack("stone", 24);
  slots[30] = stack("log", 16);
  slots[31] = stack("planks", 32);
  slots[32] = stack("torch", 16);
  slots[33] = stack("apple", 5);
  slots[34] = stack("wood_pickaxe", 1, { durability: 59 });
  slots[35] = stack("stone_pickaxe", 1, { durability: 131 });
  slots[26] = stack("workspace_map", 1);
  return slots;
}

export function leftClick(slots, index, cursor) {
  const next = slots.map(cloneStack);
  const target = next[index];
  let held = cloneStack(cursor);
  if (!held) { next[index] = null; held = target; }
  else if (!target) { next[index] = held; held = null; }
  else if (sameItem(target, held) && target.count < maxStack(target)) {
    const move = Math.min(held.count, maxStack(target) - target.count);
    target.count += move;
    held.count -= move;
    if (held.count === 0) held = null;
  } else { next[index] = held; held = target; }
  return { slots: next, cursor: held };
}

export function rightClick(slots, index, cursor) {
  const next = slots.map(cloneStack);
  const target = next[index];
  let held = cloneStack(cursor);
  if (!held && target) {
    const take = Math.ceil(target.count / 2);
    held = { ...target, count: take };
    target.count -= take;
    if (target.count === 0) next[index] = null;
  } else if (held && !target) {
    next[index] = { ...held, count: 1 };
    held.count -= 1;
    if (held.count === 0) held = null;
  } else if (held && target && sameItem(held, target) && target.count < maxStack(target)) {
    target.count += 1;
    held.count -= 1;
    if (held.count === 0) held = null;
  } else if (held && target) {
    next[index] = held;
    held = target;
  }
  return { slots: next, cursor: held };
}

export function insertStack(slots, incoming, order = slots.map((_, i) => i)) {
  const next = slots.map(cloneStack);
  let held = cloneStack(incoming);
  if (!held) return { slots: next, remainder: null };
  for (const index of order) {
    const target = next[index];
    if (!target || !sameItem(target, held) || target.count >= maxStack(target)) continue;
    const move = Math.min(held.count, maxStack(target) - target.count);
    target.count += move;
    held.count -= move;
    if (!held.count) return { slots: next, remainder: null };
  }
  for (const index of order) {
    if (next[index]) continue;
    const move = Math.min(held.count, maxStack(held));
    next[index] = { ...held, count: move };
    held.count -= move;
    if (!held.count) return { slots: next, remainder: null };
  }
  return { slots: next, remainder: held };
}

export function quickMove(source, sourceIndex, target, targetOrder) {
  const sameArray = source === target;
  const src = source.map(cloneStack);
  const value = cloneStack(src[sourceIndex]);
  if (!value) return { source: src, target: sameArray ? src : target.map(cloneStack) };
  if (sameArray) src[sourceIndex] = null;
  const inserted = insertStack(sameArray ? src : target, value, targetOrder.filter((i) => !sameArray || i !== sourceIndex));
  const remainder = inserted.remainder;
  if (sameArray) {
    inserted.slots[sourceIndex] = remainder;
    return { source: inserted.slots, target: inserted.slots };
  }
  const moved = value.count - (remainder?.count ?? 0);
  if (moved > 0) {
    src[sourceIndex].count -= moved;
    if (!src[sourceIndex].count) src[sourceIndex] = null;
  }
  return { source: src, target: inserted.slots };
}

export function swapWithHotbar(player, areaSlots, areaIndex, hotbarIndex) {
  const p = player.map(cloneStack);
  const a = areaSlots === player ? p : areaSlots.map(cloneStack);
  const hotIndex = MAIN_SIZE + hotbarIndex;
  const temp = cloneStack(a[areaIndex]);
  a[areaIndex] = cloneStack(p[hotIndex]);
  p[hotIndex] = temp;
  return { player: p, area: a };
}

export function dropFromSlot(slots, index, whole = false) {
  const next = slots.map(cloneStack);
  const target = next[index];
  if (!target) return { slots: next, dropped: null };
  const count = whole ? target.count : 1;
  const dropped = { ...target, count };
  target.count -= count;
  if (!target.count) next[index] = null;
  return { slots: next, dropped };
}

export function collectMatching(groups, cursor) {
  const out = groups.map((slots) => slots.map(cloneStack));
  let held = cloneStack(cursor);
  if (!held) return { groups: out, cursor: null };
  for (const slots of out) {
    for (let i = 0; i < slots.length && held.count < maxStack(held); i += 1) {
      const target = slots[i];
      if (!sameItem(target, held)) continue;
      const move = Math.min(target.count, maxStack(held) - held.count);
      held.count += move;
      target.count -= move;
      if (!target.count) slots[i] = null;
    }
  }
  return { groups: out, cursor: held };
}

export function dragDistribute(slots, indices, cursor, mode = "even") {
  const next = slots.map(cloneStack);
  let held = cloneStack(cursor);
  if (!held || !indices.length) return { slots: next, cursor: held };
  const valid = [...new Set(indices)].filter((i) => !next[i] || sameItem(next[i], held));
  if (!valid.length) return { slots: next, cursor: held };
  if (mode === "one") {
    for (const i of valid) {
      if (!held?.count) break;
      const target = next[i];
      if (target && target.count >= maxStack(target)) continue;
      if (target) target.count += 1;
      else next[i] = { ...held, count: 1 };
      held.count -= 1;
    }
  } else {
    const each = Math.max(1, Math.floor(held.count / valid.length));
    for (const i of valid) {
      if (!held?.count) break;
      const target = next[i];
      const room = target ? maxStack(target) - target.count : maxStack(held);
      const move = Math.min(each, room, held.count);
      if (!move) continue;
      if (target) target.count += move;
      else next[i] = { ...held, count: move };
      held.count -= move;
    }
  }
  if (!held.count) held = null;
  return { slots: next, cursor: held };
}

export function closeCursor(player, cursor) {
  const order = [...Array.from({ length: MAIN_SIZE }, (_, i) => i), ...Array.from({ length: HOTBAR_SIZE }, (_, i) => MAIN_SIZE + i)];
  const inserted = insertStack(player, cursor, order);
  return { player: inserted.slots, dropped: inserted.remainder };
}
