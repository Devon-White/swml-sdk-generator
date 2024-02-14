// quicktypeGenerator.ts

import { quicktype, InputData, JSONSchemaInput, FetchingJSONSchemaStore } from "quicktype-core";
import fs from "fs";
import path from "path";
import { ensureDirectoryExists } from "../utils/checkDirectory"; // Ensure this path matches the location of your utility
import { QuicktypeConfig, RendererOptions } from "QuicktypeConfig"; // Ensure this path matches the location of your type definitions

// Directly import the configuration as a module
import quicktypeConfigModule from "../../config/quicktypeConfig.json";
const config: QuicktypeConfig = quicktypeConfigModule;

const postProcessedSchema = path.resolve("./schema/postProcess.json");
const finalSchema = path.resolve("./schema/final.schema.json");

interface QuicktypeOptions {
    targetLanguage: string;
    typeName: string;
    jsonSchemaString: string;
    rendererOptions: RendererOptions
}

async function quicktypeJSONSchema(options: QuicktypeOptions) {
    const { targetLanguage, typeName, jsonSchemaString, rendererOptions } = options;

    const schemaInput = new JSONSchemaInput(new FetchingJSONSchemaStore());
    await schemaInput.addSource({ name: typeName, schema: jsonSchemaString });

    const inputData = new InputData();
    inputData.addInput(schemaInput);

    return quicktype({
        inputData,
        lang: targetLanguage,
        rendererOptions,
    });
}

function renamePropertiesInSchema(schema: any): any {
    const renameProperty = (obj: any, parentObj: any = null) => {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const renamedKey = key.startsWith('quicktype_') ? key.substring('quicktype_'.length) : key;
                if (renamedKey !== key) {
                    obj[renamedKey] = obj[key];
                    delete obj[key];
                    if (parentObj && Array.isArray(parentObj.required)) {
                        const requiredIndex = parentObj.required.indexOf(key);
                        if (requiredIndex !== -1) {
                            parentObj.required[requiredIndex] = renamedKey;
                        }
                    }
                }
                if (typeof obj[renamedKey] === 'object') {
                    renameProperty(obj[renamedKey], obj);
                }
            }
        }
    };

    renameProperty(schema);
    return schema;
}

async function quicktypeGenerator(targetLanguage: string): Promise<void> {
    const jsonSchemaString = fs.readFileSync(postProcessedSchema, "utf8");
    const schema = JSON.parse(jsonSchemaString);
    const languageConfig = config.languages[targetLanguage];


    // Ensure 'processing' is defined
    if (!languageConfig?.processing) {
        throw new Error(`'processing' configuration not set for language '${targetLanguage}' in quicktypeConfig.`);
    }

    // Ensure 'outputDir' and 'propertyRegex' are defined within 'processing'
    const { outputDir: outputFilePath, propertyRegex } = languageConfig.processing;

    if (!outputFilePath) {
        throw new Error(`'outputDir' not set for language '${targetLanguage}' in quicktypeConfig.`);
    }

    if (!propertyRegex) {
        throw new Error(`'propertyRegex' not set for language '${targetLanguage}' in quicktypeConfig.`);
    }

    // Ensure 'rendererOptions' is defined
    if (!languageConfig.rendererOptions) {
        throw new Error(`'rendererOptions' not set for language '${targetLanguage}' in quicktypeConfig.`);
    }

    // Ensure the output directory exists (extract directory part from 'outputFilePath')
    const outputDir = path.dirname(outputFilePath);
    await ensureDirectoryExists(outputDir);

    const { lines: generatedCode } = await quicktypeJSONSchema({
        targetLanguage: targetLanguage,
        typeName: "Instruction",
        jsonSchemaString: JSON.stringify(schema),
        rendererOptions: languageConfig.rendererOptions
    });

    generatedCode.forEach((line, index) => {
        if (line.includes('quicktype_')) {
            const regex = new RegExp(propertyRegex.pattern, propertyRegex.flags);
            generatedCode[index] = line.replace(regex, propertyRegex.replacement);
        }
    });


    fs.writeFileSync(outputFilePath, generatedCode.join('\n'));
    console.log(`Code generation for ${targetLanguage} completed.`);

    const modifiedSchema = renamePropertiesInSchema(schema);
    fs.writeFileSync(finalSchema, JSON.stringify(modifiedSchema, null, 2));
}

export { quicktypeGenerator };