import { createGenerator, Config  } from 'ts-json-schema-generator';
import fs from 'fs';
import path from 'path';
import quicktypeConfig from '../../config/quicktypeConfig.json'


const schemaFileName = path.resolve('../../types/TypeScript_SDK/SignalWireMLTypes.ts');
const tsConfig = path.resolve('./types/TypeScript_SDK/tsconfig.json');
const schemaOutputFile = path.resolve('./schema/generated-schema.json');
const postProcessSchema = path.resolve('./schema/postProcess.json');

const config: Config = {
    path: schemaFileName,
    tsconfig: tsConfig,
    type: '*' // Adjust as needed for your specific type
};

console.log(config);

interface SchemaObject {
  // Define the structure of your schema object here
  [key: string]: any; // Replace 'any' with more specific types if known
}

function adjustReservedWords(obj: SchemaObject, reservedWords: string[]): SchemaObject {
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






function generateSchema(language: string): void {
    console.log("Generating schema...");

    const generator = createGenerator(config);
    const schema: SchemaObject = generator.createSchema(config.type);

    if (schema) {
        fs.mkdirSync(path.dirname(schemaOutputFile), { recursive: true });
        fs.mkdirSync(path.dirname(postProcessSchema), { recursive: true });

        fs.writeFileSync(path.resolve(schemaOutputFile), JSON.stringify(schema, null, 2));

        const reservedWords = quicktypeConfig.languages.python.processing.reservedWords
        adjustReservedWords(schema, reservedWords);

        const tempSchema = {
            "title": "SignalWireML",
            "$id": "SignalWireML",
            "$schema": "http://json-schema.org/draft-07/schema#",
            "$ref": "#/definitions/Instruction",
            "definitions": schema.definitions
        };

        fs.writeFileSync(path.resolve(postProcessSchema), JSON.stringify(tempSchema, null, 2));

        console.log("Final schema generated!");
    } else {
        console.log("Schema generation failed!");
    }
}

export { generateSchema };
