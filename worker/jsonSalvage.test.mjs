import assert from 'node:assert/strict';
import { salvageExamsFromTruncatedJson } from './jsonSalvage.ts';

// 1. JSON completo e válido — retorna todos os objetos
{
  const text = '{"exames": [{"nomeExame": "TSH", "resultado": "2,5"}, {"nomeExame": "T4", "resultado": "1,1"}]}';
  const out = salvageExamsFromTruncatedJson(text);
  assert.equal(out.length, 2);
  assert.equal(out[0].nomeExame, 'TSH');
  assert.equal(out[1].nomeExame, 'T4');
}

// 2. Truncado no meio do segundo objeto — resgata só o primeiro
{
  const text = '{"exames": [{"nomeExame": "TSH", "resultado": "2,5"}, {"nomeExame": "T4", "resu';
  const out = salvageExamsFromTruncatedJson(text);
  assert.equal(out.length, 1);
  assert.equal(out[0].nomeExame, 'TSH');
}

// 3. Truncado dentro de uma string com escapes — não quebra
{
  const text = '{"exames": [{"nomeExame": "Anti-HBs", "interpretacao": "linha1\\n\\"aspas\\""}, {"nomeExame": "cortado \\" no esc';
  const out = salvageExamsFromTruncatedJson(text);
  assert.equal(out.length, 1);
  assert.equal(out[0].nomeExame, 'Anti-HBs');
}

// 4. Chave "exams" (inglês) também funciona
{
  const text = '{"exams": [{"nomeExame": "Glicose"}], "outro": 1';
  const out = salvageExamsFromTruncatedJson(text);
  assert.equal(out.length, 1);
}

// 5. Sem array de exames — retorna vazio
{
  assert.deepEqual(salvageExamsFromTruncatedJson('texto sem json nenhum'), []);
  assert.deepEqual(salvageExamsFromTruncatedJson('{"resposta": "ok"}'), []);
}

// 6. Objetos com aninhamento interno (objeto e array dentro do exame)
{
  const text = '{"exames": [{"nomeExame": "Hemograma", "detalhes": {"serie": [1, 2]}}, {"nomeExame": "incompleto", "detalhes": {"serie": [1,';
  const out = salvageExamsFromTruncatedJson(text);
  assert.equal(out.length, 1);
  assert.equal(out[0].detalhes.serie.length, 2);
}

// 7. Chaves/colchetes dentro de strings não confundem o rastreio de profundidade
{
  const text = '{"exames": [{"nomeExame": "PCR", "observacao": "valor { entre } chaves [x]"}, {"nomeExame": "co';
  const out = salvageExamsFromTruncatedJson(text);
  assert.equal(out.length, 1);
  assert.equal(out[0].nomeExame, 'PCR');
}


// 8. Array vazio — retorna vazio sem erro
{
  assert.deepEqual(salvageExamsFromTruncatedJson('{"exames": []}'), []);
}

// 9. Chave "exams" (inglês) combinada com truncagem
{
  const text = '{"exams": [{"nomeExame": "Glicose", "resultado": "92"}, {"nomeExame": "cortad';
  const out = salvageExamsFromTruncatedJson(text);
  assert.equal(out.length, 1);
  assert.equal(out[0].nomeExame, 'Glicose');
}

// 10. Chave "exames" escapada dentro de uma string antes do array real — ignora a falsa
{
  const text = '{"nota": "o campo \\"exames\\": [] deve ser array", "exames": [{"nomeExame": "TSH", "resultado": "2,5"}]}';
  const out = salvageExamsFromTruncatedJson(text);
  assert.equal(out.length, 1);
  assert.equal(out[0].nomeExame, 'TSH');
}

console.log('jsonSalvage: todos os testes passaram');
