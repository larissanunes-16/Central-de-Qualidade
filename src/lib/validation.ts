import { z } from "zod";

// RN-03/RN-04: nome do serviço, secretaria e responsável pela análise são obrigatórios.
export const criarServicoSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome do serviço."),
  secretariaId: z.string().min(1, "Selecione a secretaria responsável."),
  responsavelAnalise: z.string().trim().min(1, "Informe ao menos um responsável pela análise."),
  contextoAdicional: z.string().trim().optional(),
  origem: z.enum(["IMPORTADO", "CRIADO_NOVO"]).default("IMPORTADO"),
});

export const salvarComparativoSchema = z.object({
  comparativoAntes: z.string().trim().min(1, "Descreva o estado anterior do serviço."),
  comparativoDepois: z.string().trim().min(1, "Descreva as mudanças realizadas."),
});

export const criarCardResponsavelSchema = z.object({
  responsavel: z.string().trim().min(1, "Atribua um responsável ao card."),
  usuarioAtualId: z.string().min(1),
});

export const moverCardSchema = z.object({
  estado: z.enum(["PENDENTE", "EM_ANDAMENTO", "CONCLUIDO"]),
  usuarioAtualId: z.string().min(1, "Selecione o usuário atual."),
  responsavel: z.string().trim().optional(),
});

export const comentarioOuvidoriaSchema = z.object({
  texto: z.string().trim().min(1, "O comentário não pode estar vazio."),
});
