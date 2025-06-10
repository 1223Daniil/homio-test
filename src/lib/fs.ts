import { mkdir } from "fs/promises";
import { join } from "path";

export async function ensureDir(path: string) {
  try {
    await mkdir(path, { recursive: true });
  } catch (error) {
    if ((error as any).code !== "EEXIST") {
      throw error;
    }
  }
}

export function getProjectMediaPath(projectId: string) {
  return join(process.cwd(), "public", "uploads", "projects", projectId);
}
