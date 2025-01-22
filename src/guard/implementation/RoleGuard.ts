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
        "While executing RoleGuard, guild was not found"
      );
    }

    const hasRoles = this.roleIds.every(roleId =>
      interaction.member.roles.cache.has(roleId)
    );

    if (this.requireAllRoles && !hasRoles) {
      throw new GuardException("You do not have the required roles");
    }

    if (!this.requireAllRoles && !hasRoles) {
      throw new GuardException("You do not have the required roles");
    }
  }
}
