const createGenerator = require('ts-json-schema-generator');
const fs = require('fs');
const quicktypeConfig = JSON.parse(fs.readFileSync('./config/quicktypeConfig.json', 'utf8'));
const schemaFileName = './TypeScript_SDK/SignalWireMLTypes.ts';
const tsConfig = './TypeScript_SDK/tsconfig.json';
const schemaOutputFile = './schema/generated-schema.json';
const finalOutputFile = './schema/final-schema.json';
const path = require('path');

const config = {
    path: path.resolve(schemaFileName), // Path to your TypeScript file
    tsconfig: path.resolve(tsConfig),       // Path to your tsconfig.json
    type: '*',                    // Name of the TypeScript type
};

console.log(config)


function adjustReservedWords(obj, reservedWords) {
  if (Array.isArray(obj)) {
    return obj.map(item => adjustReservedWords(item, reservedWords));
  }
  if (obj && typeof obj === 'object') {
    for (let prop in obj.properties) {
      if (reservedWords.includes(prop)) {
        obj.properties[`quicktype_${prop}`] = obj.properties[prop];
        delete obj.properties[prop];
        if (obj.required && obj.required.includes(prop)) {
          obj.required[obj.required.indexOf(prop)] = `quicktype_${prop}`;
        }
      }
      adjustReservedWords(obj.properties[prop], reservedWords);
    }
    for (let key in obj) {
      if (key !== 'properties') {
        adjustReservedWords(obj[key], reservedWords);
      }
    }
  }
  return obj;
}

function generateSchema(language) {
    console.log("Generating schema...");

    const generator = createGenerator.createGenerator(config);
    const schema = generator.createSchema(config.type);

    if (schema) {
        fs.writeFileSync(path.resolve(schemaOutputFile), JSON.stringify(schema, null, 2));

        // Adjust for reserved words
        const reservedWords = quicktypeConfig.languages[language].processing.reservedWords;
        adjustReservedWords(schema, reservedWords);

        // Reformat the schema for quicktype compatibility
        const finalSchema = {
            "title": "SignalWireML",
            "$id": "SignalWireML",
            "$schema": "http://json-schema.org/draft-07/schema#",
            "$ref": "#/definitions/Instruction",
            "definitions": schema.definitions
        };

        // Write the reformatted schema to a new file
        fs.writeFileSync(path.resolve(finalOutputFile), JSON.stringify(finalSchema, null, 2));

        console.log("Final schema generated!");
} else {
    console.log("Schema generation failed!");
    }
}

module.exports = { generateSchema };
