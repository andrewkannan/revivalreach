import { prisma } from "@/lib/prisma";

export async function hasAccess(role: string, modulePath: string): Promise<boolean> {
  if (role === "ADMIN") return true;

  try {
    const settings = await prisma.systemSettings.findUnique({
      where: { id: "singleton" }
    });

    if (!settings || !settings.rolePermissions) {
      return false; // Safe default
    }

    const permissions = typeof settings.rolePermissions === 'string' 
      ? JSON.parse(settings.rolePermissions) 
      : settings.rolePermissions as Record<string, string[]>;

    const allowedPaths = permissions[role] || [];
    
    return allowedPaths.includes(modulePath);
  } catch (error) {
    console.error("Failed to check permissions:", error);
    return false;
  }
}
