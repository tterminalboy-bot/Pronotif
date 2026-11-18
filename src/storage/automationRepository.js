import { normalizeAutomation } from '../domain/automation.js';

const STORAGE_KEY = 'pronotif-rules';

export function readAutomations(storage) {
  try {
    const serialized = (storage ?? globalThis.localStorage)?.getItem(STORAGE_KEY);
    if (!serialized) return [];
    const parsed = JSON.parse(serialized);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeAutomation).filter(Boolean);
  } catch {
    return [];
  }
}

export function writeAutomations(automations, storage) {
  const safeAutomations = automations.map(normalizeAutomation).filter(Boolean);
  try {
    (storage ?? globalThis.localStorage)?.setItem(STORAGE_KEY, JSON.stringify(safeAutomations));
    return { saved: true, count: safeAutomations.length };
  } catch {
    return { saved: false, count: safeAutomations.length };
  }
}
