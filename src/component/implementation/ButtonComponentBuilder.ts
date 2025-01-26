import {
  ButtonBuilder,
  type ButtonInteraction,
  SnowflakeUtil
} from "discord.js";
import type { Flucord } from "../../lib/Flucord";
import { deleteComponent } from "../../utility/Component";
import { Time } from "../../utility/constants/Time";

type ButtonComponentBuilderExecuteOptions = {
  execute: (interaction: ButtonInteraction, stop: () => void) => unknown;
  expiredExecute?(id: string): unknown;
  allowedExecutorIds?: string[];
  executionThreshold?: number;
  renewOnInteract?: boolean;
};

export class ButtonComponentBuilder extends ButtonBuilder {
  setExecute(
    flucord: Flucord,
    {
      execute,
      expiredExecute,
      allowedExecutorIds = [],
      executionThreshold = Time.Minute * 5,
      renewOnInteract = false
    }: ButtonComponentBuilderExecuteOptions
  ) {
    const customId = SnowflakeUtil.generate().toString();

    this.setCustomId(customId);

    if (executionThreshold > Time.Minute * 14) {
      executionThreshold = Time.Minute * 14;
    }

    const timeoutStartTime = Date.now();
    const timeout = setTimeout(() => {
      if (expiredExecute) {
        expiredExecute(customId);
      }

      deleteComponent(flucord, customId, "button");
    }, executionThreshold);

    flucord.components.push({
      id: customId,
      type: "button",
      allowedExecutorIds,
      executionThreshold,
      renewOnInteract,
      timeout,
      timeoutCreatedAt: timeoutStartTime,
      execute,
      expiredExecute
    });

    return this;
  }
}
