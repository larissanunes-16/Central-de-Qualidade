import { PrismaClient } from "@prisma/client";
import { gerarRelatorioMock } from "../src/lib/ai/mockAnalysis";
import { gerarAnalisePreditivaMock } from "../src/lib/ai/mockPredictiveAnalysis";
import { gerarLayoutSugeridoMock } from "../src/lib/ai/mockLayout";
import { SECRETARIAS_PADRAO } from "../src/lib/constants";

const db = new PrismaClient();

async function main() {
  const secretarias = await Promise.all(
    SECRETARIAS_PADRAO.map((nome) => db.secretaria.upsert({ where: { nome }, update: {}, create: { nome } })),
  );
  const [secti, saude, fazenda, educacao] = secretarias;

  const [ana, carlos, fernanda] = await Promise.all([
    db.usuario.upsert({
      where: { email: "ana.lima@secti.recife.pe.gov.br" },
      update: {},
      create: { nome: "Ana Beatriz Lima", email: "ana.lima@secti.recife.pe.gov.br", papel: "ANALISTA" },
    }),
    db.usuario.upsert({
      where: { email: "carlos.souza@secti.recife.pe.gov.br" },
      update: {},
      create: { nome: "Carlos Eduardo Souza", email: "carlos.souza@secti.recife.pe.gov.br", papel: "ANALISTA" },
    }),
    db.usuario.upsert({
      where: { email: "fernanda.rocha@secti.recife.pe.gov.br" },
      update: {},
      create: { nome: "Fernanda Rocha", email: "fernanda.rocha@secti.recife.pe.gov.br", papel: "GESTOR" },
    }),
  ]);

  // 1. Serviço recém-cadastrado, aguardando importação/análise.
  await db.servico.create({
    data: {
      nome: "Agendamento de Consultas",
      secretariaId: saude.id,
      estado: "AGUARDANDO_ANALISE",
      versaoAtual: 0,
    },
  });

  // 2. Serviço em análise: documentos enviados, relatório já gerado, aguardando aceite do analista.
  const servicoEmAnalise = await db.servico.create({
    data: { nome: "Emissão de Certidão de Débito Municipal", secretariaId: fazenda.id, estado: "EM_ANALISE", versaoAtual: 0 },
  });
  const cicloEmAnalise = await db.ciclo.create({
    data: {
      servicoId: servicoEmAnalise.id,
      versao: 1,
      responsavelAnalise: carlos.nome,
      analiseIniciadaEm: new Date(),
      documentos: {
        create: [
          { nome: "blueprint-certidao.pdf", tipoMime: "application/pdf", tamanhoBytes: 540000, caminhoArquivo: "seed/blueprint-certidao.pdf" },
        ],
      },
    },
  });
  const relatorioEmAnalise = await gerarRelatorioMock({
    servicoNome: servicoEmAnalise.nome,
    secretariaNome: fazenda.nome,
    documentos: [{ nome: "blueprint-certidao.pdf" }],
    comentariosOuvidoria: [],
    seed: cicloEmAnalise.id,
  });
  await db.relatorio.create({
    data: {
      cicloId: cicloEmAnalise.id,
      jornada: JSON.stringify(relatorioEmAnalise.jornada),
      pontosFalha: JSON.stringify(relatorioEmAnalise.pontosFalha),
      momentosVerdade: JSON.stringify(relatorioEmAnalise.momentosVerdade),
      matrizPriorizacao: JSON.stringify(relatorioEmAnalise.pontosFalha),
      recomendacoes: JSON.stringify(relatorioEmAnalise.recomendacoes),
    },
  });

  // 3. Serviço em melhoria: relatório aceito, cards de melhoria em progresso.
  const servicoEmMelhoria = await db.servico.create({
    data: { nome: "Solicitação de Alvará de Funcionamento", secretariaId: fazenda.id, estado: "EM_MELHORIA", versaoAtual: 0 },
  });
  const cicloEmMelhoria = await db.ciclo.create({
    data: {
      servicoId: servicoEmMelhoria.id,
      versao: 1,
      responsavelAnalise: ana.nome,
      analiseIniciadaEm: new Date(),
      membrosParticipantes: JSON.stringify([ana.nome, fernanda.nome]),
      documentos: {
        create: [{ nome: "jornada-alvara.pdf", tipoMime: "application/pdf", tamanhoBytes: 320000, caminhoArquivo: "seed/jornada-alvara.pdf" }],
      },
    },
  });
  const relatorioEmMelhoria = await gerarRelatorioMock({
    servicoNome: servicoEmMelhoria.nome,
    secretariaNome: fazenda.nome,
    documentos: [{ nome: "jornada-alvara.pdf" }],
    comentariosOuvidoria: [{ texto: "Demora muito para responder o pedido de alvará." }],
    seed: cicloEmMelhoria.id,
  });
  await db.relatorio.create({
    data: {
      cicloId: cicloEmMelhoria.id,
      jornada: JSON.stringify(relatorioEmMelhoria.jornada),
      pontosFalha: JSON.stringify(relatorioEmMelhoria.pontosFalha),
      momentosVerdade: JSON.stringify(relatorioEmMelhoria.momentosVerdade),
      matrizPriorizacao: JSON.stringify(relatorioEmMelhoria.pontosFalha),
      recomendacoes: JSON.stringify(relatorioEmMelhoria.recomendacoes),
    },
  });
  await Promise.all(
    relatorioEmMelhoria.recomendacoes.map((rec, index) =>
      db.cardMelhoria.create({
        data: {
          cicloId: cicloEmMelhoria.id,
          recomendacaoRef: rec.id,
          titulo: rec.titulo,
          categoria: rec.categoria,
          estado: index === 0 ? "CONCLUIDO" : index === 1 ? "EM_ANDAMENTO" : "PENDENTE",
          responsavel: index === 0 ? ana.nome : index === 1 ? carlos.nome : null,
          concluidoEm: index === 0 ? new Date() : null,
        },
      }),
    ),
  );

  // 4. Serviço com ciclo concluído, disponível no histórico com comparativo antes/depois.
  const servicoConcluido = await db.servico.create({
    data: { nome: "Cadastro em Programa Social", secretariaId: educacao.id, estado: "CONCLUIDO", versaoAtual: 1 },
  });
  const cicloConcluido = await db.ciclo.create({
    data: {
      servicoId: servicoConcluido.id,
      versao: 1,
      responsavelAnalise: fernanda.nome,
      analiseIniciadaEm: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      dataInicio: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      dataConclusao: new Date(),
      membrosParticipantes: JSON.stringify([fernanda.nome, ana.nome]),
      comparativoAntes: "Usuários precisavam comparecer presencialmente para confirmar dados cadastrais, gerando filas e demora de até 15 dias para análise.",
      comparativoDepois: "Confirmação de dados passou a ser feita 100% online, com prazo médio de análise reduzido para 3 dias e notificação automática por SMS.",
      documentos: {
        create: [{ nome: "roteiro-entrevistas-cadastro.pdf", tipoMime: "application/pdf", tamanhoBytes: 210000, caminhoArquivo: "seed/roteiro-entrevistas-cadastro.pdf" }],
      },
    },
  });
  const relatorioConcluido = await gerarRelatorioMock({
    servicoNome: servicoConcluido.nome,
    secretariaNome: educacao.nome,
    documentos: [{ nome: "roteiro-entrevistas-cadastro.pdf" }],
    comentariosOuvidoria: [],
    seed: cicloConcluido.id,
  });
  await db.relatorio.create({
    data: {
      cicloId: cicloConcluido.id,
      jornada: JSON.stringify(relatorioConcluido.jornada),
      pontosFalha: JSON.stringify(relatorioConcluido.pontosFalha),
      momentosVerdade: JSON.stringify(relatorioConcluido.momentosVerdade),
      matrizPriorizacao: JSON.stringify(relatorioConcluido.pontosFalha),
      recomendacoes: JSON.stringify(relatorioConcluido.recomendacoes),
    },
  });
  await Promise.all(
    relatorioConcluido.recomendacoes.map((rec) =>
      db.cardMelhoria.create({
        data: {
          cicloId: cicloConcluido.id,
          recomendacaoRef: rec.id,
          titulo: rec.titulo,
          categoria: rec.categoria,
          estado: "CONCLUIDO",
          responsavel: fernanda.nome,
          concluidoEm: new Date(),
        },
      }),
    ),
  );

  // 5. Serviço novo em planejamento: formulário guiado ainda em rascunho, sem análise gerada.
  const servicoPlanejamento = await db.servico.create({
    data: { nome: "Poda Programada de Árvores via App", secretariaId: secti.id, origem: "CRIADO_NOVO", estado: "PLANEJAMENTO", versaoAtual: 0 },
  });
  await db.ciclo.create({
    data: {
      servicoId: servicoPlanejamento.id,
      versao: 1,
      tipo: "PREDITIVO",
      responsavelAnalise: carlos.nome,
      objetivoServico: "Permitir que moradores solicitem a poda de árvores em vias públicas sem precisar ir a uma unidade de atendimento.",
      publicoAlvo: "Moradores do Recife com árvores próximas à residência que oferecem risco ou obstrução.",
      etapasPrevistas: JSON.stringify(["Solicitação pelo app", "Triagem técnica", "Agendamento da equipe", "Execução da poda", "Confirmação de conclusão"]),
      canaisPrevistos: JSON.stringify(["Aplicativo", "Telefone"]),
    },
  });

  // 6. Serviço novo com análise preditiva já gerada, pronto para ser lançado.
  const servicoPreditivo = await db.servico.create({
    data: { nome: "Emissão Digital de Alvará de Evento", secretariaId: fazenda.id, origem: "CRIADO_NOVO", estado: "ANALISE_PREDITIVA", versaoAtual: 0 },
  });
  const cicloPreditivo = await db.ciclo.create({
    data: {
      servicoId: servicoPreditivo.id,
      versao: 1,
      tipo: "PREDITIVO",
      responsavelAnalise: ana.nome,
      analiseIniciadaEm: new Date(),
      objetivoServico: "Permitir que organizadores de eventos solicitem o alvará de funcionamento inteiramente online.",
      publicoAlvo: "Produtores culturais e organizadores de eventos de pequeno e médio porte.",
      etapasPrevistas: JSON.stringify(["Cadastro do evento", "Envio de documentação", "Análise de segurança", "Pagamento da taxa", "Emissão do alvará"]),
      canaisPrevistos: JSON.stringify(["Site", "Aplicativo"]),
      integracoesPrevistas: "Integração com o sistema de pagamento municipal e com o Corpo de Bombeiros.",
    },
  });
  const relatorioPreditivo = await gerarAnalisePreditivaMock({
    servicoNome: servicoPreditivo.nome,
    secretariaNome: fazenda.nome,
    objetivoServico: "Permitir que organizadores de eventos solicitem o alvará de funcionamento inteiramente online.",
    publicoAlvo: "Produtores culturais e organizadores de eventos de pequeno e médio porte.",
    etapasPrevistas: ["Cadastro do evento", "Envio de documentação", "Análise de segurança", "Pagamento da taxa", "Emissão do alvará"],
    canaisPrevistos: ["Site", "Aplicativo"],
    integracoesPrevistas: "Integração com o sistema de pagamento municipal e com o Corpo de Bombeiros.",
    seed: cicloPreditivo.id,
  });
  const layoutSugeridoPreditivo = gerarLayoutSugeridoMock(servicoPreditivo.nome, cicloPreditivo.id);
  await db.relatorio.create({
    data: {
      cicloId: cicloPreditivo.id,
      jornada: JSON.stringify(relatorioPreditivo.jornada),
      pontosFalha: JSON.stringify(relatorioPreditivo.pontosFalha),
      momentosVerdade: JSON.stringify(relatorioPreditivo.momentosVerdade),
      matrizPriorizacao: JSON.stringify(relatorioPreditivo.pontosFalha),
      recomendacoes: JSON.stringify(relatorioPreditivo.recomendacoes),
      layoutSugerido: JSON.stringify(layoutSugeridoPreditivo),
    },
  });

  console.log("Seed concluído.");
  console.log({ secti: secti.nome, secretarias: secretarias.length, usuarios: 3 });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
