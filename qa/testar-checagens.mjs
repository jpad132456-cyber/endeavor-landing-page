// Teste dos testes: prova que as checagens pegam defeitos de verdade.
// Cada caso abaixo planta UM defeito numa cópia da página (o index.html não é tocado) e roda a
// checagem. O caso passa só se a checagem indicada der NÃO. O "controle" roda a página
// original com a mesma configuração e precisa dar SIM nas mesmas checagens: assim fica provado
// que o NÃO vem do defeito plantado, e não de outra coisa.
// Uso: node testar-checagens.mjs        (~10 min; resumo em relatorio-mutantes/resumo.md)
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CATALOGO } from "./lib/catalogo.mjs";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const ORIGINAL = fs.readFileSync(path.join(AQUI, "..", "index.html"), "utf8");
const SAIDA = path.join(AQUI, "relatorio-mutantes");

// troca obrigatória: se o trecho não existir, o caso falha (não testa nada por engano)
function trocar(html, de, para) {
  if (!html.includes(de)) throw new Error(`Trecho não encontrado: ${de.slice(0, 60)}`);
  return html.split(de).join(para);
}
const comCss = (html, css) => trocar(html, "</style>", `${css}\n</style>`);
const comScriptNoFim = (html, js) => trocar(html, "</body>", `<script>${js}</script>\n</body>`);

const CASOS = [
  { id: "R12-todo", defeito: "Texto de rascunho \"TODO: revisar\" esquecido na página", espera: ["R12"], partes: "geral",
    aplicar: (h) => trocar(h, "<h2>Hoje, às 18h, na Sala São Paulo.</h2>", "<h2>Hoje, às 18h, na Sala São Paulo.</h2><p>TODO: revisar este texto</p>") },
  { id: "L02-texto-por-cima", defeito: "Parágrafo posicionado por cima do título do hero", espera: ["L02"], vps: "1440x900",
    aplicar: (h) => trocar(h, '<h1>Todo gigante', '<p style="position:absolute;top:150px;left:60px;margin:0;font:700 22px sans-serif">Texto por cima do título</p><h1>Todo gigante') },
  { id: "L02-entrelinha", defeito: "Entrelinha do H1 apertada demais (letras de uma linha encostam na outra)", espera: ["L02"], vps: "390x844,1440x900",
    aplicar: (h) => comCss(h, "h1 { line-height: 0.6 !important; }") },
  { id: "L14-bloco-invisivel", defeito: "Bloco com animação de entrada que nunca é observado (fica invisível)", espera: ["L14"], vps: "390x844",
    aplicar: (h) => comScriptNoFim(h, 'var p=document.createElement("p");p.className="reveal";p.textContent="Bloco que nunca aparece";document.querySelector("#informacoes .container").appendChild(p);') },
  { id: "P07-lazy-na-dobra", defeito: "Logo do hero com loading=lazy (está na primeira tela do desktop)", espera: ["P07"], vps: "1440x900",
    aplicar: (h) => trocar(h, 'alt="Day1 Endeavor" width="720" height="235">', 'alt="Day1 Endeavor" width="720" height="235" loading="lazy">') },
  { id: "P07-sem-lazy-longe", defeito: "Logos de patrocínio (bem abaixo da dobra) sem loading=lazy", espera: ["P07"], vps: "390x844",
    aplicar: (h) => h.replace(/(<ul class="logo-grid">[\s\S]*?<\/ul>)/, (ul) => ul.split(' loading="lazy"').join("")) },
  { id: "R04-falta-palestrante", defeito: "Bernardinho removido da seção de palestrantes", espera: ["R04"], partes: "geral",
    aplicar: (h) => h.replace(/<li class="speaker reveal">\s*<img src="[^"]*bernardinho[\s\S]*?<\/li>/, "") },
  { id: "A06-foco-invisivel", defeito: "Contorno de foco do teclado removido", espera: ["A06"], vps: "1440x900",
    aplicar: (h) => comCss(h, ":focus-visible { outline: none !important; }") },
  { id: "A08-foco-em-barra-escondida", defeito: "Links do header fixo escondido continuam recebendo foco do Tab", espera: ["A08"], vps: "1440x900",
    aplicar: (h) => trocar(trocar(h, 'bar.querySelectorAll("a").forEach(function (a) { a.tabIndex = show ? 0 : -1; });', ""), ' tabindex="-1"', "") },
  { id: "P03-imagem-pesada", defeito: "Logo da Onfly volta ao PNG original de 498 KB", espera: ["P03"], vps: "1440x900",
    aplicar: (h) => trocar(h, "3-patrocinadores/web/onfly.webp", "3-patrocinadores/onfly.png") },
  { id: "C15-sem-barras-fixas", defeito: "Barra fixa (celular) e header fixo (desktop) desligados", espera: ["C15", "C13", "C14"], vps: "390x844,1440x900",
    aplicar: (h) => comCss(h, ".topbar, .sticky-cta { display: none !important; }") },
  { id: "C15-cta-meio-cortado", defeito: "Barra fixa só aparece quando o botão do topo sai inteiro da tela", espera: ["C15"], vps: "390x664",
    aplicar: (h) => trocar(h, "if (e.intersectionRatio > 0.99)", "if (e.isIntersecting)") },
  { id: "C11-alvo-pequeno", defeito: "Links de texto sem a área de toque de 44px", espera: ["C11"], vps: "390x844",
    aplicar: (h) => comCss(h, ".text-link, .info-item button.text-link { padding-top: 0 !important; margin-top: 0 !important; }") },
  { id: "A03-contraste", defeito: "Kicker teal sobre o azul (contraste 4,4:1)", espera: ["A03", "A01"], vps: "1440x900",
    aplicar: (h) => comCss(h, ".on-blue .kicker { color: var(--teal) !important; }") },
  { id: "L03-botao-quebra", defeito: "Sem o ajuste de padding do botão em telas de até 400px", espera: ["L03"], vps: "360x800",
    aplicar: (h) => trocar(h, ".btn { padding-left: 12px; padding-right: 12px; gap: 8px; }", "") },
  { id: "D03-botao-fora-da-dobra", defeito: "Hero com 300px a mais de espaço em cima (botão sai da primeira tela)", espera: ["D03", "D04"], vps: "1366x657",
    aplicar: (h) => comCss(h, ".hero-grid { padding-top: 300px !important; }") },
  { id: "P05-cls-fontes", defeito: "Sem as fontes provisórias de mesma medida (texto pula quando a fonte carrega)", espera: ["P05"], partes: "desempenho",
    aplicar: (h) => trocar(trocar(h, '"Hanken Grotesk", "Hanken Fallback",', '"Hanken Grotesk",'), '"Inter", "Inter Fallback",', '"Inter",') },
];
const CONTROLE = { id: "controle", defeito: "Nenhum (página original)", vps: "360x800,390x664,390x844,1366x657,1440x900", partes: "geral,desempenho,telas", aplicar: (h) => h };

function rodar(caso) {
  const pasta = path.join(SAIDA, caso.id);
  fs.mkdirSync(pasta, { recursive: true });
  const html = path.join(pasta, "pagina.html");
  fs.writeFileSync(html, caso.aplicar(ORIGINAL));
  const args = ["checagem.mjs", "--html", html, "--saida", path.join(pasta, "relatorio"), "--sem-prints", "--sem-links-externos",
    "--partes", caso.partes || "telas", ...(caso.vps ? ["--viewports", caso.vps] : [])];
  return new Promise((ok) => {
    const p = spawn(process.execPath, args, { cwd: AQUI, stdio: ["ignore", fs.openSync(path.join(pasta, "log.txt"), "w"), "inherit"] });
    p.on("close", () => {
      const r = JSON.parse(fs.readFileSync(path.join(pasta, "relatorio", "resultado.json"), "utf8"));
      ok(r);
    });
  });
}

fs.rmSync(SAIDA, { recursive: true, force: true });
const todos = [CONTROLE, ...CASOS];
const resultados = new Map();
let i = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (i < todos.length) {
    const caso = todos[i++];
    try { resultados.set(caso.id, await rodar(caso)); console.log(`  rodou: ${caso.id}`); }
    catch (e) { resultados.set(caso.id, { erro: e.message }); console.log(`  ERRO: ${caso.id}: ${e.message}`); }
  }
}));

const estado = (r, id) => {
  const rs = r.resultados.filter((x) => x.id === id);
  return !rs.length ? "não avaliada" : rs.some((x) => !x.ok) ? "NÃO" : "SIM";
};
const linhas = ["# Teste dos testes", "", `Rodado em ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}.`, "",
  "Cada caso planta um defeito numa cópia da página. O caso passa (✅) se a checagem esperada der **NÃO** com o defeito",
  "e **SIM** na página original (controle), com a mesma configuração.", "",
  "| Caso | Defeito plantado | Checagem | Com o defeito | Página original | Resultado |", "|---|---|---|---|---|---|"];
let falhas = 0;
const controle = resultados.get("controle");
for (const caso of CASOS) {
  const r = resultados.get(caso.id);
  for (const id of caso.espera) {
    const comDefeito = r?.erro ? `erro: ${r.erro}` : estado(r, id);
    const original = controle?.erro ? "erro" : estado(controle, id);
    const passou = comDefeito === "NÃO" && original === "SIM";
    if (!passou) falhas++;
    linhas.push(`| ${caso.id} | ${caso.defeito} | ${id} ${CATALOGO[id].pergunta} | ${comDefeito} | ${original} | ${passou ? "✅" : "❌"} |`);
  }
}
linhas.push("", falhas ? `**${falhas} caso(s) falharam:** a checagem não pegou o defeito plantado.` : "**Todas as checagens pegaram o defeito plantado e passaram na página original.**");
fs.writeFileSync(path.join(SAIDA, "resumo.md"), linhas.join("\n") + "\n");
console.log("\n" + linhas.slice(6).join("\n") + "\n");
process.exitCode = falhas ? 1 : 0;
