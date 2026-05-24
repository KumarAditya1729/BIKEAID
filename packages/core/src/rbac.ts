import type { Role } from "./types";

export const permissions = [
  "request:create",
  "request:read:own",
  "request:read:assigned",
  "request:read:garage",
  "request:read:any",
  "request:update:assigned",
  "mechanic:manage:garage",
  "mechanic:verify",
  "payment:mark_collected",
  "payment:verify",
  "analytics:read:garage",
  "analytics:read:any",
  "audit:read",
  "dispute:manage"
] as const;

export type Permission = (typeof permissions)[number];

const rolePermissions: Record<Role, Permission[]> = {
  customer: ["request:create", "request:read:own"],
  mechanic: ["request:read:assigned", "request:update:assigned", "payment:mark_collected"],
  garage_owner: ["request:read:garage", "mechanic:manage:garage", "analytics:read:garage"],
  admin: ["request:read:any", "payment:verify", "mechanic:verify", "analytics:read:any", "dispute:manage", "audit:read"],
  super_admin: [...permissions]
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role].includes(permission);
}

export function assertPermission(role: Role, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Role ${role} is not allowed to perform ${permission}`);
  }
}
