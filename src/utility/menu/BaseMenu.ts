import {
  ActionRowBuilder,
  type CollectedInteraction,
  DiscordAPIError,
  InteractionCollector,
  type InteractionResponse,
  type Message,
  type MessageActionRowComponentBuilder,
  MessageFlags,
  type RepliableInteraction
} from "discord.js";
import { MenuException } from "../../exception/MenuException";
import type { Flucord } from "../../lib/Flucord";
import { Time } from "../constants/Time";
import type { BaseMenuPage } from "./BaseMenuPage";

export type BaseMenuOptions<T> = {
  state: T;
  threshold?: number;
  ephemeral?: boolean;
};

export class BaseMenu<T> {
  readonly flucord: Flucord;

  state: T;
  private readonly threshold: number;
  private readonly ephemeral: boolean;

  private page: BaseMenuPage<T>;
  private history: BaseMenuPage<T>[];

  private interaction: InteractionResponse;
  private message: Message;
  private collector: InteractionCollector<CollectedInteraction>;

  constructor(
    flucord: Flucord,
    {
      state,
      threshold = Time.Minute * 5,
      ephemeral = false
    }: BaseMenuOptions<T>
  ) {
    this.flucord = flucord;

    this.state = state;
    this.threshold = threshold;
    this.ephemeral = ephemeral;

    this.history = [];

    if (this.threshold > Time.Minute * 14) {
      this.threshold = Time.Minute * 14;
    }
  }

  setPage(page: BaseMenuPage<T>) {
    if (this.page) {
      this.history.push(this.page);
    }

    page.menu = this;
    page.flucord = this.flucord;
    this.page = page;

    return this;
  }

  back() {
    const lastPage = this.history.pop();

    if (!lastPage) {
      throw new MenuException("There is no page to go back to.");
    }

    this.page = lastPage;

    return this;
  }

  private setupInteractionCollector() {
    const startTime = Date.now();
    const maxDuration = Time.Minute * 14;

    this.collector = new InteractionCollector(this.message.client, {
      message: this.message,
      idle: this.threshold
    });

    this.collector.on("collect", async interaction => {
      try {
        if (interaction.isButton()) {
          if (!this.page.handleButton) {
            throw new MenuException(
              "Button interaction is not supported in this menu page."
            );
          }

          await this.page.handleButton(interaction);
        } else if (interaction.isStringSelectMenu()) {
          if (!this.page.handleStringSelectMenu) {
            throw new MenuException(
              "String select menu interaction is not supported in this menu page."
            );
          }

          await this.page.handleStringSelectMenu(interaction);
        } else if (interaction.isChannelSelectMenu()) {
          if (!this.page.handleChannelSelectMenu) {
            throw new MenuException(
              "Channel select menu interaction is not supported in this menu page."
            );
          }

          await this.page.handleChannelSelectMenu(interaction);
        } else if (interaction.isRoleSelectMenu()) {
          if (!this.page.handleRoleSelectMenu) {
            throw new MenuException(
              "Role select menu interaction is not supported in this menu page."
            );
          }

          await this.page.handleRoleSelectMenu(interaction);
        } else if (interaction.isMentionableSelectMenu()) {
          if (!this.page.handleMentionableSelectMenu) {
            throw new MenuException(
              "Mentionable select menu interaction is not supported in this menu page."
            );
          }

          await this.page.handleMentionableSelectMenu(interaction);
        } else if (interaction.isUserSelectMenu()) {
          if (!this.page.handleUserSelectMenu) {
            throw new MenuException(
              "User select menu interaction is not supported in this menu page."
            );
          }

          await this.page.handleUserSelectMenu(interaction);
        } else if (interaction.isModalSubmit() && interaction.isFromMessage()) {
          if (!this.page.handleModal) {
            throw new MenuException(
              "Modal submit interaction is not supported in this menu page."
            );
          }

          await this.page.handleModal(interaction);
        }

        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.min(
          this.threshold,
          maxDuration - elapsedTime
        );

        this.collector.resetTimer({
          idle: remainingTime
        });
      } catch (error) {
        this.flucord.logger.error("Failed to execute menu interaction");

        if (!(error instanceof DiscordAPIError)) {
          this.flucord.logger.error(error);
        }
      }

      this.message = await interaction.fetchReply();
    });

    this.collector.on("end", () => this.handleEnd());
  }

  private handleEnd() {
    if (this.page.handleEnd) {
      this.page.handleEnd();
    }

    const updatedComponents = this.message.components.map(row =>
      ActionRowBuilder.from<MessageActionRowComponentBuilder>(row)
    );

    for (const row of updatedComponents) {
      for (const component of row.components) {
        component.setDisabled(true);
      }
    }

    if (Date.now() - this.interaction.createdTimestamp < Time.Minute * 15) {
      return this.interaction.edit({ components: updatedComponents });
    }
  }

  //biome-ignore lint/suspicious/useAwait:
  async render() {
    if (!this.page) {
      throw new MenuException("No page is set for the menu.");
    }

    return this.page.render();
  }

  async start(interaction: RepliableInteraction) {
    const sendData = await this.render();

    this.interaction = await interaction.reply({
      ...sendData,
      flags: this.ephemeral ? [MessageFlags.Ephemeral] : []
    });
    this.message = await this.interaction.fetch();

    this.setupInteractionCollector();
  }

  stop() {
    this.collector.stop();
  }
}
