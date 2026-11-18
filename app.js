const STORE = {
  rules: 'pronotif-rules',
  events: 'pronotif-events',
  theme: 'pronotif-theme',
};
const root = document.querySelector('#root');
const triggers = [
  'Professeur absent',
  'Cours annulé',
  'Cours ajouté',
  'Cours supprimé',
  'Changement de salle',
  'Changement d’horaire',
  'Modification d’emploi du temps',
  'Ajout d’une permanence',
  'Modification d’une permanence',
];
const fields = [
  ['professeur', 'Le professeur'],
  ['matiere', 'La matière'],
  ['salle', 'La salle'],
  ['permanence', 'Une heure de permanence'],
  ['horaire_debut', 'L’heure de début'],
  ['evenement', 'Le type d’événement'],
];
const operators = [
  ['equals', 'est égal à'],
  ['not_equals', 'est différent de'],
  ['contains', 'contient'],
  ['not_contains', 'ne contient pas'],
  ['is_set', 'est renseigné'],
  ['is_not_set', 'n’est pas renseigné'],
  ['is_true', 'est vrai'],
  ['is_false', 'est faux'],
];
const platforms = [
  ['notification', 'Notification sur cet appareil', 'Push à connecter'],
  ['discord', 'Discord', 'Connexion à configurer'],
  ['telegram', 'Telegram', 'Connexion à configurer'],
  ['whatsapp', 'WhatsApp', 'Connecteur officiel à étudier'],
];
const variables = ['professeur', 'matiere', 'horaire_debut', 'horaire_fin', 'salle', 'date', 'jour', 'heure', 'evenement', 'etablissement'];
const nav = [
  ['home', 'Accueil', '⌂'],
  ['planning', 'Planning', '▦'],
  ['create', 'Créer', '+'],
  ['rules', 'Automatisations', '⤴'],
  ['settings', 'Réglages', '⚙'],
];
let page = 'home';
let notice = '';
let editingId = null;
let draft = null;
let state = {
  theme: read(STORE.theme, 'light'),
  rules: read(STORE.rules, []),
  events: read(STORE.events, []),
};

function read(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}
function saveState() {
  try {
    localStorage.setItem(STORE.rules, JSON.stringify(state.rules));
    localStorage.setItem(STORE.events, JSON.stringify(state.events));
    localStorage.setItem(STORE.theme, state.theme);
  } catch {
    showNotice('Le navigateur n’a pas pu enregistrer les données.');
  }
}
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}
function setTheme(theme) {
  state.theme = theme;
  document.documentElement.dataset.theme = theme;
  saveState();
}
function showNotice(message) {
  notice = message;
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.append(toast);
  window.setTimeout(() => toast.remove(), 3200);
}
function navBar() {
  return '<nav class="bottom-nav" aria-label="Navigation principale">' + nav.map(item =>
    '<button class="nav-item ' + (page === item[0] || (page === 'builder' && item[0] === 'rules') ? 'selected ' : '') +
    (item[0] === 'create' ? 'nav-create' : '') + '" data-nav="' + item[0] + '"><span class="nav-icon"><span class="nav-glyph">' +
    item[2] + '</span></span><small>' + item[1] + '</small></button>'
  ).join('') + '</nav>';
}
function header() {
  return '<header class="topbar"><a class="brand" data-nav="home"><span class="brand-mark">▦<i></i></span><span><b>Pronotif</b><small>Ton assistant scolaire intelligent</small></span></a>' +
    '<div class="top-actions"><span class="local-pill"><span></span>Prototype</span>' +
    '<button class="icon-button" data-action="theme" aria-label="Changer de thème">' + (state.theme === 'dark' ? '☀' : '☾') + '</button></div></header>';
}
function heading(eyebrow, title, subtitle) {
  return '<section class="page-heading"><div><span class="eyebrow">' + eyebrow + '</span><h1>' + title + '</h1><p>' + subtitle + '</p></div></section>';
}
function renderHome() {
  const active = state.rules.filter(rule => rule.active).length;
  return heading('CENTRE DE CONTRÔLE', 'Bonjour 👋', 'Voici l’état de ton assistant scolaire.') +
    '<section class="status-card"><div class="status-icon">◉</div><div class="status-copy"><b>Emploi du temps</b><span>' +
    (state.events.length ? state.events.length + ' événements importés depuis un fichier ICS' : 'Aucun calendrier importé') +
    '</span></div><button class="button-secondary small" data-nav="settings">Configurer</button></section>' +
    '<div class="section-title"><div><h2>Ton espace</h2><p>Tout l’essentiel, en un coup d’œil.</p></div></div>' +
    '<section class="overview-grid"><div class="metric-card"><span class="metric-icon green">↗</span><b class="metric-value">' + active +
    '</b><span class="metric-label">Automatisations actives</span></div><div class="metric-card"><span class="metric-icon blue">♧</span><b class="metric-value">' +
    state.events.length + '</b><span class="metric-label">Événements importés</span></div></section>' +
    '<section class="empty-card"><div class="empty-illustration">▦</div><div><b>' +
    (state.events.length ? 'Ton planning est importé' : 'Importe ton emploi du temps') +
    '</b><p>Les cours apparaîtront ici après l’import d’un fichier ICS.</p></div></section>' +
    '<section class="quick-card"><div class="quick-symbol">⤴</div><div class="quick-copy"><b>Crée une règle personnalisée</b><p>Combine un événement, des conditions et plusieurs actions.</p></div>' +
    '<button class="round-arrow" data-nav="create" aria-label="Créer une règle">›</button></section>';
}
function formatDate(value) {
  if (!value) return 'Horaire inconnu';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
}
function renderPlanning() {
  const events = [...state.events].sort((a, b) => (a.start || '').localeCompare(b.start || ''));
  return heading('TON EMPLOI DU TEMPS', 'Planning', 'Cours importés depuis ton fichier local.') +
    '<section class="settings-card"><div class="settings-card-head"><h2>Import manuel</h2><span class="status-badge neutral">' + events.length + ' événement(s)</span></div>' +
    '<label class="file-picker">Importer un fichier ICS<input type="file" accept=".ics,text/calendar" data-ics-file></label>' +
    '<p class="muted-note">Le fichier est lu dans ce navigateur. Aucun compte Pronote n’est connecté par cette importation.</p></section>' +
    (events.length ? '<div class="event-list">' + events.map(event =>
      '<article class="event-card"><span class="event-date">' + escapeHtml(formatDate(event.start)) + '</span><b>' + escapeHtml(event.title || 'Cours') +
      '</b><span>' + escapeHtml(event.location || 'Salle non indiquée') + '</span></article>'
    ).join('') + '</div>' : '<div class="empty-state"><div class="empty-illustration">▦</div><h2>Aucun cours importé</h2><p>Choisis un fichier ICS exporté depuis ton espace Pronote.</p></div>');
}
function actionSummary(rule) {
  if (rule.action) return rule.action;
  return (rule.actionPlatforms || []).map(id => platforms.find(item => item[0] === id)?.[1] || id).join(' + ');
}
function renderRules() {
  return heading('TES RÈGLES', 'Automatisations', 'Choisis quoi faire quand un événement arrive.') +
    '<section class="quick-card"><div class="quick-copy"><b>Nouvelle automatisation</b><p>Définis le déclencheur, les conditions et les actions.</p></div><button class="button-primary small" data-nav="create">+ Créer</button></section>' +
    (state.rules.length ? '<div class="rule-list">' + state.rules.map(rule =>
      '<article class="rule-card"><div class="rule-icon">⤴</div><div class="rule-body"><div class="rule-title-row"><b>' + escapeHtml(rule.name) +
      '</b><span class="status-badge ' + (rule.active ? 'success' : 'neutral') + '">' + (rule.active ? 'Activée' : 'Désactivée') +
      '</span></div><p>' + escapeHtml(rule.trigger) + ' › ' + escapeHtml(actionSummary(rule)) + '</p><small>' +
      escapeHtml((rule.conditions || []).length + ' condition(s) · ' + (rule.updatedAt || 'Pas encore testée')) +
      '</small><div class="rule-actions"><button data-edit="' + escapeHtml(rule.id) + '">Modifier</button><button data-duplicate="' + escapeHtml(rule.id) +
      '">Dupliquer</button><button class="delete-action" data-delete="' + escapeHtml(rule.id) + '">Supprimer</button></div></div>' +
      '<label class="switch"><input type="checkbox" data-toggle="' + escapeHtml(rule.id) + '" ' + (rule.active ? 'checked' : '') + '><span></span></label></article>'
    ).join('') + '</div>' : '<div class="empty-state"><div class="empty-illustration">⤴</div><h2>Aucune automatisation</h2><p>Crée ta première règle pour organiser les actions liées à ton planning.</p><button class="button-primary" data-nav="create">Créer une automatisation</button></div>');
}
function renderSettings() {
  return heading('CENTRE DE CONTRÔLE', 'Réglages', 'Gère ton emploi du temps et l’apparence.') +
    '<section class="settings-card"><div class="settings-card-head"><div><span class="eyebrow">PRONOTE</span><h2>Importer un calendrier</h2></div><span class="status-badge neutral">Import manuel</span></div>' +
    '<p class="settings-intro">L’import ICS lit un export local. La connexion automatique Pronote n’est pas encore disponible.</p>' +
    '<label class="file-picker">Choisir un fichier ICS<input type="file" accept=".ics,text/calendar" data-ics-file></label>' +
    '<p class="muted-note">' + (state.events.length ? state.events.length + ' événement(s) lus sur cet appareil.' : 'Aucun fichier sélectionné.') + '</p></section>' +
    '<section class="settings-card"><div class="settings-card-head"><div><span class="eyebrow">APPARENCE</span><h2>Thème</h2></div></div>' +
    '<div class="theme-choices"><button data-theme="light" class="' + (state.theme === 'light' ? 'chosen' : '') + '">☀ Clair</button>' +
    '<button data-theme="dark" class="' + (state.theme === 'dark' ? 'chosen' : '') + '">☾ Sombre</button></div></section>' +
    '<section class="security-note"><div><b>Connexion Pronote</b><span>Pas encore développée. N’entre pas ton mot de passe ici.</span></div></section>';
}
function defaultDraft(rule) {
  return rule ? {
    ...rule,
    conditions: rule.conditions?.length ? rule.conditions : [{ field: 'matiere', operator: 'equals', value: '' }],
    conditionJoin: rule.conditionJoin || 'AND',
    delayAmount: rule.delayAmount || '',
    delayUnit: rule.delayUnit || 'minutes',
    actionPlatforms: rule.actionPlatforms || ['notification'],
    messageTitle: rule.messageTitle || '',
    message: rule.message || '',
  } : {
    name: '', trigger: '', conditions: [{ field: 'professeur', operator: 'is_set', value: '' }],
    conditionJoin: 'AND', delayAmount: '', delayUnit: 'minutes',
    actionPlatforms: ['notification'], messageTitle: '', message: '',
    active: false,
  };
}
function selectOptions(items, selected) {
  return items.map(item => '<option value="' + escapeHtml(item[0]) + '" ' + (item[0] === selected ? 'selected' : '') + '>' + escapeHtml(item[1]) + '</option>').join('');
}
function renderConditions() {
  return '<div class="logic-toggle"><span>Combiner avec</span><button data-join="AND" class="' + (draft.conditionJoin === 'AND' ? 'chosen' : '') + '">ET</button><button data-join="OR" class="' +
    (draft.conditionJoin === 'OR' ? 'chosen' : '') + '">OU</button></div><div class="conditions-stack">' + draft.conditions.map((condition, index) =>
      '<div class="condition-row"><select data-condition-field="' + index + '">' + selectOptions(fields, condition.field) + '</select>' +
      '<select data-condition-operator="' + index + '">' + selectOptions(operators, condition.operator) + '</select>' +
      (['is_set', 'is_not_set', 'is_true', 'is_false'].includes(condition.operator) ? '' :
        condition.field === 'permanence' ? '<select data-condition-value="' + index + '"><option value="">Choisir</option><option value="true" ' + (condition.value === 'true' ? 'selected' : '') + '>Oui</option><option value="false" ' + (condition.value === 'false' ? 'selected' : '') + '>Non</option></select>' :
          '<input data-condition-value="' + index + '" value="' + escapeHtml(condition.value) + '" placeholder="Valeur à comparer">') +
      '<button class="condition-remove" data-remove-condition="' + index + '" aria-label="Supprimer la condition">×</button></div>'
    ).join('') + '</div><button class="button-secondary add-condition" data-add-condition>+ Ajouter une condition</button>' +
    '<p class="muted-note">Exemple : professeur absent ET permanence renseignée. Les champs proposés dépendent des informations réellement fournies par Pronote.</p>';
}
function renderBuilder() {
  const steps = ['Déclencheur', 'Conditions', 'Temps', 'Actions', 'Résumé'];
  let body = '';
  if (draft.step === 0) {
    body = '<div class="choice-grid">' + triggers.map(trigger => '<button class="choice ' + (draft.trigger === trigger ? 'selected' : '') + '" data-trigger="' + escapeHtml(trigger) +
      '"><span class="choice-dot">' + (draft.trigger === trigger ? '✓' : '') + '</span>' + escapeHtml(trigger) + '</button>').join('') + '</div>' +
      '<p class="muted-note">Le déclenchement réel dépendra d’une source Pronote connectée.</p>';
  } else if (draft.step === 1) {
    body = renderConditions();
  } else if (draft.step === 2) {
    body = '<label class="field-label">Attendre (facultatif)</label><div class="delay-input"><input type="number" min="1" max="10000" data-delay-amount value="' +
      escapeHtml(draft.delayAmount) + '" placeholder="0"><select data-delay-unit>' +
      selectOptions([['seconds','secondes'],['minutes','minutes'],['hours','heures'],['days','jours'],['weeks','semaines'],['months','mois'],['years','années']], draft.delayUnit) + '</select></div>' +
      '<p class="muted-note">Le délai sera stocké dans la règle; son exécution après fermeture de l’app nécessitera un moteur serveur.</p>';
  } else if (draft.step === 3) {
    body = '<div class="platform-list">' + platforms.map(item =>
      '<label class="platform-choice"><input type="checkbox" data-platform="' + item[0] + '" ' + (draft.actionPlatforms.includes(item[0]) ? 'checked' : '') +
      '><span><b>' + item[1] + '</b><small>' + item[2] + '</small></span></label>'
    ).join('') + '</div><label class="field-label message-label">Titre du message</label><input data-message-title value="' + escapeHtml(draft.messageTitle) +
      '" placeholder="Ex. Changement de planning"><label class="field-label message-label">Contenu</label><textarea data-message rows="4" placeholder="Écris ton message">' + escapeHtml(draft.message) +
      '</textarea><div class="variable-chips"><span>Insérer une variable</span>' + variables.map(v => '<button data-variable="' + v + '">{' + v + '}</button>').join('') +
      '</div><div class="message-preview"><small>APERÇU DU MODÈLE</small><b data-preview-title>' + escapeHtml(draft.messageTitle || 'Titre du message') +
      '</b><p data-preview-message>' + escapeHtml(draft.message || 'Ton message personnalisé apparaîtra ici.') + '</p></div>' +
      '<p class="muted-note">Les destinations apparaîtront uniquement après connexion réelle d’un compte de messagerie.</p>';
  } else {
    const conditionSummary = draft.conditions.map(condition => {
      const field = fields.find(item => item[0] === condition.field)?.[1] || condition.field;
      const operator = operators.find(item => item[0] === condition.operator)?.[1] || condition.operator;
      return field + ' ' + operator + (condition.value ? ' « ' + condition.value + ' »' : '');
    }).join(draft.conditionJoin === 'AND' ? ' ET ' : ' OU ');
    const actionSummary = draft.actionPlatforms.map(id => platforms.find(item => item[0] === id)?.[1]).filter(Boolean).join(' + ') || 'Aucune';
    body = '<div class="summary-box"><div><small>QUAND</small><b>' + escapeHtml(draft.trigger || 'Aucun déclencheur choisi') +
      '</b></div><div><small>CONDITIONS</small><b>' + escapeHtml(conditionSummary) + '</b></div>' +
      (draft.delayAmount ? '<div><small>DÉLAI</small><b>' + escapeHtml(draft.delayAmount + ' ' + draft.delayUnit) + '</b></div>' : '') +
      '<div><small>ACTIONS</small><b>' + escapeHtml(actionSummary) + '</b></div><div><small>NOM</small><b>' + escapeHtml(draft.name || 'Sans nom') + '</b></div></div>' +
      '<label class="activation-row"><span><b>Activer cette règle</b><small>Elle ne s’exécutera pas avant la connexion des services.</small></span><input type="checkbox" data-active ' + (draft.active ? 'checked' : '') + '></label>' +
      '<div class="preview-note">Configuration locale uniquement : aucun message n’est envoyé dans cette version.</div>';
  }
  return '<div class="builder-overlay"><section class="builder-panel"><header class="builder-top"><button class="icon-button" data-builder-cancel>←</button>' +
    '<div><span class="eyebrow">CONSTRUCTEUR DE RÈGLE</span><b>' + (editingId ? 'Modifier une automatisation' : 'Nouvelle automatisation') + '</b></div>' +
    '<button class="icon-button" data-builder-cancel>×</button></header><div class="builder-progress">' +
    steps.map((step, index) => '<button class="' + (draft.step === index ? 'current' : draft.step > index ? 'done' : '') + '" data-step="' + index +
      '"><i>' + (draft.step > index ? '✓' : index + 1) + '</i><span>' + step + '</span></button>').join('') +
    '</div><div class="builder-scroll"><section class="builder-name-card"><span class="eyebrow">NOM DE L’AUTOMATISATION</span>' +
    '<input data-name value="' + escapeHtml(draft.name) + '" placeholder="Ex. Absence de mon professeur"><small>Tu pourras modifier ce nom plus tard.</small></section>' +
    '<section class="builder-section"><div class="builder-section-head"><span class="step-icon">' + ['⚡','☷','◷','♧','✓'][draft.step] +
    '</span><div><h2>' + ['Quand cela se produit','Conditions','Temps','Actions','Résumé'][draft.step] + '</h2><p>' +
    ['Choisis l’événement qui démarre la règle.','Ajoute plusieurs critères et choisis leur logique.','Ajoute un délai avant les actions.','Choisis les actions et compose ton message.','Vérifie la règle avant de l’enregistrer.'][draft.step] +
    '</p></div></div>' + body + '</section></div><footer class="builder-footer"><button class="button-secondary" data-builder-back>' +
    (draft.step === 0 ? 'Annuler' : 'Précédent') + '</button>' + (draft.step < 4
      ? '<button class="button-primary" data-builder-next>Continuer ›</button>'
      : '<button class="button-primary" data-save-rule ' + (!draft.name.trim() || !draft.trigger ? 'disabled' : '') + '>Enregistrer</button>') +
    '</footer></section></div>';
}
function render() {
  document.documentElement.dataset.theme = state.theme === 'dark' ? 'dark' : 'light';
  root.innerHTML = '<div class="app-shell">' + header() + '<main class="main-content">' +
    (page === 'home' ? renderHome() : page === 'planning' ? renderPlanning() : page === 'rules' ? renderRules() :
      page === 'settings' ? renderSettings() : renderBuilder()) + '</main>' + navBar() + '</div>';
}
function startBuilder(rule) {
  editingId = rule?.id || null;
  draft = defaultDraft(rule);
  draft.step = 0;
  page = 'builder';
  render();
}
function parseIcsDate(value) {
  const match = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?/);
  if (!match) return '';
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4] || 0), Number(match[5] || 0), Number(match[6] || 0));
  if (match[7] === 'Z') return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
  return date.toISOString();
}
function unescapeIcs(value) {
  return value.replace(/\\n/gi, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\');
}
function parseIcs(text) {
  const lines = text.replace(/\r?\n[ \t]/g, '').split(/\r?\n/);
  const events = [];
  let current = null;
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') current = {};
    else if (line === 'END:VEVENT' && current) {
      if (current.start || current.title) events.push({
        id: current.uid || 'ics-' + events.length + '-' + (current.start || ''),
        title: current.title || 'Événement',
        start: current.start || '',
        end: current.end || '',
        location: current.location || '',
      });
      current = null;
    } else if (current) {
      const separator = line.indexOf(':');
      if (separator < 0) continue;
      const key = line.slice(0, separator).split(';')[0];
      const value = unescapeIcs(line.slice(separator + 1));
      if (key === 'UID') current.uid = value;
      if (key === 'SUMMARY') current.title = value;
      if (key === 'DTSTART') current.start = parseIcsDate(value);
      if (key === 'DTEND') current.end = parseIcsDate(value);
      if (key === 'LOCATION') current.location = value;
    }
  }
  return events;
}
function updatePreview() {
  const title = document.querySelector('[data-preview-title]');
  const message = document.querySelector('[data-preview-message]');
  if (title) title.textContent = draft.messageTitle || 'Titre du message';
  if (message) message.textContent = draft.message || 'Ton message personnalisé apparaîtra ici.';
}
root.addEventListener('click', event => {
  const target = event.target.closest('[data-nav],[data-action],[data-trigger],[data-add-condition],[data-remove-condition],[data-join],[data-variable],[data-step],[data-builder-cancel],[data-builder-back],[data-builder-next],[data-save-rule],[data-edit],[data-delete],[data-duplicate]');
  if (!target) return;
  if (target.dataset.nav) {
    if (target.dataset.nav === 'create') startBuilder();
    else { page = target.dataset.nav; render(); }
  } else if (target.dataset.action === 'theme') {
    setTheme(state.theme === 'dark' ? 'light' : 'dark'); render();
  } else if (target.dataset.trigger) {
    draft.trigger = target.dataset.trigger; render();
  } else if (target.hasAttribute('data-add-condition')) {
    if (draft.conditions.length < 8) draft.conditions.push({ field: 'matiere', operator: 'equals', value: '' });
    render();
  } else if (target.dataset.removeCondition !== undefined) {
    draft.conditions.splice(Number(target.dataset.removeCondition), 1);
    if (!draft.conditions.length) draft.conditions.push({ field: 'matiere', operator: 'equals', value: '' });
    render();
  } else if (target.dataset.join) {
    draft.conditionJoin = target.dataset.join; render();
  } else if (target.dataset.variable) {
    draft.message = (draft.message || '') + '{' + target.dataset.variable + '}';
    render();
  } else if (target.dataset.step !== undefined) {
    draft.step = Number(target.dataset.step); render();
  } else if (target.hasAttribute('data-builder-cancel')) {
    page = editingId ? 'rules' : 'rules'; editingId = null; draft = null; render();
  } else if (target.hasAttribute('data-builder-back')) {
    if (draft.step === 0) { page = 'rules'; draft = null; editingId = null; }
    else draft.step -= 1;
    render();
  } else if (target.hasAttribute('data-builder-next')) {
    draft.name = document.querySelector('[data-name]')?.value || draft.name;
    draft.step = Math.min(4, draft.step + 1); render();
  } else if (target.hasAttribute('data-save-rule')) {
    draft.name = document.querySelector('[data-name]')?.value || draft.name;
    draft.active = document.querySelector('[data-active]')?.checked || false;
    draft.actionPlatforms = Array.from(document.querySelectorAll('[data-platform]:checked')).map(input => input.dataset.platform);
    draft.messageTitle = document.querySelector('[data-message-title]')?.value || '';
    draft.message = document.querySelector('[data-message]')?.value || '';
    if (!draft.actionPlatforms.length) draft.actionPlatforms = ['notification'];
    const action = draft.actionPlatforms.map(id => platforms.find(item => item[0] === id)?.[1]).filter(Boolean).join(' + ');
    const saved = { ...draft, id: editingId || draft.id || (globalThis.crypto?.randomUUID?.() || 'rule-' + Date.now()), action, updatedAt: 'À tester' };
    state.rules = [saved, ...state.rules.filter(rule => rule.id !== saved.id)];
    saveState(); page = 'rules'; draft = null; editingId = null; render(); showNotice('Règle enregistrée sur cet appareil.');
  } else if (target.dataset.edit) {
    const rule = state.rules.find(item => item.id === target.dataset.edit);
    if (rule) startBuilder(rule);
  } else if (target.dataset.delete) {
    state.rules = state.rules.filter(item => item.id !== target.dataset.delete); saveState(); render();
  } else if (target.dataset.duplicate) {
    const rule = state.rules.find(item => item.id === target.dataset.duplicate);
    if (rule) state.rules.unshift({ ...rule, id: globalThis.crypto?.randomUUID?.() || 'rule-' + Date.now(), name: rule.name + ' (copie)', active: false });
    saveState(); render();
  }
});
root.addEventListener('input', event => {
  const target = event.target;
  if (!draft) return;
  if (target.matches('[data-name]')) draft.name = target.value;
  if (target.matches('[data-delay-amount]')) draft.delayAmount = target.value;
  if (target.matches('[data-message-title]')) { draft.messageTitle = target.value; updatePreview(); }
  if (target.matches('[data-message]')) { draft.message = target.value; updatePreview(); }
  const valueIndex = target.getAttribute('data-condition-value');
  if (valueIndex !== null && target.tagName === 'INPUT') draft.conditions[Number(valueIndex)].value = target.value;
});
root.addEventListener('change', event => {
  const target = event.target;
  if (target.matches('[data-condition-field]')) {
    const condition = draft.conditions[Number(target.dataset.conditionField)];
    condition.field = target.value; condition.value = ''; render();
  }
  if (target.matches('[data-condition-operator]')) {
    draft.conditions[Number(target.dataset.conditionOperator)].operator = target.value; render();
  }
  if (target.matches('[data-condition-value]') && target.tagName === 'SELECT') draft.conditions[Number(target.dataset.conditionValue)].value = target.value;
  if (target.matches('[data-delay-unit]')) draft.delayUnit = target.value;
  if (target.matches('[data-platform]')) {
    const id = target.dataset.platform;
    if (target.checked && !draft.actionPlatforms.includes(id)) draft.actionPlatforms.push(id);
    if (!target.checked) draft.actionPlatforms = draft.actionPlatforms.filter(item => item !== id);
  }
  if (target.matches('[data-active]')) draft.active = target.checked;
  if (target.matches('[data-toggle]')) {
    const rule = state.rules.find(item => item.id === target.dataset.toggle);
    if (rule) rule.active = target.checked; saveState();
  }
  if (target.matches('[data-ics-file]')) {
    const file = target.files?.[0];
    if (!file) return;
    file.text().then(text => {
      state.events = parseIcs(text); saveState(); page = 'planning'; render();
      showNotice(state.events.length + ' événement(s) importés localement.');
    }).catch(() => showNotice('Le fichier ICS n’a pas pu être lu.'));
  }
});
root.addEventListener('change', event => {
  if (event.target.matches('[data-theme]')) { setTheme(event.target.dataset.theme); render(); }
});
render();
