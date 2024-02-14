import { createGenerator, Config } from 'ts-json-schema-generator';
import { promises as fs } from 'fs';
import path from 'path';
import quicktypeConfigModule from '../../config/quicktypeConfig.json';
import { QuicktypeConfig } from 'QuicktypeConfig';
import { ensureDirectoryExists } from '../utils/checkDirectory';


interface SchemaObject {
  // Define the structure of your schema object here
  [key: string]: any; // Replace 'any' with more specific types if known
}

// Utility function to adjust reserved words in the schema
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

async function generateSchema(language: string): Promise<void> {
  const quicktypeConfig: QuicktypeConfig = quicktypeConfigModule; // Note: Adjust according to your import method
  if (!quicktypeConfig.languages[language]) {
    throw new Error(`Language ${language} is not defined in the quicktypeConfig.json file.`);
  }

  const schemaFileName = path.resolve('./types/SignalWireML_TS/src/SignalWireML/SignalWireML.ts');
  const tsConfig = path.resolve('./types/SignalWireML_TS/tsconfig.json');
  const schemaOutputFile = path.resolve('./schema/generated-schema.json');
  const postProcessSchema = path.resolve('./schema/postProcess.json');

  const config: Config = {
    path: schemaFileName,
    tsconfig: tsConfig,
    type: '*',
  };

  const generator = createGenerator(config);
  const schema = generator.createSchema(config.type);

  try {
    await ensureDirectoryExists(path.dirname(schemaOutputFile));
    await ensureDirectoryExists(path.dirname(postProcessSchema));

    const reservedWords = quicktypeConfig.languages[language]?.processing?.reservedWords ?? [];
    adjustReservedWords(schema, reservedWords);

    const tempSchema = {
      title: "SignalWireML",
      $id: "SignalWireML",
      $schema: "http://json-schema.org/draft-07/schema#",
      $ref: "#/definitions/Instruction",
      definitions: schema.definitions,
    };

    await fs.writeFile(schemaOutputFile, JSON.stringify(schema, null, 2));
    await fs.writeFile(postProcessSchema, JSON.stringify(tempSchema, null, 2));
  } catch (error) {
    console.error("Schema generation failed:", error);
  }
}

export { generateSchema };
