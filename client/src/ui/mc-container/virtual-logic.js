export function beginVirtualCursor(item,source){if(!item||item.locked)return null;return{item,source}}
export function resolveVirtualTransfer(cursor,target){if(!cursor)return{kind:"noop"};if(cursor.source===target)return{kind:"cancel",item:cursor.item};return{kind:"commit",item:cursor.item,source:cursor.source,target}}
export function modelSelectionForEquip(cursor){if(!cursor?.item?.selection)return null;return{...cursor.item.selection}}
