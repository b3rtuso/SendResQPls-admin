/**
 * Reusable Change Detection & Unsaved Changes Utilities
 * For SendResQPls Admin Web Application
 */

export interface FieldChange {
  key: string;
  label: string;
  oldValue: any;
  newValue: any;
  oldFormatted: string;
  newFormatted: string;
}

export interface DetectChangesOptions<T = Record<string, any>> {
  /** Human-readable labels for fields (e.g. { headOfficer: 'Head Officer' }) */
  labels?: Partial<Record<keyof T | string, string>>;
  /** Custom value formatters for display */
  formatters?: Partial<Record<keyof T | string, (val: any) => string>>;
  /** Specific keys to ignore from comparison */
  ignoreKeys?: (keyof T | string)[];
  /** Only compare these specific keys if provided */
  includeKeys?: (keyof T | string)[];
  /** Text to show when a value is empty or null (default: '(empty)') */
  emptyText?: string;
}

/**
 * Normalizes values to handle type coercions safely:
 * - null, undefined, and empty string '' normalize to empty string ''
 * - string numbers (e.g. "123") vs numbers (123) are compared logically
 * - string arrays vs comma-separated strings are normalized
 */
export function normalizeValue(val: any): any {
  if (val === null || val === undefined) return '';

  if (typeof val === 'string') {
    const trimmed = val.trim();
    return trimmed;
  }

  if (typeof val === 'number') {
    return val;
  }

  if (typeof val === 'boolean') {
    return val;
  }

  if (Array.isArray(val)) {
    // Array of strings or numbers: trim, filter empty, sort and join
    return val
      .map((item) => (typeof item === 'string' ? item.trim() : item))
      .filter((item) => item !== '' && item !== null && item !== undefined)
      .sort()
      .join(', ');
  }

  return val;
}

/**
 * Checks if two values are logically equal, preventing false positives
 * such as "123" vs 123, null vs "", or rearranged equipment arrays.
 */
export function areValuesEqual(a: any, b: any): boolean {
  // 1. Array vs comma-separated string (common in equipment inputs)
  if (Array.isArray(a) && typeof b === 'string') {
    const bArr = b.split(',').map((s) => s.trim()).filter(Boolean).sort().join(', ');
    const aNormalized = normalizeValue(a);
    return aNormalized === bArr;
  }
  if (typeof a === 'string' && Array.isArray(b)) {
    const aArr = a.split(',').map((s) => s.trim()).filter(Boolean).sort().join(', ');
    const bNormalized = normalizeValue(b);
    return aArr === bNormalized;
  }

  const normA = normalizeValue(a);
  const normB = normalizeValue(b);

  // Direct equality after normalization
  if (normA === normB) return true;

  // Number vs numeric string: 123 === "123"
  if (
    (typeof normA === 'number' && typeof normB === 'string') ||
    (typeof normA === 'string' && typeof normB === 'number')
  ) {
    const numA = Number(normA);
    const numB = Number(normB);
    if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
      return numA === numB;
    }
  }

  // Boolean vs boolean string: true === "true"
  if (
    (typeof normA === 'boolean' && typeof normB === 'string') ||
    (typeof normA === 'string' && typeof normB === 'boolean')
  ) {
    return String(normA).toLowerCase() === String(normB).toLowerCase();
  }

  return false;
}

/**
 * Formats a value for human-readable display in the confirmation modal.
 */
export function formatFieldValue(
  val: any,
  formatter?: (v: any) => string,
  emptyText: string = '(empty)'
): string {
  if (formatter) {
    try {
      return formatter(val);
    } catch {
      // fallback
    }
  }

  if (val === null || val === undefined || val === '') {
    return emptyText;
  }

  if (typeof val === 'boolean') {
    return val ? 'Yes' : 'No';
  }

  if (Array.isArray(val)) {
    const joined = val.filter(Boolean).join(', ');
    return joined || emptyText;
  }

  return String(val);
}

/**
 * Converts camelCase or snake_case key to human-readable label
 * e.g. "headOfficer" -> "Head Officer"
 */
export function formatDefaultKeyLabel(key: string): string {
  const result = key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .trim();
  return result.charAt(0).toUpperCase() + result.slice(1);
}

/**
 * Compares originalData against formData and returns ONLY the changed fields.
 */
export function detectFieldChanges<T extends Record<string, any>>(
  originalData: T | null | undefined,
  formData: T | null | undefined,
  options: DetectChangesOptions<T> = {}
): FieldChange[] {
  if (!originalData && !formData) return [];

  const original = (originalData || {}) as Record<string, any>;
  const current = (formData || {}) as Record<string, any>;

  const {
    labels = {},
    formatters = {},
    ignoreKeys = ['id', '_id', 'createdAt', 'updatedAt'],
    includeKeys,
    emptyText = '(empty)',
  } = options;

  // Determine all keys to compare
  const allKeysSet = new Set<string>();
  if (includeKeys && includeKeys.length > 0) {
    includeKeys.forEach((k) => allKeysSet.add(String(k)));
  } else {
    Object.keys(original).forEach((k) => allKeysSet.add(k));
    Object.keys(current).forEach((k) => allKeysSet.add(k));
  }

  const ignoreSet = new Set(ignoreKeys.map(String));
  const changedFields: FieldChange[] = [];

  for (const key of allKeysSet) {
    if (ignoreSet.has(key)) continue;

    const oldVal = original[key];
    const newVal = current[key];

    // Check logical equality
    if (!areValuesEqual(oldVal, newVal)) {
      const customFormatter = (formatters as Record<string, any>)[key];
      const customLabel = (labels as Record<string, any>)[key] || formatDefaultKeyLabel(key);

      changedFields.push({
        key,
        label: customLabel,
        oldValue: oldVal,
        newValue: newVal,
        oldFormatted: formatFieldValue(oldVal, customFormatter, emptyText),
        newFormatted: formatFieldValue(newVal, customFormatter, emptyText),
      });
    }
  }

  return changedFields;
}
