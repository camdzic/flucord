export type GuardErrorOptions = {
  name: string;
  message: string;
  silent?: boolean;
};

export class GuardError extends Error {
  readonly name: string;
  readonly silent: boolean;

  constructor({ name, message, silent = false }: GuardErrorOptions) {
    super(message);

    this.name = name;
    this.silent = silent;
  }
}
