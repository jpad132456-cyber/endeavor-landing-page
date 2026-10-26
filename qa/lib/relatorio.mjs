// Gera relatorio/index.html: resultado SIM/NÃO de cada checagem, inventário de cliques e prints.
import fs from "node:fs";
import path from "node:path";
import { CATALOGO, CATEGORIAS } from "./catalogo.mjs";

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

export function gerarRelatorio({ saida, meta, resultados, inventario, prints }) {
  const porId = {};
  for (const r of resultados) (porId[r.id] ||= []).push(r);
  const linhas = Object.entries(CATALOGO).map(([id, item]) => {
    const rs = porId[id] || [];
    const falhas = rs.filter((r) => !r.ok);
    return { id, ...item, rs, falhas, estado: !rs.length ? "na" : falhas.length ? "nao" : "sim" };
  });
  const conta = (f) => linhas.filter(f).length;
  const resumo = {
    sim: conta((l) => l.estado === "sim"), nao: conta((l) => l.estado === "nao"),
    criticos: conta((l) => l.estado === "nao" && l.prioridade === "Crítico"), na: conta((l) => l.estado === "na"),
  };
  const ctxNome = (r) => (r.navegador === "—" ? r.viewport : `${r.navegador} · ${r.viewport}`);

  const categorias = Object.entries(CATEGORIAS).map(([letra, nome]) => {
    const ls = linhas.filter((l) => l.id[0] === letra);
    const ok = ls.filter((l) => l.estado === "sim").length;
    const linhasHtml = ls.map((l) => `
      <tr class="linha ${l.estado}" data-prioridade="${esc(l.prioridade)}">
        <td class="id">${l.id}</td>
        <td>
          <div class="pergunta">${esc(l.pergunta)}</div>
          <details>
            <summary>${l.rs.length ? (l.falhas.length ? `Falhou em ${l.falhas.length} de ${l.rs.length} verificações` : `Passou nas ${l.rs.length} verificações`) : "Não avaliada nesta execução"}</summary>
            <p class="como"><b>Como o script decide:</b> ${esc(l.como)} <span class="fonte">Fonte: ${esc(l.fonte)}</span></p>
            <table class="contextos">${[...l.falhas, ...l.rs.filter((r) => r.ok)].map((r) => `
              <tr><td class="res ${r.ok ? "sim" : "nao"}">${r.ok ? "SIM" : "NÃO"}</td><td class="ctx">${esc(ctxNome(r))}</td><td>${esc(r.detalhe)}</td></tr>`).join("")}
            </table>
          </details>
        </td>
        <td><span class="prio p-${esc(l.prioridade).toLowerCase().replace(/[^a-z]/g, "")}">${esc(l.prioridade)}</span></td>
        <td class="res ${l.estado}">${l.estado === "sim" ? "SIM" : l.estado === "nao" ? "NÃO" : "—"}</td>
      </tr>`).join("");
    return `<section class="cat"><h3>${esc(nome)} <small>${ok}/${ls.length} SIM</small></h3>
      <table class="checagens"><thead><tr><th>ID</th><th>Pergunta</th><th>Prioridade</th><th>Resultado</th></tr></thead><tbody>${linhasHtml}</tbody></table></section>`;
  }).join("");

  const marca = (v) => (v === null || v === undefined ? "—" : v ? '<span class="sim">SIM</span>' : '<span class="nao">NÃO</span>');
  const inventarioHtml = inventario.map((l) => `<tr class="${l.clique === false ? "falhou" : ""}">
    <td>${esc(l.navegador)} · ${esc(l.viewport)}</td><td>${esc(l.elemento)}</td><td class="url">${esc(l.destino)}</td>
    <td>${marca(l.visivel)}</td><td>${marca(!!l.nome)}</td><td>${esc(l.tamanho)}</td><td>${marca(l.ok24)}</td><td>${marca(l.ok44)}</td>
    <td>${marca(l.visivel ? l.clique : null)}</td><td>${esc(l.obs)}</td></tr>`).join("");

  const nomesSecao = Object.fromEntries(meta.secoes.map((s) => [s.id, s.nome]));
  const galeria = prints.map((p) => ({ ...p, nome: p.nome || nomesSecao[p.secao] || p.secao }));

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Checagem da landing page</title>
<style>
  :root { --ink:#01000F; --white:#fff; --teal:#09E1CD; --blue:#273AE9; --yellow:#FFCF53; --purple:#AC27F4; --line:#CCCCCF; --ok:#0A7D4F; --bad:#C4161C; --soft:#F4F4F6; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--white); color:var(--ink); font:15px/1.5 -apple-system, "Segoe UI", Inter, sans-serif; }
  header.topo { background:var(--ink); color:var(--white); padding:32px 24px; }
  header.topo h1 { margin:0 0 6px; font-size:28px; }
  header.topo p { margin:0; opacity:.8; }
  main { max-width:1280px; margin:0 auto; padding:24px 16px 80px; }
  .resumo { display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin:0 0 28px; }
  .tile { border:2px solid var(--ink); padding:16px; }
  .tile b { display:block; font-size:40px; line-height:1; }
  .tile.sim b { color:var(--ok); } .tile.nao b { color:var(--bad); }
  nav.abas { display:flex; gap:8px; flex-wrap:wrap; margin:0 0 20px; position:sticky; top:0; background:var(--white); padding:10px 0; z-index:5; border-bottom:1px solid var(--line); }
  nav.abas button, .filtros button { font:600 14px/1 inherit; padding:10px 14px; border:2px solid var(--ink); background:var(--white); cursor:pointer; }
  nav.abas button[aria-pressed="true"], .filtros button[aria-pressed="true"] { background:var(--ink); color:var(--white); }
  .filtros { display:flex; gap:8px; flex-wrap:wrap; margin:0 0 16px; }
  .cat h3 { margin:32px 0 8px; font-size:20px; } .cat h3 small { font-weight:500; opacity:.6; margin-left:8px; }
  table { width:100%; border-collapse:collapse; }
  table.checagens > thead th { text-align:left; font-size:12px; text-transform:uppercase; letter-spacing:.06em; border-bottom:2px solid var(--ink); padding:8px; }
  table.checagens > tbody > tr > td { border-bottom:1px solid var(--line); padding:10px 8px; vertical-align:top; }
  td.id { font-weight:700; white-space:nowrap; width:56px; }
  .pergunta { font-weight:600; }
  details summary { cursor:pointer; font-size:13px; opacity:.75; margin-top:4px; }
  .como { font-size:13px; background:var(--soft); padding:8px 10px; margin:8px 0; }
  .fonte { display:block; opacity:.7; margin-top:4px; }
  table.contextos td { font-size:13px; padding:4px 8px 4px 0; border-top:1px solid #eee; vertical-align:top; }
  td.ctx { white-space:nowrap; opacity:.8; }
  td.res, .res { font-weight:800; white-space:nowrap; }
  .res.sim, span.sim { color:var(--ok); font-weight:800; } .res.nao, span.nao { color:var(--bad); font-weight:800; } .res.na { opacity:.5; }
  .prio { font-size:12px; font-weight:700; padding:3px 8px; white-space:nowrap; }
  .p-crtico { background:var(--bad); color:#fff; } .p-importante { background:var(--yellow); } .p-recomendao { background:var(--soft); }
  .inventario { font-size:13px; overflow-x:auto; }
  .inventario th { text-align:left; border-bottom:2px solid var(--ink); padding:6px; white-space:nowrap; }
  .inventario td { border-bottom:1px solid var(--line); padding:6px; vertical-align:top; }
  .inventario td.url { max-width:280px; word-break:break-all; }
  .inventario tr.falhou { background:#FDECEC; }
  .controles { display:flex; gap:12px; flex-wrap:wrap; align-items:end; margin:0 0 16px; }
  .controles label { display:flex; flex-direction:column; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; gap:4px; }
  .controles select { font:15px inherit; padding:8px; border:2px solid var(--ink); background:var(--white); }
  .fotos { display:grid; gap:24px; }
  .fotos.grade { grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); align-items:start; }
  figure { margin:0; }
  figure img { display:block; max-width:100%; height:auto; border:1px solid var(--line); background:var(--soft); }
  .fotos.lista figure img { max-height:80vh; width:auto; }
  figcaption { font-size:13px; font-weight:700; margin:0 0 6px; }
  .erros { background:#FDECEC; padding:12px 16px; }
  [hidden] { display:none !important; }
</style>
</head>
<body>
<header class="topo">
  <h1>Checagem da landing page · Day1 Endeavor 2026</h1>
  <p>${esc(new Date(meta.data).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }))} · ${esc(meta.base)} · ${meta.duracao}s${meta.rapido ? " · modo rápido" : ""} · navegadores: ${esc(Object.keys(meta.plano).join(", "))}</p>
</header>
<main>
  <div class="resumo">
    <div class="tile sim"><b>${resumo.sim}</b>checagens SIM</div>
    <div class="tile nao"><b>${resumo.nao}</b>checagens NÃO</div>
    <div class="tile nao"><b>${resumo.criticos}</b>críticas com NÃO</div>
    <div class="tile"><b>${resultados.length}</b>verificações (checagem × tela × navegador)</div>
  </div>
  <p>Uma checagem só é <b>SIM</b> se passou em <b>todos</b> os tamanhos de tela e navegadores em que rodou. Abra cada linha para ver onde falhou e o que o script mediu.</p>
  ${meta.isentos?.length ? `<div class="como"><b>Isentas no caso-limite 320×568 (decisão do usuário, fora do placar).</b> Com os 3 tamanhos de fonte do DESIGN.md 2.2, estas checagens não têm como passar nessa tela (ver guia, seção 3). Elas rodam mesmo assim, e o resultado real fica aqui:<table class="contextos">${meta.isentos.map((x) => `<tr><td class="res ${x.ok ? "sim" : "nao"}">${x.ok ? "SIM" : "NÃO"}</td><td class="ctx">${esc(x.id)} · ${esc(x.navegador)} · ${esc(x.viewport)}</td><td>${esc(CATALOGO[x.id].pergunta)} ${esc(x.detalhe)}</td></tr>`).join("")}</table></div>` : ""}
  ${meta.errosExecucao.length ? `<div class="erros"><b>Erros de execução (partes que não rodaram):</b><ul>${meta.errosExecucao.map((e) => `<li>${esc(e)}</li>`).join("")}</ul></div>` : ""}

  <nav class="abas" aria-label="Partes do relatório">
    <button data-aba="checagens" aria-pressed="true">Checagens</button>
    <button data-aba="cliques" aria-pressed="false">Inventário de cliques</button>
    <button data-aba="prints" aria-pressed="false">Prints por tela</button>
    <button data-aba="comparar" aria-pressed="false">Comparar seção</button>
  </nav>

  <div id="aba-checagens">
    <div class="filtros" role="group" aria-label="Filtro">
      <button data-filtro="todas" aria-pressed="true">Todas</button>
      <button data-filtro="nao" aria-pressed="false">Só NÃO</button>
      <button data-filtro="critico" aria-pressed="false">Só críticas com NÃO</button>
    </div>
    ${categorias}
  </div>

  <div id="aba-cliques" hidden>
    <p>Cada link e botão da página, em cada tela onde os cliques foram testados. "Clique funciona" = abriu o destino certo em nova aba, rolou até a seção ou baixou o arquivo.</p>
    <div class="inventario"><table><thead><tr><th>Onde</th><th>Elemento</th><th>Destino</th><th>Visível</th><th>Tem nome</th><th>Tamanho</th><th>≥ 24px</th><th>≥ 44px</th><th>Clique funciona</th><th>Observação</th></tr></thead>
    <tbody>${inventarioHtml}</tbody></table></div>
  </div>

  <div id="aba-prints" hidden>
    <div class="controles">
      <label>Navegador <select id="sel-nav"></select></label>
      <label>Tamanho de tela <select id="sel-vp"></select></label>
    </div>
    <div class="fotos lista" id="fotos-vp"></div>
  </div>

  <div id="aba-comparar" hidden>
    <div class="controles">
      <label>Seção <select id="sel-secao"></select></label>
      <label>Navegador <select id="sel-nav2"></select></label>
    </div>
    <div class="fotos grade" id="fotos-secao"></div>
  </div>
</main>
<script>
  var PRINTS = ${JSON.stringify(galeria).replace(/</g, "\\u003c")};
  var VPS = ${JSON.stringify(meta.viewports.map((v) => ({ id: v.id, nome: v.nome }))).replace(/</g, "\\u003c")};
  var ORDEM = VPS.map(function (v) { return v.id; });
  function nomeVp(id) { var v = VPS.find(function (x) { return x.id === id; }); return v ? id.replace("x", "×") + " · " + v.nome : id; }
  function opcoes(sel, valores, rotulo) { sel.innerHTML = valores.map(function (v) { return '<option value="' + v + '">' + (rotulo ? rotulo(v) : v) + "</option>"; }).join(""); }
  function unicos(xs) { return xs.filter(function (x, i) { return xs.indexOf(x) === i; }); }
  function figura(p, legenda) { return '<figure><figcaption>' + legenda + '</figcaption><a href="' + p.arquivo + '" target="_blank"><img loading="lazy" src="' + p.arquivo + '" alt="' + legenda + '"></a></figure>'; }

  document.querySelectorAll("nav.abas button").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll("nav.abas button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); document.getElementById("aba-" + x.dataset.aba).hidden = x !== b; });
    });
  });
  document.querySelectorAll(".filtros button").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".filtros button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      document.querySelectorAll("tr.linha").forEach(function (tr) {
        var f = b.dataset.filtro;
        tr.hidden = f === "nao" ? !tr.classList.contains("nao") : f === "critico" ? !(tr.classList.contains("nao") && tr.dataset.prioridade === "Crítico") : false;
      });
    });
  });

  var selNav = document.getElementById("sel-nav"), selVp = document.getElementById("sel-vp");
  var navs = unicos(PRINTS.filter(function (p) { return !p.estado; }).map(function (p) { return p.navegador; }));
  opcoes(selNav, navs);
  function atualizarVps() {
    var vps = unicos(PRINTS.filter(function (p) { return p.navegador === selNav.value && !p.estado; }).map(function (p) { return p.viewport; }))
      .sort(function (a, b) { return ORDEM.indexOf(a) - ORDEM.indexOf(b); });
    opcoes(selVp, vps, nomeVp);
    mostrarVp();
  }
  function mostrarVp() {
    var ps = PRINTS.filter(function (p) { return (p.navegador === selNav.value && p.viewport === selVp.value) || (p.estado && p.viewport === selVp.value && selNav.value === "chromium"); });
    document.getElementById("fotos-vp").innerHTML = ps.map(function (p) { return figura(p, p.nome); }).join("") || "<p>Sem prints.</p>";
  }
  selNav.addEventListener("change", atualizarVps); selVp.addEventListener("change", mostrarVp);
  atualizarVps();

  var selSecao = document.getElementById("sel-secao"), selNav2 = document.getElementById("sel-nav2");
  var secoes = unicos(PRINTS.map(function (p) { return p.secao; }));
  selSecao.innerHTML = secoes.map(function (s) { var p = PRINTS.find(function (x) { return x.secao === s; }); return '<option value="' + s + '">' + p.nome + "</option>"; }).join("");
  opcoes(selNav2, navs);
  function mostrarSecao() {
    var ps = PRINTS.filter(function (p) { return p.secao === selSecao.value && (p.estado || p.navegador === selNav2.value); })
      .sort(function (a, b) { return ORDEM.indexOf(a.viewport) - ORDEM.indexOf(b.viewport); });
    document.getElementById("fotos-secao").innerHTML = ps.map(function (p) { return figura(p, nomeVp(p.viewport)); }).join("") || "<p>Sem prints para esta combinação.</p>";
  }
  selSecao.addEventListener("change", mostrarSecao); selNav2.addEventListener("change", mostrarSecao);
  mostrarSecao();
</script>
</body>
</html>`;
  fs.writeFileSync(path.join(saida, "index.html"), html);
}
