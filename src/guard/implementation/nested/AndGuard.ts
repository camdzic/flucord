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
import { GuardException } from "../../../exception/GuardException";
import { BaseGuard, type BaseGuardTypeMap } from "../../BaseGuard";

export class AndGuard extends BaseGuard<"any"> {
  private readonly guards: BaseGuard<keyof BaseGuardTypeMap>[];

  constructor(...guards: BaseGuard<keyof BaseGuardTypeMap>[]) {
    super({
      types: ["any"]
    });

    this.guards = guards;
  }

  async execute(
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
    const allowedGuards = this.guards.filter(g =>
      this.isSpecificGuard(g, this.getInteractionType(interaction))
    );

    for (const guard of allowedGuards) {
      try {
        await guard.execute(interaction);
      } catch {
        throw new GuardException(
          `Guard ${guard.constructor.name} failed in ${this.constructor.name}`
        );
      }
    }
  }

  private isSpecificGuard(
    guard: BaseGuard<keyof BaseGuardTypeMap>,
    type: keyof BaseGuardTypeMap
  ): guard is BaseGuard<typeof type> | BaseGuard<"any"> {
    return guard.types.includes(type) || guard.types.includes("any");
  }

  private getInteractionType(
    interaction:
      | ChatInputCommandInteraction
      | MessageContextMenuCommandInteraction
      | UserContextMenuCommandInteraction
      | ButtonInteraction
      | StringSelectMenuInteraction
      | ChannelSelectMenuInteraction
      | RoleSelectMenuInteraction
      | MentionableSelectMenuInteraction
      | UserSelectMenuInteraction
      | ModalSubmitInteraction
  ): keyof BaseGuardTypeMap {
    if (interaction.isChatInputCommand()) return "slashCommand";
    if (interaction.isMessageContextMenuCommand())
      return "messageContextMenuCommand";
    if (interaction.isUserContextMenuCommand()) return "userContextMenuCommand";
    if (interaction.isButton()) return "button";
    if (interaction.isStringSelectMenu()) return "stringSelectMenu";
    if (interaction.isChannelSelectMenu()) return "channelSelectMenu";
    if (interaction.isRoleSelectMenu()) return "roleSelectMenu";
    if (interaction.isMentionableSelectMenu()) return "mentionableSelectMenu";
    if (interaction.isUserSelectMenu()) return "userSelectMenu";
    if (interaction.isModalSubmit()) return "modal";

    throw new Error("Unknown interaction type");
  }
}
