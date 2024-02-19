import { RendererOptions } from 'quicktype-core';

export interface Processing {
  propertyRegex?: {
    pattern: string;
    flags: string;
    replacement: string;
  };
  instructionUnion: {
    addInstructionUnion: boolean;
    rawInstructionType?: string | null;
    typeSeparator?: string | null;
  };
  customMappings?: null | {
    endOfImportsIdentifier?: null | string;
    mappings?: null |
      {
        toType: string;
        fromType: {
            pattern: string;
            flags: string;
        }
      }[]
    typeDeclarations?: null |
        {
          type: string;
          declaration: string;
        }[]
  }
  reservedWords?: string[];
  outputDir?: string;
}

export interface LanguageConfig {
  rendererOptions?: RendererOptions;
  processing?: Processing;
}

export interface QuicktypeConfig {
  languages: {
    [language: string]: LanguageConfig;
  };
}
