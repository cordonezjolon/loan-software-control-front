import type { messages } from './messages';

type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`;

type PreviousDepth = [never, 0, 1, 2, 3, 4, 5, 6];

type LeafPaths<T, Depth extends number = 6> = Depth extends 0
  ? never
  : T extends string
  ? ''
  : {
      [K in Extract<keyof T, string>]: T[K] extends string
        ? K
        : T[K] extends Record<string, unknown>
          ? `${K}${DotPrefix<LeafPaths<T[K], PreviousDepth[Depth]>>}`
          : never;
    }[Extract<keyof T, string>];

type DefaultCatalog = (typeof messages)['en'];

export type MessageKey = LeafPaths<DefaultCatalog>;

export type TranslationValues = Record<
  string,
  string | number | boolean | Date | null | undefined
>;

export type TranslateFn = {
  (key: MessageKey, values?: TranslationValues): string;
  (key: string, values?: TranslationValues): string;
};
