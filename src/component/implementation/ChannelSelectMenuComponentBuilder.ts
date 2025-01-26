import {
  ChannelSelectMenuBuilder,
  type ChannelSelectMenuInteraction,
  SnowflakeUtil
} from "discord.js";
import type { Flucord } from "../../lib/Flucord";
import { deleteComponent } from "../../utility/Component";
import { Time } from "../../utility/constants/Time";

type ChannelSelectMenuComponentBuilderExecuteOptions = {
  execute: (
    interaction: ChannelSelectMenuInteraction,
    stop: () => void
  ) => unknown;
  expiredExecute?(id: string): unknown;
  allowedExecutorIds?: string[];
  executionThreshold?: number;
  renewOnInteract?: boolean;
};

export class ChannelSelectMenuComponentBuilder extends ChannelSelectMenuBuilder {
  setExecute(
    flucord: Flucord,
    {
      execute,
      expiredExecute,
      allowedExecutorIds = [],
      executionThreshold = Time.Minute * 5,
      renewOnInteract = false
    }: ChannelSelectMenuComponentBuilderExecuteOptions
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

      deleteComponent(flucord, customId, "channelSelectMenu");
    }, executionThreshold);

    flucord.components.push({
      id: customId,
      type: "channelSelectMenu",
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
