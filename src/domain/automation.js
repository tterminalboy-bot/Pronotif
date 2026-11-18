const ALLOWED_TRIGGERS = new Set([
  'Professeur absent',
  'Cours annulé',
  'Cours ajouté',
  'Cours supprimé',
  'Changement de salle',
  'Changement d’horaire',
  'Modification d’emploi du temps',
]);

const ALLOWED_ACTIONS = new Set([
  'Afficher une notification',
  'Envoyer un message Discord',
]);

const MAX_TEXT_LENGTH = 5000;

function safeText(value, maxLength = MAX_TEXT_LENGTH) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export function normalizeAutomation(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const trigger = safeText(value.trigger, 120);
  const action = safeText(value.action, 120);
  const name = safeText(value.name, 120);
  if (!name || !ALLOWED_TRIGGERS.has(trigger) || !ALLOWED_ACTIONS.has(action)) return null;

  const delay = value.delay === '' || value.delay == null ? '' : String(value.delay).slice(0, 24);
  return {
    id: safeText(value.id, 80) || createAutomationId(),
    name,
    trigger,
    action,
    subject: safeText(value.subject, 120) || 'Toutes les matières',
    delay,
    message: safeText(value.message),
    active: value.active === true,
    updatedAt: safeText(value.updatedAt, 80) || 'Jamais exécutée',
  };
}

export function createAutomationId() {
  return globalThis.crypto?.randomUUID?.() ?? `rule-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function countActiveAutomations(automations) {
  return automations.reduce((count, automation) => count + Number(automation.active === true), 0);
}

export { ALLOWED_ACTIONS, ALLOWED_TRIGGERS };
