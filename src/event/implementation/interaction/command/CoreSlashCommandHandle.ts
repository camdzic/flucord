import { DiscordAPIError, type Interaction, MessageFlags } from "discord.js";
import { CooldownGuardException } from "../../../../exception/CooldownGuardException";
import { GuardException } from "../../../../exception/GuardException";
import type { BaseGuard, BaseGuardTypeMap } from "../../../../guard/BaseGuard";
import type { Flucord } from "../../../../lib/Flucord";
import { BaseEvent } from "../../../BaseEvent";

export class CoreSlashCommandHandle extends BaseEvent<"interactionCreate"> {
  constructor(flucord: Flucord) {
    super(flucord, {
      event: "interactionCreate"
    });
  }

  async execute(interaction: Interaction) {
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
        const failedGuards: any[] = [];
        const cooldownFailedguards: any[] = [];
        const commandGuards = slashCommand.guards.filter(g =>
          this.isSpecificGuard(g, "slashCommand")
        );

        for (const guard of commandGuards) {
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
            embeds: [
              this.flucord.embeds.error(cooldownFailedguards.join("\n"))
            ],
            flags: MessageFlags.Ephemeral
          });
        }
        if (failedGuards.length) {
          return interaction.reply({
            embeds: [
              this.flucord.embeds.error(
                "You cannot use this slash command due to a lack of guards"
              )
            ],
            flags: MessageFlags.Ephemeral
          });
        }
      }

      try {
        await slashCommand.execute(interaction);
      } catch (error) {
        if (interaction.deferred || interaction.replied) {
          interaction.editReply({
            embeds: [
              this.flucord.embeds.error(
                `Failed to execute ${slashCommand.constructor.name}, error will be reported`
              )
            ],
            components: []
          });
        } else {
          interaction.reply({
            embeds: [
              this.flucord.embeds.error(
                `Failed to execute ${slashCommand.constructor.name}, error will be reported`
              )
            ],
            components: [],
            flags: MessageFlags.Ephemeral
          });
        }

        this.flucord.logger.error(
          `Failed to execute ${slashCommand.constructor.name}`
        );

        if (!(error instanceof DiscordAPIError)) {
          this.flucord.logger.error(error);
        }
      }
    } else if (interaction.isAutocomplete()) {
      const slashCommand = this.flucord.slashCommands.find(
        command => command.name === interaction.commandName
      );

      if (!slashCommand) return;

      if (slashCommand.autocompleteExecute) {
        try {
          await slashCommand.autocompleteExecute(interaction);
        } catch (error) {
          this.flucord.logger.error(
            `Failed to execute autocomplete for ${slashCommand.constructor.name}`
          );

          if (!(error instanceof DiscordAPIError)) {
            this.flucord.logger.error(error);
          }
        }
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
