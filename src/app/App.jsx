import { useEffect, useState } from 'react';
import { CalendarDays, CircleCheck, Home, Moon, Plus, Settings, Sun, Workflow } from 'lucide-react';
import Builder from '../pages/Builder.jsx';
import HomePage from '../pages/HomePage.jsx';
import PlanningPage from '../pages/PlanningPage.jsx';
import RulesPage from '../pages/RulesPage.jsx';
import SettingsPage from '../pages/SettingsPage.jsx';
import { countActiveAutomations } from '../domain/automation.js';
import { useAutomations } from '../hooks/useAutomations.js';

const navigation = [
  { id: 'home', label: 'Accueil', Icon: Home },
  { id: 'planning', label: 'Planning', Icon: CalendarDays },
  { id: 'new', label: 'Créer', Icon: Plus, primary: true },
  { id: 'rules', label: 'Automatisations', Icon: Workflow },
  { id: 'settings', label: 'Réglages', Icon: Settings },
];

function readTheme() {
  try {
    return localStorage.getItem('pronotif-theme') || 'light';
  } catch {
    return 'light';
  }
}

function App() {
  const [page, setPage] = useState('home');
  const [theme, setTheme] = useState(readTheme);
  const [notice, setNotice] = useState('');
  const { automations, saveAutomation, deleteAutomation, duplicateAutomation, toggleAutomation, storageAvailable } = useAutomations();
  const activeCount = countActiveAutomations(automations);

  useEffect(() => {
    const applyTheme = () => {
      const resolved = theme === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme;
      document.documentElement.dataset.theme = resolved;
    };
    applyTheme();
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', applyTheme);
    try { localStorage.setItem('pronotif-theme', theme); } catch { /* Private browsing may disable storage. */ }
    return () => media.removeEventListener('change', applyTheme);
  }, [theme]);

  useEffect(() => {
    if (!storageAvailable) {
      setNotice('Le navigateur ne permet pas d’enregistrer les automatisations');
      const timer = window.setTimeout(() => setNotice(''), 4000);
      return () => window.clearTimeout(timer);
    }
  }, [storageAvailable]);

  function handleSaveAutomation(automation) {
    if (!saveAutomation(automation)) return;
    setPage('rules');
    setNotice('Automatisation enregistrée sur cet appareil');
    window.setTimeout(() => setNotice(''), 3000);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" onClick={() => setPage('home')}>
          <span className="brand-mark"><CalendarDays size={21} /><i /></span>
          <span><b>Pronotif</b><small>Ton assistant scolaire intelligent</small></span>
        </a>
        <div className="top-actions">
          <span className="local-pill"><span /> Prototype local</span>
          <button className="icon-button theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label="Changer de thème">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>
      <main className="main-content">
        {page === 'home' && <HomePage activeCount={activeCount} onCreate={() => setPage('new')} onSettings={() => setPage('settings')} />}
        {page === 'planning' && <PlanningPage />}
        {page === 'rules' && <RulesPage rules={automations} onCreate={() => setPage('new')} onSave={handleSaveAutomation} onDelete={deleteAutomation} onDuplicate={duplicateAutomation} onToggle={toggleAutomation} />}
        {page === 'settings' && <SettingsPage theme={theme} setTheme={setTheme} />}
        {page === 'new' && <Builder onCancel={() => setPage('rules')} onSave={handleSaveAutomation} />}
      </main>
      <nav className="bottom-nav" aria-label="Navigation principale">
        {navigation.map(({ id, label, Icon, primary }) => (
          <button key={id} className={`nav-item ${page === id || (id === 'rules' && page === 'new') ? 'selected' : ''} ${primary ? 'nav-create' : ''}`} onClick={() => setPage(id)}>
            <span className="nav-icon"><Icon size={primary ? 24 : 20} /></span><small>{label}</small>
          </button>
        ))}
      </nav>
      {notice && <div className="toast"><CircleCheck size={17} />{notice}</div>}
    </div>
  );
}

export default App;
