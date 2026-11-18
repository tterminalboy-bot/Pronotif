import { useState } from 'react';
import { ChevronRight, Clock3, Plus, Trash2, Workflow } from 'lucide-react';
import Builder from './Builder.jsx';
import PageHeading from '../components/PageHeading.jsx';

function RulesPage({ rules, onCreate, onSave, onDelete, onDuplicate, onToggle }) {
  const [editing, setEditing] = useState(null);

  return (
    <>
      <PageHeading
        eyebrow="TES RÈGLES"
        title="Automatisations"
        sub="Des actions utiles, déclenchées au bon moment."
        action={<button className="button-primary small" onClick={onCreate}><Plus size={16} />Créer</button>}
      />
      {rules.length === 0 ? (
        <div className="empty-state">
          <div className="empty-illustration"><Workflow size={25} /></div>
          <h2>À toi de jouer</h2>
          <p>Crée une règle pour automatiser une action liée à ton planning.</p>
          <button className="button-primary" onClick={onCreate}><Plus size={17} />Créer une automatisation</button>
        </div>
      ) : (
        <div className="rule-list">
          {rules.map(rule => (
            <article className="rule-card" key={rule.id}>
              <div className="rule-icon"><Workflow size={19} /></div>
              <div className="rule-body">
                <div className="rule-title-row">
                  <b>{rule.name}</b>
                  <span className={`status-badge ${rule.active ? 'success' : 'neutral'}`}>{rule.active ? 'Activée' : 'Désactivée'}</span>
                </div>
                <p>{rule.trigger} <ChevronRight size={13} /> {rule.action}</p>
                <small><Clock3 size={13} />{rule.updatedAt}</small>
                <div className="rule-actions">
                  <button onClick={() => setEditing(rule)}>Modifier</button>
                  <button onClick={() => onDuplicate(rule)}>Dupliquer</button>
                  <button className="delete-action" onClick={() => onDelete(rule.id)} aria-label={`Supprimer ${rule.name}`}><Trash2 size={14} /></button>
                </div>
              </div>
              <label className="switch">
                <input type="checkbox" checked={rule.active} onChange={event => onToggle(rule.id, event.target.checked)} />
                <span />
              </label>
            </article>
          ))}
        </div>
      )}
      {editing && (
        <Builder
          initial={editing}
          onCancel={() => setEditing(null)}
          onSave={rule => { onSave(rule); setEditing(null); }}
        />
      )}
    </>
  );
}

export default RulesPage;
