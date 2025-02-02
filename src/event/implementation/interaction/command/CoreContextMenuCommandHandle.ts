import {
  type CacheType,
  DiscordAPIError,
  type Interaction,
  type MessageContextMenuCommandInteraction,
  MessageFlags,
  type UserContextMenuCommandInteraction
} from "discord.js";
import type { BaseContextMenuCommandTypeMap } from "../../../../command/BaseContextMenuCommand";
import { CooldownGuardException } from "../../../../exception/CooldownGuardException";
import { GuardException } from "../../../../exception/GuardException";
import { GuardExecutionFailException } from "../../../../exception/GuardExecutionFailException";
import type { BaseGuard, BaseGuardTypeMap } from "../../../../guard/BaseGuard";
import type { Flucord } from "../../../../lib/Flucord";
import { BaseEvent } from "../../../BaseEvent";

export class CoreContextMenuCommandHandle extends BaseEvent<"interactionCreate"> {
  constructor(flucord: Flucord) {
    super(flucord, {
      event: "interactionCreate"
    });
  }

  async execute(interaction: Interaction<CacheType>) {
    if (interaction.isMessageContextMenuCommand()) {
      await this.handleContextMenuCommand(
        interaction,
        "messageContextMenuCommand"
      );
    } else if (interaction.isUserContextMenuCommand()) {
      await this.handleContextMenuCommand(
        interaction,
        "userContextMenuCommand"
      );
    }
  }

  private async handleContextMenuCommand(
    interaction:
      | MessageContextMenuCommandInteraction
      | UserContextMenuCommandInteraction,
    type: keyof BaseContextMenuCommandTypeMap
  ) {
    const contextMenuCommand = this.flucord.contextMenuCommands
      .filter(command => command.type === type)
      .find(command => command.name === interaction.commandName);

    if (!contextMenuCommand) {
      return interaction.reply({
        embeds: [
          this.flucord.embeds.error(
            "Unable to find wanted context menu command"
          )
        ],
        flags: MessageFlags.Ephemeral
      });
    }

    if (contextMenuCommand.guards) {
      const failedGuards: any[] = [];
      const disallowedGuards: any[] = [];
      const cooldownFailedGuards: any[] = [];
      const contextMenuCommandGuards = contextMenuCommand.guards.filter(g =>
        this.isSpecificGuard(g, type)
      );

      for (const guard of contextMenuCommandGuards) {
        try {
          await guard.execute(interaction);
        } catch (error) {
          if (error instanceof GuardExecutionFailException) {
            failedGuards.push(error.message);
          } else if (error instanceof CooldownGuardException) {
            cooldownFailedGuards.push(error.message);
          } else if (error instanceof GuardException) {
            disallowedGuards.push(error.message);
          }
        }
      }

      if (failedGuards.length) {
        return interaction.reply({
          embeds: [
            this.flucord.embeds.error(
              `Strange things happened while execution:\n\n${failedGuards.map((message, i) => `${i}. **${message}**`).join("\n")}`
            )
          ],
          flags: MessageFlags.Ephemeral
        });
      }
      if (cooldownFailedGuards.length) {
        return interaction.reply({
          embeds: [this.flucord.embeds.error(cooldownFailedGuards.join("\n"))],
          flags: MessageFlags.Ephemeral
        });
      }
      if (disallowedGuards.length) {
        return interaction.reply({
          embeds: [
            this.flucord.embeds.error(
              `In order to use this command, you need to meet the following requirements:\n\n${disallowedGuards.map((message, i) => `${i}. **${message}**`).join("\n")}`
            )
          ],
          flags: MessageFlags.Ephemeral
        });
      }
    }

    try {
      await contextMenuCommand.execute(interaction);
    } catch (error) {
      if (interaction.deferred || interaction.replied) {
        interaction.editReply({
          embeds: [
            this.flucord.embeds.error(
              `Failed to execute ${contextMenuCommand.constructor.name}, error will be reported`
            )
          ],
          components: []
        });
      } else {
        interaction.reply({
          embeds: [
            this.flucord.embeds.error(
              `Failed to execute ${contextMenuCommand.constructor.name}, error will be reported`
            )
          ],
          components: [],
          flags: MessageFlags.Ephemeral
        });
      }

      this.flucord.logger.error(
        `Failed to execute ${contextMenuCommand.constructor.name}`
      );

      if (!(error instanceof DiscordAPIError)) {
        this.flucord.logger.error(error);
      }
    }
  }

  private isSpecificGuard(
    guard: BaseGuard<keyof BaseGuardTypeMap>,
    type: keyof BaseGuardTypeMap
  ): guard is BaseGuard<typeof type> | BaseGuard<"any"> {
    return guard.types.includes(type) || guard.types.includes("any");
  }
}
