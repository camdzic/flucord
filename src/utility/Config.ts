import * as fs from "node:fs";
import * as path from "node:path";
import { ConfigException } from "../exception/ConfigException";

type NestedConfig = {
  [key: string]: NestedConfig | unknown;
};

export class Config {
  private readonly configPath: string;

  private configData: NestedConfig;

  constructor(configPath: string, defaults: Record<string, unknown> = {}) {
    this.configPath = configPath;

    this.configData = {};

    this.ensureConfigFileExists();
    this.loadConfigData();
    this.applyDefaultValues(defaults);
  }

  private ensureConfigFileExists() {
    const directory = path.dirname(this.configPath);

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    if (!fs.existsSync(this.configPath)) {
      fs.writeFileSync(this.configPath, JSON.stringify({}, null, 2));
    }
  }

  private loadConfigData() {
    try {
      const fileContent = fs.readFileSync(this.configPath, "utf-8");

      this.configData = JSON.parse(fileContent);
    } catch {
      this.configData = {};
    }
  }

  private persistConfigData() {
    fs.writeFileSync(this.configPath, JSON.stringify(this.configData, null, 2));
  }

  private applyDefaultValues(defaults: Record<string, unknown>) {
    for (const [key, value] of Object.entries(defaults)) {
      this.registerPath(key, value);
    }
  }

  registerPath(configPath: string, defaultValue: unknown = null) {
    const pathSegments = configPath.split(".");
    const finalKey = pathSegments.pop();
    let currentLevel = this.configData;

    for (const segment of pathSegments) {
      if (!currentLevel[segment] || typeof currentLevel[segment] !== "object") {
        currentLevel[segment] = {};
      }
      currentLevel = currentLevel[segment] as NestedConfig;
    }

    // biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
    if (finalKey && !currentLevel.hasOwnProperty(finalKey)) {
      currentLevel[finalKey] = defaultValue;
      this.persistConfigData();
    }
  }

  private isNestedObject(value: unknown): value is NestedConfig {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  private retrieveValue(path: string) {
    return path.split(".").reduce<unknown>((currentNode, segment) => {
      if (!this.isNestedObject(currentNode)) {
        throw new ConfigException(`Invalid path '${path}'`);
      }

      return currentNode[segment];
    }, this.configData);
  }

  private prettyTypeof(value: unknown) {
    if (Array.isArray(value)) {
      return "array";
    }

    return typeof value;
  }

  getValue<T>(path: string) {
    return this.retrieveValue(path) as T;
  }

  getString(path: string) {
    const value = this.retrieveValue(path);

    if (typeof value !== "string") {
      throw new ConfigException(
        `Expected ${this.prettyTypeof(value)} at '${path}' and not a string`
      );
    }

    return value;
  }

  getNumber(path: string) {
    const value = this.retrieveValue(path);

    if (typeof value !== "number") {
      throw new ConfigException(
        `Expected ${this.prettyTypeof(value)} at '${path}' and not a number`
      );
    }

    return value;
  }

  getBoolean(path: string) {
    const value = this.retrieveValue(path);

    if (typeof value !== "boolean") {
      throw new ConfigException(
        `Expected ${this.prettyTypeof(value)} at '${path}' and not a boolean`
      );
    }

    return value;
  }

  getObject<T extends NestedConfig>(path: string) {
    const value = this.retrieveValue(path);

    if (!this.isNestedObject(value)) {
      throw new ConfigException(
        `Expected ${this.prettyTypeof(value)} at '${path}' and not an object`
      );
    }

    return value as T;
  }

  getArray<T>(path: string): T[] {
    const value = this.retrieveValue(path);

    if (!Array.isArray(value)) {
      throw new ConfigException(
        `Expected ${this.prettyTypeof(value)} at '${path}' and not an array`
      );
    }

    return value as T[];
  }
}
