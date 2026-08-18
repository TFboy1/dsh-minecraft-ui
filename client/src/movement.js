export function movementBasis(yaw) {
  const sin = Math.sin(yaw), cos = Math.cos(yaw);
  return { forward: { x: -sin, z: -cos }, right: { x: cos, z: -sin } };
}
export function movementVector(yaw, strafe, forwardInput) {
  const length = Math.hypot(strafe, forwardInput);
  if (!length) return { x: 0, z: 0 };
  const s = strafe / length, f = forwardInput / length;
  const basis = movementBasis(yaw);
  return { x: basis.right.x * s + basis.forward.x * f, z: basis.right.z * s + basis.forward.z * f };
}
