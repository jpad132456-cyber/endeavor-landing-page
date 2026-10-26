// Gera versões leves (WebP) das imagens usadas na página, sem tocar nos originais.
// Cada imagem é reduzida para caber na caixa indicada (2× o maior tamanho exibido, para
// telas retina) e salva numa subpasta web/ ao lado do original.
// Uso: node otimizar-imagens.mjs
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const IMGS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "assets", "images");

// [pasta, arquivo, largura máx., altura máx., qualidade]
const LOGO = [320, 128, 0.9];
const TRABALHO = [
  ...["mariano-gomide", "daniela-e-juliana-binatti", "carol-matsuse-e-yuri-gricheno", "sergio-lopes-e-edgar-diniz", "bernardinho", "antonio-carlos-pipponzi"]
    .map((n) => ["1-palestrantes-hoje-2026/sem-fundo", `${n}.png`, 424, 568, 0.85]),
  ["2-palestrantes-edicoes-anteriores", "palestrantes-05-dupla.jpg", 800, 800, 0.8],
  ["5-evento-identidade-e-local", "sala-sao-paulo-01.jpg", 1024, 618, 0.8],
  ["5-evento-identidade-e-local", "day1-endeavor.png", 720, 236, 0.9],
  ...["dell-technologies", "onfly", "salvy", "ey", "qi-tech", "cora", "appmax", "tako", "wescale"].map((n) => ["3-patrocinadores", `${n}.png`, ...LOGO]),
  ...["instituto-alpha-lumen", "orquestra-orion", "monking", "creator-ads", "the-map", "groov-ia", "nude", "kibon", "female-force", "b2mamy",
    "mafia-do-moscatel", "instituto-caldeira", "newhack", "confraria-do-empreendedor", "south-summit-brazil", "shiva", "distrito", "cubo-itau", "founders-club"]
    .map((n) => ["4-parceiros-e-apoiadores", `${n}.png`, ...LOGO]),
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [pasta, arquivo, maxW, maxH, q] of TRABALHO) {
  const origem = path.join(IMGS, pasta, arquivo);
  const tipo = arquivo.endsWith(".jpg") ? "image/jpeg" : "image/png";
  const dataUrl = `data:${tipo};base64,${fs.readFileSync(origem).toString("base64")}`;
  const r = await page.evaluate(async ({ dataUrl, maxW, maxH, q }) => {
    const img = new Image();
    img.src = dataUrl;
    await img.decode();
    const escala = Math.min(1, maxW / img.naturalWidth, maxH / img.naturalHeight);
    const w = Math.round(img.naturalWidth * escala), h = Math.round(img.naturalHeight * escala);
    // reduz pela metade em passos, para não serrilhar reduções grandes
    let fonte = img, fw = img.naturalWidth, fh = img.naturalHeight;
    while (fw / 2 >= w && fh / 2 >= h) {
      const c = document.createElement("canvas");
      c.width = Math.round(fw / 2); c.height = Math.round(fh / 2);
      const g = c.getContext("2d"); g.imageSmoothingQuality = "high"; g.drawImage(fonte, 0, 0, c.width, c.height);
      fonte = c; fw = c.width; fh = c.height;
    }
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d"); g.imageSmoothingQuality = "high"; g.drawImage(fonte, 0, 0, w, h);
    return { w, h, url: c.toDataURL("image/webp", q) };
  }, { dataUrl, maxW, maxH, q });
  const destino = path.join(IMGS, pasta, "web", arquivo.replace(/\.(png|jpg)$/, ".webp"));
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, Buffer.from(r.url.split(",")[1], "base64"));
  console.log(`${pasta}/web/${path.basename(destino)}  ${r.w}×${r.h}  ${Math.round(fs.statSync(destino).size / 1024)} KB`);
}
await browser.close();
