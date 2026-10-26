// Checagem de qualidade da landing page do Day1 Endeavor 2026.
// Todas as avaliações saem como SIM ou NÃO (ver GUIA-DE-CHECAGEM.md).
//
// Uso:
//   node checagem.mjs                      página local, todos os tamanhos e navegadores
//   node checagem.mjs --rapido             só Chromium e 5 tamanhos
//   node checagem.mjs --url <endereço>     testa um endereço publicado (ex.: produção)
//   node checagem.mjs --sem-prints         não tira prints
//   node checagem.mjs --sem-links-externos não consulta os sites de destino (C06)
// Opções usadas pelo teste dos testes (testar-checagens.mjs):
//   --html <arquivo>   serve este arquivo no lugar do index.html
//   --saida <pasta>    grava o relatório em outra pasta
//   --viewports a,b    só estes tamanhos (no Chromium)
//   --partes a,b       só estas partes: geral, contador, preferencias, desempenho, telas
import { chromium, webkit, firefox, request as pwRequest } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CATALOGO } from "./lib/catalogo.mjs";
import { gerarRelatorio } from "./lib/relatorio.mjs";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, "..");
const argsCedo = process.argv.slice(2);
const SAIDA = argsCedo.includes("--saida") ? path.resolve(argsCedo[argsCedo.indexOf("--saida") + 1]) : path.join(AQUI, "relatorio");
const NO_NAVEGADOR = path.join(AQUI, "lib", "no-navegador.js");

const args = process.argv.slice(2);
const opcao = (nome) => args.includes(nome);
const valor = (nome) => { const i = args.indexOf(nome); return i >= 0 ? args[i + 1] : null; };
const RAPIDO = opcao("--rapido");
const SEM_PRINTS = opcao("--sem-prints");
const SEM_EXTERNOS = opcao("--sem-links-externos");

// Regras do evento (CLAUDE.md e DESIGN.md 2.1)
const FORM_URL = "https://forms.gle/UK5mzH7c9cRPeHNh6";
const FEVER_URL = "https://feverup.com/m/712650";
const ONLINE_URL = "https://endeavor.org.br/day1-2026/";
const ENDEAVOR_URL = "https://brasil.endeavor.org";
const SITE_URL = "https://endeavor-landing-page.vercel.app/";
const DATA_EVENTO = "2026-10-26";
const CTA_TEXTO = "Quero meu ingresso gratuito";
const PALESTRANTES_2026 = ["mariano-gomide.png", "daniela-e-juliana-binatti.png", "carol-matsuse-e-yuri-gricheno.png",
  "sergio-lopes-e-edgar-diniz.png", "bernardinho.png", "antonio-carlos-pipponzi.png"];

// Tamanhos de tela (largura × altura visível). Ver o guia para o motivo de cada um.
const VIEWPORTS = [
  // Caso-limite (decisão do usuário em 26/10/2026): com os 3 tamanhos de fonte do DESIGN.md 2.2,
  // título + subtítulo + botão não cabem em 568px de altura e o texto do botão não cabe em 252px.
  // Este tamanho roda todas as checagens, menos as 5 de PULAR_NO_LIMITE.
  { id: "320x568", nome: "iPhone SE 1ª geração (caso-limite)", w: 320, h: 568, dpr: 2, tipo: "celular", limite: true },
  { id: "360x800", nome: "Android mais comum (Galaxy A/S)", w: 360, h: 800, dpr: 2, tipo: "celular" },
  { id: "375x667", nome: "iPhone SE 2/3, iPhone 8", w: 375, h: 667, dpr: 2, tipo: "celular" },
  { id: "390x844", nome: "iPhone 12/13/14", w: 390, h: 844, dpr: 2, tipo: "celular" },
  { id: "390x664", nome: "iPhone 14 com as barras do Safari (área visível real)", w: 390, h: 664, dpr: 2, tipo: "celular" },
  { id: "393x852", nome: "iPhone 15/16, Pixel", w: 393, h: 852, dpr: 2, tipo: "celular" },
  { id: "430x932", nome: "iPhone Pro Max / Plus", w: 430, h: 932, dpr: 2, tipo: "celular" },
  { id: "768x1024", nome: "iPad (retrato)", w: 768, h: 1024, dpr: 2, tipo: "tablet" },
  { id: "820x1180", nome: "iPad Air (retrato)", w: 820, h: 1180, dpr: 2, tipo: "tablet" },
  { id: "1024x768", nome: "iPad (paisagem)", w: 1024, h: 768, dpr: 2, tipo: "tablet" },
  { id: "1280x720", nome: "Notebook HD", w: 1280, h: 720, dpr: 1, tipo: "desktop" },
  { id: "1366x657", nome: "Notebook 1366×768 com a barra do navegador", w: 1366, h: 657, dpr: 1, tipo: "desktop" },
  { id: "1440x900", nome: "MacBook Air 13\"", w: 1440, h: 900, dpr: 1, tipo: "desktop" },
  { id: "1536x730", nome: "Notebook Full HD com zoom 125% (Windows), com navegador", w: 1536, h: 730, dpr: 1, tipo: "desktop" },
  { id: "1920x953", nome: "Monitor Full HD com navegador", w: 1920, h: 953, dpr: 1, tipo: "desktop" },
  { id: "2560x1305", nome: "Monitor QHD/2K com navegador", w: 2560, h: 1305, dpr: 1, tipo: "desktop" },
];
const PULAR_NO_LIMITE = ["D02", "D03", "D04", "C13", "L03"];
const HTML = valor("--html") ? path.resolve(valor("--html")) : null;
const SO_VPS = valor("--viewports") ? valor("--viewports").split(",") : null;
const PARTES = valor("--partes") ? valor("--partes").split(",") : ["geral", "contador", "preferencias", "desempenho", "telas"];
// Em quais tamanhos cada navegador roda, e onde rodam os testes mais longos.
const PLANO = SO_VPS
  ? { chromium: { vps: SO_VPS, cliques: SO_VPS, axe: SO_VPS, teclado: SO_VPS.filter((id) => VIEWPORTS.find((v) => v.id === id)?.tipo === "desktop") } }
  : RAPIDO
  ? { chromium: { vps: ["375x667", "390x844", "1366x657", "1440x900", "1920x953"], cliques: ["390x844", "1440x900"], axe: ["390x844", "1440x900"], teclado: ["1440x900"] } }
  : {
      chromium: { vps: VIEWPORTS.map((v) => v.id), cliques: ["390x844", "1440x900"], axe: ["390x844", "1440x900"], teclado: ["1440x900"] },
      webkit: { vps: ["375x667", "390x844", "390x664", "430x932", "820x1180", "1440x900"], cliques: ["390x844", "1440x900"], axe: ["390x844"], teclado: [] },
      firefox: { vps: ["1366x657", "1920x953"], cliques: ["1366x657"], axe: [], teclado: [] },
    };
const MOTORES = { chromium, webkit, firefox };

// Seções fotografadas em cada tamanho
const SECOES = [
  { id: "01-dobra", nome: "Primeira dobra (o que aparece sem rolar)", tipo: "tela" },
  { id: "02-hero", nome: "Hero (seção inteira)", sel: "#topo" },
  { id: "03-faixa", nome: "Faixa rolante", sel: ".marquee" },
  { id: "04-palestrantes", nome: "Quem sobe no palco", sel: "#palestrantes" },
  { id: "05-como-funciona", nome: "Como funciona (ingresso gratuito)", sel: "#como-funciona" },
  { id: "06-informacoes", nome: "Informações práticas", sel: "#informacoes" },
  { id: "07-patrocinio", nome: "Patrocínio e apoio", sel: "#apoio" },
  { id: "08-cta-final", nome: "CTA final", sel: "#final" },
  { id: "09-rodape", nome: "Rodapé", sel: ".site-footer" },
  { id: "10-barra-fixa", nome: "Barra fixa durante a rolagem", tipo: "barra" },
  { id: "11-pagina-inteira", nome: "Página inteira", tipo: "inteira" },
];

// ---------------------------------------------------------------- resultados
const resultados = [];
const prints = [];
const inventario = [];
const errosExecucao = [];
const isentos = []; // checagens puladas no caso-limite, com o resultado real (não entram no placar)
const GERAL = { navegador: "—", viewport: "geral" };
function registrar(id, ctx, ok, detalhe = "") {
  if (!CATALOGO[id]) throw new Error(`Checagem desconhecida: ${id}`);
  if (ctx.limite && PULAR_NO_LIMITE.includes(id)) {
    isentos.push({ id, navegador: ctx.navegador, viewport: ctx.viewport, ok: !!ok, detalhe: String(detalhe || "") });
    return;
  }
  resultados.push({ id, navegador: ctx.navegador, viewport: ctx.viewport, ok: !!ok, detalhe: String(detalhe || "") });
}
const lista = (itens, max = 8) => (itens.length ? itens.slice(0, max).join(" · ") + (itens.length > max ? ` · (+${itens.length - max})` : "") : "");
const kb = (b) => `${Math.round(b / 1024)} KB`;
const mb = (b) => `${(b / 1024 / 1024).toFixed(2)} MB`;
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const mesmoEndereco = (a, b) => { try { return decodeURIComponent(new URL(a).href) === decodeURIComponent(new URL(b).href); } catch { return a === b; } };
const semBarra = (u) => u.replace(/\/+$/, "");

// ---------------------------------------------------------------- servidor local
function servir(raiz) {
  const tipos = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon", ".json": "application/json" };
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    const arq = HTML && p === "/index.html" ? HTML : path.join(raiz, p);
    if ((!arq.startsWith(raiz) && arq !== HTML) || !fs.existsSync(arq) || fs.statSync(arq).isDirectory()) { res.writeHead(404); return res.end("404"); }
    res.writeHead(200, { "Content-Type": tipos[path.extname(arq).toLowerCase()] || "application/octet-stream" });
    fs.createReadStream(arq).pipe(res);
  });
  return new Promise((ok) => server.listen(0, "127.0.0.1", () => ok(server)));
}

// ---------------------------------------------------------------- utilidades de página
async function novaPagina(browser, nav, vp, extra = {}) {
  const movel = vp.tipo !== "desktop";
  const context = await browser.newContext({
    viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: vp.dpr,
    isMobile: movel && nav !== "firefox", hasTouch: movel && nav !== "firefox",
    locale: "pt-BR", timezoneId: "America/Sao_Paulo", acceptDownloads: true, ...extra,
  });
  if (extra.javaScriptEnabled !== false) await context.addInitScript({ path: NO_NAVEGADOR });
  const page = await context.newPage();
  return { context, page };
}
// O aviso inicial pede o horário do contador. As checagens usam o do dispositivo, que é o que
// page.clock controla nos cenários do contador (R10). Depois do clique o mouse sai de cima da página,
// senão ele fica sobre o botão do hero (em hover) e atrapalha as medições.
async function fecharAviso(page) {
  await page.locator('#aviso[open] button[value="dispositivo"]').click({ timeout: 5000 }).catch(() => {});
  await page.mouse.move(0, 0).catch(() => {});
}
async function carregar(page, url = BASE) {
  const resp = await page.goto(url, { waitUntil: "load", timeout: 60000 });
  await fecharAviso(page);
  await page.evaluate(() => document.fonts.ready.then(() => true)).catch(() => {});
  await page.waitForTimeout(1800); // animação de entrada do hero
  return resp;
}
async function rolarTudo(page) {
  await page.evaluate(async () => {
    const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
    for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.5) {
      scrollTo({ top: y, behavior: "instant" });
      await dormir(140);
    }
    scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" });
    await dormir(400);
  });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await page.evaluate(() => Promise.all([...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 8000); }))));
}
const rolarPara = (page, y) => page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), y);
async function esperarRolagemParar(page) {
  let ultimo = -1;
  for (let i = 0; i < 40; i++) {
    const y = await page.evaluate(() => scrollY);
    if (y === ultimo) return;
    ultimo = y;
    await page.waitForTimeout(120);
  }
}
async function estadoBarras(page) {
  return page.evaluate(() => ["sticky-cta", "topbar"].map((id) => {
    const el = document.getElementById(id), r = el.getBoundingClientRect();
    return { id, display: getComputedStyle(el).display, classe: el.classList.contains("is-visible"),
      naTela: r.bottom > 1 && r.top < innerHeight - 1, ret: { top: r.top, bottom: r.bottom, left: r.left, right: r.right } };
  }));
}
async function fotografar(page, alvo, arquivo, opcoes) {
  const destino = path.join(SAIDA, arquivo);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  const base = { path: destino, type: "jpeg", quality: opcoes?.qualidade || 80, animations: "disabled", timeout: 60000 };
  if (alvo === "tela") await page.screenshot(base);
  else if (alvo === "inteira") await page.screenshot({ ...base, fullPage: true, quality: 60 });
  else await page.locator(alvo).first().screenshot(base);
}

// ---------------------------------------------------------------- avaliação por tamanho de tela
async function avaliarViewport(browser, nav, vp, plano) {
  const ctx = { navegador: nav, viewport: vp.id, limite: !!vp.limite };
  const movel = vp.tipo !== "desktop";
  const layoutCelular = vp.w <= 860;
  const { context, page } = await novaPagina(browser, nav, vp);
  const erros = [], falhas = [], tamanhos = [];
  page.on("pageerror", (e) => erros.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") erros.push(m.text()); });
  page.on("requestfailed", (r) => { if (!/^(blob|data):/.test(r.url())) falhas.push(`${r.failure()?.errorText || "falha"} ${r.url()}`); });
  page.on("response", (r) => { if (r.status() >= 400) falhas.push(`${r.status()} ${r.url()}`); });
  page.on("requestfinished", (r) => tamanhos.push(r.sizes().then((s) => ({ url: r.url(), tipo: r.resourceType(), bytes: s.responseBodySize + s.responseHeadersSize })).catch(() => null)));

  await carregar(page);
  const iniciais = (await Promise.all([...tamanhos])).filter(Boolean);
  const pasta = `prints/${nav}/${vp.id}`;
  if (!SEM_PRINTS) {
    await fotografar(page, "tela", `${pasta}/01-dobra.jpg`);
    prints.push({ navegador: nav, viewport: vp.id, secao: "01-dobra", arquivo: `${pasta}/01-dobra.jpg` });
  }

  // ---- Primeira dobra (página no topo)
  const a0 = await page.evaluate(() => __qa.auditar());
  registrar("D01", ctx, a0.dobra.h1);
  registrar("D02", ctx, a0.dobra.lead);
  registrar("D03", ctx, a0.dobra.cta, a0.dobra.cta ? "" : `Botão de ${a0.dobra.ctaRet?.top}px a ${a0.dobra.ctaRet?.bottom}px; a tela mostra até ${a0.vh}px.`);
  registrar("D04", ctx, a0.dobra.fever);
  registrar("D05", ctx, a0.logoNoTriangulo?.ok, a0.logoNoTriangulo ? `Pior canto: ${a0.logoNoTriangulo.pior} (limite 1)` : "Logo ou triângulo não encontrado");
  registrar("D06", ctx, a0.contador?.ok, a0.contador ? (a0.contador.ok ? "" : `${a0.contador.foraCirculo} canto(s) fora do círculo${a0.contador.cortado ? "; cortado pela borda" : ""}`) : "Contador não visível");
  registrar("D07", ctx, a0.selo ? a0.selo.ok : true, a0.selo ? `Folga entre selo e contador: ${a0.selo.folga}px` : "Selo não visível neste tamanho");
  registrar("V06", ctx, a0.diagonal && a0.diagonal.cor === "teal" && a0.diagonal.w >= 100 && a0.diagonal.display !== "none", a0.diagonal ? `${a0.diagonal.cor}, ${a0.diagonal.w}px` : "");
  // "Fora da dobra" = começa mais de uma tela abaixo da primeira (só aparece depois de rolar
  // mais de uma tela). Uma imagem logo abaixo da dobra no celular e dentro dela no desktop
  // (como o logo do hero) não deve ser adiada.
  const acimaDaDobra = new Set(a0.imagens.filter((i) => i.visivel && !i.fixo && i.top < a0.vh).map((i) => i.src));
  const lazyErrado = a0.imagens.filter((i) => i.visivel && !i.fixo && i.top < a0.vh && i.lazy).map((i) => `${i.src} (na dobra, com lazy)`)
    .concat(a0.imagens.filter((i) => !i.fixo && i.top >= 2 * a0.vh && !i.lazy && !acimaDaDobra.has(i.src)).map((i) => `${i.src} (fora da dobra, sem lazy)`));
  registrar("P07", ctx, lazyErrado.length === 0, lista(lazyErrado));

  const fontes = await page.evaluate(() => {
    const carregadas = new Set([...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family.replace(/["']/g, "")));
    return ["Hanken Grotesk", "Inter", "Unbounded"].map((f) => [f, carregadas.has(f)]);
  });
  registrar("T05", ctx, fontes.every(([, ok]) => ok), lista(fontes.filter(([, ok]) => !ok).map(([f]) => `${f} não carregou`)));

  // ---- Rola a página inteira (dispara animações de entrada e imagens preguiçosas)
  await rolarTudo(page);
  await rolarPara(page, 0);
  await page.waitForTimeout(700);
  const a = await page.evaluate(() => __qa.auditar());

  registrar("L14", ctx, a.reveals.faltando.length === 0, lista(a.reveals.faltando));
  registrar("T06", ctx, a.transbordando.length === 0, lista(a.transbordando));
  registrar("L01", ctx, a.cortados.length === 0, lista(a.cortados));
  registrar("L02", ctx, a.sobreposicoes.length === 0, lista(a.sobreposicoes));
  registrar("L03", ctx, a.botoesQuebrados.length === 0, lista(a.botoesQuebrados));
  const permitidos = layoutCelular ? [32, 20, 16, 72] : [50, 22, 16, 112];
  const forasDeEscala = Object.entries(a.fontes).filter(([s]) => !permitidos.includes(+s));
  registrar("L04", ctx, forasDeEscala.length === 0, forasDeEscala.length ? forasDeEscala.map(([s, ex]) => `${s}px: ${ex.join("; ")}`).join(" · ") : `Tamanhos usados: ${Object.keys(a.fontes).join(", ")}px`);
  const pequenas = Object.entries(a.fontes).filter(([s]) => +s < 16);
  registrar("L05", ctx, pequenas.length === 0, pequenas.map(([s, ex]) => `${s}px: ${ex.join("; ")}`).join(" · "));

  const imgsVisiveis = a.imagens.filter((i) => i.visivel);
  const quebradas = imgsVisiveis.filter((i) => !i.completa || i.nw === 0).map((i) => i.src);
  registrar("T04", ctx, quebradas.length === 0, lista(quebradas));
  const escala = (i) => (i.fit === "cover" ? Math.max(i.rw / i.nw, i.rh / i.nh) : i.fit === "contain" ? Math.min(i.rw / i.nw, i.rh / i.nh) : i.rw / i.nw);
  const rasters = imgsVisiveis.filter((i) => !i.svg && i.nw > 0);
  const distorcidas = rasters.filter((i) => !["cover", "contain"].includes(i.fit) && Math.abs(i.rw / i.rh - i.nw / i.nh) / (i.nw / i.nh) > 0.02)
    .map((i) => `${i.src} (${Math.round(i.rw)}×${Math.round(i.rh)} vs ${i.nw}×${i.nh})`);
  registrar("L06", ctx, distorcidas.length === 0, lista(distorcidas));
  const ampliadas = rasters.filter((i) => escala(i) > 1.01).map((i) => `${i.src} (${escala(i).toFixed(2)}×)`);
  registrar("L07", ctx, ampliadas.length === 0, lista(ampliadas));
  const naoRetina = rasters.filter((i) => escala(i) > 0.51).map((i) => `${i.src} (arquivo ${i.nw}px, exibido ${Math.round(i.rw)}px)`);
  registrar("L08", ctx, naoRetina.length === 0, lista(naoRetina));
  registrar("L09", ctx, a.cards?.ok, a.cards ? `${a.cards.colunas} coluna(s), ${a.cards.linhas} linha(s)${a.cards.mesmoTamanho ? "" : "; tamanhos diferentes"}${a.cards.colunasOk ? "" : "; colunas desalinhadas"}` : "Cards não encontrados");
  registrar("L10", ctx, a.linhasLongas.length === 0, lista(a.linhasLongas));
  registrar("L13", ctx, a.semMargem.length === 0, lista(a.semMargem));

  registrar("A03", ctx, a.contraste.length === 0, lista(a.contraste));
  const paleta = Object.entries(a.foraDaPaleta);
  registrar("V01", ctx, paleta.length === 0, paleta.map(([h, ex]) => `${h}: ${ex.join("; ")}`).join(" · "));
  registrar("V02", ctx, a.sombras.length === 0, lista(a.sombras));
  registrar("V03", ctx, a.cantos.length === 0, lista(a.cantos));
  registrar("V04", ctx, a.gradientes.length === 0, lista(a.gradientes));
  const titulosFracos = a.titulos.filter((t) => !/founders grotesk|hanken grotesk/i.test(t.fonte) || t.peso < 700);
  registrar("V05", ctx, titulosFracos.length === 0, lista(titulosFracos.map((t) => `${t.desc}: ${t.fonte} ${t.peso}`)));

  // Clicáveis: destino, rel, tamanho, cursor
  const clicaveis = a.cliques.filter((c) => c.visivel && (!c.barra || c.barraDisplay !== "none"));
  const semDestino = a.cliques.filter((c) => c.tag === "a" && (!c.href || c.href === "#" || /^javascript:/i.test(c.href))).map((c) => c.desc);
  registrar("C01", ctx, semDestino.length === 0, lista(semDestino));
  const semNoopener = a.cliques.filter((c) => c.target === "_blank" && !/noopener|noreferrer/.test(c.rel)).map((c) => c.desc);
  registrar("C04", ctx, semNoopener.length === 0, lista(semNoopener));
  const pequenos24 = clicaveis.filter((c) => c.w < 24 || c.h < 24).map((c) => `${c.desc} (${c.w}×${c.h})`);
  registrar("C10", ctx, pequenos24.length === 0, lista(pequenos24));
  if (movel) {
    const pequenos44 = clicaveis.filter((c) => c.w < 44 || c.h < 44).map((c) => `${c.desc} (${c.w}×${c.h})`);
    registrar("C11", ctx, pequenos44.length === 0, lista(pequenos44));
  }
  registrar("C12", ctx, a.cursorSemAcao.length === 0, lista(a.cursorSemAcao));
  const destaqueErrado = a.cliques.filter((c) => (c.fundoTeal || /\bbtn\b/.test(c.classe)) && c.hrefAbs && !mesmoEndereco(c.hrefAbs, FORM_URL)).map((c) => `${c.desc} → ${c.hrefAbs}`);
  registrar("R09", ctx, destaqueErrado.length === 0, lista(destaqueErrado));

  registrar("A04", ctx, a.imgsSemAlt.length === 0, lista(a.imgsSemAlt));
  const h1s = a.titulosOrdem.filter((n) => n === 1).length;
  const saltos = a.titulosOrdem.filter((n, i) => i > 0 && n - a.titulosOrdem[i - 1] > 1).length;
  registrar("A05", ctx, h1s === 1 && saltos === 0, `${h1s} H1; ${saltos} salto(s) de nível; ordem: ${a.titulosOrdem.map((n) => "H" + n).join(" ")}`);
  registrar("A12", ctx, Object.values(a.regioes).every(Boolean), Object.entries(a.regioes).filter(([, ok]) => !ok).map(([r]) => `falta ${r}`).join(", "));
  registrar("A13", ctx, a.idsRepetidos.length === 0, lista(a.idsRepetidos));

  // ---- C15: botão de inscrição ao fim de cada seção
  const semCta = [];
  for (const sel of ["#topo", "#palestrantes", "#como-funciona", "#informacoes", "#apoio", "#final"]) {
    const y = await page.evaluate((sel) => { const s = document.querySelector(sel).getBoundingClientRect(); return Math.max(0, s.bottom + scrollY - innerHeight); }, sel);
    await rolarPara(page, y);
    await page.waitForTimeout(500);
    const tem = await page.evaluate((form) => [...document.querySelectorAll("a[href]")].some((el) => el.href === form
      && __qa.visivel(el) && (() => { const r = el.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth; })()
      && __qa.naoCoberto(el)), FORM_URL);
    if (!tem) semCta.push(sel);
  }
  registrar("C15", ctx, semCta.length === 0, semCta.length ? `Sem botão visível ao fim de: ${semCta.join(", ")}` : "");

  // ---- C13/C14: barras fixas
  const qual = layoutCelular ? "sticky-cta" : "topbar";
  const barraId = layoutCelular ? "C13" : "C14";
  await rolarPara(page, 0); await page.waitForTimeout(500);
  const b0 = (await estadoBarras(page)).find((b) => b.id === qual);
  const yMeio = await page.evaluate(() => document.querySelector("#palestrantes").getBoundingClientRect().top + scrollY + 200);
  await rolarPara(page, yMeio); await page.waitForTimeout(500);
  const b1 = (await estadoBarras(page)).find((b) => b.id === qual);
  if (!SEM_PRINTS) {
    await fotografar(page, "tela", `${pasta}/10-barra-fixa.jpg`);
    prints.push({ navegador: nav, viewport: vp.id, secao: "10-barra-fixa", arquivo: `${pasta}/10-barra-fixa.jpg` });
  }
  await page.evaluate(() => document.getElementById("final-cta").scrollIntoView({ block: "center", behavior: "instant" }));
  await page.waitForTimeout(500);
  const b2 = (await estadoBarras(page)).find((b) => b.id === qual);
  const barraOk = !b0.naTela && b1.naTela && b1.classe && !b2.naTela;
  registrar(barraId, ctx, barraOk, `topo: ${b0.naTela ? "visível" : "escondida"} · meio: ${b1.naTela ? "visível" : "escondida"} · CTA final: ${b2.naTela ? "visível" : "escondida"} (esperado: escondida · visível · escondida)`);

  // ---- L11: barra fixa x rodapé
  await rolarPara(page, 1e7); await page.waitForTimeout(500);
  const cobreRodape = await page.evaluate(() => {
    const barras = [...document.querySelectorAll(".sticky-cta, .topbar")].filter((b) => getComputedStyle(b).display !== "none")
      .map((b) => b.getBoundingClientRect()).filter((r) => r.bottom > 1 && r.top < innerHeight - 1);
    const itens = [...document.querySelectorAll(".site-footer img, .site-footer p, .site-footer a")];
    return itens.filter((el) => { const r = el.getBoundingClientRect(); return barras.some((b) => r.bottom > b.top + 1 && r.top < b.bottom - 1); }).map((el) => __qa.descrever(el));
  });
  registrar("L11", ctx, cobreRodape.length === 0, lista(cobreRodape));

  // ---- Prints das seções (barras fixas e barra de progresso escondidas)
  if (!SEM_PRINTS) {
    await rolarPara(page, 0); await page.waitForTimeout(300);
    const estilo = await page.addStyleTag({ content: ".topbar, .sticky-cta, .progress { visibility: hidden !important; }" });
    for (const s of SECOES.filter((s) => s.sel || s.tipo === "inteira")) {
      const arquivo = `${pasta}/${s.id}.jpg`;
      try {
        await fotografar(page, s.sel || "inteira", arquivo);
        prints.push({ navegador: nav, viewport: vp.id, secao: s.id, arquivo });
      } catch (e) { errosExecucao.push(`Print ${s.id} em ${nav} ${vp.id}: ${e.message.split("\n")[0]}`); }
    }
    await estilo.evaluate((el) => el.remove());
  }

  // ---- Peso e requisições de UM carregamento completo (antes dos testes de clique e teclado,
  // que recarregam a página e contariam tudo de novo)
  if (nav === "chromium") {
    const todos = (await Promise.all([...tamanhos])).filter(Boolean);
    const soma = (xs) => xs.reduce((t, x) => t + x.bytes, 0);
    registrar("P01", ctx, soma(todos) <= 3 * 1024 * 1024, `${mb(soma(todos))} em ${todos.length} requisições`);
    registrar("P02", ctx, soma(iniciais) <= 1.5 * 1024 * 1024, `${mb(soma(iniciais))} em ${iniciais.length} requisições`);
    const grandes = todos.filter((x) => x.tipo === "image" && x.bytes > 300 * 1024).sort((x, y) => y.bytes - x.bytes)
      .map((x) => `${decodeURIComponent(new URL(x.url).pathname).split("/").pop()} (${kb(x.bytes)})`);
    registrar("P03", ctx, grandes.length === 0, lista(grandes, 12));
    registrar("P09", ctx, todos.length <= 60, `${todos.length} requisições`);
  }

  // ---- Cliques, hover, axe e teclado
  if (plano.cliques.includes(vp.id)) await testarCliques(page, context, ctx, a, vp);
  if (plano.axe.includes(vp.id)) await rodarAxe(page, ctx);
  if (plano.teclado.includes(vp.id)) await testarTeclado(page, ctx);

  // ---- Erros (durante tudo, inclusive cliques e teclado)
  registrar("T02", ctx, erros.length === 0, lista([...new Set(erros)]));
  registrar("T03", ctx, falhas.length === 0, lista([...new Set(falhas)]));
  await context.close();
}

// ---------------------------------------------------------------- cliques
async function testarCliques(page, context, ctx, a, vp) {
  // Destinos externos são simulados: o clique abre a aba, mas não carrega o site real.
  await context.route((u) => u.origin !== ORIGEM && !/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname),
    (route) => route.fulfill({ status: 200, contentType: "text/html; charset=utf-8", body: "<!doctype html><title>destino simulado</title><p>destino simulado pela checagem</p>" }));
  const falhas = [];
  const ancorasEscondidas = [];
  let icsOk = null;
  for (const c of a.cliques) {
    const linha = { navegador: ctx.navegador, viewport: ctx.viewport, elemento: c.desc, destino: c.hrefAbs || "(botão)", nome: c.nome,
      tamanho: `${c.w}×${c.h}`, visivel: c.visivel && (!c.barra || c.barraDisplay !== "none"), ok24: c.w >= 24 && c.h >= 24, ok44: c.w >= 44 && c.h >= 44, clique: null, obs: "" };
    inventario.push(linha);
    if (!linha.visivel) { linha.obs = "Escondido neste tamanho de tela"; continue; }
    const loc = page.locator(`[data-qa="${c.qa}"]`);
    try {
      if (c.barra) {
        const y = await page.evaluate(() => document.querySelector("#palestrantes").getBoundingClientRect().top + scrollY + 200);
        await rolarPara(page, y); await page.waitForTimeout(500);
      }
      if (c.href && c.href.startsWith("#")) {
        await loc.click({ timeout: 5000 });
        await page.waitForTimeout(150);
        await esperarRolagemParar(page);
        await page.waitForTimeout(450);
        const r = await page.evaluate((id) => {
          const sec = document.querySelector(id);
          const alvo = sec.querySelector(".section-head") || sec;
          const barras = [...document.querySelectorAll(".topbar, .sticky-cta")].map((b) => b.getBoundingClientRect()).filter((b) => b.bottom > 1 && b.top <= 0);
          return { top: alvo.getBoundingClientRect().top, livre: Math.max(0, ...barras.map((b) => b.bottom)), vh: innerHeight };
        }, c.href);
        linha.clique = r.top >= -1 && r.top < r.vh * 0.6;
        const naoEscondido = r.top >= r.livre - 1;
        if (!naoEscondido) ancorasEscondidas.push(`${c.desc}: título em ${Math.round(r.top)}px, header fixo até ${Math.round(r.livre)}px`);
        linha.obs = `Rolou até a seção (topo do título em ${Math.round(r.top)}px)`;
      } else if (c.tag === "button") {
        const [download] = await Promise.all([page.waitForEvent("download", { timeout: 8000 }), loc.click({ timeout: 5000 })]);
        const nome = download.suggestedFilename();
        const txt = fs.readFileSync(await download.path(), "utf8");
        icsOk = /\.ics$/.test(nome) && /BEGIN:VCALENDAR/.test(txt) && /END:VCALENDAR/.test(txt) && /DTSTART:20261026T210000Z/.test(txt)
          && /SUMMARY:.*Day1/.test(txt) && /LOCATION:.*Sala São Paulo/.test(txt);
        registrar("C07", ctx, icsOk, `Arquivo ${nome}; ${icsOk ? "início 26/10 21:00 UTC = 18h em Brasília" : "conteúdo inesperado: " + txt.slice(0, 200)}`);
        linha.clique = true;
        linha.obs = `Baixou ${nome}`;
      } else if (c.target === "_blank") {
        const [popup] = await Promise.all([context.waitForEvent("page", { timeout: 8000 }), loc.click({ timeout: 5000 })]);
        await popup.waitForLoadState("domcontentloaded", { timeout: 10000 }).catch(() => {});
        const url = popup.url();
        await popup.close();
        linha.clique = mesmoEndereco(url, c.hrefAbs);
        linha.obs = linha.clique ? "Abriu em nova aba" : `Abriu ${url}`;
      } else {
        const antes = page.url();
        await Promise.all([page.waitForURL((u) => u.href !== antes, { timeout: 8000 }), loc.click({ timeout: 5000 })]);
        linha.clique = mesmoEndereco(page.url(), c.hrefAbs);
        await page.goBack();
      }
    } catch (e) {
      linha.clique = false;
      linha.obs = e.message.split("\n")[0].slice(0, 160);
    }
    if (!linha.clique) falhas.push(`${c.desc}: ${linha.obs}`);
  }
  registrar("C05", ctx, falhas.length === 0, falhas.length ? lista(falhas) : `${inventario.filter((l) => l.navegador === ctx.navegador && l.viewport === ctx.viewport && l.clique).length} cliques testados`);
  if (a.cliques.some((c) => c.href?.startsWith("#") && c.visivel)) registrar("L12", ctx, ancorasEscondidas.length === 0, lista(ancorasEscondidas));
  if (icsOk === null && a.cliques.some((c) => c.tag === "button")) registrar("C07", ctx, false, "O botão não foi testado (escondido?)");

  // C08: mensagem do WhatsApp
  const share = a.cliques.find((c) => /wa\.me/.test(c.hrefAbs || ""));
  if (share) {
    const texto = new URL(share.hrefAbs).searchParams.get("text") || "";
    const ok = share.hrefAbs.startsWith("https://wa.me/?text=") && /Day1/.test(texto) && /18h/.test(texto) && /Sala São Paulo/.test(texto) && texto.includes(semBarra(BASE));
    registrar("C08", ctx, ok, `Mensagem: "${texto}"`);
  } else registrar("C08", ctx, false, "Link de compartilhamento não encontrado");

  // C09: hover (só desktop)
  if (vp.tipo === "desktop") {
    const amostras = ["#hero-cta", ".hero .text-link", ".site-nav a", ".utility-cta", "#como-funciona .share", ".info-item .text-link", ".site-footer .text-link"];
    const semHover = [];
    for (const sel of amostras) {
      const loc = page.locator(sel).first();
      if (!(await loc.isVisible().catch(() => false))) continue;
      await loc.scrollIntoViewIfNeeded();
      await page.mouse.move(1, (vp.h / 2) | 0);
      await page.waitForTimeout(450);
      const antes = await loc.evaluate((el) => __qa.assinatura(el));
      await loc.hover();
      await page.waitForTimeout(450);
      const depois = await loc.evaluate((el) => __qa.assinatura(el));
      if (antes === depois) semHover.push(sel);
    }
    registrar("C09", ctx, semHover.length === 0, semHover.length ? `Sem mudança no hover: ${semHover.join(", ")}` : `${amostras.length} tipos de botão/link testados`);
  }
  await context.unrouteAll({ behavior: "ignoreErrors" });
}

// ---------------------------------------------------------------- axe-core
async function rodarAxe(page, ctx) {
  await rolarPara(page, 0); await page.waitForTimeout(400);
  const res = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]).analyze();
  const fmt = (v) => `${v.id} [${v.impact}] ${v.help} — ${v.nodes.length} elemento(s): ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join("; ")}`;
  const graves = res.violations.filter((v) => ["critical", "serious"].includes(v.impact));
  registrar("A01", ctx, graves.length === 0, lista(graves.map(fmt)));
  registrar("A02", ctx, res.violations.length === 0, lista(res.violations.map(fmt)));
}

// ---------------------------------------------------------------- teclado
async function testarTeclado(page, ctx) {
  await page.goto(BASE, { waitUntil: "load" });
  await fecharAviso(page);
  await page.waitForTimeout(1500);
  const passos = [];
  for (let i = 0; i < 80; i++) {
    await page.keyboard.press("Tab");
    // o foco dispara rolagem suave e a animação de entrada: mede depois que tudo assenta
    await page.waitForTimeout(100);
    await esperarRolagemParar(page);
    await page.waitForTimeout(700);
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el), r = el.getBoundingClientRect();
      const barra = el.closest(".topbar, .sticky-cta");
      return { desc: __qa.descrever(el), href: el.href || null, qa: el.getAttribute("data-qa") || el.outerHTML.slice(0, 60),
        contorno: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0,
        naTela: r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth,
        coberto: !__qa.naoCoberto(el), barraEscondida: !!barra && !barra.classList.contains("is-visible"), visivel: __qa.visivel(el) };
    });
    if (!info || (passos.length && info.qa === passos[0].qa)) break;
    passos.push(info);
  }
  const ruins = passos.filter((p) => !p.contorno || p.coberto || !p.naTela).map((p) => `${p.desc}${!p.contorno ? " (sem contorno)" : ""}${p.coberto ? " (coberto)" : ""}${!p.naTela ? " (fora da tela)" : ""}`);
  registrar("A06", ctx, passos.length > 0 && ruins.length === 0, ruins.length ? lista(ruins) : `${passos.length} elementos focados com Tab`);
  const pos = passos.findIndex((p) => p.href === FORM_URL) + 1;
  registrar("A07", ctx, pos >= 1 && pos <= 3, pos ? `Botão de inscrição no ${pos}º Tab (${passos[pos - 1].desc})` : "Nenhum botão de inscrição alcançado com Tab");
  const escondidos = passos.filter((p) => p.barraEscondida || !p.visivel).map((p) => p.desc);
  const a = await page.evaluate(() => __qa.auditar());
  registrar("A08", ctx, escondidos.length === 0 && a.focoEmEscondido.length === 0, lista([...escondidos, ...a.focoEmEscondido.map((d) => `${d} (dentro de aria-hidden)`)]));
}

// ---------------------------------------------------------------- checagens gerais (uma vez)
async function avaliarGeral(browser) {
  const vp = VIEWPORTS.find((v) => v.id === "1440x900");
  const { context, page } = await novaPagina(browser, "chromium", vp);
  const resp = await carregar(page);
  registrar("T01", GERAL, resp && resp.status() === 200, `Status ${resp?.status()} em ${BASE}`);
  const robotsHeader = resp?.headers()["x-robots-tag"] || "";
  const g = await page.evaluate(() => {
    const meta = (sel) => document.querySelector(sel)?.getAttribute("content") || "";
    const grids = [...document.querySelectorAll(".logo-grid")].map((ul) => ({ rotulo: ul.previousElementSibling?.textContent.trim() || "", srcs: [...ul.querySelectorAll("img")].map((i) => i.getAttribute("src")) }));
    return {
      title: document.title, desc: meta('meta[name="description"]'), lang: document.documentElement.lang,
      viewport: meta('meta[name="viewport"]'), robots: meta('meta[name="robots"]'),
      og: { title: meta('meta[property="og:title"]'), description: meta('meta[property="og:description"]'), image: meta('meta[property="og:image"]'), url: meta('meta[property="og:url"]'), type: meta('meta[property="og:type"]') },
      twitter: meta('meta[name="twitter:card"]'), canonical: document.querySelector('link[rel="canonical"]')?.href || "",
      icon: document.querySelector('link[rel="icon"]')?.href || "", apple: document.querySelector('link[rel="apple-touch-icon"]')?.href || "",
      jsonld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent),
      fontLinks: [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href),
      texto: document.body.innerText,
      textoOriginal: (() => { const c = document.body.cloneNode(true); c.querySelectorAll("script, style, svg").forEach((n) => n.remove()); return c.textContent; })(),
      links: [...document.querySelectorAll("a[href]")].map((el) => ({ texto: el.innerText.trim().replace(/\s+/g, " "), href: el.href, classe: el.className,
        noTopo: !!el.closest(".topbar, .utility-bar"), temFever: !!el.closest(".cta-block, .cta-band, .venue, .sticky-cta")?.querySelector(`a[href="https://feverup.com/m/712650"]`) })),
      palestrantes: [...document.querySelectorAll("#palestrantes img")].map((i) => ({ src: i.getAttribute("src"), alt: i.getAttribute("alt") || "" })),
      antigas: [...document.querySelectorAll("img")].filter((i) => /2-palestrantes-edicoes-anteriores|hero-decor/.test(i.getAttribute("src"))).map((i) => ({ src: i.getAttribute("src"), alt: i.getAttribute("alt") || "", naSecao: !!i.closest("#palestrantes") })),
      grids, imgsSemDim: [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("width") || !i.hasAttribute("height")).map((i) => i.getAttribute("src")),
    };
  });

  // Conteúdo
  const t = g.texto;
  const falta = (termos) => termos.filter((x) => (Array.isArray(x) ? !x.some((y) => t.includes(y)) : !t.includes(x))).map((x) => (Array.isArray(x) ? x.join(" ou ") : x));
  const f1 = falta([["26.10", "26/10"], "18h", "Sala São Paulo", "Praça Júlio Prestes, 16"]);
  registrar("R01", GERAL, f1.length === 0, f1.length ? `Falta: ${f1.join(", ")}` : "");
  registrar("R02", GERAL, /100 ingressos gratuitos para estudantes/i.test(t));
  const f3 = falta(["ordem de inscrição", "pessoal e intransferível", "e-mail", "spam"]);
  registrar("R03", GERAL, f3.length === 0, f3.length ? `Falta: ${f3.join(", ")}` : "");
  // Compara pelo nome do arquivo sem extensão (a página pode usar a versão .webp da mesma foto),
  // exigindo que venha da pasta dos palestrantes de 2026.
  const semExt = (f) => f.replace(/\.[a-z0-9]+$/i, "");
  const arquivos = g.palestrantes.map((p) => ({ arq: semExt(p.src.split("/").pop()), pasta2026: p.src.includes("1-palestrantes-hoje-2026/"), alt: p.alt }));
  const faltando = PALESTRANTES_2026.filter((f) => !arquivos.some((a) => a.arq === semExt(f) && a.pasta2026 && a.alt.trim()));
  registrar("R04", GERAL, faltando.length === 0, faltando.length ? `Falta (ou sem nome): ${faltando.join(", ")}` : `${arquivos.length} palestrantes: ${arquivos.map((a) => a.alt).join(", ")}`);
  const antigasErradas = g.antigas.filter((i) => i.naSecao || i.alt.trim()).map((i) => `${i.src}${i.naSecao ? " (na seção de palestrantes)" : ""}${i.alt ? ` (alt "${i.alt}")` : ""}`);
  registrar("R05", GERAL, antigasErradas.length === 0, antigasErradas.length ? lista(antigasErradas) : g.antigas.length ? `${g.antigas.length} foto(s) antiga(s) usada(s) só como decoração, sem nome` : "");
  const gridErrado = g.grids.flatMap((gr) => {
    const pasta = /patroc/i.test(gr.rotulo) ? "3-patrocinadores/" : "4-parceiros-e-apoiadores/";
    return gr.srcs.filter((s) => !s.includes(pasta)).map((s) => `${s} sob "${gr.rotulo}"`);
  });
  registrar("R06", GERAL, g.grids.length === 2 && gridErrado.length === 0, gridErrado.length ? lista(gridErrado) : g.grids.map((gr) => `${gr.rotulo}: ${gr.srcs.length} logos`).join(" · "));
  const inventado = t.match(/restam|restantes|últimas \d+|\d+ vagas disponíveis|prazo|inscrições (encerram|até)/gi) || [];
  registrar("R07", GERAL, inventado.length === 0, inventado.length ? `Encontrado: ${[...new Set(inventado)].join(", ")}` : "");
  const hrefs = g.links.map((l) => semBarra(l.href));
  const obrig = { "formulário de estudantes": FORM_URL, Fever: FEVER_URL, "transmissão online": ONLINE_URL, "site da Endeavor": ENDEAVOR_URL };
  const faltaLink = Object.entries(obrig).filter(([, u]) => !hrefs.includes(semBarra(u))).map(([n]) => n);
  registrar("R08", GERAL, faltaLink.length === 0, faltaLink.length ? `Falta: ${faltaLink.join(", ")}` : "");
  const hojeBR = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  const qtdHoje = (t.match(/\bhoje\b/gi) || []).length;
  registrar("R11", GERAL, qtdHoje === 0 || hojeBR === DATA_EVENTO, `A página diz "hoje" ${qtdHoje} vez(es); data atual em Brasília: ${hojeBR.split("-").reverse().join("/")}; evento: 26/10/2026.`);
  // TODO/FIXME são marcas de programador em maiúsculas: procura no texto original (sem o
  // text-transform), senão a palavra "Todo" de um título em caixa alta vira falso alarme.
  const rascunho = (t.match(/lorem|ipsum|undefined|\bNaN\b|\bnull\b|\[object|\{\{/gi) || []).concat(g.textoOriginal.match(/\bTODO\b|\bFIXME\b/g) || []);
  registrar("R12", GERAL, rascunho.length === 0, rascunho.join(", "));

  // Botões de inscrição
  const ctaErrados = g.links.filter((l) => (l.texto.startsWith(CTA_TEXTO) && !mesmoEndereco(l.href, FORM_URL)) || (mesmoEndereco(l.href, FORM_URL) && !l.texto.startsWith(CTA_TEXTO)))
    .map((l) => `"${l.texto}" → ${l.href}`);
  const totalCtas = g.links.filter((l) => mesmoEndereco(l.href, FORM_URL)).length;
  registrar("C02", GERAL, ctaErrados.length === 0 && totalCtas > 0, ctaErrados.length ? lista(ctaErrados) : `${totalCtas} botões, todos "${CTA_TEXTO}" → form de estudantes`);
  const semFever = g.links.filter((l) => mesmoEndereco(l.href, FORM_URL) && !l.noTopo && !l.temFever).map((l) => l.classe);
  registrar("C03", GERAL, semFever.length === 0, semFever.length ? `${semFever.length} botão(ões) sem Fever ao lado` : "Barra preta do topo e header fixo não entram nesta regra");
  const fortes = g.links.filter((l) => /\bbtn\b/.test(l.classe) && [FEVER_URL, ONLINE_URL, ENDEAVOR_URL].some((u) => mesmoEndereco(l.href, u)));
  if (fortes.length) registrar("R09", GERAL, false, lista(fortes.map((l) => `${l.texto} usa .btn`)));

  // SEO
  registrar("S01", GERAL, g.title.length >= 30 && g.title.length <= 65, `${g.title.length} caracteres: "${g.title}"`);
  registrar("S02", GERAL, g.desc.length >= 70 && g.desc.length <= 160, `${g.desc.length} caracteres`);
  const ogFalta = Object.entries(g.og).filter(([, v]) => !v).map(([k]) => `og:${k}`);
  registrar("S03", GERAL, ogFalta.length === 0 && /^https?:\/\//.test(g.og.image), ogFalta.length ? `Falta: ${ogFalta.join(", ")}` : `og:image = ${g.og.image}`);
  let ogDim = null;
  if (g.og.image) {
    const local = new URL(new URL(g.og.image).pathname, BASE).href;
    ogDim = await page.evaluate((src) => new Promise((ok) => { const i = new Image(); i.onload = () => ok([i.naturalWidth, i.naturalHeight]); i.onerror = () => ok(null); i.src = src; }), local);
  }
  registrar("S04", GERAL, !!ogDim && ogDim[0] === 1200 && ogDim[1] === 630, ogDim ? `${ogDim[0]}×${ogDim[1]}` : "Imagem não carregou");
  registrar("S05", GERAL, semBarra(g.og.url) === semBarra(SITE_URL), `og:url = ${g.og.url}`);
  registrar("S06", GERAL, g.twitter === "summary_large_image", `twitter:card = ${g.twitter || "(vazio)"}`);
  const icones = [];
  for (const [nome, href] of [["favicon", g.icon], ["apple-touch-icon", g.apple]]) {
    const st = href ? (await page.request.get(href).catch(() => null))?.status() : null;
    if (st !== 200) icones.push(`${nome}: ${href || "sem link"} (${st ?? "erro"})`);
  }
  registrar("S07", GERAL, icones.length === 0, lista(icones));
  registrar("S08", GERAL, !!g.canonical, g.canonical || "Sem <link rel=\"canonical\">");
  registrar("S09", GERAL, /width=device-width/.test(g.viewport) && !/user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?(\D|$)/.test(g.viewport), `"${g.viewport}"`);
  registrar("S10", GERAL, g.jsonld.some((j) => /"@type"\s*:\s*"Event"/.test(j)), g.jsonld.length ? "" : "Sem JSON-LD na página");
  registrar("S11", GERAL, !/noindex/i.test(g.robots) && !/noindex/i.test(robotsHeader), g.robots || robotsHeader ? `robots: ${g.robots || robotsHeader}` : "");
  registrar("A11", GERAL, g.lang === "pt-BR", `lang="${g.lang}"`);
  registrar("P08", GERAL, g.imgsSemDim.length === 0, g.imgsSemDim.length ? `${g.imgsSemDim.length} imagem(ns) sem width/height: ${lista(g.imgsSemDim, 5)}` : "");
  registrar("P10", GERAL, g.fontLinks.filter((h) => /fonts\.googleapis/.test(h)).every((h) => /display=swap/.test(h)));

  // C06: sites de destino
  if (!SEM_EXTERNOS) {
    const externos = [...new Set(g.links.map((l) => l.href).filter((h) => /^https?:/.test(h) && new URL(h).origin !== ORIGEM).concat(ONLINE_URL))];
    const api = await pwRequest.newContext({ userAgent: await page.evaluate(() => navigator.userAgent).then((ua) => ua.replace("HeadlessChrome", "Chrome")), extraHTTPHeaders: { "Accept-Language": "pt-BR,pt;q=0.9" } });
    for (const url of externos) {
      let st = null, como = "requisição";
      try { st = (await api.get(url, { maxRedirects: 10, timeout: 20000 })).status(); } catch (e) { st = null; }
      if (!st || st >= 400) {
        try { const p2 = await context.newPage(); const r = await p2.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 }); st = r?.status() ?? st; como = "navegador"; await p2.close(); } catch {}
      }
      const ctxUrl = { navegador: "—", viewport: url.length > 70 ? url.slice(0, 67) + "…" : url };
      registrar("C06", ctxUrl, st && st < 400, `HTTP ${st ?? "sem resposta"} (${como})${st === 403 ? " — o site pode estar bloqueando robôs; confira abrindo o link" : ""}`);
    }
    await api.dispose();
  }
  await context.close();
}

// ---------------------------------------------------------------- relógio simulado (R10)
async function avaliarContador(browser) {
  const cenarios = [
    { nome: "2 dias antes", quando: "2026-10-24T18:00:00-03:00", ok: (e) => e.valores.join(":") === "48:00:00" },
    { nome: "26/10 às 10h", quando: "2026-10-26T10:00:00-03:00", ok: (e) => e.valores.join(":") === "08:00:00" },
    { nome: "26/10 às 19h", quando: "2026-10-26T19:00:00-03:00", ok: (e) => /Acontecendo agora/i.test(e.texto) && e.link === ONLINE_URL },
    { nome: "27/10", quando: "2026-10-27T09:00:00-03:00", ok: (e) => /aconteceu/i.test(e.texto) && e.link === ONLINE_URL },
  ];
  for (const vpId of ["390x844", "1440x900"]) {
    const vp = VIEWPORTS.find((v) => v.id === vpId);
    for (const [i, cen] of cenarios.entries()) {
      const { context, page } = await novaPagina(browser, "chromium", vp);
      await page.clock.setFixedTime(new Date(cen.quando));
      await carregar(page);
      const e = await page.evaluate(() => {
        const c = document.getElementById("countdown");
        return { texto: c.innerText.replace(/\s+/g, " ").trim(), valores: [...c.querySelectorAll(".cd-num")].map((n) => n.dataset.value || ""), link: c.querySelector("a")?.href || null };
      });
      registrar("R10", { navegador: "chromium", viewport: `${vpId} · ${cen.nome}` }, cen.ok(e), `Mostra: "${e.valores.length ? e.valores.join(":") : e.texto}"${e.link ? ` (link: ${e.link})` : ""}`);
      if (!SEM_PRINTS) {
        const arquivo = `prints/estados/${vpId}/contador-${i + 1}.jpg`;
        await fotografar(page, ".hero-visual", arquivo);
        prints.push({ navegador: "chromium", viewport: vpId, secao: `contador-${i + 1}`, nome: `Contador: ${cen.nome}`, arquivo, estado: true });
      }
      await context.close();
    }
  }
}

// ---------------------------------------------------------------- movimento reduzido e sem JavaScript (A09, A10)
async function avaliarPreferencias(browser) {
  for (const vpId of ["390x844", "1440x900"]) {
    const vp = VIEWPORTS.find((v) => v.id === vpId);
    const ctx = { navegador: "chromium", viewport: vpId };
    {
      const { context, page } = await novaPagina(browser, "chromium", vp, { reducedMotion: "reduce" });
      await carregar(page);
      const r = await page.evaluate(() => ({
        rodando: document.getAnimations().filter((an) => an.playState === "running").map((an) => `${an.animationName || an.constructor.name} em ${an.effect?.target?.className || an.effect?.target?.tagName || "?"}`),
        invisiveis: [...document.querySelectorAll(".reveal")].filter((el) => parseFloat(getComputedStyle(el).opacity) < 1).length,
      }));
      registrar("A09", ctx, r.rodando.length === 0 && r.invisiveis === 0, [r.rodando.length ? `Animações rodando: ${lista(r.rodando)}` : "", r.invisiveis ? `${r.invisiveis} bloco(s) invisível(is) sem rolar` : ""].filter(Boolean).join(" · "));
      await context.close();
    }
    {
      const { context, page } = await novaPagina(browser, "chromium", vp, { javaScriptEnabled: false });
      await page.goto(BASE, { waitUntil: "load" });
      await page.waitForTimeout(800);
      const r = await page.evaluate((form) => {
        const vis = (el) => { const cs = getComputedStyle(el), b = el.getBoundingClientRect(); return cs.display !== "none" && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0 && b.width > 0; };
        return {
          invisiveis: [...document.querySelectorAll(".reveal")].filter((el) => parseFloat(getComputedStyle(el).opacity) < 1).length,
          h1: vis(document.querySelector("h1")),
          ctas: [...document.querySelectorAll("a[href]")].filter((a) => a.href === form && vis(a)).length,
          quebrados: [...document.querySelectorAll('a[href="#"]')].filter(vis).map((a) => a.innerText.trim().replace(/\s+/g, " ")),
        };
      }, FORM_URL);
      const ok = r.invisiveis === 0 && r.h1 && r.ctas >= 3 && r.quebrados.length === 0;
      registrar("A10", ctx, ok, [`${r.ctas} botões de inscrição visíveis`, r.invisiveis ? `${r.invisiveis} bloco(s) invisível(is)` : "", r.quebrados.length ? `Sem JavaScript, apontam para "#": ${[...new Set(r.quebrados)].join(", ")}` : ""].filter(Boolean).join(" · "));
      if (!SEM_PRINTS) {
        const arquivo = `prints/estados/${vpId}/sem-javascript.jpg`;
        await fotografar(page, "tela", arquivo);
        prints.push({ navegador: "chromium", viewport: vpId, secao: "sem-js", nome: "Primeira dobra sem JavaScript", arquivo, estado: true });
      }
      await context.close();
    }
  }
}

// ---------------------------------------------------------------- desempenho (P04, P05, P06)
async function avaliarDesempenho(browser) {
  const perfis = [
    { vpId: "390x844", rede: { latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 }, cpu: 4, nome: "celular 4G lento" },
    { vpId: "1440x900", rede: { latency: 40, downloadThroughput: (10 * 1024 * 1024) / 8, uploadThroughput: (5 * 1024 * 1024) / 8 }, cpu: 1, nome: "desktop banda larga" },
  ];
  for (const perfil of perfis) {
    const vp = VIEWPORTS.find((v) => v.id === perfil.vpId);
    const ctx = { navegador: "chromium", viewport: `${perfil.vpId} · ${perfil.nome}` };
    const { context, page } = await novaPagina(browser, "chromium", vp);
    await page.addInitScript(() => {
      window.__perf = { lcp: 0, fcp: 0, cls: 0 };
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__perf.lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__perf.cls += e.value; }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === "first-contentful-paint") window.__perf.fcp = e.startTime; }).observe({ type: "paint", buffered: true });
    });
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", { offline: false, ...perfil.rede });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: perfil.cpu });
    await page.goto(BASE, { waitUntil: "load", timeout: 120000 });
    await fecharAviso(page);
    await page.waitForTimeout(3000);
    const p = await page.evaluate(() => ({ ...window.__perf }));
    await rolarTudo(page);
    await page.waitForTimeout(1500);
    const cls = await page.evaluate(() => window.__perf.cls);
    registrar("P04", ctx, p.lcp > 0 && p.lcp <= 2500, `LCP ${(p.lcp / 1000).toFixed(2)} s`);
    registrar("P05", ctx, cls <= 0.1, `CLS ${cls.toFixed(3)}`);
    registrar("P06", ctx, p.fcp > 0 && p.fcp <= 1800, `FCP ${(p.fcp / 1000).toFixed(2)} s`);
    await context.close();
  }
}

// ---------------------------------------------------------------- execução
let BASE, ORIGEM;
async function principal() {
  const inicio = Date.now();
  fs.rmSync(SAIDA, { recursive: true, force: true });
  fs.mkdirSync(SAIDA, { recursive: true });
  let server = null;
  if (valor("--url")) BASE = new URL(valor("--url")).href;
  else { server = await servir(RAIZ); BASE = `http://127.0.0.1:${server.address().port}/`; }
  ORIGEM = new URL(BASE).origin;
  console.log(`\nChecagem da landing page · ${BASE}${RAPIDO ? " · modo rápido" : ""}\n`);

  await Promise.all(Object.entries(PLANO).map(async ([nav, plano]) => {
    const browser = await MOTORES[nav].launch();
    try {
      if (nav === "chromium") {
        for (const [nome, fn] of [["geral", avaliarGeral], ["contador", avaliarContador], ["preferencias", avaliarPreferencias], ["desempenho", avaliarDesempenho]].filter(([n]) => PARTES.includes(n))) {
          try { await fn(browser); console.log(`  ✓ chromium · ${nome}`); }
          catch (e) { errosExecucao.push(`${nome}: ${e.message.split("\n")[0]}`); console.log(`  ✗ chromium · ${nome}: ${e.message.split("\n")[0]}`); }
        }
      }
      for (const id of PARTES.includes("telas") ? plano.vps : []) {
        const vp = VIEWPORTS.find((v) => v.id === id);
        try { await avaliarViewport(browser, nav, vp, plano); console.log(`  ✓ ${nav} · ${id}`); }
        catch (e) { errosExecucao.push(`${nav} ${id}: ${e.message.split("\n")[0]}`); console.log(`  ✗ ${nav} · ${id}: ${e.message.split("\n")[0]}`); }
      }
    } finally { await browser.close(); }
  }));
  if (server) server.close();

  // Resumo no terminal: uma linha por checagem (SIM só se passou em todos os contextos)
  const ids = Object.keys(CATALOGO);
  let sim = 0, nao = 0, naoAvaliadas = 0, criticosNao = 0;
  console.log("");
  for (const id of ids) {
    const rs = resultados.filter((r) => r.id === id);
    const item = CATALOGO[id];
    if (!rs.length) { naoAvaliadas++; console.log(`  —    ${id} ${item.pergunta} (não avaliada)`); continue; }
    const falhou = rs.filter((r) => !r.ok);
    if (falhou.length) { nao++; if (item.prioridade === "Crítico") criticosNao++; } else sim++;
    const onde = falhou.length ? `  ← ${falhou.length}/${rs.length}: ${falhou.slice(0, 4).map((r) => (r.navegador === "—" ? r.viewport : `${r.navegador} ${r.viewport}`)).join(", ")}${falhou.length > 4 ? "…" : ""}` : "";
    console.log(`  ${falhou.length ? "NÃO" : "SIM"}  ${id} ${item.pergunta}${onde}`);
  }
  if (isentos.length) {
    console.log("\n  Isentas no caso-limite 320×568 (decisão do usuário; fora do placar). Resultado real:");
    for (const r of isentos) console.log(`    ${r.ok ? "SIM" : "NÃO"}  ${r.id} ${CATALOGO[r.id].pergunta} (${r.navegador} ${r.viewport})`);
  }
  const duracao = Math.round((Date.now() - inicio) / 1000);
  const meta = { isentos, pularNoLimite: PULAR_NO_LIMITE, base: BASE, data: new Date().toISOString(), duracao, rapido: RAPIDO, plano: PLANO, viewports: VIEWPORTS, secoes: SECOES, errosExecucao };
  fs.writeFileSync(path.join(SAIDA, "resultado.json"), JSON.stringify({ meta, resultados, inventario, prints }, null, 2));
  const csv = ["id;prioridade;pergunta;navegador;viewport;resultado;detalhe"].concat(resultados.map((r) =>
    [r.id, CATALOGO[r.id].prioridade, CATALOGO[r.id].pergunta, r.navegador, r.viewport, r.ok ? "SIM" : "NÃO", r.detalhe].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")));
  fs.writeFileSync(path.join(SAIDA, "resultado.csv"), "﻿" + csv.join("\n"));
  gerarRelatorio({ saida: SAIDA, meta, resultados, inventario, prints });

  console.log(`\n  ${sim} SIM · ${nao} NÃO (${criticosNao} crítica(s))${naoAvaliadas ? ` · ${naoAvaliadas} não avaliada(s)` : ""} · ${resultados.length} verificações em ${duracao}s`);
  if (errosExecucao.length) console.log(`  Erros de execução: ${errosExecucao.length} (ver relatório)`);
  console.log(`  Relatório: ${path.join(SAIDA, "index.html")}\n`);
  process.exitCode = criticosNao > 0 ? 1 : 0;
}

principal().catch((e) => { console.error(e); process.exit(2); });
