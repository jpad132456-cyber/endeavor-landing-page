// Catálogo de checagens. Cada item é uma pergunta de SIM/NÃO.
// "como" diz exatamente o que o script mede; "fonte" diz de onde vem a regra.
// Prioridade: Crítico (impede a inscrição ou quebra a página), Importante (prejudica
// a experiência ou a marca), Recomendação (melhoria).

export const CATEGORIAS = {
  T: "1. Carregamento e técnica",
  D: "2. Primeira dobra (sem rolar)",
  L: "3. Layout e formatação",
  C: "4. Botões e links (cliques)",
  R: "5. Conteúdo e regras do evento",
  A: "6. Acessibilidade",
  P: "7. Velocidade e peso",
  S: "8. SEO e compartilhamento",
  V: "9. Identidade visual Endeavor",
};

const c = (prioridade, pergunta, como, fonte) => ({ prioridade, pergunta, como, fonte });

export const CATALOGO = {
  // 1. Carregamento e técnica
  T01: c("Crítico", "A página abre sem erro (HTTP 200)?", "Status da resposta do endereço testado.", "Básico"),
  T02: c("Crítico", "Nenhum erro de JavaScript no console?", "Escuta erros da página e mensagens console.error durante carregamento, rolagem e cliques.", "Básico"),
  T03: c("Importante", "Nenhum arquivo deixou de carregar (sem 404/500/erro de rede)?", "Lista toda requisição com status ≥ 400 ou falha de rede.", "Básico"),
  T04: c("Crítico", "Todas as imagens carregaram (nenhuma quebrada)?", "Depois de rolar a página inteira, toda <img> visível tem naturalWidth > 0.", "Básico"),
  T05: c("Importante", "As fontes da página (Hanken Grotesk, Inter e Unbounded) carregaram?", "document.fonts: cada família tem ao menos um arquivo com status \"loaded\".", "DESIGN.md 1.4"),
  T06: c("Crítico", "Nenhum elemento passa da largura da tela (sem rolagem lateral)?", "Mede a borda direita/esquerda de todo elemento visível, descontando só recortes intencionais (overflow) de ancestrais que não sejam o body. Tolerância 1px. O overflow-x do body não conta, porque no iPhone ele não impede a rolagem lateral.", "WCAG 1.4.10"),

  // 2. Primeira dobra
  D01: c("Crítico", "O título (H1) aparece inteiro sem rolar?", "Retângulo do H1 inteiro dentro da janela, com a página no topo.", "DESIGN.md 2.1"),
  D02: c("Importante", "O subtítulo aparece inteiro sem rolar?", "Retângulo do .lead inteiro dentro da janela.", "DESIGN.md 2.1"),
  D03: c("Crítico", "O botão \"Quero meu ingresso gratuito\" do hero aparece inteiro sem rolar?", "Retângulo de #hero-cta inteiro dentro da janela e não coberto por outro elemento (elementFromPoint no centro).", "DESIGN.md 2.1"),
  D04: c("Recomendação", "O link da Fever (alternativa) aparece sem rolar?", "Retângulo do link da Fever do hero inteiro dentro da janela.", "DESIGN.md 2.1"),
  D05: c("Importante", "O logo da Endeavor fica inteiro dentro do triângulo teal?", "Os 4 cantos do logo ficam dentro do triângulo (x/L + y/A ≤ 1).", "DESIGN.md 1.5"),
  D06: c("Importante", "O contador fica inteiro dentro do círculo e dentro da tela?", "Os 4 cantos dos dígitos (ou do aviso \"Acontecendo agora\") ficam dentro do círculo do hero e da largura da tela.", "DESIGN.md 2.2"),
  D07: c("Importante", "O selo amarelo \"100 vagas\" não cobre o contador?", "Distância entre o centro do selo e o retângulo do contador maior que o raio do selo.", "Comentários do CSS"),

  // 3. Layout e formatação
  L01: c("Crítico", "Nenhum texto aparece cortado?", "Cada linha de texto (Range.getClientRects) fica dentro da área visível dos ancestrais com overflow e dentro da largura da tela. A faixa rolante decorativa é ignorada.", "Básico"),
  L02: c("Crítico", "Nenhum texto ou imagem fica sobreposto a outro?", "Compara a área de tinta de cada linha de texto (do topo da letra mais alta ao pé da mais baixa), imagens e selos (círculos tratados como círculos). Sobreposição > 2px nos dois eixos = NÃO.", "Básico"),
  L03: c("Importante", "Os botões cabem em uma linha (o texto não quebra)?", "Conta as linhas de texto de cada .btn, .share e .utility-cta visível.", "Comentários do CSS"),
  L04: c("Importante", "A página usa só os tamanhos de fonte permitidos?", "Todo texto visível usa 50/22/16/112px (desktop) ou 32/20/16/72px (≤ 860px).", "DESIGN.md 2.2"),
  L05: c("Importante", "Nenhum texto menor que 16px?", "Tamanho de fonte calculado de todo texto visível ≥ 16px.", "Legibilidade no celular"),
  L06: c("Crítico", "Nenhuma imagem distorcida (proporção original mantida)?", "Proporção exibida = proporção do arquivo (±2%), exceto com object-fit cover/contain.", "Básico"),
  L07: c("Importante", "Nenhuma imagem ampliada além do tamanho do arquivo (sem pixelizar)?", "Escala de exibição (considerando object-fit) ≤ 1× o arquivo. SVG é ignorado.", "Básico"),
  L08: c("Recomendação", "Imagens nítidas em tela retina (arquivo com 2× o tamanho exibido)?", "Escala de exibição ≤ 0,5× o arquivo. SVG é ignorado.", "Boas práticas (telas 2×/3×)"),
  L09: c("Importante", "Os cards de palestrantes estão alinhados em grade e com o mesmo tamanho?", "Todas as fotos com mesma largura/altura (±1px), linhas com o mesmo número de colunas e colunas alinhadas.", "Básico"),
  L10: c("Recomendação", "Os parágrafos têm no máximo ~90 caracteres por linha?", "Caracteres ÷ linhas reais de cada parágrafo com 2+ linhas.", "Tipografia (45–90 caracteres)"),
  L11: c("Importante", "No fim da página, a barra fixa não cobre o rodapé?", "Rola até o fim e confere se o retângulo da barra fixa visível cruza algum elemento do rodapé.", "Básico"),
  L12: c("Importante", "Ao clicar no menu, o título da seção não fica escondido atrás do header fixo?", "Depois do clique em cada âncora, o topo do cabeçalho da seção fica abaixo do header fixo e na metade de cima da tela.", "Básico"),
  L13: c("Importante", "Todo texto respeita a margem lateral mínima de 16px?", "Cada linha de texto começa a ≥ 16px da borda esquerda e termina a ≥ 16px da direita.", "DESIGN.md 1.7"),
  L14: c("Crítico", "Todo bloco com animação de entrada aparece ao rolar (nada fica invisível)?", "Rola a página de meia em meia tela e confere se todo .reveal exibido (sem display:none) ganhou a classe is-seen.", "Básico"),

  // 4. Botões e links
  C01: c("Crítico", "Todo link tem destino (nada com href vazio ou \"#\")?", "Depois do JavaScript rodar, nenhum <a> com href vazio, \"#\" ou javascript:.", "Básico"),
  C02: c("Crítico", "Todos os botões de inscrição têm o mesmo texto e levam ao formulário de estudantes?", "Todo link com o texto \"Quero meu ingresso gratuito\" aponta para o Google Form, e todo link para o form tem esse texto.", "DESIGN.md 2.1"),
  C03: c("Importante", "Todo botão de inscrição no conteúdo tem o link da Fever ao lado ou abaixo?", "O bloco de cada botão do form (exceto barra preta do topo e header fixo) contém o link da Fever.", "DESIGN.md 2.1"),
  C04: c("Importante", "Links que abrem outra aba têm rel=noopener?", "Todo target=_blank tem noopener ou noreferrer.", "Segurança"),
  C05: c("Crítico", "Cada link/botão funciona ao ser clicado?", "Clica de verdade em cada elemento clicável visível: links externos precisam abrir nova aba com o endereço certo, âncoras precisam rolar até a seção, \"Adicionar à agenda\" precisa baixar o arquivo. Destinos externos são simulados (o clique não carrega o site real).", "Básico"),
  C06: c("Crítico", "Os sites de destino respondem (sem erro 404/500)?", "Requisição GET (seguindo redirecionamentos) para cada endereço externo único da página. Se bloquear robôs, tenta de novo com um navegador real.", "Básico"),
  C07: c("Importante", "\"Adicionar à agenda\" baixa um .ics válido com 26/10 às 18h (Brasília)?", "Arquivo baixado tem BEGIN/END:VCALENDAR, DTSTART:20261026T210000Z (18h BRT), título e local.", "Básico"),
  C08: c("Importante", "\"Chamar um colega\" abre o WhatsApp com mensagem e link da página?", "href começa com https://wa.me/?text= e a mensagem cita Day1, 18h, Sala São Paulo e o endereço da página.", "Básico"),
  C09: c("Recomendação", "Botões e links mudam de aparência ao passar o mouse?", "Compara cor, fundo, borda, sublinhado e transformações antes e depois do hover (só desktop).", "DESIGN.md 1.6"),
  C10: c("Importante", "Todo alvo de clique tem pelo menos 24×24 px?", "Retângulo de cada link/botão visível.", "WCAG 2.2 (2.5.8, AA)"),
  C11: c("Recomendação", "Todo alvo de toque tem pelo menos 44×44 px?", "Retângulo de cada link/botão visível (só celular e tablet).", "Apple HIG / Material (44–48px)"),
  C12: c("Importante", "Nada parece clicável (cursor de mãozinha) sem ser clicável?", "Elementos com cursor:pointer fora de links/botões.", "Básico"),
  C13: c("Importante", "No celular, a barra fixa de inscrição aparece quando o botão do topo sai da tela e some no CTA final?", "Confere a barra no topo (escondida), no meio da página (visível) e com o CTA final na tela (escondida).", "DESIGN.md 2.1"),
  C14: c("Importante", "No desktop, o header fixo aparece quando o botão do topo sai da tela e some no CTA final?", "Mesmo teste da C13, para o header fixo do desktop.", "Comentários do CSS"),
  C15: c("Crítico", "Ao chegar ao fim de cada seção, há um botão de inscrição visível na tela?", "Rola até o fim de cada seção e procura um link para o form inteiro na tela e não coberto (vale o botão da seção ou a barra fixa).", "DESIGN.md 2.1"),

  // 5. Conteúdo e regras do evento
  R01: c("Crítico", "Data, hora e local corretos aparecem?", "O texto da página contém 26.10 (ou 26/10), 18h, Sala São Paulo e Praça Júlio Prestes, 16.", "CLAUDE.md / DESIGN.md 2.1"),
  R02: c("Crítico", "A oferta \"100 ingressos gratuitos para estudantes\" aparece?", "Texto exato presente.", "DESIGN.md 2.1"),
  R03: c("Importante", "As regras do ingresso aparecem (ordem de inscrição, pessoal e intransferível, e-mail, spam)?", "Os 4 termos estão no texto.", "DESIGN.md 2.1"),
  R04: c("Crítico", "Todos os 6 palestrantes de 2026 aparecem, com foto e nome?", "As 6 fotos da pasta 1-palestrantes-hoje-2026 (em qualquer formato) estão na seção, cada uma com alt preenchido.", "assets/images/README.md"),
  R05: c("Crítico", "Nenhuma pessoa de edições anteriores aparece como palestrante de 2026?", "Nenhuma imagem da pasta 2-palestrantes-edicoes-anteriores (nem hero-decor) na seção de palestrantes, e fora dela só com alt vazio (sem nome).", "assets/images/README.md"),
  R06: c("Importante", "Patrocinadores e apoiadores estão na lista certa?", "Logos sob \"Patrocínio\" vêm só de 3-patrocinadores; sob \"Apoio\", só de 4-parceiros-e-apoiadores.", "assets/images/README.md"),
  R07: c("Crítico", "Nenhum contador de vagas restantes ou prazo inventado?", "O texto não contém \"restam\", \"restantes\", \"últimas N vagas\", \"N vagas disponíveis\", \"prazo\" etc.", "DESIGN.md 2.1"),
  R08: c("Crítico", "Os 4 links obrigatórios estão na página?", "Há links para o form de estudantes, a Fever, a transmissão online e o site da Endeavor.", "CLAUDE.md / DESIGN.md 2.1"),
  R09: c("Importante", "Só o formulário de estudantes usa o botão de destaque?", "Todo .btn e todo link com fundo teal apontam para o form; Fever, transmissão e site da Endeavor nunca usam .btn.", "DESIGN.md 2.1"),
  R10: c("Importante", "O contador mostra o estado certo em cada horário?", "Relógio simulado: 2 dias antes (48:00:00), 26/10 10h (08:00:00), 26/10 19h (\"Acontecendo agora\" + link online) e 27/10 (\"aconteceu\" + link).", "Script da página"),
  R11: c("Crítico", "Os textos com \"Hoje\" estão corretos para a data atual?", "Se a página diz \"hoje\", a data atual em Brasília precisa ser 26/10/2026.", "Conteúdo"),
  R12: c("Importante", "Nenhum texto de rascunho ou erro de dado aparece?", "O texto visível não contém lorem, undefined, NaN, null, [object, {{; e o texto original (sem caixa alta do CSS) não contém TODO ou FIXME.", "Básico"),

  // 6. Acessibilidade
  A01: c("Crítico", "axe-core: nenhuma falha de acessibilidade crítica ou séria?", "Biblioteca axe-core (regras WCAG 2.0/2.1/2.2 A e AA + boas práticas), impacto critical ou serious.", "WCAG 2.2 AA"),
  A02: c("Recomendação", "axe-core: nenhuma falha de acessibilidade de qualquer nível?", "Mesma análise, qualquer impacto.", "WCAG 2.2 AA"),
  A03: c("Importante", "Todo texto tem contraste suficiente com o fundo?", "Cor do texto (com opacidade) sobre a cor de fundo efetiva: ≥ 4,5:1, ou ≥ 3:1 em texto grande (≥ 24px, ou ≥ 18,66px em negrito).", "WCAG 1.4.3"),
  A04: c("Importante", "Toda imagem tem texto alternativo (ou está marcada como decorativa)?", "Nenhuma <img> sem atributo alt.", "WCAG 1.1.1"),
  A05: c("Importante", "Há um único H1 e os títulos seguem a ordem?", "Exatamente 1 H1 e nenhum salto de nível (ex.: H2 → H4).", "WCAG 1.3.1"),
  A06: c("Importante", "Todo elemento focado pelo teclado mostra contorno visível e não fica coberto?", "Aperta Tab por toda a página: cada elemento focado tem outline e não fica atrás de barra fixa.", "WCAG 2.4.7 / 2.4.11"),
  A07: c("Importante", "O botão de inscrição é alcançado com até 3 Tabs?", "Posição do primeiro link para o form na ordem do Tab.", "Usabilidade"),
  A08: c("Importante", "Elementos escondidos não recebem foco do teclado?", "Nenhum foco cai em barra fixa escondida ou fora da tela, e nada focável dentro de aria-hidden=true.", "WCAG 2.4.3 / 4.1.2"),
  A09: c("Importante", "Com \"reduzir movimento\" ligado, as animações param e todo o conteúdo aparece?", "Navegador com prefers-reduced-motion: nenhuma animação rodando e nenhum .reveal invisível.", "WCAG 2.3.3"),
  A10: c("Recomendação", "Sem JavaScript, todo o conteúdo e os botões funcionam?", "JavaScript desligado: nenhum .reveal invisível, H1 visível, botões do form presentes e nenhum link visível apontando para \"#\".", "Melhoria progressiva"),
  A11: c("Importante", "O idioma da página está definido como pt-BR?", "<html lang=\"pt-BR\">.", "WCAG 3.1.1"),
  A12: c("Recomendação", "A página tem as regiões header, nav, main e footer?", "Os 4 elementos existem.", "WCAG 1.3.1"),
  A13: c("Importante", "Não há IDs repetidos?", "Todo id é único.", "HTML válido"),

  // 7. Velocidade e peso
  P01: c("Importante", "Peso total da página (depois de rolar tudo) ≤ 3 MB?", "Soma dos bytes transferidos (corpo + cabeçalhos) de todas as requisições.", "Boas práticas para 4G"),
  P02: c("Importante", "Peso do carregamento inicial (antes de rolar) ≤ 1,5 MB?", "Mesma soma, só até o load + fontes, sem rolar.", "Boas práticas para 4G"),
  P03: c("Importante", "Nenhuma imagem com arquivo maior que 300 KB?", "Bytes de cada resposta de imagem.", "Boas práticas"),
  P04: c("Crítico", "LCP ≤ 2,5 s no celular com 4G simulado?", "Largest Contentful Paint medido no Chromium com rede 4G lenta (1,6 Mbps, 150 ms) e CPU 4× mais lenta (perfil do Lighthouse). No desktop: 10 Mbps, 40 ms.", "Google Core Web Vitals"),
  P05: c("Importante", "CLS ≤ 0,1 (a página não \"pula\" ao carregar e rolar)?", "Soma das layout-shift sem input recente, do carregamento até o fim da rolagem.", "Google Core Web Vitals"),
  P06: c("Recomendação", "FCP ≤ 1,8 s no celular com 4G simulado?", "First Contentful Paint no mesmo cenário da P04.", "Google (web.dev)"),
  P07: c("Importante", "Imagens fora da dobra usam carregamento preguiçoso, e as da dobra não?", "Nenhuma imagem da primeira tela com loading=lazy; toda imagem que começa mais de uma tela abaixo da dobra (só aparece depois de rolar mais de uma tela) com loading=lazy, exceto arquivo já usado acima.", "Boas práticas"),
  P08: c("Recomendação", "Toda imagem declara largura e altura no HTML?", "Atributos width e height em toda <img>.", "Boas práticas (evita CLS)"),
  P09: c("Recomendação", "No máximo 60 requisições?", "Número de requisições depois de rolar tudo.", "Boas práticas"),
  P10: c("Recomendação", "As fontes usam font-display: swap?", "O link do Google Fonts contém display=swap.", "Boas práticas"),

  // 8. SEO e compartilhamento
  S01: c("Importante", "O título da aba tem de 30 a 65 caracteres?", "Comprimento de document.title.", "Google (resultados de busca)"),
  S02: c("Importante", "A meta description tem de 70 a 160 caracteres?", "Comprimento do conteúdo.", "Google (resultados de busca)"),
  S03: c("Importante", "As tags Open Graph estão completas?", "og:title, og:description, og:image (endereço absoluto), og:url e og:type preenchidas.", "Open Graph (WhatsApp, LinkedIn)"),
  S04: c("Importante", "A imagem de compartilhamento existe e tem 1200×630?", "Carrega o arquivo de og:image e mede.", "Open Graph"),
  S05: c("Recomendação", "og:url aponta para o endereço publicado?", "og:url = https://endeavor-landing-page.vercel.app/.", "Open Graph"),
  S06: c("Recomendação", "O cartão do X/Twitter está configurado?", "twitter:card = summary_large_image.", "X/Twitter"),
  S07: c("Importante", "Favicon e ícone de iPhone existem?", "Os arquivos de rel=icon e rel=apple-touch-icon respondem 200.", "Básico"),
  S08: c("Recomendação", "Há link canônico?", "<link rel=\"canonical\"> presente.", "Google"),
  S09: c("Importante", "A meta viewport está certa e não bloqueia o zoom?", "Contém width=device-width e não tem user-scalable=no nem maximum-scale=1.", "WCAG 1.4.4"),
  S10: c("Recomendação", "Há dados estruturados de evento (schema.org Event)?", "JSON-LD com @type Event.", "Google (resultado rico de evento)"),
  S11: c("Crítico", "A página não está bloqueada para buscadores?", "Sem meta robots noindex e sem cabeçalho X-Robots-Tag noindex.", "Google"),

  // 9. Identidade visual
  V01: c("Importante", "Só cores da paleta Endeavor em textos, fundos e bordas?", "Cor do texto, do fundo e das bordas de todo elemento visível (e ::before/::after) pertence à paleta do DESIGN.md (transparência permitida).", "DESIGN.md 1.3"),
  V02: c("Importante", "Sem sombras?", "box-shadow e text-shadow = none em tudo.", "DESIGN.md 1.5"),
  V03: c("Importante", "Sem cantos arredondados fora de círculos?", "border-radius só 0 ou círculo (50% / raio ≥ metade do lado) em elementos com fundo, borda ou imagem.", "DESIGN.md 1.5"),
  V04: c("Importante", "Sem gradientes de cor?", "Nenhum background-image com gradiente de 2+ cores diferentes.", "DESIGN.md 1.3"),
  V05: c("Importante", "Os títulos (H1/H2) usam a fonte de display com peso forte?", "Primeira fonte da pilha é Founders/Hanken Grotesk e peso ≥ 700.", "DESIGN.md 1.4"),
  V06: c("Recomendação", "O grafismo da marca (diagonal teal) aparece na primeira dobra?", "Pseudo-elemento ::before do hero visível, teal e com ≥ 100px.", "DESIGN.md 1.5"),
};

// Imprime a tabela do guia em Markdown: node lib/catalogo.mjs
import { pathToFileURL } from "node:url";
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  for (const [letra, nome] of Object.entries(CATEGORIAS)) {
    console.log(`\n### ${nome}\n\n| ID | Pergunta (SIM/NÃO) | Prioridade | Como o script decide | Fonte da regra |\n|---|---|---|---|---|`);
    for (const [id, x] of Object.entries(CATALOGO)) {
      if (id[0] === letra) console.log(`| ${id} | ${x.pergunta} | ${x.prioridade} | ${x.como.replace(/\|/g, "\\|")} | ${x.fonte} |`);
    }
  }
}
