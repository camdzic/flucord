import fs from "node:fs";
import path from "node:path";
import { merge } from "lodash";
import type { ZodSchema } from "zod";

export class Config<T> {
  private filePath: string;
  private zodSchema: ZodSchema<T>;
  private defaults: T;

  private data: T;

  constructor(filePath: string, zodSchema: ZodSchema<T>, defaults: T) {
    this.filePath = filePath;
    this.zodSchema = zodSchema;
    this.defaults = defaults;

    this.validateEverything();
  }

  private validateEverything() {
    const fileDir = path.dirname(this.filePath);

    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }

    if (!fs.existsSync(this.filePath)) {
      this.data = this.defaults;

      fs.writeFileSync(this.filePath, JSON.stringify(this.defaults, null, 2));
    } else {
      const rawData = fs.readFileSync(this.filePath, "utf-8");
      const parsedData = JSON.parse(rawData);

      const mergedConfig = merge(this.defaults, parsedData);
      const validatedConfig = this.zodSchema.parse(mergedConfig);

      this.data = validatedConfig;

      fs.writeFileSync(this.filePath, JSON.stringify(validatedConfig, null, 2));
    }
  }

  get<TK extends keyof T>(key: TK): T[TK] {
    return this.data[key];
  }
}
