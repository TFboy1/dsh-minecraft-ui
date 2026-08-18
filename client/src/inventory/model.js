import { ITEM_DEFS, cloneStack, defaultPlayerInventory, emptySlots, maxStack, sameItem } from "../inventory.js";

export const ARMOR_SLOTS = ["head", "chest", "legs", "feet"];
export const refKey = (ref) => `${ref.area}:${ref.slot ?? ref.index ?? ""}`;
export function createPlayerState() {
  const flat = defaultPlayerInventory();
  return {
    main: flat.slice(0, 27), hotbar: flat.slice(27, 36),
    armor: { head: null, chest: null, legs: null, feet: null },
    offhand: null, crafting: emptySlots(4)
  };
}
export function clonePlayer(player) {
  return { main: player.main.map(cloneStack), hotbar: player.hotbar.map(cloneStack), armor: Object.fromEntries(ARMOR_SLOTS.map(k=>[k,cloneStack(player.armor?.[k])])), offhand: cloneStack(player.offhand), crafting: (player.crafting||emptySlots(4)).map(cloneStack) };
}
export function migratePlayer(save) {
  if (save?.main?.length===27 && save?.hotbar?.length===9) return clonePlayer(save);
  const flat = Array.isArray(save) && save.length===36 ? save : defaultPlayerInventory();
  return { ...createPlayerState(), main: flat.slice(0,27).map(cloneStack), hotbar: flat.slice(27,36).map(cloneStack) };
}
export function flattenPlayer(player) { return [...player.main.map(cloneStack), ...player.hotbar.map(cloneStack)]; }
export function applyFlatPlayer(player, flat) { const next=clonePlayer(player);next.main=flat.slice(0,27).map(cloneStack);next.hotbar=flat.slice(27,36).map(cloneStack);return next; }
export function getSlot(state, ref) {
  if(ref.area==="main"||ref.area==="hotbar"||ref.area==="craft"||ref.area==="chest") return state[ref.area]?.[ref.index] ?? null;
  if(ref.area==="armor") return state.player?.armor?.[ref.slot] ?? state.armor?.[ref.slot] ?? null;
  if(ref.area==="offhand") return state.player?.offhand ?? state.offhand ?? null;
  return null;
}
export function canPlace(ref, value) {
  if(!value)return true;
  if(ref.area==="armor")return ITEM_DEFS[value.id]?.armorSlot===ref.slot;
  if(ref.area==="output")return false;
  return true;
}
export function slotLimit(ref,value){return ref.area==="armor"||ref.area==="offhand"?1:maxStack(value);}
export function validStack(value){return value==null||(ITEM_DEFS[value.id]&&Number.isInteger(value.count)&&value.count>0&&value.count<=maxStack(value));}
export function validatePlayer(player){if(player.main.length!==27||player.hotbar.length!==9||player.crafting.length!==4)throw new Error("invalid player inventory shape");for(const s of [...player.main,...player.hotbar,...player.crafting,...ARMOR_SLOTS.map(k=>player.armor[k]),player.offhand])if(!validStack(s))throw new Error("invalid stack");for(const k of ARMOR_SLOTS)if(player.armor[k]&&!canPlace({area:"armor",slot:k},player.armor[k]))throw new Error("invalid armor slot");return true;}
export function stackIdentity(value){if(!value)return "";return `${value.id}|${value.tagKey||""}|${value.enchantments||""}|${value.customName||""}|${value.durability??""}`;}
export function canStack(a,b){return !!a&&!!b&&sameItem(a,b)&&stackIdentity(a)===stackIdentity(b);}
