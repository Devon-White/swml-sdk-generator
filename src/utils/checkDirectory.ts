import fs from "fs";

// Utility function to ensure the existence of a directory
export async function ensureDirectoryExists(directory: string): Promise<void> {
  if (!fs.existsSync(directory)) { // Check if the directory does not exist
    fs.mkdirSync(directory, {recursive: true}); // Create the directory recursively if it does not exist
  }
}
