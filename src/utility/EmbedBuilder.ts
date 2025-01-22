import {
  type ColorResolvable,
  EmbedBuilder as DJSEmbedBuilder
} from "discord.js";
import type { Flucord } from "../lib/Flucord";

export class EmbedBuilder {
  protected readonly flucord: Flucord;

  constructor(flucord: Flucord) {
    this.flucord = flucord;
  }

  normal() {
    return new DJSEmbedBuilder().setColor(
      this.flucord.settings.getString("colors.primary") as ColorResolvable
    );
  }

  success(message: string) {
    return new DJSEmbedBuilder()
      .setColor(
        this.flucord.settings.getString("colors.success") as ColorResolvable
      )
      .setDescription(`✅ **${message}**`);
  }

  error(message: string) {
    return new DJSEmbedBuilder()
      .setColor(
        this.flucord.settings.getString("colors.error") as ColorResolvable
      )
      .setDescription(`❌ **${message}**`);
  }
}
