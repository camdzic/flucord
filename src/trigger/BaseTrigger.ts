import type {
  ButtonInteraction,
  ChannelSelectMenuInteraction,
  MentionableSelectMenuInteraction,
  RoleSelectMenuInteraction,
  StringSelectMenuInteraction,
  UserSelectMenuInteraction
} from "discord.js";
import type { BaseGuard, BaseGuardTypeMap } from "../guard/BaseGuard";
import type { Flucord } from "../lib/Flucord";

export type BaseTriggerTypeMap = {
  button: ButtonInteraction;
  stringSelectMenu: StringSelectMenuInteraction;
  channelSelectMenu: ChannelSelectMenuInteraction;
  roleSelectMenu: RoleSelectMenuInteraction;
  mentionableSelectMenu: MentionableSelectMenuInteraction;
  userSelectMenu: UserSelectMenuInteraction;
};

type BaseTriggerOptions<T extends keyof BaseTriggerTypeMap> = {
  id: string;
  type: T;
  startsWith?: boolean;
  guards?: BaseGuard<keyof BaseGuardTypeMap>[];
};

export abstract class BaseTrigger<T extends keyof BaseTriggerTypeMap> {
  readonly flucord: Flucord;

  readonly id: string;
  readonly type: T;
  readonly startsWith: boolean;
  readonly guards: BaseGuard<keyof BaseGuardTypeMap>[];

  constructor(
    flucord: Flucord,
    { id, type, startsWith = false, guards = [] }: BaseTriggerOptions<T>
  ) {
    this.flucord = flucord;

    this.id = id;
    this.type = type;
    this.startsWith = startsWith;
    this.guards = guards;
  }

  abstract execute(interaction: BaseTriggerTypeMap[T]): unknown;
}
