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
  ) {
    if (!interaction.inCachedGuild()) {
      throw new GuardExecutionFailException(
        `While executing ${this.constructor.name}, guild was not found`
      );
    }

    const hasRoles = this.roleIds.every(roleId =>
      interaction.member.roles.cache.has(roleId)
    );

    if (this.requireAllRoles && !hasRoles) {
      throw new GuardException("You need all the required roles");
    }

    if (!this.requireAllRoles && !hasRoles) {
      throw new GuardException("You need at least one of the required roles");
    }
  }
}
