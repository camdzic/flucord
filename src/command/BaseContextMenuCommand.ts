import type {
  MessageContextMenuCommandInteraction,
  PermissionResolvable,
  UserContextMenuCommandInteraction
} from "discord.js";
import type { BaseGuard, BaseGuardTypeMap } from "../guard/BaseGuard";
import type { Flucord } from "../lib/Flucord";

export type BaseContextMenuCommandTypeMap = {
  messageContextMenuCommand: MessageContextMenuCommandInteraction;
  userContextMenuCommand: UserContextMenuCommandInteraction;
};

type BaseContextMenuCommandOptions<
  T extends keyof BaseContextMenuCommandTypeMap
> = {
  name: string;
  type: T;
  guildPlusUser?: boolean;
  guards?: BaseGuard<keyof BaseGuardTypeMap>[];
  permissions?: PermissionResolvable[];
};

export abstract class BaseContextMenuCommand<
  T extends keyof BaseContextMenuCommandTypeMap
> {
  readonly flucord: Flucord;

  readonly name: string;
  readonly type: T;
  readonly guildPlusUser?: boolean;
  readonly guards?: BaseGuard<keyof BaseGuardTypeMap>[];
  readonly permissions?: PermissionResolvable[];

  constructor(
    flucord: Flucord,
    {
      name,
      type,
      guildPlusUser = false,
      guards = [],
      permissions = []
    }: BaseContextMenuCommandOptions<T>
  ) {
    this.flucord = flucord;

    this.name = name;
    this.type = type;
    this.guildPlusUser = guildPlusUser;
    this.guards = guards;
    this.permissions = permissions;
  }

  abstract execute(interaction: BaseContextMenuCommandTypeMap[T]): unknown;
}
