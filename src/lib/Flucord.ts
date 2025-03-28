import { Glob } from "bun";
import { CronJob } from "cron";
import { Client, type ClientEvents, type ClientOptions } from "discord.js";
import type { z } from "zod";
import {
  BaseContextMenuCommand,
  type BaseContextMenuCommandTypeMap
} from "../command/BaseContextMenuCommand";
import { BaseSlashCommand } from "../command/BaseSlashCommand";
import { BaseCron, type TimeZone } from "../cron/BaseCron";
import { BaseEvent } from "../event/BaseEvent";
import { CoreClientReadyHandleEvent } from "../event/implementation/client/CoreClientReadyHandleEvent";
import { GuardErrorEvent } from "../event/implementation/editable/GuardErrorEvent";
import { SlashCommandErrorEvent } from "../event/implementation/editable/SlashCommandErrorEvent";
import { CoreContextMenuCommandHandleEvent } from "../event/implementation/interaction/command/CoreContextMenuCommandHandleEvent";
import { CoreSlashCommandHandleEvent } from "../event/implementation/interaction/command/CoreSlashCommandHandleEvent";
import { CoreTriggerHandleEvent } from "../event/implementation/interaction/trigger/CoreTriggerHandleEvent";
import { BaseTrigger, type BaseTriggerTypeMap } from "../trigger/BaseTrigger";
import { Config } from "../utility/Config";
import { EmbedBuilder } from "../utility/EmbedBuilder";
import { Logger } from "../utility/Logger";
import { defaultConfigSchema } from "../utility/configSchemas/defaultConfigSchema";

type FlucordOptions = {
  defaultTimezone?: TimeZone;
  eventsDir?: string;
  commandsDir?: string;
  triggersDir?: string;
  cronsDir?: string;
  djsClientOptions: ClientOptions;
};

export class Flucord {
  readonly defaultTimezone: TimeZone;
  private readonly eventsDir: string;
  private readonly commandsDir: string;
  private readonly triggersDir: string;
  private readonly cronsDir: string;

  readonly client: Client<true>;

  readonly config: Config<z.infer<typeof defaultConfigSchema>>;
  readonly logger: Logger;
  embeds: EmbedBuilder;

  private coreEvents: BaseEvent<keyof ClientEvents>[] = [
    new CoreClientReadyHandleEvent(this),
    new CoreContextMenuCommandHandleEvent(this),
    new CoreSlashCommandHandleEvent(this),
    new CoreTriggerHandleEvent(this)
  ];
  private editableEvents: BaseEvent<keyof ClientEvents>[] = [
    new GuardErrorEvent(this),
    new SlashCommandErrorEvent(this)
  ];
  slashCommands: BaseSlashCommand[] = [];
  contextMenuCommands: BaseContextMenuCommand<
    keyof BaseContextMenuCommandTypeMap
  >[] = [];
  triggers: BaseTrigger<keyof BaseTriggerTypeMap>[] = [];

  constructor({
    defaultTimezone = "Europe/Sarajevo",
    eventsDir = "events",
    commandsDir = "commands",
    triggersDir = "triggers",
    cronsDir = "crons",
    djsClientOptions
  }: FlucordOptions) {
    this.defaultTimezone = defaultTimezone;
    this.eventsDir = eventsDir;
    this.commandsDir = commandsDir;
    this.triggersDir = triggersDir;
    this.cronsDir = cronsDir;

    this.client = new Client(djsClientOptions);

    this.config = new Config("config/config.json", defaultConfigSchema, {
      token: "nameSaysItAll",
      commands: {
        enabled: true,
        global: true,
        guildId: null
      },
      colors: {
        primary: "#5865f2",
        success: "#57f287",
        error: "#ed4245"
      }
    });

    this.logger = new Logger(this);
    this.embeds = new EmbedBuilder(this);

    this.start();
  }

  private async loadFiles(directory: string) {
    const files: unknown[] = [];

    const glob = new Glob(`src/${directory}/**/*.ts`);
    for await (const file of glob.scan({ absolute: true, onlyFiles: true })) {
      const module = await import(file);

      for (const value of Object.values(module)) {
        if (
          typeof value === "function" &&
          value.prototype &&
          value.prototype.constructor
        ) {
          //@ts-ignore
          const instance = new value(this);
          files.push(instance);
        }
      }
    }

    return files;
  }

  private async loadEvents() {
    const events = await this.loadFiles(this.eventsDir);
    const baseEvents = events.filter(event => event instanceof BaseEvent);

    if (
      baseEvents.some(event =>
        this.editableEvents.some(e => e.event === event.event)
      )
    ) {
      this.editableEvents = this.editableEvents.filter(
        event => !baseEvents.some(e => e.event === event.event)
      );
    }

    const combinedEvents = [
      ...this.coreEvents,
      ...this.editableEvents,
      ...baseEvents
    ];

    for (const event of combinedEvents) {
      this.client[event.once ? "once" : "on"](
        event.event,
        event.execute.bind(event)
      );
    }

    this.logger.info(`Loaded ${combinedEvents.length} events`);
  }

  private async loadCommands() {
    const commands = await this.loadFiles(this.commandsDir);

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
    const triggers = await this.loadFiles(this.triggersDir);

    this.triggers = [
      ...triggers.filter(trigger => trigger instanceof BaseTrigger)
    ];

    this.logger.info(`Loaded ${this.triggers.length} triggers`);
  }

  private async loadCrons() {
    const crons = await this.loadFiles(this.cronsDir);
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

    await this.client.login(this.config.get("token"));
  }
}
