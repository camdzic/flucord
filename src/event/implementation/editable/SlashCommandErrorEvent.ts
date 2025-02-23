import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import type { Flucord } from "../../../lib/Flucord";
import { BaseEvent } from "../../BaseEvent";

export class SlashCommandErrorEvent extends BaseEvent<"slashCommandError"> {
  constructor(flucord: Flucord) {
    super(flucord, {
      event: "slashCommandError"
    });
  }

  execute(
    _interaction: ChatInputCommandInteraction<CacheType>,
    error: unknown
  ) {
    this.flucord.logger.error(
      "An error occurred while executing a slash command"
    );
    this.flucord.logger.error(error);
  }
}
