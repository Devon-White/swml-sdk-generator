const { quicktype, InputData, JSONSchemaInput, FetchingJSONSchemaStore } = require("quicktype-core");
const generateDocs   = require("./generateDocs");
const fs = require("fs");
const path = require("path");

const configPath = "./config/quicktypeConfig.json";
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const finalSchema = path.resolve("./schema/final-schema.json");

async function quicktypeJSONSchema(targetLanguage, typeName, jsonSchemaString, rendererOptions) {
    const schemaInput = new JSONSchemaInput(new FetchingJSONSchemaStore());
    await schemaInput.addSource({ name: typeName, schema: jsonSchemaString });

    const inputData = new InputData();
    inputData.addInput(schemaInput);

    return await quicktype({
        inputData,
        lang: targetLanguage,
        rendererOptions: rendererOptions
    });
}

function renamePropertiesInSchema(schema) {
    const renameProperty = (obj, parentObj = null, parentKey = null) => {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const renamedKey = key.startsWith('quicktype_') ? key.replace('quicktype_', '') + '_' : key;

                if (key !== renamedKey) {
                    obj[renamedKey] = obj[key];
                    delete obj[key];

                    // Update the parent's required array if this key was renamed
                    if (parentObj && Array.isArray(parentObj.required)) {
                        const requiredIndex = parentObj.required.indexOf(key);
                        if (requiredIndex !== -1) {
                            parentObj.required[requiredIndex] = renamedKey;
                        }
                    }
                }

                if (typeof obj[renamedKey] === 'object') {
                    renameProperty(obj[renamedKey], obj, renamedKey);
                }
            }
        }
    };

    renameProperty(schema);
    return schema;
}


async function quicktypeGenerator(targetLanguage) {
    if (!fs.existsSync(configPath)) {
        console.error(`Configuration file not found: ${configPath}`);
        return;
    }

    if (!fs.existsSync(finalSchema)) {
        console.error(`Schema file not found: ${finalSchema}`);
        return;
    }

    let jsonSchemaString = fs.readFileSync(finalSchema, "utf8");
    let schema = JSON.parse(jsonSchemaString);



    const languageConfig = config.languages[targetLanguage];
    if (!languageConfig.rendererOptions) {
        console.error(`No renderer options found for language: ${targetLanguage}`);
        return;
    }

    const { lines: generatedCode } = await quicktypeJSONSchema(
        targetLanguage,
        "Instruction",
        JSON.stringify(schema),
        languageConfig.rendererOptions
    );

    const outputDir = config.languages[targetLanguage].processing.outputDir;

    //  parse the generated code and remove properties with quicktype_ prefix and add _ to the end of the property name

    generatedCode.forEach((line, index) => {
    if (line.includes('quicktype_')) {
        generatedCode[index] = line.replace(/quicktype_(\w+)/g, '$1_');
    }
});


    fs.writeFileSync(path.resolve(outputDir), generatedCode.join('\n'));
    console.log(`Code generation for ${targetLanguage} completed.`);

    schema = renamePropertiesInSchema(schema);

    await generateDocs(schema, targetLanguage);

}

module.exports = { quicktypeGenerator };
