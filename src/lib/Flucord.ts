import { Glob } from "bun";
import { CronJob } from "cron";
import { Client, type ClientEvents, type ClientOptions } from "discord.js";
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
import { CoreClientReadyEvent } from "../event/implementation/client/CoreClientReadyEvent";
import { CoreContextMenuCommandHandle } from "../event/implementation/interaction/command/CoreContextMenuCommandHandle";
import { CoreSlashCommandHandle } from "../event/implementation/interaction/command/CoreSlashCommandHandle";
import { CoreComponentHandle } from "../event/implementation/interaction/component/CoreComponentHandle";
import { CoreTriggerHandle } from "../event/implementation/interaction/trigger/CoreTriggerHandle";
import { BaseTrigger, type BaseTriggerTypeMap } from "../trigger/BaseTrigger";
import { Config } from "../utility/Config";
import { EmbedBuilder } from "../utility/EmbedBuilder";
import { Logger } from "../utility/Logger";

export class Flucord {
  readonly client: Client;

  readonly settings: Config;

  readonly logger: Logger;
  embeds: EmbedBuilder;

  events: BaseEvent<keyof ClientEvents>[] = [
    new CoreClientReadyEvent(this),
    new CoreContextMenuCommandHandle(this),
    new CoreSlashCommandHandle(this),
    new CoreComponentHandle(this),
    new CoreTriggerHandle(this)
  ];
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

  private async loadFiles(directory: string) {
    const files: any[] = [];

    const glob = new Glob(`src/${directory}/**/*.ts`);
    for await (const file of glob.scan({ absolute: true, onlyFiles: true })) {
      const module = await import(file);

      for (const value of Object.values(module)) {
        if (
          typeof value === "function" &&
          value.prototype &&
          value.prototype.constructor
        ) {
          // @ts-ignore
          const instance = new value();
          files.push(instance);
        }
      }
    }

    return files;
  }

  private async loadEvents() {
    const events = await this.loadFiles("events");
    const baseEvents = [
      ...events.filter(event => event instanceof BaseEvent),
      ...this.events
    ];

    for (const event of baseEvents) {
      this.client[event.once ? "once" : "on"](
        event.event,
        event.execute.bind(event)
      );
    }

    this.logger.info(`Loaded ${baseEvents.length} events`);
  }

  private async loadCommands() {
    const commands = await this.loadFiles("commands");

    this.slashCommands = [
      ...commands.filter(command => command instanceof BaseSlashCommand)
    ];
    this.contextMenuCommands = [
      ...commands.filter(command => command instanceof BaseContextMenuCommand)
    ];

    this.logger.info(
      `Loaded ${this.slashCommands.length + this.contextMenuCommands.length} commands (${this.slashCommands.length} slash, ${this.contextMenuCommands.length} context menu)`
    );
  }

  private async loadTriggers() {
    const triggers = await this.loadFiles("triggers");

    this.triggers = [
      ...triggers.filter(trigger => trigger instanceof BaseTrigger)
    ];

    this.logger.info(`Loaded ${this.triggers.length} triggers`);
  }

  private async loadCrons() {
    const crons = await this.loadFiles("crons");
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
