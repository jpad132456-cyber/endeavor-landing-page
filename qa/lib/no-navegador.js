// Funções que rodam dentro da página (injetadas antes de cada carregamento).
// Só medem: não mudam nada visível. A única marca deixada é o atributo data-qa nos
// elementos clicáveis, usado pelo script para clicar neles depois.
window.__qa = (() => {
  const PALETA = {
    ink: [1, 0, 15], white: [255, 255, 255], teal: [9, 225, 205], blue: [39, 58, 233],
    yellow: [255, 207, 83], purple: [172, 39, 244], "teal-pale": [220, 251, 250], "gray-line": [204, 204, 207],
  };

  function cor(str) {
    const m = String(str).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  const hex = (c) => "#" + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();
  function nomeNaPaleta(c) {
    for (const [nome, p] of Object.entries(PALETA)) {
      if (Math.abs(p[0] - c.r) <= 3 && Math.abs(p[1] - c.g) <= 3 && Math.abs(p[2] - c.b) <= 3) return nome;
    }
    return null;
  }
  function luminancia(c) {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  }
  const contraste = (a, b) => { const x = luminancia(a), y = luminancia(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const misturar = (c, fundo) => ({ r: c.r * c.a + fundo.r * (1 - c.a), g: c.g * c.a + fundo.g * (1 - c.a), b: c.b * c.a + fundo.b * (1 - c.a), a: 1 });

  // Cor de fundo efetiva: empilha os fundos dos ancestrais até achar um opaco.
  function fundo(el) {
    const camadas = [];
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const c = cor(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0) { camadas.push(c); if (c.a >= 1) break; }
    }
    let base = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = camadas.length - 1; i >= 0; i--) base = misturar(camadas[i], base);
    return base;
  }

  function visivel(el) {
    if (!el || !el.isConnected) return false;
    if (el.closest(".sr-only")) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) === 0) return false;
    }
    return true;
  }
  function emFixo(el) {
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) if (getComputedStyle(n).position === "fixed") return true;
    return false;
  }
  function descrever(el) {
    let s = el.tagName.toLowerCase();
    if (el.id) s += "#" + el.id;
    const cls = typeof el.className === "string" ? el.className.trim().split(/\s+/).filter(Boolean).slice(0, 2) : [];
    if (cls.length) s += "." + cls.join(".");
    const t = (el.innerText || el.getAttribute("alt") || el.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 48);
    return t ? `${s} "${t}"` : s;
  }

  // Área visível do elemento: o próprio retângulo cortado pelos ancestrais com overflow
  // (exceto body/html: no iPhone o overflow-x do body não impede rolagem lateral).
  function caixaDeRecorte(el, incluirProprio) {
    const box = { l: -Infinity, t: -Infinity, r: Infinity, b: Infinity };
    for (let n = incluirProprio ? el : el.parentElement; n && n !== document.body && n !== document.documentElement; n = n.parentElement) {
      const cs = getComputedStyle(n);
      const cx = cs.overflowX !== "visible", cy = cs.overflowY !== "visible";
      if (!cx && !cy) continue;
      const p = n.getBoundingClientRect();
      const l = p.left + n.clientLeft, t = p.top + n.clientTop;
      if (cx) { box.l = Math.max(box.l, l); box.r = Math.min(box.r, l + n.clientWidth); }
      if (cy) { box.t = Math.max(box.t, t); box.b = Math.min(box.b, t + n.clientHeight); }
    }
    return box;
  }
  function retanguloVisivel(el) {
    const r = el.getBoundingClientRect(), c = caixaDeRecorte(el, false);
    return { l: Math.max(r.left, c.l), t: Math.max(r.top, c.t), r: Math.min(r.right, c.r), b: Math.min(r.bottom, c.b) };
  }

  function temTextoProprio(el) {
    for (const n of el.childNodes) if (n.nodeType === 3 && n.textContent.trim()) return true;
    return false;
  }
  function folhasDeTexto() {
    const out = [];
    for (const el of document.body.querySelectorAll("*")) {
      if (el.closest("svg, script, style, noscript, template, .sr-only")) continue;
      if (temTextoProprio(el) && visivel(el)) out.push(el);
    }
    return out;
  }
  // Caixas das linhas de texto do próprio elemento (sem os filhos).
  function caixasDeTexto(el) {
    const out = [];
    for (const n of el.childNodes) {
      if (n.nodeType !== 3 || !n.textContent.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      for (const r of range.getClientRects()) if (r.width > 0.5 && r.height > 0.5) out.push({ l: r.left, t: r.top, r: r.right, b: r.bottom });
    }
    return out;
  }
  function linhas(el) {
    const range = document.createRange();
    range.selectNodeContents(el);
    const tops = new Set();
    for (const r of range.getClientRects()) if (r.width > 0.5 && r.height > 0.5) tops.add(Math.round(r.top / 4));
    return tops.size;
  }
  function circulo(el) {
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    if (!/50%/.test(cs.borderTopLeftRadius) || Math.abs(r.width - r.height) > 2) return null;
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, raio: r.width / 2 };
  }
  function distRetPonto(b, x, y) {
    const dx = Math.max(b.l - x, 0, x - b.r), dy = Math.max(b.t - y, 0, y - b.b);
    return Math.hypot(dx, dy);
  }
  function naoCoberto(el) {
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return false;
    const topo = document.elementFromPoint(x, y);
    return !!topo && (topo === el || el.contains(topo));
  }
  function inteiroNaTela(el) {
    if (!el || !visivel(el)) return false;
    const r = el.getBoundingClientRect();
    return r.top >= -1 && r.left >= -1 && r.bottom <= innerHeight + 1 && r.right <= document.documentElement.clientWidth + 1;
  }
  function nomeAcessivel(el) {
    const label = el.getAttribute("aria-label");
    if (label) return label.trim();
    const ids = el.getAttribute("aria-labelledby");
    if (ids) return ids.split(/\s+/).map((id) => document.getElementById(id)?.textContent || "").join(" ").trim();
    const t = (el.innerText || el.textContent || "").trim().replace(/\s+/g, " ");
    if (t) return t;
    const img = el.querySelector("img[alt]");
    return (img && img.alt.trim()) || (el.getAttribute("title") || "").trim();
  }
  function pseudos(el) {
    const out = [[getComputedStyle(el), ""]];
    for (const p of ["::before", "::after"]) {
      const cs = getComputedStyle(el, p);
      if (cs.content && cs.content !== "none" && cs.content !== "normal") out.push([cs, p]);
    }
    return out;
  }

  function auditar(cfg) {
    const vw = document.documentElement.clientWidth, vh = innerHeight;
    const todas = [...document.body.querySelectorAll("*")].filter((el) => !el.closest("svg") || el.tagName.toLowerCase() === "svg");
    const visiveis = todas.filter(visivel);
    const folhasTodas = folhasDeTexto();
    const folhas = folhasTodas.filter((el) => !emFixo(el));
    const out = { vw, vh, docH: document.documentElement.scrollHeight };

    // T06: elementos que passam da largura da tela
    out.transbordando = [];
    const marcados = [];
    for (const el of visiveis) {
      if (emFixo(el) || marcados.some((m) => m.contains(el))) continue;
      const v = retanguloVisivel(el);
      if (v.r - v.l <= 0 || v.b - v.t <= 0) continue;
      if (v.r > vw + 1 || v.l < -1) { marcados.push(el); out.transbordando.push(`${descrever(el)} (${Math.round(v.l)}→${Math.round(v.r)}px; tela ${vw}px)`); }
    }

    // L01: texto cortado
    out.cortados = [];
    for (const el of folhas) {
      if (el.closest(".marquee")) continue;
      const clip = caixaDeRecorte(el, true);
      clip.l = Math.max(clip.l, 0); clip.r = Math.min(clip.r, vw);
      if (caixasDeTexto(el).some((b) => b.l < clip.l - 1 || b.r > clip.r + 1 || b.t < clip.t - 1 || b.b > clip.b + 1)) out.cortados.push(descrever(el));
    }

    // L02: sobreposições
    const itens = [];
    // Para texto, a caixa é a da TINTA das letras (do topo da letra mais alta ao pé da mais baixa,
    // medido com canvas na mesma fonte), não a área reservada pela fonte: com entrelinha fechada
    // as áreas reservadas de linhas vizinhas se cruzam sem as letras se tocarem; já letras que se
    // encostam de verdade (entrelinha apertada demais, texto por cima de texto) continuam pegas.
    const tela = document.createElement("canvas").getContext("2d");
    const caixasDeTinta = (el) => {
      const cs = getComputedStyle(el);
      let texto = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join("").trim();
      if (cs.textTransform === "uppercase") texto = texto.toUpperCase();
      tela.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const m = tela.measureText(texto);
      return caixasDeTexto(el).map((b) => {
        const base = b.t + m.fontBoundingBoxAscent; // linha de base dentro da área da fonte
        return { l: b.l, r: b.r, t: base - m.actualBoundingBoxAscent, b: base + m.actualBoundingBoxDescent };
      });
    };
    for (const el of folhas) if (!el.closest(".marquee")) itens.push({ el, caixas: caixasDeTinta(el) });
    for (const el of document.querySelectorAll("img, .seal, .edge-seal")) {
      if (!visivel(el) || emFixo(el) || el.closest(".marquee")) continue;
      const v = retanguloVisivel(el);
      if (v.r - v.l <= 0 || v.b - v.t <= 0) continue;
      itens.push({ el, caixas: [v], circ: circulo(el) });
    }
    const sobrepoe = (a, b, ca, cb) => {
      if (ca && cb) return Math.hypot(ca.cx - cb.cx, ca.cy - cb.cy) < ca.raio + cb.raio - 2;
      if (ca) return distRetPonto(b, ca.cx, ca.cy) < ca.raio - 2;
      if (cb) return distRetPonto(a, cb.cx, cb.cy) < cb.raio - 2;
      return Math.min(a.r, b.r) - Math.max(a.l, b.l) > 2 && Math.min(a.b, b.b) - Math.max(a.t, b.t) > 2;
    };
    out.sobreposicoes = [];
    for (let i = 0; i < itens.length; i++) {
      for (let j = i + 1; j < itens.length; j++) {
        const A = itens[i], B = itens[j];
        if (A.el.contains(B.el) || B.el.contains(A.el)) continue;
        if (A.caixas.some((a) => B.caixas.some((b) => sobrepoe(a, b, A.circ, B.circ)))) {
          out.sobreposicoes.push(`${descrever(A.el)} × ${descrever(B.el)}`);
        }
      }
    }

    // L04/L05: tamanhos de fonte
    out.fontes = {};
    for (const el of folhasTodas) {
      const s = Math.round(parseFloat(getComputedStyle(el).fontSize) * 10) / 10;
      (out.fontes[s] ||= []);
      if (out.fontes[s].length < 3) out.fontes[s].push(descrever(el));
    }

    // A03: contraste
    out.contraste = [];
    for (const el of folhasTodas) {
      const cs = getComputedStyle(el);
      const c = cor(cs.color);
      if (!c || c.a === 0) continue;
      let op = 1;
      for (let n = el; n && n.nodeType === 1; n = n.parentElement) op *= parseFloat(getComputedStyle(n).opacity);
      const bg = fundo(el);
      const razao = contraste(misturar({ ...c, a: c.a * op }, bg), bg);
      const fs = parseFloat(cs.fontSize), fw = parseInt(cs.fontWeight, 10);
      const minimo = fs >= 24 || (fs >= 18.66 && fw >= 700) ? 3 : 4.5;
      if (razao < minimo - 0.005) out.contraste.push(`${descrever(el)}: ${razao.toFixed(2)}:1 (mínimo ${minimo}:1; texto ${hex(c)} sobre ${hex(bg)})`);
    }

    // V01–V04: paleta, sombras, cantos e gradientes
    out.foraDaPaleta = {};
    out.sombras = []; out.cantos = []; out.gradientes = [];
    const folhaSet = new Set(folhasTodas);
    for (const el of visiveis) {
      if (el.closest("svg")) continue;
      for (const [cs, p] of pseudos(el)) {
        const nome = descrever(el) + p;
        const cores = [];
        if (!p && folhaSet.has(el)) cores.push(["texto", cs.color]);
        cores.push(["fundo", cs.backgroundColor]);
        for (const lado of ["Top", "Right", "Bottom", "Left"]) {
          if (parseFloat(cs[`border${lado}Width`]) > 0 && cs[`border${lado}Style`] !== "none") cores.push(["borda", cs[`border${lado}Color`]]);
        }
        if (parseFloat(cs.webkitTextStrokeWidth) > 0) cores.push(["contorno do texto", cs.webkitTextStrokeColor]);
        for (const [tipo, valor] of cores) {
          const k = cor(valor);
          if (!k || k.a === 0 || nomeNaPaleta(k)) continue;
          const h = hex(k);
          (out.foraDaPaleta[h] ||= []);
          if (out.foraDaPaleta[h].length < 3) out.foraDaPaleta[h].push(`${tipo} de ${nome}`);
        }
        if ((cs.boxShadow && cs.boxShadow !== "none") || (cs.textShadow && cs.textShadow !== "none")) out.sombras.push(nome);
        const raios = ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius"].map((k) => cs[k]);
        if (raios.some((v) => parseFloat(v) > 0)) {
          const w = parseFloat(cs.width) || el.getBoundingClientRect().width, h = parseFloat(cs.height) || el.getBoundingClientRect().height;
          const ehCirculo = raios.every((v) => (/%/.test(v) ? parseFloat(v) >= 50 : parseFloat(v) >= Math.min(w, h) / 2 - 1));
          const temCara = (cor(cs.backgroundColor)?.a || 0) > 0 || parseFloat(cs.borderTopWidth) > 0 || (!p && el.tagName === "IMG");
          if (!ehCirculo && temCara) out.cantos.push(`${nome} (${raios.join(" ")})`);
        }
        if (/gradient\(/.test(cs.backgroundImage)) {
          const cs2 = new Set((cs.backgroundImage.match(/rgba?\([^)]*\)/g) || []).map((v) => hex(cor(v))));
          if (cs2.size > 1) out.gradientes.push(`${nome}: ${[...cs2].join(", ")}`);
        }
      }
    }

    // V05: títulos; V06: diagonal teal
    out.titulos = [...document.querySelectorAll("h1, h2")].filter(visivel).map((h) => {
      const cs = getComputedStyle(h);
      const primeira = cs.fontFamily.split(",")[0].replace(/["']/g, "").trim();
      return { desc: descrever(h), fonte: primeira, peso: parseInt(cs.fontWeight, 10) };
    });
    const hero = document.querySelector(".hero");
    const diag = hero && getComputedStyle(hero, "::before");
    out.diagonal = diag ? { cor: nomeNaPaleta(cor(diag.backgroundColor) || {}), w: parseFloat(diag.width), h: parseFloat(diag.height), display: diag.display } : null;

    // Primeira dobra
    const heroCta = document.getElementById("hero-cta");
    out.dobra = {
      h1: inteiroNaTela(document.querySelector("h1")),
      lead: inteiroNaTela(document.querySelector(".hero .lead")),
      cta: inteiroNaTela(heroCta) && naoCoberto(heroCta),
      fever: inteiroNaTela(document.querySelector(".hero .secondary a")),
      ctaRet: heroCta ? (({ top, bottom }) => ({ top: Math.round(top), bottom: Math.round(bottom) }))(heroCta.getBoundingClientRect()) : null,
    };
    // D05: logo dentro do triângulo
    const logo = document.querySelector(".site-header .logo");
    if (logo && hero && diag) {
      const hr = hero.getBoundingClientRect(), lr = logo.getBoundingClientRect();
      const W = parseFloat(diag.width), H = parseFloat(diag.height);
      const cantos = [[lr.left, lr.top], [lr.right, lr.top], [lr.left, lr.bottom], [lr.right, lr.bottom]];
      const pior = Math.max(...cantos.map(([x, y]) => (x - hr.left) / W + (y - hr.top) / H));
      out.logoNoTriangulo = { ok: pior <= 1.001 && lr.left >= hr.left && lr.top >= hr.top, pior: +pior.toFixed(3) };
    }
    // D06/D07: contador
    const visual = document.querySelector(".hero-visual");
    const alvoContador = document.querySelector(".countdown-digits") || document.querySelector(".countdown-live");
    if (visual && alvoContador && visivel(alvoContador)) {
      const vr = visual.getBoundingClientRect(), cr = alvoContador.getBoundingClientRect();
      const cx = vr.left + vr.width / 2, cy = vr.top + vr.height / 2, raio = vr.width / 2;
      const cantos = [[cr.left, cr.top], [cr.right, cr.top], [cr.left, cr.bottom], [cr.right, cr.bottom]];
      const foraCirculo = cantos.filter(([x, y]) => Math.hypot(x - cx, y - cy) > raio + 1).length;
      const clip = caixaDeRecorte(alvoContador, false);
      const cortado = cr.left < Math.max(0, clip.l) - 1 || cr.right > Math.min(vw, clip.r) + 1 || cr.bottom > clip.b + 1;
      out.contador = { ok: foraCirculo === 0 && !cortado, foraCirculo, cortado };
      const selo = document.querySelector(".hero-visual .seal");
      if (selo && visivel(selo)) {
        const sr = selo.getBoundingClientRect();
        const caixas = [cr];
        const rotulo = document.querySelector(".countdown-label");
        if (rotulo && visivel(rotulo)) caixas.push(rotulo.getBoundingClientRect());
        const dist = Math.min(...caixas.map((b) => distRetPonto({ l: b.left, t: b.top, r: b.right, b: b.bottom }, sr.left + sr.width / 2, sr.top + sr.height / 2)));
        out.selo = { ok: dist >= sr.width / 2, folga: Math.round(dist - sr.width / 2) };
      }
    }

    // L03: botões em uma linha
    out.botoesQuebrados = [...document.querySelectorAll("a.btn, a.share, .utility-cta")]
      .filter((el) => visivel(el) && getComputedStyle(el.closest(".sticky-cta, .topbar") || el).display !== "none")
      .filter((el) => new Set(caixasDeTexto(el).map((b) => Math.round(b.t / 4))).size > 1)
      .map(descrever);

    // Imagens
    out.imagens = [...document.querySelectorAll("img")].map((img) => {
      const r = img.getBoundingClientRect(), cs = getComputedStyle(img);
      return {
        src: img.getAttribute("src"), desc: descrever(img), alt: img.getAttribute("alt"),
        nw: img.naturalWidth, nh: img.naturalHeight, rw: r.width, rh: r.height,
        fit: cs.objectFit, svg: /\.svg($|\?)/i.test(img.currentSrc || img.src), completa: img.complete,
        lazy: img.loading === "lazy" || img.getAttribute("loading") === "lazy",
        top: r.top + scrollY, visivel: visivel(img), fixo: emFixo(img),
        temDim: img.hasAttribute("width") && img.hasAttribute("height"),
        decorativa: !!img.closest('[aria-hidden="true"]') || img.getAttribute("role") === "presentation",
      };
    });

    // L09: cards de palestrantes
    const fotos = [...document.querySelectorAll(".speaker img")].filter(visivel).map((i) => i.getBoundingClientRect());
    if (fotos.length) {
      const mesmoTamanho = fotos.every((f) => Math.abs(f.width - fotos[0].width) <= 1 && Math.abs(f.height - fotos[0].height) <= 1);
      const linhasDeCards = [];
      for (const f of fotos) {
        const l = linhasDeCards.find((x) => Math.abs(x.top - f.top) <= 2);
        if (l) l.lefts.push(f.left); else linhasDeCards.push({ top: f.top, lefts: [f.left] });
      }
      const cols = linhasDeCards[0].lefts.length;
      const colunasOk = linhasDeCards.every((l, i) => (i === linhasDeCards.length - 1 ? l.lefts.length <= cols : l.lefts.length === cols)
        && l.lefts.every((x, k) => Math.abs(x - linhasDeCards[0].lefts[k]) <= 1));
      out.cards = { ok: mesmoTamanho && colunasOk, colunas: cols, linhas: linhasDeCards.length, mesmoTamanho, colunasOk };
    }

    // L10: caracteres por linha
    out.linhasLongas = [];
    for (const el of document.querySelectorAll("p, li, h1, h2, h3")) {
      if (!visivel(el) || el.closest(".marquee, .sr-only")) continue;
      const n = linhas(el), chars = el.innerText.replace(/\s+/g, " ").trim().length;
      if (n >= 2 && chars / n > 90) out.linhasLongas.push(`${descrever(el)}: ~${Math.round(chars / n)} caracteres/linha`);
    }

    // L13: margem lateral
    out.semMargem = [];
    for (const el of folhas) {
      if (el.closest(".marquee")) continue;
      if (caixasDeTexto(el).some((b) => b.l < 15.5 || b.r > vw - 15.5)) out.semMargem.push(descrever(el));
    }

    // Clicáveis
    out.cliques = [];
    document.querySelectorAll('a[href], button, [role="button"], input, select, textarea, summary').forEach((el, i) => {
      el.setAttribute("data-qa", String(i));
      const r = el.getBoundingClientRect();
      const barra = el.closest(".topbar, .sticky-cta");
      out.cliques.push({
        qa: i, desc: descrever(el), tag: el.tagName.toLowerCase(), href: el.getAttribute("href"), hrefAbs: el.href || null,
        target: el.getAttribute("target") || "", rel: el.getAttribute("rel") || "", nome: nomeAcessivel(el),
        w: Math.round(r.width), h: Math.round(r.height), visivel: visivel(el), barra: barra ? barra.id : null,
        barraDisplay: barra ? getComputedStyle(barra).display : null, classe: typeof el.className === "string" ? el.className : "",
        fundoTeal: nomeNaPaleta(cor(getComputedStyle(el).backgroundColor) || {}) === "teal",
      });
    });
    out.cursorSemAcao = visiveis
      .filter((el) => getComputedStyle(el).cursor === "pointer" && !el.closest('a[href], button, label, summary, [role="button"], input, select'))
      .map(descrever);

    // Acessibilidade estrutural
    out.imgsSemAlt = [...document.querySelectorAll("img:not([alt])")].map(descrever);
    out.titulosOrdem = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((h) => +h.tagName[1]);
    out.regioes = { header: !!document.querySelector("header, [role=banner]"), nav: !!document.querySelector("nav, [role=navigation]"), main: !!document.querySelector("main, [role=main]"), footer: !!document.querySelector("footer, [role=contentinfo]") };
    const ids = {};
    document.querySelectorAll("[id]").forEach((el) => { ids[el.id] = (ids[el.id] || 0) + 1; });
    out.idsRepetidos = Object.entries(ids).filter(([, n]) => n > 1).map(([id, n]) => `${id} (${n}×)`);
    out.focoEmEscondido = [...document.querySelectorAll('[aria-hidden="true"]')].flatMap((box) =>
      [...box.querySelectorAll("a[href], button, input, select, textarea, [tabindex]")].filter((el) => el.tabIndex >= 0).map(descrever));

    // Blocos com display:none (escondidos de propósito neste tamanho) não entram: nunca são vistos.
    const renderizado = (el) => el.getClientRects().length > 0;
    out.reveals = { total: [...document.querySelectorAll(".reveal")].filter(renderizado).length, vistos: [...document.querySelectorAll(".reveal.is-seen")].filter(renderizado).length,
      faltando: [...document.querySelectorAll(".reveal:not(.is-seen)")].filter(renderizado).map(descrever) };
    return out;
  }

  // Assinatura visual de um elemento (para comparar antes/depois do hover)
  function assinatura(el) {
    const cs = getComputedStyle(el), a = getComputedStyle(el, "::after"), b = getComputedStyle(el, "::before");
    const icone = el.querySelector("svg");
    return [cs.color, cs.backgroundColor, cs.borderTopColor, cs.backgroundSize, cs.textDecorationLine, cs.textDecorationColor,
      b.transform, a.height, icone ? getComputedStyle(icone).transform : ""].join("|");
  }

  return { auditar, assinatura, visivel, naoCoberto, descrever, emFixo };
})();
