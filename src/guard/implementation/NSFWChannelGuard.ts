import {
  type ButtonInteraction,
  type CacheType,
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
        `While executing ${this.constructor.name}, channel was not found`
      );
    }

    if (
      interaction.channel.type === ChannelType.GuildText &&
      !interaction.channel.nsfw
    ) {
      throw new GuardException("You need to be in a NSFW channel");
    }
  }
}
