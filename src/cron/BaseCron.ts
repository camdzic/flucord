import type { CRON } from "ts-cron-validator";
import type { Flucord } from "../lib/Flucord";
import type { timeZonesNames } from "../utility/constants/TimeZoneName";

//biome-ignore format:
type TimeZone = typeof timeZonesNames[number];

type BaseCronOptions<T extends string> = {
  format: CRON<T> extends T ? T : never;
  timezone?: TimeZone;
};

export abstract class BaseCron<T extends string> {
  readonly flucord: Flucord;

  readonly format: CRON<T> extends T ? T : never;
  readonly timezone: TimeZone;

  constructor(
    flucord: Flucord,
    { format, timezone = flucord.defaultTimezone }: BaseCronOptions<T>
  ) {
    this.flucord = flucord;

    this.format = format;
    this.timezone = timezone;
  }

  abstract execute(): unknown;
}
