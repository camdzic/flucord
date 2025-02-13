import { Result } from "@sapphire/result";
import {
  type CacheType,
  type Interaction,
  type MessageContextMenuCommandInteraction,
  MessageFlags,
  type UserContextMenuCommandInteraction
} from "discord.js";
import type { BaseContextMenuCommandTypeMap } from "../../../../command/BaseContextMenuCommand";
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
      const contextMenuCommandGuards = contextMenuCommand.guards.filter(g =>
        this.isSpecificGuard(g, type)
      );

      const results = await Promise.all(
        contextMenuCommandGuards.map(guard =>
          Result.fromAsync(() => guard.execute(interaction))
        )
      );

      for (const result of results) {
        if (result.isErr()) {
          result.inspectErr(error =>
            this.flucord.client.emit("guardError", interaction, error)
          );
          return;
        }
      }
    }

    const result = await Result.fromAsync(
      async () => await contextMenuCommand.execute(interaction)
    );

    result.inspectErr(error => {
      this.flucord.logger.error(
        "An error occurred while executing a context menu command"
      );
      this.flucord.logger.error(error);
    });
  }

  private isSpecificGuard(
    guard: BaseGuard<keyof BaseGuardTypeMap>,
    type: keyof BaseGuardTypeMap
  ): guard is BaseGuard<typeof type> | BaseGuard<"any"> {
    return guard.types.includes(type) || guard.types.includes("any");
  }
}
