export const DROP_PICKUP_DELAY=.45;
export const DROP_PICKUP_RANGE=1.4;
export function canPickupDrop(dropPosition,playerPosition,age,range=DROP_PICKUP_RANGE){return age>=DROP_PICKUP_DELAY&&Math.hypot(dropPosition.x-playerPosition.x,dropPosition.y-playerPosition.y,dropPosition.z-playerPosition.z)<range}
export function dropLaunchVelocity(randomA=Math.random(),randomB=Math.random()){const angle=randomA*Math.PI*2,speed=.35+randomB*.25;return{x:Math.cos(angle)*speed,y:1.8,z:Math.sin(angle)*speed}}
