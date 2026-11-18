import test from 'node:test';
import assert from 'node:assert/strict';
import { countActiveAutomations, normalizeAutomation } from '../src/domain/automation.js';
import { readAutomations, writeAutomations } from '../src/storage/automationRepository.js';

const validRule = {
  id: 'r-1',
  name: 'Absence de professeur',
  trigger: 'Professeur absent',
  action: 'Afficher une notification',
  actionPlatforms: ['notification', 'telegram'],
  conditions: [
    { field: 'professeur', operator: 'is_set', value: '' },
    { field: 'permanence', operator: 'is_true', value: 'true' },
  ],
  conditionJoin: 'AND',
  delayAmount: 5,
  delayUnit: 'minutes',
  messageTitle: 'Alerte',
  message: 'Absence de {professeur}',
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

test('normalise une règle et ne conserve que les champs connus', () => {
  const rule = normalizeAutomation({ ...validRule, password: 'secret', active: 'true' });
  assert.equal(rule.name, validRule.name);
  assert.equal(rule.active, false);
  assert.equal(rule.conditions.length, 2);
  assert.equal(rule.actionPlatforms.length, 2);
  assert.equal('password' in rule, false);
});

test('rejette un déclencheur qui ne fait pas partie du catalogue', () => {
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

test('n’enregistre pas les propriétés inconnues ni les conditions invalides', () => {
  const storage = makeStorage();
  const result = writeAutomations([{
    ...validRule,
    password: 'secret',
    conditions: [...validRule.conditions, { field: 'unknown', operator: 'run-code', value: 'x' }],
  }], storage);
  const [saved] = JSON.parse(storage.getItem());
  assert.equal(result.saved, true);
  assert.equal(saved.conditions.length, 2);
  assert.equal('password' in saved, false);
});
