import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const subtreePath: string = path.resolve(`./types/SignalWireML_TS`); // Adjust the path as necessary
const subtreeUrl: string = 'https://github.com/andremartinssw/SignalWireML.git';
const subtreeBranch: string = 'main'; // Replace with the actual branch name if different

try {
    // Check if the subtree path already exists
    if (!fs.existsSync(subtreePath)) {
        console.log(`Setting up subtree at ${subtreePath}...`);

        // Check if the remote already exists
        const remotes = execSync('git remote').toString();
        if (!remotes.includes('original-subtree-remote')) {
            execSync(`git remote add -f original-subtree-remote ${subtreeUrl}`, { stdio: 'inherit' });
        }

        execSync(`git subtree add --prefix=${subtreePath} original-subtree-remote ${subtreeBranch} --squash`, { stdio: 'inherit' });
        console.log('Subtree set up successfully.');
    } else {
        console.log('Subtree already set up.');
    }
} catch (error) {
    console.error('Error setting up subtree:', error);
}
