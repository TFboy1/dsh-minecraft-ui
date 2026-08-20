import { cloneStack,maxStack } from "../inventory.js";
import { RECIPES } from "./recipes.js";
const ids=grid=>grid.map(s=>s?.id||null);
export function recipePattern(recipe){return recipe.shapeless?recipe.ingredients:recipe.patterns[0]}
export function matchRecipe(grid){const got=ids(grid),size=Math.sqrt(grid.length);for(const recipe of RECIPES){if(recipe.size!==size)continue;if(recipe.shapeless){const a=got.filter(Boolean).sort(),b=[...recipe.ingredients].sort();if(a.length===b.length&&a.every((x,i)=>x===b[i]))return recipe;}else if(recipe.patterns.some(p=>p.every((x,i)=>x===got[i])))return recipe;}return null;}
export function craftingOutput(grid){const recipe=matchRecipe(grid);return recipe?{...recipe.result}:null;}
export function consumeRecipe(grid,recipe){if(!recipe)return grid;const next=grid.map(cloneStack);for(let i=0;i<next.length;i++)if(next[i]){next[i].count--;if(!next[i].count)next[i]=null;}return next;}
export function recipeNeeds(recipe){const needs={};for(const id of recipePattern(recipe).filter(Boolean))needs[id]=(needs[id]||0)+1;return needs}
export function recipeCraftable(recipe,groups){const counts={};for(const slots of groups)for(const s of slots)if(s)counts[s.id]=(counts[s.id]||0)+s.count;return Object.entries(recipeNeeds(recipe)).every(([id,n])=>(counts[id]||0)>=n);}
export function fillRecipe(player,recipe){const next={...player,main:player.main.map(cloneStack),hotbar:player.hotbar.map(cloneStack),crafting:player.crafting.map(cloneStack)},pattern=recipePattern(recipe);for(let i=0;i<next.crafting.length;i++){const id=pattern[i]||null;if(!id)continue;for(const group of[next.main,next.hotbar]){const j=group.findIndex(s=>s?.id===id);if(j>=0){next.crafting[i]={...group[j],count:1};group[j].count--;if(!group[j].count)group[j]=null;break;}}}return next;}
export function craftRecipeFromPlayer(player,recipe){if(!recipeCraftable(recipe,[player.main,player.hotbar]))return{ok:false,player};const next={...player,main:player.main.map(cloneStack),hotbar:player.hotbar.map(cloneStack)},needs=recipeNeeds(recipe);for(const[id,count]of Object.entries(needs)){let left=count;for(const group of[next.main,next.hotbar])for(let i=0;i<group.length&&left;i++)if(group[i]?.id===id){const take=Math.min(left,group[i].count);group[i].count-=take;left-=take;if(!group[i].count)group[i]=null;}}
  let result={...recipe.result};for(const group of[next.main,next.hotbar]){for(let i=0;i<group.length&&result.count;i++){const s=group[i];if(s?.id===result.id&&s.count<maxStack(s)){const move=Math.min(result.count,maxStack(s)-s.count);s.count+=move;result.count-=move;}}for(let i=0;i<group.length&&result.count;i++)if(!group[i]){group[i]={...result,count:result.count};result.count=0;}}
  return result.count?{ok:false,player}:{ok:true,player:next,result:recipe.result};
}
export { RECIPES };
