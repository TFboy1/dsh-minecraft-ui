import test from"node:test";import assert from"node:assert/strict";import{beginVirtualCursor,modelSelectionForEquip,resolveVirtualTransfer}from"../client/src/ui/mc-container/virtual-logic.js";
test("picking a virtual item does not commit a capability change",()=>{const c=beginVirtualCursor({id:"grep"},"chest");assert.deepEqual(c,{item:{id:"grep"},source:"chest"});assert.equal(resolveVirtualTransfer(c,"chest").kind,"cancel")});
test("plugin commits only when dropped across container zones",()=>{const c=beginVirtualCursor({id:"grep"},"chest"),r=resolveVirtualTransfer(c,"agent");assert.equal(r.kind,"commit");assert.equal(r.target,"agent")});
test("locked capability cannot enter cursor",()=>assert.equal(beginVirtualCursor({id:"internal",locked:true},"chest"),null));
test("model selection is produced only for equipment drop",()=>{assert.equal(modelSelectionForEquip(null),null);assert.deepEqual(modelSelectionForEquip({item:{selection:{provider:"p",model:"m"}}}),{provider:"p",model:"m"})});
