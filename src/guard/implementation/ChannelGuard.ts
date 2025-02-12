import type {
  ButtonInteraction,
  CacheType,
  ChannelSelectMenuInteraction,
  ChatInputCommandInteraction,
  MentionableSelectMenuInteraction,
  MessageContextMenuCommandInteraction,
  ModalSubmitInteraction,
  RoleSelectMenuInteraction,
  StringSelectMenuInteraction,
  UserContextMenuCommandInteraction,
  UserSelectMenuInteraction
} from "discord.js";
import { BaseGuard } from "../BaseGuard";

export class ChannelGuard extends BaseGuard<"any"> {
  private readonly channelIds: string[];

  constructor(...channelIds: string[]) {
    super({
      types: ["any"]
    });

    this.channelIds = channelIds;
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

    if (!this.channelIds.includes(interaction.channel.id)) {
      return this.error("You can only use this in specific channels.");
    }

    return this.ok();
  }
}
