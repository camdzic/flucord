import type {
  ButtonInteraction,
  CacheType,
  ChannelSelectMenuInteraction,
  ChannelType,
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

export class ChannelTypeGuard extends BaseGuard<"any"> {
  private readonly channelTypes: ChannelType[];

  constructor(...channelTypes: ChannelType[]) {
    super({
      types: ["any"]
    });

    this.channelTypes = channelTypes;
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
      return this.error({
        name: "interactionChannelNotAvailable",
        message: "Interaction channel is not available."
      });
    }

    if (!this.channelTypes.includes(interaction.channel.type)) {
      return this.error({
        name: "interactionChannelTypeNotAllowed",
        message: "You can only use this in specific channel types."
      });
    }

    return this.ok();
  }
}
