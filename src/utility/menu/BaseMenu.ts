import {
  ActionRowBuilder,
  type Awaitable,
  type CollectedInteraction,
  InteractionCollector,
  type Message,
  type MessageActionRowComponentBuilder,
  MessageFlags,
  type RepliableInteraction
} from "discord.js";
import { MenuError } from "../../error/MenuError";
import type { Flucord } from "../../lib/Flucord";
import { Time } from "../constants/Time";
import type { BaseMenuPage } from "./BaseMenuPage";

type BaseMenuFilter = (interaction: CollectedInteraction) => Awaitable<boolean>;

type BaseMenuOptions<T> = {
  state: T;
  threshold?: number;
  ephemeral?: boolean;
  filter?: BaseMenuFilter;
};

export class BaseMenu<T> {
  readonly flucord: Flucord;

  state: T;
  private readonly threshold: number;
  private readonly ephemeral: boolean;
  private readonly filter: BaseMenuFilter;

  private currentPage: BaseMenuPage<T>;
  private pageHistory: BaseMenuPage<T>[];

  message: Message;
  private collector: InteractionCollector<CollectedInteraction>;

  constructor(
    flucord: Flucord,
    {
      state,
      threshold = Time.Minute * 5,
      ephemeral = false,
      filter = () => true
    }: BaseMenuOptions<T>
  ) {
    this.flucord = flucord;

    this.state = state;
    this.threshold = threshold;
    this.ephemeral = ephemeral;
    this.filter = filter;

    this.pageHistory = [];
  }

  navigate(page: BaseMenuPage<T>) {
    if (this.currentPage) {
      this.pageHistory.push(this.currentPage);
    }

    this.currentPage = page;

    return this;
  }

  back() {
    const previousPage = this.pageHistory.pop();

    if (!previousPage) {
      throw new MenuError("No previous page to navigate to");
    }

    this.currentPage = previousPage;

    return this;
  }

  async stop(disableComponents = true) {
    this.collector.stop();

    if (disableComponents) {
      await this.disableComponents();
    }

    return this;
  }

  async start(interaction: RepliableInteraction) {
    const renderedPage = await this.currentPage.getRenderer();

    if (interaction.deferred || interaction.replied) {
      this.message = await interaction.editReply(renderedPage);
    } else {
      const messageResponse = await interaction.reply({
        ...renderedPage,
        flags: this.ephemeral ? MessageFlags.Ephemeral : undefined,
        withResponse: true
      });

      if (!messageResponse.resource || !messageResponse.resource.message) {
        throw new MenuError("Failed to reply to interaction");
      }

      this.message = messageResponse.resource.message;
    }

    this.setupCollector();

    return this;
  }

  private setupCollector() {
    this.collector = new InteractionCollector(this.flucord.client, {
      message: this.message,
      idle: this.threshold,
      filter: this.filter
    });

    this.collector.on("collect", async interaction => {
      await this.currentPage.handleInteraction(interaction);

      this.collector.resetTimer({ idle: this.threshold });
    });
  }

  private async disableComponents() {
    if (
      this.message.editable &&
      !this.message.flags.has(MessageFlags.Ephemeral)
    ) {
      const disabledComponents = this.message.components.map(row =>
        ActionRowBuilder.from<MessageActionRowComponentBuilder>(row)
      );

      for (const row of disabledComponents) {
        for (const component of row.components) {
          component.setDisabled(true);
        }
      }

      await this.message.edit({ components: disabledComponents });
    }
  }
}
