import {
  RoleSelectMenuBuilder,
  type RoleSelectMenuInteraction,
  SnowflakeUtil
} from "discord.js";
import type { Flucord } from "../../lib/Flucord";
import { deleteComponent } from "../../utility/Component";
import { Time } from "../../utility/constants/Time";

type RoleSelectMenuComponentBuilderExecuteOptions = {
  execute: (
    interaction: RoleSelectMenuInteraction,
    stop: () => void
  ) => unknown;
  expiredExecute?(id: string): unknown;
  allowedExecutorIds?: string[];
  executionThreshold?: number;
  renewOnInteract?: boolean;
};

export class RoleSelectMenuComponentBuilder extends RoleSelectMenuBuilder {
  setExecute(
    flucord: Flucord,
    {
      execute,
      expiredExecute,
      allowedExecutorIds = [],
      executionThreshold = Time.Minute * 5,
      renewOnInteract = false
    }: RoleSelectMenuComponentBuilderExecuteOptions
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

      deleteComponent(flucord, customId, "roleSelectMenu");
    }, executionThreshold);

    flucord.components.push({
      id: customId,
      type: "roleSelectMenu",
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
