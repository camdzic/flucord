import type {
  Awaitable,
  ButtonInteraction,
  ChannelSelectMenuInteraction,
  CollectedInteraction,
  InteractionReplyOptions,
  MentionableSelectMenuInteraction,
  ModalSubmitInteraction,
  RoleSelectMenuInteraction,
  StringSelectMenuInteraction,
  UserSelectMenuInteraction
} from "discord.js";
import type { Flucord } from "../../lib/Flucord";
import type { BaseMenu } from "./BaseMenu";

export abstract class BaseMenuPage<T> {
  readonly menu: BaseMenu<T>;

  readonly flucord: Flucord;
  state: T;

  constructor(menu: BaseMenu<T>) {
    this.menu = menu;

    this.state = menu.state;
    this.flucord = menu.flucord;
  }

  abstract setRenderer(): Awaitable<InteractionReplyOptions>;

  getRenderer() {
    return this.setRenderer();
  }

  handleInteraction(interaction: CollectedInteraction) {
    if (interaction.isButton() && this.handleButton) {
      return this.handleButton(interaction);
    }
    if (interaction.isStringSelectMenu() && this.handleStringSelectMenu) {
      return this.handleStringSelectMenu(interaction);
    }
    if (interaction.isChannelSelectMenu() && this.handleChannelSelectMenu) {
      return this.handleChannelSelectMenu(interaction);
    }
    if (interaction.isRoleSelectMenu() && this.handleRoleSelectMenu) {
      return this.handleRoleSelectMenu(interaction);
    }
    if (
      interaction.isMentionableSelectMenu() &&
      this.handleMentionableSelectMenu
    ) {
      return this.handleMentionableSelectMenu(interaction);
    }
    if (interaction.isUserSelectMenu() && this.handleUserSelectMenu) {
      return this.handleUserSelectMenu(interaction);
    }
    if (interaction.isModalSubmit() && this.handleModal) {
      return this.handleModal(interaction);
    }
  }

  handleButton?(interaction: ButtonInteraction): Awaitable<unknown>;
  handleStringSelectMenu?(
    interaction: StringSelectMenuInteraction
  ): Awaitable<unknown>;
  handleChannelSelectMenu?(
    interaction: ChannelSelectMenuInteraction
  ): Awaitable<unknown>;
  handleRoleSelectMenu?(
    interaction: RoleSelectMenuInteraction
  ): Awaitable<unknown>;
  handleMentionableSelectMenu?(
    interaction: MentionableSelectMenuInteraction
  ): Awaitable<unknown>;
  handleUserSelectMenu?(
    interaction: UserSelectMenuInteraction
  ): Awaitable<unknown>;
  handleModal?(interaction: ModalSubmitInteraction): Awaitable<unknown>;
}
