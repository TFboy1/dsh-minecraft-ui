import test from"node:test";import assert from"node:assert/strict";import{movementBasis,movementVector}from"../client/src/movement.js";const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
test("W follows camera forward at cardinal yaws",()=>{for(const yaw of[0,Math.PI/2,-Math.PI/2,Math.PI]){const b=movementBasis(yaw),v=movementVector(yaw,0,1);near(v.x,b.forward.x);near(v.z,b.forward.z);near(v.x*v.x+v.z*v.z,1);}});
test("strafe is perpendicular and D points right",()=>{for(const yaw of[0,.7,-1.8]){const b=movementBasis(yaw),v=movementVector(yaw,1,0);near(v.x,b.right.x);near(v.z,b.right.z);near(v.x*b.forward.x+v.z*b.forward.z,0);}});
test("diagonal input is normalized",()=>{const v=movementVector(.42,1,1);near(Math.hypot(v.x,v.z),1);});
test("known directions match Three camera convention",()=>{let v=movementVector(0,0,1);near(v.x,0);near(v.z,-1);v=movementVector(Math.PI/2,0,1);near(v.x,-1);near(v.z,0);v=movementVector(-Math.PI/2,0,1);near(v.x,1);near(v.z,0);});
