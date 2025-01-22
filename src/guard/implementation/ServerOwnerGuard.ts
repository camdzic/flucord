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

export class ServerOwnerGuard extends BaseGuard<"any"> {
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
    if (!interaction.inCachedGuild()) {
      throw new GuardExecutionFailException(
        "While executing ServerOwnerGuard, guild was not found"
      );
    }

    if (interaction.guild.ownerId !== interaction.user.id) {
      throw new GuardException("You are not the owner of the server");
    }
  }
}
