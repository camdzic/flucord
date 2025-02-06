import {
  type ColorResolvable,
  EmbedBuilder as DJSEmbedBuilder
} from "discord.js";
import type { Flucord } from "../lib/Flucord";

export class EmbedBuilder {
  protected readonly flucord: Flucord;

  readonly primary: () => DJSEmbedBuilder;

  constructor(flucord: Flucord) {
    this.flucord = flucord;

    this.primary = () => {
      return new DJSEmbedBuilder().setColor(
        this.flucord.settings.getValue<ColorResolvable>("colors.primary")
      );
    };

    Object.defineProperty(this, "primary", {
      configurable: false,
      enumerable: false,
      writable: false
    });
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
