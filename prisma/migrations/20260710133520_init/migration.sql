-- CreateTable
CREATE TABLE "Secretaria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "papel" TEXT NOT NULL DEFAULT 'ANALISTA'
);

-- CreateTable
CREATE TABLE "Servico" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "secretariaId" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'AGUARDANDO_ANALISE',
    "origem" TEXT NOT NULL DEFAULT 'IMPORTADO',
    "versaoAtual" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Servico_secretariaId_fkey" FOREIGN KEY ("secretariaId") REFERENCES "Secretaria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ciclo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "servicoId" TEXT NOT NULL,
    "versao" INTEGER NOT NULL,
    "dataInicio" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataConclusao" DATETIME,
    "responsavelAnalise" TEXT NOT NULL,
    "contextoAdicional" TEXT,
    "comparativoAntes" TEXT,
    "comparativoDepois" TEXT,
    "membrosParticipantes" TEXT,
    "falhaProcessamento" BOOLEAN NOT NULL DEFAULT false,
    "analiseIniciadaEm" DATETIME,
    CONSTRAINT "Ciclo_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Servico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cicloId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipoMime" TEXT NOT NULL,
    "tamanhoBytes" INTEGER NOT NULL,
    "caminhoArquivo" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Documento_cicloId_fkey" FOREIGN KEY ("cicloId") REFERENCES "Ciclo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ComentarioOuvidoria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "servicoId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ComentarioOuvidoria_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Servico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Relatorio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cicloId" TEXT NOT NULL,
    "jornada" TEXT NOT NULL,
    "pontosFalha" TEXT NOT NULL,
    "momentosVerdade" TEXT NOT NULL,
    "matrizPriorizacao" TEXT NOT NULL,
    "recomendacoes" TEXT NOT NULL,
    "layoutSugerido" TEXT,
    "geradoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editadoManualmente" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Relatorio_cicloId_fkey" FOREIGN KEY ("cicloId") REFERENCES "Ciclo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CardMelhoria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cicloId" TEXT NOT NULL,
    "recomendacaoRef" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDENTE',
    "responsavel" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concluidoEm" DATETIME,
    CONSTRAINT "CardMelhoria_cicloId_fkey" FOREIGN KEY ("cicloId") REFERENCES "Ciclo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Secretaria_nome_key" ON "Secretaria"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Ciclo_servicoId_versao_key" ON "Ciclo"("servicoId", "versao");

-- CreateIndex
CREATE UNIQUE INDEX "Relatorio_cicloId_key" ON "Relatorio"("cicloId");
