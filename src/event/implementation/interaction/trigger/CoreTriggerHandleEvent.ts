import { Result } from "@sapphire/result";
import type {
  ButtonInteraction,
  CacheType,
  ChannelSelectMenuInteraction,
  Interaction,
  MentionableSelectMenuInteraction,
  ModalSubmitInteraction,
  RoleSelectMenuInteraction,
  StringSelectMenuInteraction,
  UserSelectMenuInteraction
} from "discord.js";
import type { BaseGuard, BaseGuardTypeMap } from "../../../../guard/BaseGuard";
import type { Flucord } from "../../../../lib/Flucord";
import type { BaseTriggerTypeMap } from "../../../../trigger/BaseTrigger";
import { BaseEvent } from "../../../BaseEvent";

export class CoreTriggerHandleEvent extends BaseEvent<"interactionCreate"> {
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

    if (!trigger) {
      return;
    }

    if (trigger.guards) {
      const triggerGuards = trigger.guards.filter(g =>
        this.isSpecificGuard(g, type)
      );

      const results = await Promise.all(
        triggerGuards.map(guard =>
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
      async () => await trigger.execute(interaction)
    );

    result.inspectErr(error =>
      this.flucord.client.emit("triggerError", interaction, error)
    );
  }

  private isSpecificGuard(
    guard: BaseGuard<keyof BaseGuardTypeMap>,
    type: keyof BaseGuardTypeMap
  ): guard is BaseGuard<typeof type> | BaseGuard<"any"> {
    return guard.types.includes(type) || guard.types.includes("any");
  }
}
