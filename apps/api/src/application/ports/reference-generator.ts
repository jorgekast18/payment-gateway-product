export const REFERENCE_GENERATOR = Symbol('REFERENCE_GENERATOR');

export interface ReferenceGenerator {
  generate(): string;
}
