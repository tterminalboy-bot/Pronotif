const ALLOWED_TRIGGERS = new Set([
  'Professeur absent',
  'Cours annulé',
  'Cours ajouté',
  'Cours supprimé',
  'Changement de salle',
  'Changement d’horaire',
  'Modification d’emploi du temps',
  'Ajout d’une permanence',
  'Modification d’une permanence',
]);

const ALLOWED_ACTIONS = new Set([
  'Afficher une notification',
  'Envoyer un message Discord',
  'Notification sur cet appareil',
  'Discord',
  'Telegram',
  'WhatsApp',
]);

const ALLOWED_PLATFORMS = new Set(['notification', 'discord', 'telegram', 'whatsapp']);
const ALLOWED_FIELDS = new Set(['professeur', 'matiere', 'salle', 'permanence', 'horaire_debut', 'evenement']);
const ALLOWED_OPERATORS = new Set(['equals', 'not_equals', 'contains', 'not_contains', 'is_set', 'is_not_set', 'is_true', 'is_false']);
const ALLOWED_DELAY_UNITS = new Set(['seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years']);
const MAX_TEXT_LENGTH = 5000;

function safeText(value, maxLength = MAX_TEXT_LENGTH) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function legacyPlatform(action) {
  if (action === 'Envoyer un message Discord' || action === 'Discord') return ['discord'];
  if (action === 'Telegram') return ['telegram'];
  if (action === 'WhatsApp') return ['whatsapp'];
  return ['notification'];
}

export function normalizeAutomation(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const trigger = safeText(value.trigger, 120);
  const name = safeText(value.name, 120);
  const legacyAction = safeText(value.action, 500);
  if (!name || !ALLOWED_TRIGGERS.has(trigger)) return null;

  const actionPlatforms = Array.isArray(value.actionPlatforms)
    ? [...new Set(value.actionPlatforms.filter(platform => ALLOWED_PLATFORMS.has(platform)))]
    : legacyPlatform(legacyAction);

  const conditions = (Array.isArray(value.conditions) ? value.conditions : [])
    .slice(0, 8)
    .map(condition => {
      if (!condition || !ALLOWED_FIELDS.has(condition.field) || !ALLOWED_OPERATORS.has(condition.operator)) return null;
      return {
        field: condition.field,
        operator: condition.operator,
        value: safeText(condition.value, 300),
      };
    })
    .filter(Boolean);

  const delayAmount = Math.min(10000, Math.max(0, Number.parseInt(value.delayAmount, 10) || 0));
  const delayUnit = ALLOWED_DELAY_UNITS.has(value.delayUnit) ? value.delayUnit : 'minutes';
  const action = actionPlatforms.map(platform => ({
    notification: 'Notification sur cet appareil',
    discord: 'Discord',
    telegram: 'Telegram',
    whatsapp: 'WhatsApp',
  })[platform]).join(' + ') || legacyAction || 'Afficher une notification';

  return {
    id: safeText(value.id, 80) || createAutomationId(),
    name,
    trigger,
    action,
    actionPlatforms,
    conditions,
    conditionJoin: value.conditionJoin === 'OR' ? 'OR' : 'AND',
    subject: safeText(value.subject, 120) || 'Toutes les matières',
    delay: delayAmount ? `${delayAmount} ${delayUnit}` : safeText(value.delay, 24),
    delayAmount,
    delayUnit,
    messageTitle: safeText(value.messageTitle, 160),
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
