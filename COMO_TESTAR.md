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

### 3.2 Criar um serviço novo (`/servicos/novo`)
- Preencha nome, secretaria e responsável.
- Faça upload de um arquivo PDF/DOCX/JPEG/PNG (até 20 MB).
- Teste "Salvar rascunho" (deve voltar para a Carta de Serviços com o
  serviço em "Aguardando análise").
- Crie outro e clique em **"Iniciar análise com IA"** — deve aparecer a
  barra de progresso e, em seguida, o Relatório de Achados completo
  (jornada, pontos de falha, momentos da verdade, recomendações e, como
  este veio de "Novo serviço", também um layout inicial sugerido).

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
- Troque o "Usuário atual" para alguém que **não** é o responsável do
  card e tente movê-lo para "Concluído" — deve ser bloqueado (só o
  responsável ou um Gestor podem concluir).
- Troque para o responsável (ou para a Fernanda, que é Gestora) e
  conclua o card.
- Repita até 100% dos cards — o botão **"Concluir ciclo"** deve aparecer.
- Preencha o comparativo antes/depois e confirme.

### 3.5 Histórico (`/historico`)
- O serviço concluído deve aparecer com a linha do tempo completa e o
  comparativo antes/depois (fundo vermelho/verde).
- Abra o card para ver o relatório original (somente leitura, sem botão
  de editar) e exporte de novo em PDF/Word.

### 3.6 Equipe e Configurações
- Em `/equipe`, adicione um novo membro (Analista ou Gestor).
- Em `/configuracoes`, confira a lista de secretarias cadastradas.

## 4. O que é simulado (mock) hoje

- **Análise por IA**: gera um relatório com conteúdo plausível baseado no
  nome do serviço, mas não lê o conteúdo real dos arquivos enviados. Está
  isolado em `src/lib/ai/` para ser substituído por uma chamada real à
  API da Anthropic no futuro, sem mudar o resto do sistema.
- **Login**: não existe. O seletor de "Usuário atual" é só para simular
  papéis durante os testes.
