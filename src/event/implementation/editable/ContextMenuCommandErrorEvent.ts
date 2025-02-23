import type { CacheType, ContextMenuCommandInteraction } from "discord.js";
import type { Flucord } from "../../../lib/Flucord";
import { BaseEvent } from "../../BaseEvent";

export class ContextMenuCommandErrorEvent extends BaseEvent<"contextMenuCommandError"> {
  constructor(flucord: Flucord) {
    super(flucord, {
      event: "contextMenuCommandError"
    });
  }

  execute(
    _interaction: ContextMenuCommandInteraction<CacheType>,
    error: unknown
  ) {
    this.flucord.logger.error(
      "An error occurred while executing a context menu command"
    );
    this.flucord.logger.error(error);
  }
}
