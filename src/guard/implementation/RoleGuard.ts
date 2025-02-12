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

export class RoleGuard extends BaseGuard<"any"> {
  private readonly requireAllRoles: boolean;
  private readonly roleIds: string[];

  constructor(requireAllRoles: boolean, ...roleIds: string[]) {
    super({
      types: ["any"]
    });

    this.requireAllRoles = requireAllRoles;
    this.roleIds = roleIds;
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
      return this.error("Interaction guild is not available.");
    }

    const hasRoles = this.roleIds.every(roleId =>
      interaction.member.roles.cache.has(roleId)
    );

    if (this.requireAllRoles && !hasRoles) {
      return this.error(
        "You can only use this if you have all the required roles."
      );
    }

    if (!this.requireAllRoles && !hasRoles) {
      return this.error(
        "You can only use this if you have at least one of the required roles."
      );
    }

    return this.ok();
  }
}
