import assert from 'node:assert/strict';
import { normalizeResultForKey } from './resultKey.ts';

// Variantes de formato numérico produzem a mesma chave
assert.equal(normalizeResultForKey('2,5'), normalizeResultForKey('2.5'));
assert.equal(normalizeResultForKey('2,50'), normalizeResultForKey('2.5'));
assert.equal(normalizeResultForKey('229,2'), normalizeResultForKey('229.20'));
assert.equal(normalizeResultForKey('1.100'), normalizeResultForKey('1100')); // milhar pt-BR
assert.equal(normalizeResultForKey('1.234,56'), normalizeResultForKey('1234.56'));

// Comparadores textuais equivalem ao símbolo
assert.equal(normalizeResultForKey('Superior a 90'), normalizeResultForKey('>90'));
assert.equal(normalizeResultForKey('Inferior a 0,5'), normalizeResultForKey('< 0.5'));
assert.equal(normalizeResultForKey('Maior que 90'), normalizeResultForKey('> 90'));

// Valores realmente diferentes NÃO colidem
assert.notEqual(normalizeResultForKey('2,5'), normalizeResultForKey('2,6'));
assert.notEqual(normalizeResultForKey('>90'), normalizeResultForKey('<90'));
assert.notEqual(normalizeResultForKey('90'), normalizeResultForKey('>90'));

// Não numéricos caem na normalização textual simples (acentos/caixa/pontuação)
assert.equal(normalizeResultForKey('Não Reagente'), normalizeResultForKey('nao reagente'));
assert.notEqual(normalizeResultForKey('Reagente'), normalizeResultForKey('Não Reagente'));

// Vazio/nulo não explode
assert.equal(normalizeResultForKey(''), '');
assert.equal(normalizeResultForKey(null), '');
assert.equal(normalizeResultForKey(undefined), '');

console.log('resultKey: todos os testes passaram');
