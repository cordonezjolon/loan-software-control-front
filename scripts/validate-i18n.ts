import { messages, SUPPORTED_LOCALES, type Locale } from '../src/lib/i18n/messages';

function flattenLeafKeys(node: unknown, prefix = ''): string[] {
  if (typeof node === 'string') {
    return [prefix];
  }

  if (!node || typeof node !== 'object') {
    return [];
  }

  return Object.entries(node as Record<string, unknown>).flatMap(([key, value]) => {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    return flattenLeafKeys(value, nextPrefix);
  });
}

function diffKeys(base: Set<string>, target: Set<string>) {
  const missing = [...base].filter((k) => !target.has(k)).sort();
  const extra = [...target].filter((k) => !base.has(k)).sort();
  return { missing, extra };
}

function validate(): number {
  const baseLocale: Locale = 'en';
  const baseKeys = new Set(flattenLeafKeys(messages[baseLocale]));

  let hasErrors = false;

  for (const locale of SUPPORTED_LOCALES) {
    if (locale === baseLocale) continue;

    const localeKeys = new Set(flattenLeafKeys(messages[locale]));
    const { missing, extra } = diffKeys(baseKeys, localeKeys);

    if (missing.length === 0 && extra.length === 0) {
      console.log(`✅ ${locale}: translation keys are consistent with ${baseLocale}`);
      continue;
    }

    hasErrors = true;
    console.error(`\n❌ ${locale}: translation key mismatch`);

    if (missing.length > 0) {
      console.error(`  Missing keys (${missing.length}):`);
      for (const key of missing) {
        console.error(`    - ${key}`);
      }
    }

    if (extra.length > 0) {
      console.error(`  Orphan keys not present in ${baseLocale} (${extra.length}):`);
      for (const key of extra) {
        console.error(`    - ${key}`);
      }
    }
  }

  if (!hasErrors) {
    console.log('\n✅ i18n validation passed for all locales.');
    return 0;
  }

  console.error('\n❌ i18n validation failed.');
  return 1;
}

process.exit(validate());
