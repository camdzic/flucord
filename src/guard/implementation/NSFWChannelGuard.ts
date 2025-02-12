import {
  type ButtonInteraction,
  type CacheType,
  type ChannelSelectMenuInteraction,
  ChannelType,
  type ChatInputCommandInteraction,
  type MentionableSelectMenuInteraction,
  type MessageContextMenuCommandInteraction,
  type ModalSubmitInteraction,
  type RoleSelectMenuInteraction,
  type StringSelectMenuInteraction,
  type UserContextMenuCommandInteraction,
  type UserSelectMenuInteraction
} from "discord.js";
import { BaseGuard } from "../BaseGuard";

export class NSFWChannelGuard extends BaseGuard<"any"> {
  constructor() {
    super({
      types: ["any"]
    });
  }

  execute(
    interaction:
      | ChatInputCommandInteraction<CacheType>
      | MessageContextMenuCommandInteraction<CacheType>
      | UserContextMenuCommandInteraction<CacheType>
      | ButtonInteraction<CacheType>
      | StringSelectMenuInteraction<CacheType>
      | ChannelSelectMenuInteraction<CacheType>
      | RoleSelectMenuInteraction<CacheType>
      | MentionableSelectMenuInteraction<CacheType>
      | UserSelectMenuInteraction<CacheType>
      | ModalSubmitInteraction<CacheType>
  ) {
    if (!interaction.channel) {
      return this.error("Interaction channel is not available.");
    }

    if (
      interaction.channel.type === ChannelType.GuildText &&
      !interaction.channel.nsfw
    ) {
      return this.error("You can only use this in NSFW channels.");
    }

    return this.ok();
  }
}
