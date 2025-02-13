import type { BaseGuardIdentifier } from "../guard/BaseGuardIdentifier";

export type GuardErrorOptions = {
  name: BaseGuardIdentifier;
  message: string;
  silent?: boolean;
};

export class GuardError extends Error {
  readonly name: BaseGuardIdentifier;
  readonly silent: boolean;

  constructor({ name, message, silent = false }: GuardErrorOptions) {
    super(message);

    this.name = name;
    this.silent = silent;
  }
}
