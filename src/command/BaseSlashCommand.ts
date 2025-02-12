import type {
  ApplicationCommandOptionData,
  AutocompleteInteraction,
  Awaitable,
  CacheType,
  ChatInputCommandInteraction,
  PermissionResolvable
} from "discord.js";
import type { BaseGuard, BaseGuardTypeMap } from "../guard/BaseGuard";
import type { Flucord } from "../lib/Flucord";

type BaseSlashCommandOptions = {
  name: string;
  description: string;
  category: string;
  guildPlusUser?: boolean;
  options?: ApplicationCommandOptionData[];
  guards?: BaseGuard<keyof BaseGuardTypeMap>[];
  permissions?: PermissionResolvable[];
};

export abstract class BaseSlashCommand {
  readonly flucord: Flucord;

  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly guildPlusUser: boolean;
  readonly options: ApplicationCommandOptionData[];
  readonly guards: BaseGuard<keyof BaseGuardTypeMap>[];
  readonly permissions: PermissionResolvable[];

  constructor(
    flucord: Flucord,
    {
      name,
      description,
      category,
      guildPlusUser = false,
      options = [],
      guards = [],
      permissions = []
    }: BaseSlashCommandOptions
  ) {
    this.flucord = flucord;

    this.name = name;
    this.description = description;
    this.category = category;
    this.options = options;
    this.guards = guards;
    this.permissions = permissions;
    this.guildPlusUser = guildPlusUser;
  }

  abstract execute(
    interaction: ChatInputCommandInteraction<CacheType>
  ): Awaitable<unknown>;

  autocompleteExecute?(
    //biome-ignore lint/correctness/noUnusedVariables:
    //biome-ignore lint/correctness/noUnusedFunctionParameters:
    interaction: AutocompleteInteraction<CacheType>
  ): Awaitable<unknown> {
    return null;
  }
}
