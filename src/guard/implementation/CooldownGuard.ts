import type {
  CacheType,
  ChatInputCommandInteraction,
  MessageContextMenuCommandInteraction,
  UserContextMenuCommandInteraction
} from "discord.js";
import { CooldownGuardException } from "../../exception/CooldownGuardException";
import { GuardExecutionFailException } from "../../exception/GuardExecutionFailException";
import { Time } from "../../utility/constants/Time";
import { BaseGuard } from "../BaseGuard";

export class CooldownGuard extends BaseGuard<
  "slashCommand" | "userContextMenuCommand" | "messageContextMenuCommand"
> {
  private readonly cooldownTime: number;

  private readonly cooldowns = new Map<string, number>();

  constructor(cooldownTime: number) {
    super({
      types: [
        "slashCommand",
        "messageContextMenuCommand",
        "userContextMenuCommand"
      ]
    });

    this.cooldownTime = cooldownTime;
  }

  execute(
    interaction:
      | ChatInputCommandInteraction<CacheType>
      | UserContextMenuCommandInteraction<CacheType>
      | MessageContextMenuCommandInteraction<CacheType>
  ) {
    if (!interaction.inCachedGuild()) {
      throw new GuardExecutionFailException(
        "While executing CooldownGuard, guild was not found"
      );
    }

    if (interaction.member.permissions.has("ManageGuild")) return;

    const key = `cooldown:${interaction.commandName}:${interaction.guildId}:${interaction.user.id}`;
    const now = Date.now();
    const cooldownEnd = this.cooldowns.get(key);

    if (cooldownEnd && cooldownEnd > now) {
      throw new CooldownGuardException(
        `You can use this command again in \`${this.formatCooldownTime(
          cooldownEnd - now
        )}\``
      );
    }

    this.cooldowns.set(key, now + this.cooldownTime);

    setTimeout(() => this.cooldowns.delete(key), this.cooldownTime);
  }

  private formatCooldownTime(remainingTime: number): string {
    const units = [
      { label: "d", value: Time.Day },
      { label: "h", value: Time.Hour },
      { label: "m", value: Time.Minute },
      { label: "s", value: Time.Second }
    ];

    for (const { label, value } of units) {
      const time = remainingTime / value;
      if (time >= 1) {
        return `${time.toFixed(2)}${label}`;
      }
    }

    return `${remainingTime}ms`;
  }
}
