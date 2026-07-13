-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ciclo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "servicoId" TEXT NOT NULL,
    "versao" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'DIAGNOSTICO',
    "dataInicio" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataConclusao" DATETIME,
    "responsavelAnalise" TEXT NOT NULL,
    "contextoAdicional" TEXT,
    "comparativoAntes" TEXT,
    "comparativoDepois" TEXT,
    "membrosParticipantes" TEXT,
    "falhaProcessamento" BOOLEAN NOT NULL DEFAULT false,
    "analiseIniciadaEm" DATETIME,
    "objetivoServico" TEXT,
    "publicoAlvo" TEXT,
    "etapasPrevistas" TEXT,
    "canaisPrevistos" TEXT,
    "integracoesPrevistas" TEXT,
    CONSTRAINT "Ciclo_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Servico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Ciclo" ("analiseIniciadaEm", "comparativoAntes", "comparativoDepois", "contextoAdicional", "dataConclusao", "dataInicio", "falhaProcessamento", "id", "membrosParticipantes", "responsavelAnalise", "servicoId", "versao") SELECT "analiseIniciadaEm", "comparativoAntes", "comparativoDepois", "contextoAdicional", "dataConclusao", "dataInicio", "falhaProcessamento", "id", "membrosParticipantes", "responsavelAnalise", "servicoId", "versao" FROM "Ciclo";
DROP TABLE "Ciclo";
ALTER TABLE "new_Ciclo" RENAME TO "Ciclo";
CREATE UNIQUE INDEX "Ciclo_servicoId_versao_key" ON "Ciclo"("servicoId", "versao");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
