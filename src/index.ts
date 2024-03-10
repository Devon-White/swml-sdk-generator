import { generateSchema } from './scripts/generateSchema.js';
import { quicktypeGenerator } from './scripts/quicktypeGenerator.js';
import fs from 'fs';
import path from "path";

const configPath = path.resolve('./config/quicktypeConfig.json');

function main(targetLanguage: string): void {
    try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const supportedLanguages = Object.keys(config.languages);

        if (targetLanguage === '*') {
            console.log('Generating SDKs for all supported languages...');
            supportedLanguages.forEach(lang => {
                generateSchema(lang);
                quicktypeGenerator(lang).then(() => {
                    console.log(`SDK generation completed for ${lang}`);
                });
            });
        } else {
            if (supportedLanguages.includes(targetLanguage)) {
                generateSchema(targetLanguage);
                quicktypeGenerator(targetLanguage).then(() => {
                    console.log(`Generation completed!\nFiles are located in ./Generated_SDKs/${targetLanguage}`);
                });
            } else {
                console.log(`Target language '${targetLanguage}' is not supported.`);
            }
        }
    } catch (error) {
        console.error('Error during generation:', error);
        process.exit(1);
    }
}

main("python"); // Example usage for Python
