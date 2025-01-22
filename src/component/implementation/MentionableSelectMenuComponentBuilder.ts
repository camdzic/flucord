import {
  MentionableSelectMenuBuilder,
  type MentionableSelectMenuInteraction,
  SnowflakeUtil
} from "discord.js";
import type { Flucord } from "../../lib/Flucord";
import { deleteComponent } from "../../utility/Component";
import { Time } from "../../utility/constants/Time";

type MentionableSelectMenuComponentBuilderExecuteOptions = {
  execute: (
    interaction: MentionableSelectMenuInteraction,
    stop: () => void
  ) => unknown;
  expiredExecute?(id: string): unknown;
  allowedExecutorIds?: string[];
  executionThreshold?: number;
  renewOnInteract?: boolean;
};

export class MentionableSelectMenuComponentBuilder extends MentionableSelectMenuBuilder {
  setExecute(
    flucord: Flucord,
    {
      execute,
      expiredExecute,
      allowedExecutorIds = [],
      executionThreshold = Time.Minute * 5,
      renewOnInteract = false
    }: MentionableSelectMenuComponentBuilderExecuteOptions
  ) {
    const customId = SnowflakeUtil.generate().toString();

    this.setCustomId(customId);

    if (executionThreshold > Time.Minute * 10) {
      executionThreshold = Time.Minute * 10;
    }

    const timeout = setTimeout(() => {
      if (expiredExecute) {
        expiredExecute(customId);
      }

      deleteComponent(flucord, customId, "mentionableSelectMenu");
    }, executionThreshold);

    flucord.components.push({
      id: customId,
      type: "mentionableSelectMenu",
      allowedExecutorIds,
      executionThreshold,
      renewOnInteract,
      timeout,
      execute,
      expiredExecute
    });

    return this;
  }
}
