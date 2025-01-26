import {
  SnowflakeUtil,
  UserSelectMenuBuilder,
  type UserSelectMenuInteraction
} from "discord.js";
import type { Flucord } from "../../lib/Flucord";
import { deleteComponent } from "../../utility/Component";
import { Time } from "../../utility/constants/Time";

type UserSelectMenuComponentBuilderExecuteOptions = {
  execute: (
    interaction: UserSelectMenuInteraction,
    stop: () => void
  ) => unknown;
  expiredExecute?(id: string): unknown;
  allowedExecutorIds?: string[];
  executionThreshold?: number;
  renewOnInteract?: boolean;
};

export class UserSelectMenuComponentBuilder extends UserSelectMenuBuilder {
  setExecute(
    flucord: Flucord,
    {
      execute,
      expiredExecute,
      allowedExecutorIds = [],
      executionThreshold = Time.Minute * 5,
      renewOnInteract = false
    }: UserSelectMenuComponentBuilderExecuteOptions
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

      deleteComponent(flucord, customId, "userSelectMenu");
    }, executionThreshold);

    flucord.components.push({
      id: customId,
      type: "userSelectMenu",
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
