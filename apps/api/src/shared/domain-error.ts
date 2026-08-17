export abstract class DomainError {
  abstract readonly code: string;

  protected constructor(readonly message: string) {}
}
