import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const subtreePath: string = path.resolve('./types/SignalWireML_TS'); // Adjust the path as necessary
const subtreeUrl: string = 'https://github.com/andremartinssw/SignalWireML.git';
const subtreeBranch: string = 'main'; // Replace with the actual branch name if different

const setupSubtree = async (): Promise<void> => {
  try {
    await checkSubtreePath();
    await checkAndAddRemote();
    await addOrUpdateSubtree();
  } catch (error) {
    handleError(error);
  }
};

const checkSubtreePath = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(subtreePath)) {
      console.log(`Setting up subtree at ${subtreePath}...`);
      resolve();
    } else {
      console.log('Subtree already set up. Fetching latest updates...');
      resolve();
    }
  });
};

const checkAndAddRemote = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const remotes = execSync('git remote').toString();
    if (!remotes.includes('original-subtree-remote')) {
      execSync(`git remote add -f original-subtree-remote ${subtreeUrl}`, { stdio: 'inherit' });
    }
    resolve();
  });
};

const addOrUpdateSubtree = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      if (!fs.existsSync(subtreePath)) {
        execSync(`git subtree add --prefix=${subtreePath} original-subtree-remote ${subtreeBranch} --squash`, { stdio: 'inherit' });
        console.log('Subtree set up successfully.');
      } else {
        try {
          execSync(`git subtree pull --prefix=${subtreePath} original-subtree-remote ${subtreeBranch} --squash`, { stdio: 'inherit' });
          console.log('Latest updates fetched successfully.');
        } catch (pullError) {
          console.error(pullError)
          console.error('Error during subtree pull. If the subtree was never added, try adding it first.');
          reject(pullError);
        }
      }
      resolve();
    } catch (error) {
      console.error('Error setting up or updating the subtree:', error);
      reject(error);
    }
  });
};


const handleError = (error: any): void => {
  if (error instanceof Error) {
    if (error.message.includes('already exists')) {
      console.log('Subtree already set up.');
    } else {
      console.error('Error setting up subtree:', error);
    }
  } else {
    console.error('Caught an unexpected error type:', error);
  }
};

// Run the setup process
setupSubtree()
