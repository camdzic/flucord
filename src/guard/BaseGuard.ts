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
import type { GuardException } from "../exception/GuardException";

export type BaseGuardTypeMap = {
  slashCommand: ChatInputCommandInteraction;
  messageContextMenuCommand: MessageContextMenuCommandInteraction;
  userContextMenuCommand: UserContextMenuCommandInteraction;
  button: ButtonInteraction<"cached">;
  stringSelectMenu: StringSelectMenuInteraction<"cached">;
  channelSelectMenu: ChannelSelectMenuInteraction<"cached">;
  roleSelectMenu: RoleSelectMenuInteraction<"cached">;
  mentionableSelectMenu: MentionableSelectMenuInteraction<"cached">;
  userSelectMenu: UserSelectMenuInteraction<"cached">;
  any:
    | ChatInputCommandInteraction
    | MessageContextMenuCommandInteraction
    | UserContextMenuCommandInteraction
    | ButtonInteraction<"cached">
    | StringSelectMenuInteraction<"cached">
    | ChannelSelectMenuInteraction<"cached">
    | RoleSelectMenuInteraction<"cached">
    | MentionableSelectMenuInteraction<"cached">
    | UserSelectMenuInteraction<"cached">;
};

type BaseGuardOptions<T extends keyof BaseGuardTypeMap> = {
  types: T[];
};

export abstract class BaseGuard<T extends keyof BaseGuardTypeMap> {
  readonly types: T[];

  constructor({ types }: BaseGuardOptions<T>) {
    this.types = types;
  }

  abstract execute(interaction: BaseGuardTypeMap[T]): unknown | GuardException;
}
