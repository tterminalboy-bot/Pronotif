import { useState } from 'react';
import { ArrowLeft, Bell, BookOpen, Check, ChevronRight, CircleCheck, Clock3, MessageSquare, Plus, ShieldCheck, Trash2, Workflow, X, Zap } from 'lucide-react';
import { createAutomationId } from '../domain/automation.js';

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

const conditionFields = [
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
  { id: 'notification', label: 'Notification sur cet appareil', detail: 'L’envoi push n’est pas encore connecté.', Icon: Bell },
  { id: 'discord', label: 'Discord', detail: 'Connecteur à configurer; aucun salon fictif n’est proposé.', Icon: MessageSquare },
  { id: 'telegram', label: 'Telegram', detail: 'Connecteur à configurer; aucun groupe fictif n’est proposé.', Icon: MessageSquare },
  { id: 'whatsapp', label: 'WhatsApp', detail: 'Connecteur officiel à étudier; envoi non disponible dans ce prototype.', Icon: MessageSquare },
];

const variables = ['professeur', 'matiere', 'horaire_debut', 'horaire_fin', 'salle', 'date', 'jour', 'heure', 'evenement', 'etablissement'];

function initialPlatforms(initial) {
  if (Array.isArray(initial?.actionPlatforms) && initial.actionPlatforms.length) return initial.actionPlatforms;
  if (initial?.action?.includes('Discord')) return ['discord'];
  return ['notification'];
}

function Builder({ onCancel, onSave, initial }) {
  const [name, setName] = useState(initial?.name || '');
  const [trigger, setTrigger] = useState(initial?.trigger || '');
  const [conditions, setConditions] = useState(initial?.conditions?.length ? initial.conditions : [{ field: 'matiere', operator: 'equals', value: '' }]);
  const [conditionJoin, setConditionJoin] = useState(initial?.conditionJoin || 'AND');
  const [delayAmount, setDelayAmount] = useState(initial?.delayAmount || '');
  const [delayUnit, setDelayUnit] = useState(initial?.delayUnit || 'minutes');
  const [actionPlatforms, setActionPlatforms] = useState(initialPlatforms(initial));
  const [messageTitle, setMessageTitle] = useState(initial?.messageTitle || '');
  const [message, setMessage] = useState(initial?.message || 'Le cours de {matiere} est modifié.');
  const [active, setActive] = useState(initial?.active || false);
  const [step, setStep] = useState(0);

  function updateCondition(index, patch) {
    setConditions(current => current.map((condition, i) => i === index ? { ...condition, ...patch } : condition));
  }

  function insertVariable(variable) {
    setMessage(current => `${current}{${variable}}`);
  }

  function togglePlatform(platform) {
    setActionPlatforms(current => current.includes(platform)
      ? current.filter(item => item !== platform)
      : [...current, platform]);
  }

  function save() {
    const action = actionPlatforms.map(id => platforms.find(platform => platform.id === id)?.label).filter(Boolean).join(' + ');
    onSave({
      id: initial?.id || createAutomationId(),
      name: name.trim(),
      trigger,
      conditions,
      conditionJoin,
      delayAmount,
      delayUnit,
      actionPlatforms,
      action,
      messageTitle,
      message,
      active,
      updatedAt: 'À tester',
    });
  }

  return (
    <div className="builder-overlay">
      <div className="builder-panel">
        <div className="builder-top">
          <button className="icon-button" onClick={onCancel} aria-label="Retour"><ArrowLeft size={19} /></button>
          <div><span className="eyebrow">{initial ? 'MODIFIER' : 'NOUVELLE AUTOMATISATION'}</span><b>Créer une règle</b></div>
          <button className="icon-button" onClick={onCancel} aria-label="Fermer"><X size={18} /></button>
        </div>

        <div className="builder-progress">
          {['Déclencheur', 'Conditions', 'Temps', 'Actions', 'Résumé'].map((label, index) => (
            <button key={label} className={step === index ? 'current' : step > index ? 'done' : ''} onClick={() => setStep(index)}>
              <i>{step > index ? <Check size={12} /> : index + 1}</i><span>{label}</span>
            </button>
          ))}
        </div>

        <div className="builder-scroll">
          <section className="builder-name-card">
            <span className="eyebrow">NOM DE L’AUTOMATISATION</span>
            <input value={name} onChange={event => setName(event.target.value)} placeholder="Ex. Absence de mon professeur" maxLength={120} />
            <small>Tu pourras modifier ce nom plus tard.</small>
          </section>

          {step === 0 && (
            <section className="builder-section">
              <div className="builder-section-head"><span className="step-icon"><Zap size={18} /></span><div><h2>Quand cela se produit</h2><p>Choisis l’événement qui démarre la règle.</p></div></div>
              <div className="choice-grid">
                {triggers.map(item => <button key={item} className={trigger === item ? 'choice selected' : 'choice'} onClick={() => setTrigger(item)}><span className="choice-dot">{trigger === item && <Check size={12} />}</span>{item}</button>)}
              </div>
              <p className="muted-note">Les événements proposés devront être fournis par la source Pronote connectée.</p>
            </section>
          )}

          {step === 1 && (
            <section className="builder-section">
              <div className="builder-section-head"><span className="step-icon"><BookOpen size={18} /></span><div><h2>Si ces conditions sont réunies</h2><p>Ajoute plusieurs critères et choisis leur logique.</p></div></div>
              <div className="logic-toggle"><span>Appliquer les conditions avec</span><button className={conditionJoin === 'AND' ? 'chosen' : ''} onClick={() => setConditionJoin('AND')}>ET</button><button className={conditionJoin === 'OR' ? 'chosen' : ''} onClick={() => setConditionJoin('OR')}>OU</button></div>
              <div className="conditions-stack">
                {conditions.map((condition, index) => (
                  <div className="condition-row" key={index}>
                    <select aria-label="Champ de condition" value={condition.field} onChange={event => updateCondition(index, { field: event.target.value, value: '' })}>
                      {conditionFields.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                    </select>
                    <select aria-label="Opérateur" value={condition.operator} onChange={event => updateCondition(index, { operator: event.target.value })}>
                      {operators.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                    </select>
                    {!['is_set', 'is_not_set', 'is_true', 'is_false'].includes(condition.operator) && (
                      condition.field === 'permanence'
                        ? <select aria-label="Valeur" value={condition.value} onChange={event => updateCondition(index, { value: event.target.value })}><option value="">Choisir</option><option value="true">Oui</option><option value="false">Non</option></select>
                        : <input aria-label="Valeur" value={condition.value} onChange={event => updateCondition(index, { value: event.target.value })} placeholder="Valeur à comparer" />
                    )}
                    <button className="condition-remove" onClick={() => setConditions(current => current.filter((_, i) => i !== index))} aria-label="Supprimer cette condition" disabled={conditions.length === 1}><Trash2 size={15} /></button>
                  </div>
                ))}
              </div>
              <button className="button-secondary add-condition" onClick={() => setConditions(current => [...current, { field: 'matiere', operator: 'equals', value: '' }])} disabled={conditions.length >= 8}><Plus size={15} />Ajouter une condition</button>
              <p className="muted-note">Exemple : « Le professeur est absent » ET « une heure de permanence est renseignée ». Les valeurs réelles dépendront des données reçues.</p>
            </section>
          )}

          {step === 2 && (
            <section className="builder-section">
              <div className="builder-section-head"><span className="step-icon"><Clock3 size={18} /></span><div><h2>Ajouter un délai</h2><p>Optionnel : attendre avant les actions.</p></div></div>
              <label className="field-label" htmlFor="delay-amount">Attendre</label>
              <div className="delay-input">
                <input id="delay-amount" type="number" min="1" max="10000" placeholder="0" value={delayAmount} onChange={event => setDelayAmount(event.target.value)} />
                <select value={delayUnit} onChange={event => setDelayUnit(event.target.value)} aria-label="Unité du délai">
                  <option value="seconds">secondes</option><option value="minutes">minutes</option><option value="hours">heures</option><option value="days">jours</option><option value="weeks">semaines</option><option value="months">mois</option><option value="years">années</option>
                </select>
              </div>
              <p className="muted-note">Le délai est enregistré dans la règle. Son exécution automatique nécessitera le moteur serveur.</p>
            </section>
          )}

          {step === 3 && (
            <section className="builder-section">
              <div className="builder-section-head"><span className="step-icon"><Bell size={18} /></span><div><h2>Quelles actions effectuer</h2><p>Tu peux en sélectionner plusieurs.</p></div></div>
              <div className="action-select">
                {platforms.map(({ id, label, detail, Icon }) => (
                  <label key={id}>
                    <input type="checkbox" checked={actionPlatforms.includes(id)} onChange={() => togglePlatform(id)} />
                    <span className={id === 'discord' ? 'action-symbol discord' : 'action-symbol'}><Icon size={17} /></span>
                    <span><b>{label}</b><small>{detail}</small></span>
                  </label>
                ))}
              </div>
              <label className="field-label message-label" htmlFor="message-title">Titre du message</label>
              <input id="message-title" value={messageTitle} onChange={event => setMessageTitle(event.target.value)} placeholder="Ex. Changement dans ton planning" maxLength={160} />
              <label className="field-label message-label" htmlFor="message-body">Contenu</label>
              <textarea id="message-body" value={message} onChange={event => setMessage(event.target.value)} rows="4" maxLength={2000} />
              <div className="variable-chips"><span>Insérer une variable</span>{variables.map(variable => <button key={variable} onClick={() => insertVariable(variable)}>{`{${variable}}`}</button>)}</div>
              <div className="message-preview"><small>APERÇU</small><b>{messageTitle || 'Titre du message'}</b><p>{message || 'Ton message s’affichera ici.'}</p></div>
            </section>
          )}

          {step === 4 && (
            <section className="builder-section">
              <div className="builder-section-head"><span className="step-icon"><CircleCheck size={18} /></span><div><h2>Résumé et activation</h2><p>Vérifie ta règle avant de l’enregistrer.</p></div></div>
              <div className="summary-box">
                <div><small>QUAND</small><b>{trigger || 'Aucun déclencheur choisi'}</b></div>
                <div><small>SI ({conditionJoin === 'AND' ? 'ET' : 'OU'})</small><b>{conditions.map(condition => {
                  const label = conditionFields.find(([value]) => value === condition.field)?.[1] || condition.field;
                  const operator = operators.find(([value]) => value === condition.operator)?.[1] || condition.operator;
                  return `${label} ${operator}${condition.value ? ` « ${condition.value} »` : ''}`;
                }).join(conditionJoin === 'AND' ? ' ET ' : ' OU ')}</b></div>
                {delayAmount && <div><small>ATTENDRE</small><b>{delayAmount} {delayUnit}</b></div>}
                <div><small>ALORS</small><b>{actionPlatforms.map(id => platforms.find(platform => platform.id === id)?.label).filter(Boolean).join(' + ') || 'Aucune action choisie'}</b></div>
                <div><small>NOM</small><b>{name || 'Sans nom'}</b></div>
              </div>
              <label className="activation-row"><span><b>Activer cette automatisation</b><small>Elle ne s’exécutera pas avant la connexion d’une source et des actions.</small></span><input type="checkbox" checked={active} onChange={event => setActive(event.target.checked)} /></label>
              <div className="preview-note"><ShieldCheck size={17} />Configuration enregistrée localement; aucun message n’est envoyé dans cette version.</div>
            </section>
          )}
        </div>

        <footer className="builder-footer">
          <button className="button-secondary" onClick={step === 0 ? onCancel : () => setStep(current => Math.max(0, current - 1))}>{step === 0 ? 'Annuler' : 'Précédent'}</button>
          {step < 4
            ? <button className="button-primary" onClick={() => setStep(current => Math.min(4, current + 1))}>Continuer<ChevronRight size={17} /></button>
            : <button className="button-primary" disabled={!name.trim() || !trigger || !actionPlatforms.length} onClick={save}><Check size={17} />Enregistrer</button>}
        </footer>
      </div>
    </div>
  );
}

export default Builder;
