import type { Awaitable } from "discord.js";
import type { CRON } from "ts-cron-validator";
import type { Flucord } from "../lib/Flucord";
import type { timeZonesNames } from "../utility/constants/TimeZoneName";

//biome-ignore format:
export type TimeZone = typeof timeZonesNames[number];

type BaseCronOptions<T extends string> = {
  format: CRON<T> extends never ? never : T;
  timezone?: TimeZone;
};

export abstract class BaseCron<T extends string> {
  readonly flucord: Flucord;

  readonly format: CRON<T> extends never ? never : T;
  readonly timezone: TimeZone;

  constructor(
    flucord: Flucord,
    { format, timezone = flucord.defaultTimezone }: BaseCronOptions<T>
  ) {
    this.flucord = flucord;

    this.format = format;
    this.timezone = timezone;
  }

  abstract execute(): Awaitable<unknown>;
}
