import { Result } from "@sapphire/result";
import type {
  Awaitable,
  ButtonInteraction,
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
import { GuardError } from "../error/GuardError";

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
  modal: ModalSubmitInteraction;
  any:
    | ChatInputCommandInteraction
    | MessageContextMenuCommandInteraction
    | UserContextMenuCommandInteraction
    | ButtonInteraction
    | StringSelectMenuInteraction
    | ChannelSelectMenuInteraction
    | RoleSelectMenuInteraction
    | MentionableSelectMenuInteraction
    | UserSelectMenuInteraction
    | ModalSubmitInteraction;
};

type BaseGuardOptions<T extends keyof BaseGuardTypeMap> = {
  types: T[];
};

export abstract class BaseGuard<T extends keyof BaseGuardTypeMap> {
  readonly types: T[];

  constructor({ types }: BaseGuardOptions<T>) {
    this.types = types;
  }

  abstract execute(
    interaction: BaseGuardTypeMap[T]
  ): Awaitable<Result<unknown, GuardError>>;

  ok() {
    return Result.ok();
  }

  error(message: string) {
    return Result.err(new GuardError(message));
  }
}
