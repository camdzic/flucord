import type { AutocompleteInteraction, CacheType } from "discord.js";
import type { Flucord } from "../../../lib/Flucord";
import { BaseEvent } from "../../BaseEvent";

export class SlashCommandAutoCompleteErrorEvent extends BaseEvent<"slashCommandAutoCompleteError"> {
  constructor(flucord: Flucord) {
    super(flucord, {
      event: "slashCommandAutoCompleteError"
    });
  }

  execute(_interaction: AutocompleteInteraction<CacheType>, error: unknown) {
    this.flucord.logger.error(
      "An error occurred while executing a slash command autocomplete"
    );
    this.flucord.logger.error(error);
  }
}
