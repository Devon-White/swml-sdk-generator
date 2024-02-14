
export interface RendererOptions {
  [option: string]: string | boolean;
}

export interface Processing {
  propertyRegex?: {
    pattern: string;
    flags: string;
    replacement: string;
  };
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
