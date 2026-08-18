export const RECIPES = [
  { id:"planks", name:"橡木木板", shapeless:true, ingredients:["log"], result:{id:"planks",count:4} },
  { id:"sticks", name:"木棍", patterns:[["planks",null,"planks",null],[null,"planks",null,"planks"]], result:{id:"stick",count:4} },
  { id:"crafting_table", name:"工作台", patterns:[["planks","planks","planks","planks"]], result:{id:"crafting_table",count:1} },
  { id:"torches", name:"火把", patterns:[["coal",null,"stick",null],[null,"coal",null,"stick"]], result:{id:"torch",count:4} }
];
