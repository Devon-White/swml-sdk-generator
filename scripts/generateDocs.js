const path = require('path');
const generatedSdkDir = '../Generated_SDKs';

async function generateDocs(schema, targetLanguage) {
    const sdkDir = path.resolve(__dirname, `${generatedSdkDir}/${targetLanguage}/docs`);

    console.log(sdkDir)

    try {
        const { jsonschema2md } = await import('@adobe/jsonschema2md');
        jsonschema2md(schema, {
            includeReadme: true,
            schemaOutput: './schema.md',
            outDir: sdkDir,
            header: false,
        });
    } catch (error) {
        console.error('Error generating documentation:', error);
    }
}

module.exports = generateDocs;