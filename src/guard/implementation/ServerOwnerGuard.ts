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

export class ServerOwnerGuard extends BaseGuard<"any"> {
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
