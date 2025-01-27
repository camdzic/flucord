import {
  type ButtonInteraction,
  type CacheType,
  type ChannelSelectMenuInteraction,
  DiscordAPIError,
  type Interaction,
  type MentionableSelectMenuInteraction,
  MessageFlags,
  type ModalMessageModalSubmitInteraction,
  type RoleSelectMenuInteraction,
  type StringSelectMenuInteraction,
  type UserSelectMenuInteraction
} from "discord.js";
import type { BaseComponentTypeMap } from "../../../../component/BaseComponent";
import type { Flucord } from "../../../../lib/Flucord";
import { deleteComponent } from "../../../../utility/Component";
import { Time } from "../../../../utility/constants/Time";
import { BaseEvent } from "../../../BaseEvent";

export class CoreComponentHandle extends BaseEvent<"interactionCreate"> {
  constructor(flucord: Flucord) {
    super(flucord, {
      event: "interactionCreate"
    });
  }

  async execute(interaction: Interaction<CacheType>) {
    if (interaction.isButton()) {
      await this.handleComponent(interaction, "button");
    } else if (interaction.isStringSelectMenu()) {
      await this.handleComponent(interaction, "stringSelectMenu");
    } else if (interaction.isChannelSelectMenu()) {
      await this.handleComponent(interaction, "channelSelectMenu");
    } else if (interaction.isRoleSelectMenu()) {
      await this.handleComponent(interaction, "roleSelectMenu");
    } else if (interaction.isMentionableSelectMenu()) {
      await this.handleComponent(interaction, "mentionableSelectMenu");
    } else if (interaction.isUserSelectMenu()) {
      await this.handleComponent(interaction, "userSelectMenu");
    } else if (interaction.isModalSubmit() && interaction.isFromMessage()) {
      await this.handleComponent(interaction, "modal");
    }
  }

  async handleComponent(
    interaction:
      | ButtonInteraction
      | StringSelectMenuInteraction
      | ChannelSelectMenuInteraction
      | RoleSelectMenuInteraction
      | MentionableSelectMenuInteraction
      | UserSelectMenuInteraction
      | ModalMessageModalSubmitInteraction,
    type: keyof BaseComponentTypeMap
  ) {
    const component = this.flucord.components
      .filter(c => c.type === type)
      .find(c => c.id === interaction.customId);

    if (!component) return;

    if (
      component.allowedExecutorIds.length &&
      !component.allowedExecutorIds.includes(interaction.user.id)
    ) {
      return interaction.reply({
        embeds: [
          this.flucord.embeds.error(
            "This component is meant for someone else to execute"
          )
        ],
        flags: MessageFlags.Ephemeral
      });
    }

    try {
      const stop = () => {
        if (component.expiredExecute) {
          component.expiredExecute(component.id);
        }
        clearTimeout(component.timeout);
        deleteComponent(this.flucord, component.id, type);
      };

      await component.execute(interaction, stop);

      if (component.renewOnInteract) {
        clearTimeout(component.timeout);

        const maxDuration = Time.Minute * 14;
        const elapsedTime = Date.now() - component.timeoutCreatedAt;
        const remainingTime = Math.min(
          component.executionThreshold,
          maxDuration - elapsedTime
        );

        component.timeout = setTimeout(() => {
          if (component.expiredExecute) {
            component.expiredExecute(component.id);
          }
          deleteComponent(this.flucord, component.id, type);
        }, remainingTime);
      } else {
        stop();
      }
    } catch (error) {
      if (interaction.deferred || interaction.replied) {
        interaction.editReply({
          embeds: [
            this.flucord.embeds.error(
              `Failed to execute ${type} component, error will be reported`
            )
          ],
          components: []
        });
      } else {
        interaction.reply({
          embeds: [
            this.flucord.embeds.error(
              `Failed to execute ${type} component, error will be reported`
            )
          ],
          components: [],
          flags: MessageFlags.Ephemeral
        });
      }

      this.flucord.logger.error(`Failed to execute ${type} component`);

      if (!(error instanceof DiscordAPIError)) {
        this.flucord.logger.error(error);
      }
    }
  }
}
