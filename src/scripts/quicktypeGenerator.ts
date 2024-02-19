import { quicktype, InputData, JSONSchemaInput, FetchingJSONSchemaStore, RendererOptions } from "quicktype-core";
import fs from "fs";
import path from "path";
import { ensureDirectoryExists } from "../utils/checkDirectory";
import {Processing, QuicktypeConfig} from "QuicktypeConfig";

// Directly import the configuration as a module
import quicktypeConfigModule from "../../config/quicktypeConfig.json";
const config: QuicktypeConfig = quicktypeConfigModule;

const postProcessedSchema = path.resolve("./schema/postProcess.json");
const finalSchema = path.resolve("./schema/final.schema.json");

interface QuicktypeOptions {
    targetLanguage: string;
    typeName: string;
    jsonSchemaString: string;
    rendererOptions: RendererOptions;
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


async function handleCustomMappings(generatedCode: string[], customMappings: Processing["customMappings"], targetLanguage: string): Promise<string[]> {
    // Custom mappings and type declarations insertion
    if (customMappings && customMappings.endOfImportsIdentifier) {
        const endOfImportsRegex = new RegExp(customMappings.endOfImportsIdentifier);
        let endOfImportsIndex = -1;
        // Find the index of the last import statement
        for (let i = 0; i < generatedCode.length; i++) {
            if (endOfImportsRegex.test(generatedCode[i])) {
                endOfImportsIndex = i;
                break; // Once found, no need to continue the loop
            }
        }

        if (endOfImportsIndex >= 0 && customMappings.typeDeclarations && customMappings.typeDeclarations.length > 0) {
            const typeDeclarationsCode = '\n\n' + customMappings.typeDeclarations
                .map(td => td.declaration)
                .join('\n\n') + '\n'; // Ensure newline separation between declarations

            generatedCode.splice(endOfImportsIndex + 1, 0, typeDeclarationsCode);
        }

        if (customMappings.mappings && customMappings.mappings.length > 0) {
            customMappings.mappings.forEach(mapping => {
                const { toType, fromType } = mapping;

                if (!toType || !fromType) {
                    throw new Error(`'patternMatching', 'toType' or 'fromType' not set for language '${targetLanguage}' in quicktypeConfig.`);
                }

                // Use the regex specified in the mapping to replace the fromType with the toType
                const regexPattern = fromType.pattern
                const regexFlags = fromType.flags;

                if (!regexPattern || !regexFlags) {
                    throw new Error(`'pattern' or 'flags' is not set for 'patternMatching' in language '${targetLanguage}' in quicktypeConfig.`);
                }

                const fromTypeRegex = new RegExp(regexPattern, regexFlags);

                generatedCode = generatedCode.map(line => line.replace(fromTypeRegex, toType));
            });
        }
    }

    // Return the modified generatedCode
    return generatedCode;
}


async function handleInstructionUnion(generatedCode: string[], instructionUnion: any, schema: any, targetLanguage: string) {
    if (instructionUnion?.addInstructionUnion && schema.definitions?.Instruction?.anyOf) {
        const { typeSeparator, rawInstructionType } = instructionUnion;

        if (!typeSeparator || !rawInstructionType) {
            throw new Error(`'typeSeparator' or 'rawInstructionType' not set for language '${targetLanguage}' in quicktypeConfig.`);
        }

        const refs = schema.definitions.Instruction.anyOf
            .map((item: any) => item.$ref?.match(/#\/definitions\/(.+)/)?.[1])
            .filter(Boolean);

        if (refs.length) {
            const unionTypes = refs.join(typeSeparator);
            const finalInstructionUnionType = rawInstructionType.replace('$1', unionTypes);
            generatedCode.push(finalInstructionUnionType);
        }
    }
}

async function quicktypeGenerator(targetLanguage: string): Promise<void> {
    const jsonSchemaString = fs.readFileSync(postProcessedSchema, "utf8");
    const schema = JSON.parse(jsonSchemaString);
    const languageConfig = config.languages[targetLanguage];

    if (!languageConfig?.processing) {
        throw new Error(`'processing' configuration not set for language '${targetLanguage}' in quicktypeConfig.`);
    }

    const { outputDir: outputFilePath, propertyRegex, customMappings, instructionUnion } = languageConfig.processing;

    if (!outputFilePath) {
        throw new Error(`'outputDir' not set for language '${targetLanguage}' in quicktypeConfig.`);
    }

    if (!propertyRegex) {
        throw new Error(`'propertyRegex' not set for language '${targetLanguage}' in quicktypeConfig.`);
    }

    if (!languageConfig.rendererOptions) {
        throw new Error(`'rendererOptions' not set for language '${targetLanguage}' in quicktypeConfig.`);
    }

    const outputDir = path.dirname(outputFilePath);
    await ensureDirectoryExists(outputDir);

    let { lines: generatedCode } = await quicktypeJSONSchema({
        targetLanguage: targetLanguage,
        typeName: "Instruction",
        jsonSchemaString: JSON.stringify(schema),
        rendererOptions: languageConfig.rendererOptions,
    });

    // Property renaming
    generatedCode.forEach((line, index) => {
        if (line.includes('quicktype_')) {
            const regex = new RegExp(propertyRegex.pattern, propertyRegex.flags);
            generatedCode[index] = line.replace(regex, propertyRegex.replacement);
        }
    });

    // Custom Mappings and Type Declarations
    let processedCode = await handleCustomMappings(generatedCode, customMappings, targetLanguage);

    // InstructionUnion appending if configured
    await handleInstructionUnion(processedCode, instructionUnion, schema, targetLanguage);


    fs.writeFileSync(outputFilePath, processedCode.join('\n'));
    console.log(`Code generation for ${targetLanguage} completed.`);

    const modifiedSchema = renamePropertiesInSchema(schema);
    fs.writeFileSync(finalSchema, JSON.stringify(modifiedSchema, null, 2));
}

export { quicktypeGenerator };
