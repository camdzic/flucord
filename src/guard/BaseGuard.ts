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
  button: ButtonInteraction;
  stringSelectMenu: StringSelectMenuInteraction;
  channelSelectMenu: ChannelSelectMenuInteraction;
  roleSelectMenu: RoleSelectMenuInteraction;
  mentionableSelectMenu: MentionableSelectMenuInteraction;
  userSelectMenu: UserSelectMenuInteraction;
  any:
    | ChatInputCommandInteraction
    | MessageContextMenuCommandInteraction
    | UserContextMenuCommandInteraction
    | ButtonInteraction
    | StringSelectMenuInteraction
    | ChannelSelectMenuInteraction
    | RoleSelectMenuInteraction
    | MentionableSelectMenuInteraction
    | UserSelectMenuInteraction;
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
