import {promises as fs} from "fs";

// Utility function to ensure the existence of a directory
export async function ensureDirectoryExists(directory: string): Promise<void> {
  try {
    await fs.access(directory);
  } catch {
    await fs.mkdir(directory, { recursive: true });
  }
}