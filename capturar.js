const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const BASE = "http://localhost:3000";
const OUT = path.join(__dirname, "preview-shots");
fs.mkdirSync(OUT, { recursive: true });

const paginas = [
  { nome: "01-carta-de-servicos", url: "/carta-de-servicos", espera: "text=Carta de Serviços" },
  { nome: "02-novo-servico", url: "/servicos/novo", espera: "text=Criação de um novo serviço" },
  { nome: "03-historico", url: "/historico", espera: "text=Histórico" },
  { nome: "04-equipe", url: "/equipe", espera: "text=Equipe" },
  { nome: "05-configuracoes", url: "/configuracoes", espera: "text=Configurações" },
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  for (const p of paginas) {
    await page.goto(`${BASE}${p.url}`, { waitUntil: "networkidle" });
    await page.waitForSelector(p.espera, { timeout: 15000 });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT, `${p.nome}.png`), fullPage: true });
    console.log("ok:", p.nome);
  }

  // Histórico -> primeiro card concluído (detalhe do relatório)
  await page.goto(`${BASE}/historico`, { waitUntil: "networkidle" });
  await page.waitForSelector("text=Histórico");
  const primeiroCard = page.locator("a[href^='/historico/']").first();
  if (await primeiroCard.count() > 0) {
    await primeiroCard.click();
    await page.waitForSelector("text=Comparativo antes/depois", { timeout: 15000 });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT, "06-historico-detalhe.png"), fullPage: true });
    console.log("ok: 06-historico-detalhe");
  }

  // Materialização de um serviço em melhoria (via carta de serviços)
  await page.goto(`${BASE}/carta-de-servicos?estado=EM_MELHORIA`, { waitUntil: "networkidle" });
  await page.waitForSelector("text=Carta de Serviços");
  const cardEmMelhoria = page.locator("button:has-text('Em melhoria')").first();
  await page.waitForTimeout(300);
  const cards = page.locator("div.rounded-xl.border.border-slate-200.bg-white");
  const count = await cards.count();
  let aberto = false;
  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const temBadge = await card.locator("text=Em melhoria").count();
    if (temBadge > 0) {
      await card.click();
      aberto = true;
      break;
    }
  }
  if (aberto) {
    await page.waitForSelector("text=Ir para materialização", { timeout: 10000 }).catch(() => {});
    await page.click("text=Ir para materialização").catch(() => {});
    await page.waitForSelector("text=Materialização das Melhorias", { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT, "07-materializacao.png"), fullPage: true });
    console.log("ok: 07-materializacao");
  }

  await browser.close();
})().catch((e) => {
  console.error("ERRO:", e.message);
  process.exit(1);
});
