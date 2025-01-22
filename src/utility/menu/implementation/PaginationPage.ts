import {
  ActionRowBuilder,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  MessageFlags,
  ModalBuilder,
  type ModalMessageModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
  type User
} from "discord.js";
import { BaseMenuPage, type BaseMenuPageRenderResult } from "../BaseMenuPage";

type PaginationPageOptions = {
  pages: BaseMenuPageRenderResult[];
};

export class PaginationPage extends BaseMenuPage<PaginationPageState> {
  pages: BaseMenuPageRenderResult[];
  currentPage: number;

  constructor({ pages }: PaginationPageOptions) {
    super();

    this.pages = pages;
    this.currentPage = 0;
  }

  render() {
    return {
      ...this.pages[this.currentPage],
      components: [
        new ActionRowBuilder<ButtonBuilder>().setComponents(
          new ButtonBuilder()
            .setEmoji("⬅️")
            .setStyle(ButtonStyle.Primary)
            .setCustomId("back")
            .setDisabled(this.currentPage === 0),
          new ButtonBuilder()
            .setLabel(`Page ${this.currentPage + 1}/${this.pages.length}`)
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("selectPage"),
          new ButtonBuilder()
            .setEmoji("➡️")
            .setStyle(ButtonStyle.Primary)
            .setCustomId("next")
            .setDisabled(this.currentPage === this.pages.length - 1)
        )
      ]
    };
  }

  handleButton(interaction: ButtonInteraction) {
    if (interaction.user.id !== this.state.interactor.id) {
      return interaction.reply({
        embeds: [
          this.flucord.embeds.error(
            "This component is meant for someone else to execute"
          )
        ],
        flags: MessageFlags.Ephemeral
      });
    }

    if (interaction.customId === "selectPage") {
      return interaction.showModal(
        new ModalBuilder()
          .setTitle("Select Page")
          .setCustomId("selectPage")
          .setComponents(
            new ActionRowBuilder<TextInputBuilder>().setComponents(
              new TextInputBuilder()
                .setLabel("Page Number")
                .setPlaceholder("Enter a page number...")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMinLength(1)
                .setMaxLength(this.pages.length.toString().length)
                .setCustomId("pageNumber")
            )
          )
      );
    }

    switch (interaction.customId) {
      case "back":
        this.currentPage--;
        break;
      case "next":
        this.currentPage++;
        break;
    }

    return interaction.update(this.render());
  }

  handleModal(interaction: ModalMessageModalSubmitInteraction) {
    const pageNumber = interaction.fields.getTextInputValue("pageNumber");
    const parsedPageNumber = Number.parseInt(pageNumber);

    if (parsedPageNumber >= 1 && parsedPageNumber <= this.pages.length) {
      this.currentPage = parsedPageNumber - 1;
    } else {
      return interaction.reply({
        embeds: [
          this.flucord.embeds.error(
            `Invalid page number. Please enter a number between 1 and ${this.pages.length}.`
          )
        ],
        flags: MessageFlags.Ephemeral
      });
    }

    return interaction.update(this.render());
  }
}

type PaginationPageState = {
  interactor: User;
};
