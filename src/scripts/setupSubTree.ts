import { execSync } from 'child_process';
import * as fs from 'fs';
import path from "path";



const subtreePath: string = path.resolve('./types/SignalWireMLTypes');
const subtreeUrl: string = 'https://github.com/andremartinssw/SignalWireML.git';
const subtreeBranch: string = 'main';

if (!fs.existsSync(subtreePath)) {
    console.log(`Setting up subtree at ${subtreePath}...`);
    execSync(`git remote add -f original-subtree-remote ${subtreeUrl}`, { stdio: 'inherit' });
    execSync(`git subtree add --prefix=${subtreePath} original-subtree-remote ${subtreeBranch} --squash`, { stdio: 'inherit' });
    console.log('Subtree set up successfully.');
} else {
    console.log('Subtree already set up.');
}
