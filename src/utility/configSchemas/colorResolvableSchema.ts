import { type ColorResolvable, resolveColor } from "discord.js";
import { z } from "zod";

export const colorResolvableSchema = z
  .custom<ColorResolvable>()
  .refine(value => {
    try {
      const resolvedColor = resolveColor(value);

      return !!resolvedColor;
    } catch {
      return false;
    }
  });
