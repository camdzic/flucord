import { Result } from "@sapphire/result";
import { type CacheType, type Interaction, MessageFlags } from "discord.js";
import type { BaseGuard, BaseGuardTypeMap } from "../../../../guard/BaseGuard";
import type { Flucord } from "../../../../lib/Flucord";
import { BaseEvent } from "../../../BaseEvent";

export class CoreSlashCommandHandleEvent extends BaseEvent<"interactionCreate"> {
  constructor(flucord: Flucord) {
    super(flucord, {
      event: "interactionCreate"
    });
  }

  async execute(interaction: Interaction<CacheType>) {
    if (interaction.isChatInputCommand()) {
      const slashCommand = this.flucord.slashCommands.find(
        command => command.name === interaction.commandName
      );

      if (!slashCommand) {
        return interaction.reply({
          embeds: [
            this.flucord.embeds.error("Unable to find wanted slash command")
          ],
          flags: MessageFlags.Ephemeral
        });
      }

      if (slashCommand.guards) {
        const commandGuards = slashCommand.guards.filter(g =>
          this.isSpecificGuard(g, "slashCommand")
        );

        const results = await Promise.all(
          commandGuards.map(guard =>
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
        async () => await slashCommand.execute(interaction)
      );

      result.inspectErr(error =>
        this.flucord.client.emit("slashCommandError", interaction, error)
      );
    } else if (interaction.isAutocomplete()) {
      const slashCommand = this.flucord.slashCommands.find(
        command => command.name === interaction.commandName
      );

      if (slashCommand?.autocompleteExecute) {
        const result = await Result.fromAsync(async () => {
          //@ts-ignore
          await slashCommand.autocompleteExecute(interaction);
        });

        result.inspectErr(error =>
          this.flucord.client.emit(
            "slashCommandAutoCompleteError",
            interaction,
            error
          )
        );
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
