import {
  DiscordAPIError,
  type Interaction,
  type MessageContextMenuCommandInteraction,
  MessageFlags,
  type UserContextMenuCommandInteraction
} from "discord.js";
import type { BaseContextMenuCommandTypeMap } from "../../../../command/BaseContextMenuCommand";
import { CooldownGuardException } from "../../../../exception/CooldownGuardException";
import { GuardException } from "../../../../exception/GuardException";
import type { BaseGuard, BaseGuardTypeMap } from "../../../../guard/BaseGuard";
import type { Flucord } from "../../../../lib/Flucord";
import { BaseEvent } from "../../../BaseEvent";

export class CoreContextMenuCommandHandle extends BaseEvent<"interactionCreate"> {
  constructor(flucord: Flucord) {
    super(flucord, {
      event: "interactionCreate"
    });
  }

  async execute(interaction: Interaction) {
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
      const cooldownFailedguards: any[] = [];
      const contextMenuCommandGuards = contextMenuCommand.guards.filter(g =>
        this.isSpecificGuard(g, type)
      );

      for (const guard of contextMenuCommandGuards) {
        try {
          await guard.execute(interaction);
        } catch (error) {
          if (error instanceof GuardException) {
            failedGuards.push(error.message);
          } else if (error instanceof CooldownGuardException) {
            cooldownFailedguards.push(error.message);
          }
        }
      }

      if (cooldownFailedguards.length) {
        return interaction.reply({
          embeds: [this.flucord.embeds.error(cooldownFailedguards.join("\n"))],
          flags: MessageFlags.Ephemeral
        });
      }
      if (failedGuards.length) {
        return interaction.reply({
          embeds: [
            this.flucord.embeds.error(
              "You cannot use this context menu command due to a lack of guards"
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
