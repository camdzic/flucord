import {
  type ButtonInteraction,
  type CacheType,
  type ChannelSelectMenuInteraction,
  DiscordAPIError,
  type Interaction,
  type MentionableSelectMenuInteraction,
  MessageFlags,
  type ModalSubmitInteraction,
  type RoleSelectMenuInteraction,
  type StringSelectMenuInteraction,
  type UserSelectMenuInteraction
} from "discord.js";
import { GuardException } from "../../../../exception/GuardException";
import { GuardExecutionFailException } from "../../../../exception/GuardExecutionFailException";
import type { BaseGuard, BaseGuardTypeMap } from "../../../../guard/BaseGuard";
import type { Flucord } from "../../../../lib/Flucord";
import type { BaseTriggerTypeMap } from "../../../../trigger/BaseTrigger";
import { BaseEvent } from "../../../BaseEvent";

export class CoreTriggerHandle extends BaseEvent<"interactionCreate"> {
  constructor(flucord: Flucord) {
    super(flucord, {
      event: "interactionCreate"
    });
  }

  async execute(interaction: Interaction<CacheType>) {
    if (interaction.isButton()) {
      await this.handleTrigger(interaction, "button");
    } else if (interaction.isStringSelectMenu()) {
      await this.handleTrigger(interaction, "stringSelectMenu");
    } else if (interaction.isChannelSelectMenu()) {
      await this.handleTrigger(interaction, "channelSelectMenu");
    } else if (interaction.isRoleSelectMenu()) {
      await this.handleTrigger(interaction, "roleSelectMenu");
    } else if (interaction.isMentionableSelectMenu()) {
      await this.handleTrigger(interaction, "mentionableSelectMenu");
    } else if (interaction.isUserSelectMenu()) {
      await this.handleTrigger(interaction, "userSelectMenu");
    } else if (interaction.isModalSubmit()) {
      await this.handleTrigger(interaction, "modal");
    }
  }

  private async handleTrigger(
    interaction:
      | ButtonInteraction
      | StringSelectMenuInteraction
      | ChannelSelectMenuInteraction
      | RoleSelectMenuInteraction
      | MentionableSelectMenuInteraction
      | UserSelectMenuInteraction
      | ModalSubmitInteraction,
    type: keyof BaseTriggerTypeMap
  ) {
    const trigger = this.flucord.triggers
      .filter(t => t.type === type)
      .find(t =>
        t.startsWith
          ? interaction.customId.startsWith(t.id)
          : t.id === interaction.customId
      );

    if (!trigger) return;

    if (trigger.guards) {
      const failedGuards: any[] = [];
      const disallowedGuards: any[] = [];
      const triggerGuards = trigger.guards.filter(g =>
        this.isSpecificGuard(g, type)
      );

      for (const guard of triggerGuards) {
        try {
          await guard.execute(interaction);
        } catch (error) {
          if (error instanceof GuardExecutionFailException) {
            failedGuards.push(error.message);
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
      await trigger.execute(interaction);
    } catch (error) {
      if (interaction.deferred || interaction.replied) {
        interaction.editReply({
          embeds: [
            this.flucord.embeds.error(
              `Failed to execute ${type} trigger, error will be reported`
            )
          ],
          components: []
        });
      } else {
        interaction.reply({
          embeds: [
            this.flucord.embeds.error(
              `Failed to execute ${type} trigger, error will be reported`
            )
          ],
          components: [],
          flags: MessageFlags.Ephemeral
        });
      }

      this.flucord.logger.error(`Failed to execute ${type} trigger`);

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
