import type { CacheType, RepliableInteraction } from "discord.js";
import type { Flucord } from "../../../lib/Flucord";
import { BaseEvent } from "../../BaseEvent";

export class TriggerErrorEvent extends BaseEvent<"triggerError"> {
  constructor(flucord: Flucord) {
    super(flucord, {
      event: "triggerError"
    });
  }

  execute(_interaction: RepliableInteraction<CacheType>, error: unknown) {
    this.flucord.logger.error("An error occurred while executing a trigger");
    this.flucord.logger.error(error);
  }
}
