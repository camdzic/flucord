import type { ClientEvents } from "discord.js";
import type { Flucord } from "../lib/Flucord";

type BaseEventOptions<K extends keyof ClientEvents> = {
  event: K;
  once?: boolean;
};

export abstract class BaseEvent<K extends keyof ClientEvents> {
  readonly flucord: Flucord;

  readonly event: K;
  readonly once: boolean;

  constructor(flucord: Flucord, { event, once = false }: BaseEventOptions<K>) {
    this.flucord = flucord;

    this.event = event;
    this.once = once;
  }

  abstract execute(...args: ClientEvents[K]): unknown;
}
