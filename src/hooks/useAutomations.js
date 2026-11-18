import { useEffect, useState } from 'react';
import { normalizeAutomation } from '../domain/automation.js';
import { readAutomations, writeAutomations } from '../storage/automationRepository.js';

export function useAutomations() {
  const [automations, setAutomations] = useState(readAutomations);
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    setStorageAvailable(writeAutomations(automations).saved);
  }, [automations]);

  function saveAutomation(value) {
    const normalized = normalizeAutomation(value);
    if (!normalized) return false;
    setAutomations(current => [normalized, ...current.filter(item => item.id !== normalized.id)]);
    return true;
  }

  function deleteAutomation(id) {
    setAutomations(current => current.filter(item => item.id !== id));
  }

  function duplicateAutomation(value) {
    const copy = normalizeAutomation({ ...value, id: undefined, name: `${value.name} (copie)`, active: false });
    if (copy) setAutomations(current => [copy, ...current]);
  }

  function toggleAutomation(id, active) {
    setAutomations(current => current.map(item => item.id === id ? { ...item, active } : item));
  }

  return { automations, setAutomations, saveAutomation, deleteAutomation, duplicateAutomation, toggleAutomation, storageAvailable };
}
