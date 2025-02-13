import {
  type CacheType,
  MessageFlags,
  type RepliableInteraction
} from "discord.js";
import type { GuardError } from "../../../error/GuardError";
import type { Flucord } from "../../../lib/Flucord";
import { BaseEvent } from "../../BaseEvent";

export class GuardErrorEvent extends BaseEvent<"guardError"> {
  constructor(flucord: Flucord) {
    super(flucord, {
      event: "guardError"
    });
  }

  execute(interaction: RepliableInteraction<CacheType>, error: GuardError) {
    if (error.silent) return;

    return interaction.reply({
      embeds: [this.flucord.embeds.error(error.message)],
      flags: MessageFlags.Ephemeral
    });
  }
}
