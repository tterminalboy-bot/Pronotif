import test from 'node:test';
import assert from 'node:assert/strict';
import { countActiveAutomations, normalizeAutomation } from '../src/domain/automation.js';
import { readAutomations, writeAutomations } from '../src/storage/automationRepository.js';

const validRule = {
  id: 'r-1',
  name: 'Absence de professeur',
  trigger: 'Professeur absent',
  action: 'Afficher une notification',
  subject: 'Mathématiques',
  message: 'Cours annulé',
  active: true,
  updatedAt: 'Jamais exécutée',
};

function makeStorage(initialValue = null) {
  let value = initialValue;
  return {
    getItem: () => value,
    setItem: (_key, nextValue) => { value = nextValue; },
  };
}

test('normalise une règle autorisée et ne conserve que les champs connus', () => {
  const rule = normalizeAutomation({ ...validRule, password: 'secret', active: 'true' });
  assert.equal(rule.name, validRule.name);
  assert.equal(rule.active, false);
  assert.equal('password' in rule, false);
});

test('rejette une règle sans déclencheur reconnu', () => {
  assert.equal(normalizeAutomation({ ...validRule, trigger: 'Déclencheur inventé' }), null);
});

test('compte uniquement les automatisations explicitement actives', () => {
  assert.equal(countActiveAutomations([validRule, { ...validRule, active: false }, { active: 1 }]), 1);
});

test('ignore un stockage local qui contient du JSON invalide', () => {
  assert.deepEqual(readAutomations(makeStorage('{not-json')), []);
});

test('filtre les entrées invalides lors de la lecture locale', () => {
  const storage = makeStorage(JSON.stringify([validRule, { ...validRule, trigger: 'fake' }]));
  assert.equal(readAutomations(storage).length, 1);
});

test('n’enregistre aucune propriété inconnue dans le dépôt local', () => {
  const storage = makeStorage();
  const result = writeAutomations([{ ...validRule, password: 'secret' }], storage);
  const saved = JSON.parse(storage.getItem());
  assert.equal(result.saved, true);
  assert.equal(saved.length, 1);
  assert.equal('password' in saved[0], false);
});
