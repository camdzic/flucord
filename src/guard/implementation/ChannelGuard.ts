import type {
  ButtonInteraction,
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
  private readonly channelId: string;

  constructor(channelId: string) {
    super({
      types: ["any"]
    });

    this.channelId = channelId;
  }

  execute(
    interaction:
      | ChatInputCommandInteraction
      | MessageContextMenuCommandInteraction
      | UserContextMenuCommandInteraction
      | ButtonInteraction<"cached">
      | StringSelectMenuInteraction<"cached">
      | ChannelSelectMenuInteraction<"cached">
      | RoleSelectMenuInteraction<"cached">
      | MentionableSelectMenuInteraction<"cached">
      | UserSelectMenuInteraction<"cached">
  ) {
    if (!interaction.channel) {
      throw new GuardExecutionFailException(
        "While executing ChannelGuard, channel was not found"
      );
    }

    if (interaction.channel.id !== this.channelId) {
      throw new GuardException("Invalid channel");
    }
  }
}
