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
      | ModalSubmitInteraction<CacheType>
  ) {
    if (!interaction.inCachedGuild()) {
      return this.error({
        name: "interactionGuildNotAvailable",
        message: "Interaction guild is not available."
      });
    }

    if (interaction.guild.ownerId !== interaction.user.id) {
      return this.error({
        name: "interactionGuildOwnerOnly",
        message: "You can only use this if you are the server owner."
      });
    }

    return this.ok();
  }
}
