import fs from "node:fs";
import path from "node:path";
import type { ZodSchema } from "zod";

export class Config<T> {
  private filePath: string;
  private zodSchema: ZodSchema<T>;
  private defaults: T;

  private configData: T;

  constructor(filePath: string, zodSchema: ZodSchema<T>, defaults: T) {
    this.filePath = filePath;
    this.zodSchema = zodSchema;
    this.defaults = defaults;

    this.ensureConfigFileExists();

    const rawData = fs.readFileSync(this.filePath, "utf-8");
    const parsedData = JSON.parse(rawData);

    this.configData = this.zodSchema.parse(parsedData);
  }

  private ensureConfigFileExists() {
    const fileDir = path.dirname(this.filePath);

    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }

    const defaultConfig = this.defaults;

    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify(defaultConfig, null, 2));
    } else {
      const rawData = fs.readFileSync(this.filePath, "utf-8");
      const parsedData = JSON.parse(rawData);

      const mergedData = {
        ...defaultConfig,
        ...parsedData
      };

      for (const key in defaultConfig) {
        if (!(key in parsedData)) {
          mergedData[key] = defaultConfig[key];
        }
      }

      for (const key in mergedData) {
        if (
          Array.isArray(mergedData[key]) &&
          Array.isArray(defaultConfig[key])
        ) {
          if (!mergedData[key].length) {
            mergedData[key] = defaultConfig[key];
          } else {
            mergedData[key] = mergedData[key].map(item => {
              if (item && typeof item === "object") {
                const [defaultItem] = defaultConfig[key];

                return { ...defaultItem, ...item };
              }

              return item;
            });
          }
        }
      }

      const validationResult = this.zodSchema.parse(mergedData);

      fs.writeFileSync(
        this.filePath,
        JSON.stringify(validationResult, null, 2)
      );
    }
  }

  get<TK extends keyof T>(key: TK): T[TK] {
    return this.configData[key];
  }
}
