import {
  ApplicationCommandType,
  ApplicationIntegrationType,
  InteractionContextType,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  type RESTPostAPIContextMenuApplicationCommandsJSONBody
} from "discord.js";
import type { BaseContextMenuCommandTypeMap } from "../../../command/BaseContextMenuCommand";
import type { Flucord } from "../../../lib/Flucord";
import { BaseEvent } from "../../BaseEvent";

export class CoreClientReadyHandleEvent extends BaseEvent<"ready"> {
  constructor(flucord: Flucord) {
    super(flucord, {
      event: "ready"
    });
  }

  async execute() {
    if (this.flucord.config.get("commands").enabled) {
      await this.registerCommands();
    } else {
      this.flucord.logger.warn("Commands are disabled");
    }

    this.flucord.logger.info("Bot is ready");
  }

  private async registerCommands() {
    const slashCommands = this.getSlashCommandRegistrationData();
    const contextMenuCommands = this.getContextMenuCommandRegistrationData();
    const commands = [...slashCommands, ...contextMenuCommands];

    try {
      if (this.flucord.config.get("commands").global) {
        if (!this.flucord.client.application) {
          return this.flucord.logger.warn(
            "Application is not available, no commands will be registered"
          );
        }

        await this.flucord.client.application.commands.set(commands);
      } else {
        const guildId = this.flucord.config.get("commands").guildId;

        if (!guildId) {
          return this.flucord.logger.warn(
            "Guild ID is not available, no commands will be registered"
          );
        }

        const guild = await this.flucord.client.guilds
          .fetch(guildId)
          .catch(() => null);

        if (!guild) {
          return this.flucord.logger.warn(
            "Guild is not available, no commands will be registered"
          );
        }

        await this.flucord.client.application.commands.set([]);
        await guild.commands.set(commands);
      }
    } catch (error) {
      this.flucord.logger.error("Failed to register commands");
      this.flucord.logger.error(error);
    } finally {
      this.flucord.logger.info(
        "Both slash and context menu commands are registered"
      );
    }
  }

  private getSlashCommandRegistrationData() {
    return this.flucord.slashCommands.map(command => {
      const data: RESTPostAPIChatInputApplicationCommandsJSONBody = {
        name: command.name,
        description: command.description,
        type: ApplicationCommandType.ChatInput
      };

      if (command.guildPlusUser) {
        data.contexts = [
          InteractionContextType.Guild,
          InteractionContextType.PrivateChannel,
          InteractionContextType.BotDM
        ];
        data.integration_types = [
          ApplicationIntegrationType.GuildInstall,
          ApplicationIntegrationType.UserInstall
        ];
      } else {
        data.contexts = [InteractionContextType.Guild];
        data.integration_types = [ApplicationIntegrationType.GuildInstall];
      }

      if (command.options?.length) {
        //@ts-ignore
        data.options = command.options;
      }

      if (command.permissions?.length) {
        //@ts-ignore
        data.defaultMemberPermissions = command.permissions;
      }

      return data;
    });
  }

  private getContextMenuCommandRegistrationData() {
    return this.flucord.contextMenuCommands.map(command => {
      const commandTypeMap: Record<
        keyof BaseContextMenuCommandTypeMap,
        ApplicationCommandType
      > = {
        messageContextMenuCommand: ApplicationCommandType.Message,
        userContextMenuCommand: ApplicationCommandType.User
      };

      const data: RESTPostAPIContextMenuApplicationCommandsJSONBody = {
        name: command.name,
        //@ts-ignore
        type: commandTypeMap[command.type]
      };

      if (command.guildPlusUser) {
        data.contexts = [
          InteractionContextType.Guild,
          InteractionContextType.PrivateChannel,
          InteractionContextType.BotDM
        ];
        data.integration_types = [
          ApplicationIntegrationType.GuildInstall,
          ApplicationIntegrationType.UserInstall
        ];
      } else {
        data.contexts = [InteractionContextType.Guild];
        data.integration_types = [ApplicationIntegrationType.GuildInstall];
      }

      if (command.permissions?.length) {
        //@ts-ignore
        data.defaultMemberPermissions = command.permissions;
      }

      return data;
    });
  }
}
