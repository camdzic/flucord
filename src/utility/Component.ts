import {
  ActionRowBuilder,
  type ButtonInteraction,
  type ChannelSelectMenuInteraction,
  type ChatInputCommandInteraction,
  type MentionableSelectMenuInteraction,
  type Message,
  type MessageActionRowComponentBuilder,
  type MessageContextMenuCommandInteraction,
  type ModalMessageModalSubmitInteraction,
  type RoleSelectMenuInteraction,
  type StringSelectMenuInteraction,
  type UserContextMenuCommandInteraction,
  type UserSelectMenuInteraction
} from "discord.js";
import type { BaseComponentTypeMap } from "../component/BaseComponent";
import type { Flucord } from "../lib/Flucord";
import { Time } from "./constants/Time";

export function cleanExpiredComponents(
  interaction:
    | ChatInputCommandInteraction
    | MessageContextMenuCommandInteraction
    | UserContextMenuCommandInteraction
    | ButtonInteraction
    | StringSelectMenuInteraction
    | ChannelSelectMenuInteraction
    | RoleSelectMenuInteraction
    | MentionableSelectMenuInteraction
    | UserSelectMenuInteraction
    | ModalMessageModalSubmitInteraction,
  message: Message,
  id: string
) {
  const updatedComponents = message.components.map(row =>
    ActionRowBuilder.from<MessageActionRowComponentBuilder>(row)
  );

  for (const row of updatedComponents) {
    for (const component of row.components) {
      //@ts-ignore
      if (component.data.custom_id === id) {
        component.setDisabled(true);
      }
    }
  }

  if (Date.now() - interaction.createdTimestamp < Time.Minute * 15) {
    return interaction.editReply({ components: updatedComponents });
  }
}

export function deleteComponent(
  flucord: Flucord,
  customId: string,
  type: keyof BaseComponentTypeMap
) {
  flucord.components = flucord.components.filter(
    component => component.id !== customId || component.type !== type
  );
}
