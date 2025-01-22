import { inspect } from "node:util";
import {
  type Color,
  bold,
  greenBright,
  redBright,
  yellowBright
} from "colorette";
import type { Flucord } from "../lib/Flucord";

type LoggerType = "info" | "warn" | "error";

type LoggerOptions = {
  type: LoggerType;
  message: unknown;
};

export class Logger {
  private readonly flucord: Flucord;

  constructor(flucord: Flucord) {
    this.flucord = flucord;
  }

  private readonly colors: Record<LoggerType, Color> = {
    info: greenBright,
    warn: yellowBright,
    error: redBright
  };

  info(message: unknown) {
    this.writeToConsole({ type: "info", message });
  }

  warn(message: unknown) {
    this.writeToConsole({ type: "warn", message });
  }

  error(message: unknown) {
    this.writeToConsole({ type: "error", message });
  }

  private writeToConsole(options: LoggerOptions) {
    const { type, message } = options;

    const color = this.colors[type];

    if (typeof message !== "string" && !(message instanceof Error)) {
      return this.flucord.logger.error(
        "Logger message must be a string or an instance of Error"
      );
    }

    console.log(
      `${bold(color(`[${type.toUpperCase()}]`))} ${typeof message === "string" ? message : inspect(message, { colors: true })}`
    );
  }
}
