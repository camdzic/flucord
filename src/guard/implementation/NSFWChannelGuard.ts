import {
  type ButtonInteraction,
  type ChannelSelectMenuInteraction,
  ChannelType,
  type ChatInputCommandInteraction,
  type MentionableSelectMenuInteraction,
  type MessageContextMenuCommandInteraction,
  type RoleSelectMenuInteraction,
  type StringSelectMenuInteraction,
  type UserContextMenuCommandInteraction,
  type UserSelectMenuInteraction
} from "discord.js";
import { GuardException } from "../../exception/GuardException";
import { GuardExecutionFailException } from "../../exception/GuardExecutionFailException";
import { BaseGuard } from "../BaseGuard";

export class NSFWChannelGuard extends BaseGuard<"any"> {
  constructor() {
    super({
      types: ["any"]
    });
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
        "While executing NSFWChannelGuard, channel was not found"
      );
    }

    if (
      interaction.channel.type === ChannelType.GuildText &&
      !interaction.channel.nsfw
    ) {
      throw new GuardException("Channel is not NSFW");
    }
  }
}
