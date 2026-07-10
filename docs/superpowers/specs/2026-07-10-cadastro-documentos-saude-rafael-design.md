# Design: Cadastro e classificação de documentos "Saúde rafael"

**Data:** 2026-07-10
**Status:** Aprovado (operação de dados, sem mudança de schema)

## Objetivo

Cadastrar em produção os documentos de saúde da pasta `/home/rafael/Documentos/Saúde rafael`,
classificando cada um por **tipo**, juntando pares laudo+imagem, sem duplicar o que já
está no banco (378 registros da carga anterior).

## Taxonomia de tipos (carregada na tag `tipo:<X>`, sem mudar schema)

| Tipo | Origem típica | Cadastro |
|---|---|---|
| Exame Laboratorial | pasta "Exames de sangue" | extrai todos os marcadores (N registros) |
| Exame de Imagem/Gráfico | US, RM, TC, ECG, espirometria | 1 registro-conclusão (extração descritiva da IA) |
| Laudo/Parecer | TEA, fibromialgia, neuropsicológico | 1 registro descritivo (título + resumo) |
| Encaminhamento | referral entre médicos | 1 registro descritivo |
| Pedido/Solicitação | pedido de terapia/exame, receita | 1 registro descritivo |
| Prontuário | notas de prontuário | 1 registro descritivo por arquivo |

## Fluxo

1. **Mesclar 8 pares** laudo+imagem da pasta "Exame de Imagem" com `pdfunite`
   (laudo primeiro, imagem depois) → 1 PDF combinado por par. Pares casados removendo
   o prefixo `(NN) DATA ` e o sufixo ` imagem` e comparando a descrição.
2. **Classificar** cada documento pela pasta + palavras-chave no nome.
3. **Upload** via `POST /api/parse-pdf` (armazena PDF no R2 e retorna `pdfStoragePath`).
   - Tipos Laboratorial e Imagem: aguarda a fila e usa os marcadores extraídos pela IA.
   - Tipos Laudo/Encaminhamento/Pedido/Prontuário: cria **1 registro** localmente
     (nomeExame = título do arquivo, resultado = resumo do texto extraído), usando o
     `pdfStoragePath` do upload — não depende da extração de marcadores da IA.
4. **Tag de tipo:** todo registro recebe `tipo:<X>` anexado ao campo `tags`.
5. **Deduplicar** contra os registros já existentes (chave nome+data normalizada) antes
   de salvar via `POST /api/save-exams`.
6. **Escaneados** (sem camada de texto e 0 marcadores): coletados numa lista e
   cadastrados manualmente por leitura de visão (ex.: `laudo fibromialgia.pdf`).
7. **Ignorar** a subpasta DICOM (`AA567176R52_...`, 1854 slices + visualizador .exe/.dll).
8. **Auditoria** final: contagem por arquivo e por tipo; conferência de que todo
   documento-fonte tem ao menos 1 registro (ou está na lista de escaneados tratados).

## Fora de escopo

- Mudança de schema do banco / nova tela de "Documentos".
- Processamento dos slices DICOM.
- OCR automático no worker (escaneados tratados manualmente por visão nesta carga).

## Validação

- Todo PDF-fonte único → ≥1 registro no banco ou item resolvido na lista de escaneados.
- Nenhuma duplicata dos 378 registros pré-existentes.
- Distribuição por `tipo:` coerente com a taxonomia.
