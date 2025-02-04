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

  primary() {
    return new DJSEmbedBuilder().setColor(
      this.flucord.settings.getValue<ColorResolvable>("colors.primary")
    );
  }

  success(message: string) {
    return new DJSEmbedBuilder()
      .setColor(
        this.flucord.settings.getValue<ColorResolvable>("colors.success")
      )
      .setTitle("Success!")
      .setDescription(`✅ ${message}`);
  }

  error(message: string) {
    return new DJSEmbedBuilder()
      .setColor(this.flucord.settings.getValue<ColorResolvable>("colors.error"))
      .setTitle("Error!")
      .setDescription(`❌ ${message}`);
  }
}
