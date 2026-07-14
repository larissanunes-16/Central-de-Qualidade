# Como testar a Central de Qualidade localmente

## 1. Subir o sistema

O Node instalado nesta máquina (18.16.0) é mais antigo que o exigido pelo
Next.js (>= 18.17). Foi instalado um Node 20 só para este projeto em:

```
C:\Users\larissa.nunes\node20\node-v20.18.0-win-x64
```

No terminal (Git Bash), antes de qualquer comando `npm`, rode:

```bash
export PATH="/c/Users/larissa.nunes/node20/node-v20.18.0-win-x64:$PATH"
cd "/c/Users/larissa.nunes/Desktop/Central de Qualidade"
npm run dev
```

Depois abra **http://localhost:3000** no navegador. Se aparecer
`EADDRINUSE`, o servidor já está rodando em segundo plano — só abra o link.

Se quiser recomeçar do zero (banco limpo com os dados de exemplo):

```bash
rm -f prisma/dev.db
npx prisma migrate dev
npx prisma db seed
```

## 2. Não existe login (ainda)

O MVP não tem autenticação. No canto inferior da barra lateral tem o
seletor **"Usuário atual"** — é assim que você troca de "quem está usando
o sistema" para testar as regras que dependem de papel (Analista vs.
Gestor).

Usuários já cadastrados (seed):
- **Ana Beatriz Lima** — Analista
- **Carlos Eduardo Souza** — Analista
- **Fernanda Rocha** — Gestora

## 3. Roteiro de teste sugerido

### 3.1 Carta de Serviços (`/carta-de-servicos`)
- Confirme os 4 cards de métricas e os 4 serviços de exemplo (cada um em
  um estado diferente do ciclo).
- Use os filtros por estado (abas) e por secretaria (pills).
- Clique em um card para abrir o painel lateral com detalhes.

### 3.2 Importar um serviço que já existe (`/servicos/novo` → "Este serviço já existe")
- Clique em **"Novo serviço"** na Carta de Serviços — abre a pergunta
  "este serviço já existe ou está sendo criado?".
- Escolha **"Este serviço já existe"** → cai no formulário de importação.
- Preencha nome, secretaria e responsável, faça upload de um arquivo
  PDF/DOCX/JPEG/PNG (até 20 MB).
- Teste "Salvar rascunho" (deve voltar para a Carta de Serviços com o
  serviço em "Aguardando análise").
- Crie outro e clique em **"Iniciar análise com IA"** — deve aparecer a
  barra de progresso e, em seguida, o Relatório de Achados completo
  (jornada, pontos de falha, momentos da verdade, recomendações).

### 3.2b Planejar um serviço que ainda não existe (`/servicos/novo` → "Está sendo criado")
- Na mesma pergunta, escolha **"Este serviço está sendo criado"** → cai
  no formulário guiado (objetivo, público-alvo, etapas previstas da
  jornada, canais, integrações — sem upload de documentos).
- Teste "Salvar rascunho" (serviço fica em **Planejamento**).
- Em outro, preencha tudo e clique em **"Gerar análise preditiva"** —
  a IA gera uma **Análise de Riscos Previstos** (riscos previstos em vez
  de pontos de falha, jornada prevista em vez de observada, mas com o
  mesmo layout sugerido de antes).
- Clique em **"Lançar serviço"** e confirme no modal — o ciclo preditivo
  é arquivado (aparece no Histórico com o selo "Lançado") e o serviço
  volta para "Aguardando análise" já num ciclo diagnóstico novo (v2),
  seguindo o fluxo normal de importação de evidências a partir daqui.

### 3.3 Relatório de Achados
- Teste **Exportar PDF** e **Exportar Word** (arquivos devem abrir
  normalmente).
- Clique em **"Editar seções"**, altere um texto e salve.
- Clique em **"Ir para materialização"**.

### 3.4 Materialização (kanban)
- Arraste um card para "Em andamento" **sem** responsável atribuído —
  deve ser bloqueado com uma mensagem de erro.
- Clique em "Atribuir responsável", digite um nome e confirme.
- Agora arraste o mesmo card para "Em andamento" — deve funcionar.
- Troque o "Usuário atual" para qualquer analista (não precisa ser o
  responsável do card) e mova-o para "Concluído" — agora funciona para
  qualquer analista ou gestor, não só para o responsável atribuído.
- Com o "Usuário atual" em um **Analista**, chegue a 100% dos cards —
  o botão "Concluir ciclo" não aparece; em vez disso, uma mensagem
  avisa que só um gestor pode concluir o ciclo.
- Troque o "Usuário atual" para a **Fernanda (Gestora)** — o botão
  **"Concluir ciclo"** aparece.
- No modal, clique em **"Gerar com IA"** — os campos Antes/Depois são
  preenchidos automaticamente a partir dos pontos de falha do relatório
  e das melhorias concluídas neste ciclo. O texto continua editável;
  ajuste se quiser e confirme.

### 3.5 Histórico (`/historico`)
- O serviço concluído deve aparecer com a linha do tempo completa e o
  comparativo antes/depois (fundo vermelho/verde).
- Abra o card para ver o relatório original (somente leitura, sem botão
  de editar) e exporte de novo em PDF/Word.
- Um serviço que passou pelo fluxo preditivo (3.2b) aparece com o selo
  violeta "Lançado" e a linha do tempo Planejamento → Análise preditiva
  → Lançado, sem comparativo antes/depois (isso só existe no ciclo
  diagnóstico seguinte, quando ele for concluído).

### 3.6 Equipe e Configurações
- Em `/equipe`, adicione um novo membro (Analista ou Gestor).
- Em `/configuracoes`, confira a lista de secretarias cadastradas.

### 3.7 Dashboard da Ouvidoria 4.0 (`/ouvidoria/dashboard`)
- Só o layout por enquanto — filtros, mini-gráficos por mês, cards de KPI,
  gráficos de natureza/sentimento/sigilo e a tabela com abas (Órgão,
  Serviço, Categoria, Grupo, Público-alvo) usam **dados de exemplo**.
  Vai ficar conectado à base real da Ouvidoria 4.0 depois.

## 4. O que é simulado (mock) hoje

- **Análise por IA**: gera um relatório com conteúdo plausível baseado no
  nome do serviço, mas não lê o conteúdo real dos arquivos enviados. Está
  isolado em `src/lib/ai/` para ser substituído por uma chamada real à
  API da Anthropic no futuro, sem mudar o resto do sistema.
- **Login**: não existe. O seletor de "Usuário atual" é só para simular
  papéis durante os testes.
