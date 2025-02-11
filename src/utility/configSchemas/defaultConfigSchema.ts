import { z } from "zod";
import { colorResolvableSchema } from "./colorResolvableSchema";

export const defaultConfigSchema = z.object({
  token: z.string(),
  commands: z.object({
    enabled: z.boolean(),
    global: z.boolean(),
    guildId: z.string().nullable()
  }),
  colors: z.object({
    primary: colorResolvableSchema,
    success: colorResolvableSchema,
    error: colorResolvableSchema
  })
});
