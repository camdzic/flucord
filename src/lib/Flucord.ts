import * as fs from "node:fs/promises";
import * as path from "node:path";
import { CronJob } from "cron";
import { Client, type ClientOptions } from "discord.js";
import {
  BaseContextMenuCommand,
  type BaseContextMenuCommandTypeMap
} from "../command/BaseContextMenuCommand";
import { BaseSlashCommand } from "../command/BaseSlashCommand";
import type {
  BaseComponent,
  BaseComponentTypeMap
} from "../component/BaseComponent";
import { BaseCron } from "../cron/BaseCron";
import { BaseEvent } from "../event/BaseEvent";
import { BaseTrigger, type BaseTriggerTypeMap } from "../trigger/BaseTrigger";
import { Config } from "../utility/Config";
import { EmbedBuilder } from "../utility/EmbedBuilder";
import { Logger } from "../utility/Logger";

export class Flucord {
  readonly client: Client;

  readonly settings: Config;

  readonly logger: Logger;
  readonly embeds: EmbedBuilder;

  slashCommands: BaseSlashCommand[] = [];
  contextMenuCommands: BaseContextMenuCommand<
    keyof BaseContextMenuCommandTypeMap
  >[] = [];
  triggers: BaseTrigger<keyof BaseTriggerTypeMap>[] = [];
  components: BaseComponent<keyof BaseComponentTypeMap>[] = [];

  constructor(options: ClientOptions) {
    this.client = new Client(options);

    this.settings = new Config("config/settings.json", {
      token: "your-token-here",
      commands: {
        enabled: true,
        global: true,
        guild_id: null
      },
      colors: {
        primary: "#5865f2",
        error: "#ed4245",
        success: "#57f287"
      }
    });

    this.logger = new Logger(this);
    this.embeds = new EmbedBuilder(this);

    this.start();
  }

  private async loadFiles(...directories: string[]) {
    const files: any[] = [];

    for (const directory of directories) {
      try {
        const entries = await fs.readdir(directory, {
          recursive: true
        });

        for (const entry of entries) {
          const entryPath = path.join(directory, entry);

          if (path.extname(entryPath) === ".ts") {
            const module = await import(entryPath);

            for (const value of Object.values(module)) {
              if (
                typeof value === "function" &&
                value.prototype &&
                value.prototype.constructor
              ) {
                // @ts-ignore
                const instance = new value(this);
                files.push(instance);
              }
            }
          }
        }
      } catch (error) {
        //@ts-ignore
        if (error.code === "ENOENT") {
          continue;
        }

        throw error;
      }
    }

    return files;
  }

  private async loadEvents() {
    const events = await this.loadFiles(
      path.join(__dirname, "..", "event", "implementation"),
      path.join(__dirname, "..", "..", "..", "..", "src", "events")
    );
    const baseEvents = events.filter(event => event instanceof BaseEvent);

    for (const event of baseEvents) {
      this.client[event.once ? "once" : "on"](
        event.event,
        event.execute.bind(event)
      );
    }

    this.logger.info(`Loaded ${baseEvents.length} events`);
  }

  private async loadCommands() {
    const commands = await this.loadFiles(
      path.join(__dirname, "..", "..", "..", "..", "src", "commands")
    );
    const baseSlashCommands = commands.filter(
      command => command instanceof BaseSlashCommand
    );
    const BaseContextMenuCommands = commands.filter(
      command => command instanceof BaseContextMenuCommand
    );

    for (const command of baseSlashCommands) {
      this.slashCommands.push(command);
    }

    for (const command of BaseContextMenuCommands) {
      this.contextMenuCommands.push(command);
    }

    this.logger.info(
      `Loaded ${this.slashCommands.length + this.contextMenuCommands.length} commands (${this.slashCommands.length} slash, ${this.contextMenuCommands.length} context menu)`
    );
  }

  private async loadTriggers() {
    const triggers = await this.loadFiles(
      path.join(__dirname, "..", "..", "..", "..", "src", "triggers")
    );
    const baseTriggers = triggers.filter(
      trigger => trigger instanceof BaseTrigger
    );

    for (const trigger of baseTriggers) {
      this.triggers.push(trigger);
    }

    this.logger.info(`Loaded ${this.triggers.length} triggers`);
  }

  private async loadCrons() {
    const crons = await this.loadFiles(
      path.join(__dirname, "..", "..", "..", "..", "src", "crons")
    );
    const baseCrons = crons.filter(cron => cron instanceof BaseCron);

    for (const cron of baseCrons) {
      new CronJob(
        cron.format,
        () => {
          this.client.isReady() && cron.execute();
        },
        null,
        true,
        cron.timezone
      );
    }

    this.logger.info(`Loaded ${baseCrons.length} crons`);
  }

  private async start() {
    await this.loadEvents();
    await this.loadTriggers();
    await this.loadCommands();
    await this.loadCrons();

    await this.client.login(this.settings.getString("token"));
  }
}
