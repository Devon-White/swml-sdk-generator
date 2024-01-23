import { quicktype, InputData, JSONSchemaInput, FetchingJSONSchemaStore, RendererOptions, JSONSchema } from "quicktype-core";
import fs from "fs";
import path from "path";

const configPath = path.resolve("./config/quicktypeConfig.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const postProcessedSchema = path.resolve("./schema/postProcess.json");
const finalSchema = "./schema/final.schema.json";


export interface QuicktypeOptions {
    targetLanguage: string;
    typeName: string;
    jsonSchemaString: string;
    rendererOptions: RendererOptions;
}

async function quicktypeJSONSchema(options: QuicktypeOptions) {
    const { targetLanguage,
        typeName,
        jsonSchemaString,
        rendererOptions
    } = options;

    const schemaInput = new JSONSchemaInput(new FetchingJSONSchemaStore());
    await schemaInput.addSource({ name: typeName, schema: jsonSchemaString });

    const inputData = new InputData();
    inputData.addInput(schemaInput);

    return await quicktype({
        inputData,
        lang: targetLanguage,
        rendererOptions
    });
}

function renamePropertiesInSchema(schema: JSONSchema): JSONSchema {
    const renameProperty = (obj: any, parentObj: any = null) => {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const renamedKey = key.startsWith('quicktype_') ? key.replace('quicktype_', '') + '_' : key;

                if (key !== renamedKey) {
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

    renameProperty(schema, null);
    return schema;
}

async function quicktypeGenerator(targetLanguage: string): Promise<void> {
    if (!fs.existsSync(configPath)) {
        console.error(`Configuration file not found: ${configPath}`);
        return;
    }

    if (!fs.existsSync(postProcessedSchema)) {
        console.error(`Schema file not found: ${postProcessedSchema}`);
        return;
    }

    let jsonSchemaString = fs.readFileSync(postProcessedSchema, "utf8");
    let schema = JSON.parse(jsonSchemaString);

    const languageConfig = config.languages[targetLanguage];
    if (!languageConfig.rendererOptions) {
        console.error(`No renderer options found for language: ${targetLanguage}`);
        return;
    }

    const { lines: generatedCode } = await quicktypeJSONSchema({
        targetLanguage,
        typeName: "Instruction",
        jsonSchemaString: JSON.stringify(schema),
        rendererOptions: languageConfig.rendererOptions
    });

    const outputDir = config.languages[targetLanguage].processing.outputDir;

    generatedCode.forEach((line, index) => {
        if (line.includes('quicktype_')) {
            const propertyRegex = config.languages[targetLanguage].processing.propertyRegex;
            const regex = new RegExp(propertyRegex.pattern, propertyRegex.flags);
            generatedCode[index] = line.replace(regex, propertyRegex.replacement);
        }
    });

    fs.mkdirSync(path.dirname(outputDir), { recursive: true });

    fs.writeFileSync(path.resolve(outputDir), generatedCode.join('\n'));
    console.log(`Code generation for ${targetLanguage} completed.`);

    schema = renamePropertiesInSchema(schema);

    fs.writeFileSync(path.resolve(finalSchema), JSON.stringify(schema, null, 2));

}

export { quicktypeGenerator };