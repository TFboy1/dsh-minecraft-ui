export const RECIPES = [
  { id:"planks", name:"橡木木板", size:2, shapeless:true, ingredients:["log"], result:{id:"planks",count:4} },
  { id:"sticks", name:"木棍", size:2, patterns:[["planks",null,"planks",null],[null,"planks",null,"planks"]], result:{id:"stick",count:4} },
  { id:"crafting_table", name:"工作台", size:2, patterns:[["planks","planks","planks","planks"]], result:{id:"crafting_table",count:1} },
  { id:"torches", name:"火把", size:2, patterns:[["coal",null,"stick",null],[null,"coal",null,"stick"]], result:{id:"torch",count:4} },
  { id:"wood_pickaxe", name:"木镐", size:3, patterns:[["planks","planks","planks",null,"stick",null,null,"stick",null]], result:{id:"wood_pickaxe",count:1,durability:59} },
  { id:"stone_pickaxe", name:"石镐", size:3, patterns:[["stone","stone","stone",null,"stick",null,null,"stick",null]], result:{id:"stone_pickaxe",count:1,durability:131} },
  { id:"chest", name:"箱子", size:3, patterns:[["planks","planks","planks","planks",null,"planks","planks","planks","planks"]], result:{id:"chest",count:1} },
  { id:"signs", name:"橡木告示牌", size:3, patterns:[["planks","planks","planks","planks","planks","planks",null,"stick",null]], result:{id:"sign_item",count:3} },
  { id:"workspace_map", name:"Workspace 地图", size:3, shapeless:true, ingredients:["paper","paper","paper","compass"], result:{id:"workspace_map",count:1} }
];
