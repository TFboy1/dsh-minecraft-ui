import { cloneStack } from "../inventory.js";
import { RECIPES } from "./recipes.js";
const ids=(grid)=>grid.map(s=>s?.id||null);
export function matchRecipe(grid){const got=ids(grid);for(const recipe of RECIPES){if(recipe.shapeless){const a=got.filter(Boolean).sort(),b=[...recipe.ingredients].sort();if(a.length===b.length&&a.every((x,i)=>x===b[i]))return recipe;}else if(recipe.patterns.some(p=>p.every((x,i)=>x===got[i])))return recipe;}return null;}
export function craftingOutput(grid){const recipe=matchRecipe(grid);return recipe?{...recipe.result}:null;}
export function consumeRecipe(grid,recipe){if(!recipe)return grid;const next=grid.map(cloneStack);for(let i=0;i<next.length;i++)if(next[i]){next[i].count--;if(!next[i].count)next[i]=null;}return next;}
export function recipeCraftable(recipe,groups){const counts={};for(const slots of groups)for(const s of slots)if(s)counts[s.id]=(counts[s.id]||0)+s.count;const needs={};for(const id of recipe.shapeless?recipe.ingredients:recipe.patterns[0].filter(Boolean))needs[id]=(needs[id]||0)+1;return Object.entries(needs).every(([id,n])=>(counts[id]||0)>=n);}
export function fillRecipe(player,recipe){const next={...player,main:player.main.map(cloneStack),hotbar:player.hotbar.map(cloneStack),crafting:player.crafting.map(cloneStack)};const pattern=recipe.shapeless?recipe.ingredients:recipe.patterns[0];for(let i=0;i<4;i++){const id=pattern[i]||null;if(!id)continue;for(const group of [next.main,next.hotbar]){const j=group.findIndex(s=>s?.id===id);if(j>=0){next.crafting[i]={...group[j],count:1};group[j].count--;if(!group[j].count)group[j]=null;break;}}}return next;}
export { RECIPES };
