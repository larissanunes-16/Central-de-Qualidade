import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { EXTENSOES_ACEITAS, TAMANHO_MAXIMO_BYTES } from "./constants";
import { RegraNegocioError } from "./stateMachine";

const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

export function validarArquivo(nome: string, tamanhoBytes: number) {
  // RN-01: formatos aceitos. RN-02: tamanho máximo de 20 MB.
  const extensao = path.extname(nome).toLowerCase();
  if (!EXTENSOES_ACEITAS.includes(extensao)) {
    throw new RegraNegocioError(`Formato "${extensao}" não é aceito. Formatos aceitos: PDF, DOCX, JPEG, PNG.`);
  }
  if (tamanhoBytes > TAMANHO_MAXIMO_BYTES) {
    throw new RegraNegocioError(`O arquivo "${nome}" excede o tamanho máximo de 20 MB.`);
  }
}

export async function salvarArquivo(servicoId: string, nomeOriginal: string, conteudo: Buffer): Promise<string> {
  const diretorio = path.join(UPLOADS_ROOT, servicoId);
  await mkdir(diretorio, { recursive: true });
  const nomeArquivo = `${Date.now()}-${nomeOriginal.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const caminhoCompleto = path.join(diretorio, nomeArquivo);
  await writeFile(caminhoCompleto, conteudo);
  return path.join(servicoId, nomeArquivo);
}

export type DocumentoProcessado = {
  nome: string;
  tipoMime: string;
  tamanhoBytes: number;
  caminhoArquivo: string;
};

// RN-01/RN-02/RN-05: valida cada arquivo (formato e tamanho) e aceita múltiplos arquivos por importação.
export async function processarArquivos(servicoId: string, files: File[]): Promise<DocumentoProcessado[]> {
  const processados: DocumentoProcessado[] = [];
  for (const file of files) {
    validarArquivo(file.name, file.size);
    const buffer = Buffer.from(await file.arrayBuffer());
    const caminhoArquivo = await salvarArquivo(servicoId, file.name, buffer);
    processados.push({ nome: file.name, tipoMime: file.type, tamanhoBytes: file.size, caminhoArquivo });
  }
  return processados;
}
