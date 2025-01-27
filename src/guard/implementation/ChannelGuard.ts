import type {
  ButtonInteraction,
  CacheType,
  ChannelSelectMenuInteraction,
  ChatInputCommandInteraction,
  MentionableSelectMenuInteraction,
  MessageContextMenuCommandInteraction,
  RoleSelectMenuInteraction,
  StringSelectMenuInteraction,
  UserContextMenuCommandInteraction,
  UserSelectMenuInteraction
} from "discord.js";
import { GuardException } from "../../exception/GuardException";
import { GuardExecutionFailException } from "../../exception/GuardExecutionFailException";
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
  ) {
    if (!interaction.channel) {
      throw new GuardExecutionFailException(
        "While executing ChannelGuard, channel was not found"
      );
    }

    if (!this.channelIds.includes(interaction.channel.id)) {
      throw new GuardException("Invalid channel");
    }
  }
}
