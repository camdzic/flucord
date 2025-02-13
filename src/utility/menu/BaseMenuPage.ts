import type {
  Awaitable,
  ButtonInteraction,
  CacheType,
  ChannelSelectMenuInteraction,
  CollectedInteraction,
  InteractionEditReplyOptions,
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

  abstract render(): Awaitable<
    InteractionEditReplyOptions & {
      content?: string;
    }
  >;

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

  handleButton?(interaction: ButtonInteraction<CacheType>): Awaitable<unknown>;
  handleStringSelectMenu?(
    interaction: StringSelectMenuInteraction<CacheType>
  ): Awaitable<unknown>;
  handleChannelSelectMenu?(
    interaction: ChannelSelectMenuInteraction<CacheType>
  ): Awaitable<unknown>;
  handleRoleSelectMenu?(
    interaction: RoleSelectMenuInteraction<CacheType>
  ): Awaitable<unknown>;
  handleMentionableSelectMenu?(
    interaction: MentionableSelectMenuInteraction<CacheType>
  ): Awaitable<unknown>;
  handleUserSelectMenu?(
    interaction: UserSelectMenuInteraction<CacheType>
  ): Awaitable<unknown>;
  handleModal?(
    interaction: ModalSubmitInteraction<CacheType>
  ): Awaitable<unknown>;
}
