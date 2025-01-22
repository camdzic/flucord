import type {
  ButtonInteraction,
  ChannelSelectMenuInteraction,
  InteractionEditReplyOptions,
  MentionableSelectMenuInteraction,
  ModalMessageModalSubmitInteraction,
  RoleSelectMenuInteraction,
  StringSelectMenuInteraction,
  UserSelectMenuInteraction
} from "discord.js";
import type { Flucord } from "../../lib/Flucord";
import type { BaseMenu } from "./BaseMenu";

type Awaitable<T> = PromiseLike<T> | T;

export type BaseMenuPageRenderResult = InteractionEditReplyOptions & {
  content?: string | undefined;
};

export abstract class BaseMenuPage<T = unknown> {
  flucord: Flucord;
  menu: BaseMenu<T>;

  get state() {
    return this.menu.state;
  }

  handleButton?(interaction: ButtonInteraction): unknown;
  handleStringSelectMenu?(interaction: StringSelectMenuInteraction): unknown;
  handleChannelSelectMenu?(interaction: ChannelSelectMenuInteraction): unknown;
  handleRoleSelectMenu?(interaction: RoleSelectMenuInteraction): unknown;
  handleMentionableSelectMenu?(
    interaction: MentionableSelectMenuInteraction
  ): unknown;
  handleUserSelectMenu?(interaction: UserSelectMenuInteraction): unknown;
  handleModal?(interaction: ModalMessageModalSubmitInteraction): unknown;

  handleEnd?(): unknown;

  abstract render(): Awaitable<BaseMenuPageRenderResult>;
}
