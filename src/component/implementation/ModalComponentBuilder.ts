import {
  ModalBuilder,
  type ModalMessageModalSubmitInteraction,
  SnowflakeUtil
} from "discord.js";
import type { Flucord } from "../../lib/Flucord";
import { deleteComponent } from "../../utility/Component";
import { Time } from "../../utility/constants/Time";

type ModalComponentBuilderExecuteOptions = {
  execute: (interaction: ModalMessageModalSubmitInteraction) => unknown;
  executionThreshold?: number;
};

export class ModalComponentBuilder extends ModalBuilder {
  setExecute(
    flucord: Flucord,
    {
      execute,
      executionThreshold = Time.Minute * 5
    }: ModalComponentBuilderExecuteOptions
  ) {
    const customId = SnowflakeUtil.generate().toString();

    this.setCustomId(customId);

    if (executionThreshold > Time.Minute * 10) {
      executionThreshold = Time.Minute * 10;
    }

    const timeout = setTimeout(() => {
      deleteComponent(flucord, customId, "modal");
    }, executionThreshold);

    flucord.components.push({
      id: customId,
      type: "modal",
      allowedExecutorIds: [],
      executionThreshold,
      renewOnInteract: false,
      timeout,
      execute
    });

    return this;
  }
}
