
import { generateSchema } from './scripts/generateSchema';
import { quicktypeGenerator } from './scripts/quicktypeGenerator';
import { QuicktypeConfig } from 'QuicktypeConfig';
import quicktypeConfigModule from '../config/quicktypeConfig.json';

async function main(targetLanguage: string): Promise<void> {
    try {
        // Directly use the imported JSON module
        const config: QuicktypeConfig = quicktypeConfigModule;

        const supportedLanguages = Object.keys(config.languages);

        if (targetLanguage === '*') {
            console.log('Generating SDKs for all supported languages...');
            for (const lang of supportedLanguages) {
                await generateSchema(lang);
                await quicktypeGenerator(lang).then(() => {
                    console.log(`SDK generation completed for ${lang}`);
                });
            }
        } else {
            if (supportedLanguages.includes(targetLanguage)) {
                await generateSchema(targetLanguage);
                await quicktypeGenerator(targetLanguage).then(() => {
                    console.log(`Generation completed!\nFiles are located in ./Generated_SDKs/${targetLanguage}`);
                });
            } else {
                console.error(`Target language '${targetLanguage}' is not supported.`);
                process.exit(1);
            }
        }
    } catch (error) {
        console.error('Error during generation:', error);
        process.exit(1);
    }
}

main("python"); // Example usage for Python
