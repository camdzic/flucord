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
import { CooldownGuardException } from "../../../exception/CooldownGuardException";
import { GuardException } from "../../../exception/GuardException";
import { GuardExecutionFailException } from "../../../exception/GuardExecutionFailException";
import { NestedGuardException } from "../../../exception/NestedGuardException";
import { BaseGuard, type BaseGuardTypeMap } from "../../BaseGuard";

export class OrGuard extends BaseGuard<"any"> {
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

    const results = allowedGuards.map(async guard => {
      try {
        await guard.execute(interaction);
        return true;
      } catch (error) {
        if (error instanceof GuardException) {
          return error.message;
        }
        if (error instanceof GuardExecutionFailException) {
          return error.message;
        }
        if (error instanceof CooldownGuardException) {
          return error.message;
        }
      }
    });

    const resolvedResults = await Promise.all(results);

    if (resolvedResults.length) {
      const errorMessages = resolvedResults.filter(
        result => typeof result === "string"
      );

      throw new NestedGuardException(
        `Failed to pass one or more guards:\n\n${errorMessages.map((message, i) => `${i}. **${message}**`).join("\n")}`
      );
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
