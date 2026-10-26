# DESIGN.md — Endeavor Landing Page

> Documento de referência de design. A **Parte 1** registra a identidade visual do site oficial
> [brasil.endeavor.org](https://brasil.endeavor.org) (levantada em 26/10/2026, inspecionando o CSS
> computado da home em desktop 1440px e mobile 375px). Não é uma regra rígida: é a base de onde
> partir. Desvios são bem-vindos quando servirem melhor à página — desde que a página continue
> "parecendo Endeavor".

---

## Parte 1 — Identidade visual do site Endeavor Brasil

### 1.1 Personalidade da marca

- **Tom:** ambicioso, confiante, editorial. Fala de escala, impacto e "efeito multiplicador".
- **Tagline global:** *Dream bigger. Scale faster. Pay it forward.* — no Brasil vira o tripé
  **SONHAR MAIS ALTO / ESCALAR RÁPIDO / MULTIPLICAR IMPACTO**.
- **Sensação visual:** contraste forte (quase-preto × branco), blocos de cor chapada e saturada,
  tipografia grotesca grande e pesada, formas geométricas (diagonais e círculos) e muitas fotos
  reais de empreendedores e da comunidade.
- **Nada de "SaaS genérico":** quase não há sombras, cantos arredondados em cards ou gradientes.
  A geometria vem de **recortes** (círculos, diagonais), não de caixas com borda.

### 1.2 Logo

- Wordmark **"endeavor"** em minúsculas, geométrico, SVG (`216×28` no viewBox; exibido ~180px de
  largura no header desktop, ~150px no mobile).
- Cor padrão `#01000F` (sobre claro) ou branco (sobre escuro).
- Existe também um **símbolo "e"** dentro de um círculo teal (`#09E1CD`) usado como selo sobre
  fotos (ex.: canto da foto circular do hero).

### 1.3 Paleta de cores

| Token sugerido         | Hex        | Uso no site |
|------------------------|------------|-------------|
| `--ink`                | `#01000F`  | Cor de texto principal, fundos escuros (seção de empresas, rodapé). É um "preto azulado", **nunca** `#000`. |
| `--white`              | `#FFFFFF`  | Fundo padrão das páginas, texto sobre escuro/azul. |
| `--teal`               | `#09E1CD`  | Cor-assinatura. Diagonal do hero, botão "Subscribe", círculo dos depoimentos, triângulo do rodapé, símbolo "e". |
| `--blue`               | `#273AE9`  | Azul elétrico. Fundo de seção full-bleed (tripé Sonhar/Escalar/Multiplicar), eyebrows/kicker coloridos ("O Efeito Multiplicador", "INSIGHTS DA REDE"), setas do carrossel. |
| `--yellow`             | `#FFCF53`  | Amarelo quente. Círculo com descrição da empresa no carrossel, bullets (bolinhas) antes de links de lista. |
| `--purple`             | `#AC27F4`  | Roxo. Sublinhado (2px) dos links de texto/CTA, botão de busca. |
| `--teal-pale`          | `#DCFBFA`  | Teal clarinho. Barras de aviso (cookie notice / alert bar). |
| `--gray-line`          | `#CCCCCF`  | Divisórias pontuais. |

Notas:
- As cores de destaque aparecem **chapadas**, em grandes áreas ou formas geométricas — não em
  gradientes.
- Cada seção tende a usar **uma** cor de destaque dominante (azul *ou* teal *ou* amarelo), sobre a
  base ink/branco.
- O teal das grandes áreas no hero renderiza visualmente um pouco mais suave (~`#66DDCC`) por causa
  da imagem/compressão; a cor de referência continua `#09E1CD`.

### 1.4 Tipografia

| Família               | Papel | Observações |
|-----------------------|-------|-------------|
| **Founders Grotesk** (Klim) | Display e maior parte da UI: títulos, parágrafos de destaque, nav, links, botões | Fonte proprietária. Alternativas gratuitas próximas: **Hanken Grotesk**, **Schibsted Grotesk**, **Inter Tight**, **Space Grotesk** (mais geométrica). |
| **Inter**             | Texto corrido "miúdo" (descrições, cards, body base 18px) | Google Fonts. |
| **Object Sans**       | Números gigantes de estatística | Fonte proprietária (PangramPangram). Alternativas: **Unbounded**, **Syne**, **Archivo Black** (wide). |

Escala observada (desktop → mobile):

| Elemento | Fonte | Tamanho / line-height | Peso | Notas |
|---|---|---|---|---|
| H1 hero | Founders Grotesk | 50/52px → 30/31px | 700 | Texto em CAIXA ALTA (escrito assim no conteúdo), entrelinha bem fechada (~1.04). |
| Nomes de empresas (lista grande) | Founders Grotesk | 50/52px | 700 | Branco sobre ink, com sublinhado branco espesso. |
| H2 seção | Founders Grotesk | 42/46px | 600–700 | Na seção azul, centralizado e branco. |
| H3 | Founders Grotesk | 32/32px | 600 | |
| Citação (depoimento) | Founders Grotesk | 27/38px | 600 | Entre aspas, centralizada. |
| H4 / item de nav mobile | Founders Grotesk | 26/31px | 500 | |
| Kicker colorido | Founders Grotesk | 22/26px | 500 | Cor `--blue`. Às vezes caixa alta ("INSIGHTS DA REDE"), às vezes não. |
| Link CTA de texto | Founders Grotesk | 22/26px | 500 | Com sublinhado roxo (ver componentes). |
| Parágrafo de destaque | Founders Grotesk | 20/26px → 18/24px | 400 | Negrito (700) para frases-chave dentro do texto. |
| Body base | Inter | 18/27px | 400 | |
| Texto pequeno de card | Inter | 14/22px | 400 | |
| Eyebrow / label | Founders Grotesk | 16/19px | 600 | CAIXA ALTA, `letter-spacing: 0.1em` (1.6px). Ex.: "ENDEAVOR BRASIL — 26 ANOS DE IMPACTO 🇧🇷", "NOSSA MISSÃO". |
| Nav desktop | Founders Grotesk | 16px | 500 | |
| Botão | Founders Grotesk | 15px | 500 | |
| Números de estatística | Object Sans | 112/130px | 700 | **Vazados**: `color: transparent; -webkit-text-stroke: 2px #01000F`. Caixa alta, `letter-spacing: 0.01em`. |

Princípios tipográficos:
- **Títulos grandes, pesados e apertados**; texto de apoio leve e bem espaçado.
- Contraste de tamanho alto entre título e corpo.
- Alinhamento à esquerda como padrão; centralizado só em seções de manifesto (azul) e citações.

### 1.5 Formas, grafismos e imagens

- **Diagonal teal:** o hero tem um triângulo/faixa diagonal teal saindo do canto superior esquerdo
  (atrás do logo) — repete no canto do rodapé. É o grafismo mais reconhecível.
- **Círculos:** fotos recortadas em círculo (`border-radius: 50%`) — foto grande da comunidade
  sangrando à direita do hero, fotos de fundadores em círculos menores, círculo amarelo com texto
  da empresa, círculo teal com a citação nos depoimentos. Círculos frequentemente **sobrepõem**
  a borda de seções.
- **Padrão de linhas onduladas:** seções escuras (ink) usam um pattern SVG de linhas curvas finas
  (`desktop-pattern.svg`), tipo curvas de nível/topografia, em cinza sobre `#01000F`.
- **Fotografia:** fotos reais, quentes, de pessoas (fundadores, eventos, palco). Sorrisos, grupos,
  ambientes de evento. Sem banco de imagens genérico.
- **Cantos:** retos (0px) em praticamente tudo; apenas círculos (50%) e um raro 40px.
- **Sombras:** quase inexistentes. Profundidade vem de sobreposição de formas e cor.

### 1.6 Componentes

**Barra utilitária (topo):** faixa fina `#01000F` com links brancos pequenos ("Search", "Endeavor
Open", "Visit Endeavor Global") e, na ponta direita, o botão "Subscribe" teal.

**Header / navegação:** fundo branco, sticky (~60px de altura quando fixo), logo à esquerda, itens
à direita em Founders Grotesk 16px/500 ink. Itens: Day1 · Empreendedores(as) Endeavor · Rede ·
Scale Up Ventures · Knowledge Center & Events · Sobre a Endeavor. No mobile vira "MENU" (texto em
caixa alta com duas linhas abaixo, estilo hambúrguer tipográfico) que abre menu full-screen com itens
26px separados por linha de 1px.

**Botão primário:** retangular, sem raio, fundo `--teal`, borda 2px teal, texto ink 15px/500,
padding `8px 20px 9px`, transição 0.35s. O site usa pouquíssimos botões — a maioria das ações é
**link de texto**.

**Link CTA de texto (padrão principal de ação):** Founders Grotesk 22px/500, cor do texto da
seção, `padding-bottom: 6px` e um `::after` de **2px roxo `#AC27F4`** como sublinhado. Transição
0.35s. Ex.: "Nossa história e impacto em 2025", "Saiba mais sobre Empreendedores Endeavor".

**Link de lista com bullet:** bolinha amarela (`#FFCF53`, ~13px) antes do texto, Founders Grotesk
22px ink. Usado em "Notícias & Eventos" e nos CTAs do rodapé da home ("Acesse nossos conteúdos de
impacto").

**Eyebrow:** label caixa alta 16px/600 com tracking 0.1em acima do H1/citação.

**Kicker colorido:** frase curta em azul 22px acima do H2/H3 ("O Efeito Multiplicador").

**Carrossel de empresas:** seção ink com pattern ondulado; foto dos fundadores + logo da empresa
em círculo branco + círculo amarelo com nome, fundadores, setor e descrição (Inter 14px). Abaixo,
lista dos nomes das empresas em 50px/700 branco, sublinhados, funcionando como tabs (Delend,
OneSkin, Livance, VTEX, Insider, Ebanx).

**Bloco de estatísticas:** linha de 4–5 números gigantes vazados (Object Sans 112px, contorno 2px)
com legenda 22px/500 embaixo ("+450 Empreendedores Endeavor no Brasil", "+300 mentores",
"50 embaixadores", "+28 bilhões de reais em receita…", "79% de CAGR").

**Seção manifesto (full-width colorida):** fundo `--blue`, padding vertical 140px, texto branco
centralizado ~750px de largura; cada bloco = TÍTULO EM CAIXA ALTA + parágrafo 42px/600 + link CTA.

**Depoimentos:** foto full-bleed da pessoa + grande círculo teal sobreposto com a citação
(27px/600), autor em eyebrow caixa alta, e navegação "← 1/2 →" em azul.

**Rodapé:** fundo `#01000F`, padding `90px 0 80px`, links sociais brancos 22px/500 sublinhados
(Medium, LinkedIn, Twitter, Instagram, YouTube, Facebook), links legais menores, triângulo teal
no canto direito.

**Cookie notice / alert bar:** fundo `#DCFBFA`, texto ink, botões retangulares ink com texto branco.

### 1.7 Layout e espaçamento

- **Container:** `max-width: 1440px` (algumas seções 1330px), `padding: 0 35px`.
- **Colunas de texto estreitas:** parágrafos do hero com ~510px de largura; manifesto ~750px;
  blocos lado a lado com ~455px cada.
- **Ritmo vertical generoso:** seções com 80–140px de padding vertical; muito respiro em branco.
- **Composição assimétrica:** texto à esquerda + imagem circular grande sangrando para a direita
  (hero). Elementos invadem a seção vizinha (círculos cruzando o limite entre seções).
- **Alternância de fundos:** branco → ink (pattern) → branco → azul → foto → branco → ink (rodapé).
- **Mobile:** coluna única, H1 cai para 30px, corpo 18px, a diagonal teal continua no topo,
  gutter lateral ~20px.

### 1.8 Movimento

- Transições curtas e discretas: `0.35s` em links/botões/nav, `0.15s` em tabs de empresas,
  `0.25s` nas estatísticas.
- Carrosséis (Swiper) para empresas e depoimentos.
- Seções ganham classe `seenSection` ao entrar na viewport → espaço para animações de entrada
  sutis (fade/slide). Nada chamativo.

### 1.9 Estrutura da home (ordem das seções)

1. **Barra utilitária** (busca, Endeavor Open, Endeavor Global, Subscribe).
2. **Header** com navegação principal.
3. **Hero** — eyebrow "ENDEAVOR BRASIL — 26 ANOS DE IMPACTO 🇧🇷", H1 "MULTIPLICANDO OS
   EMPREENDEDORES QUE TRANSFORMAM O BRASIL", 3 parágrafos curtos com negritos, link CTA, foto
   circular da comunidade, diagonal teal; ao lado/abaixo, lista "Notícias & Eventos" com bullets
   amarelos.
4. **Empreendedores Endeavor — nossos grandes exemplos** — carrossel de empresas sobre fundo ink.
5. **O Efeito Multiplicador** — kicker azul, H2 "Quando centenas apoiam milhares, nasce o Efeito
   Multiplicador™", números gigantes.
6. **Manifesto azul** — Sonhar mais alto / Escalar rápido / Multiplicar impacto, cada um com link.
7. **Depoimentos** — citações da liderança e da missão.
8. **Duas colunas de CTA** — "Insights da Rede" (conhecimento) e "Nossos patrocinadores e
   parceiros".
9. **Rodapé** — redes sociais, links globais e legais.

### 1.10 Voz e conteúdo

- Português, frases curtas e afirmativas, vocabulário de escala: *empreendedores de alto impacto,
  scale-ups, Efeito Multiplicador™, Rede, ecossistema, mentores, embaixadores*.
- Mistura natural de termos em inglês (Scale Up, Knowledge Center, Day1, Playbook).
- Números como prova social sempre que possível ("+450", "26 anos", "50 países").

---

## Parte 2 — Direção para a nossa landing page

### 2.1 Regras gerais de estrutura (conversão)

Objetivo da página: fazer a pessoa **se inscrever no Day1 Endeavor 2026** (ver `CLAUDE.md`).
Toda a estrutura serve a isso.

**Primeira dobra (o que aparece sem rolar a página)**
1. **Título = proposta de valor.** Diz direto o que a pessoa ganha indo ao Day1, sem rodeio e sem
   texto institucional antes.
2. **Subtítulo = como essa proposta é entregue.** Explica o formato: quem sobe no palco, que tipo de
   história, quando e onde.
3. **Botão de inscrição já visível.** Ação principal, sem precisar rolar.

**Segunda, terceira dobra e demais seções**
- Cada seção existe para **convencer um motivo ou um público específico**. Exemplos: quem são os
  palestrantes (para quem é curioso pelos founders), por que a Endeavor importa (para quem é curioso
  pela Endeavor), o que um universitário ganha indo ao evento, prova social e números, informações
  práticas.
- **Ao fim de cada seção, o botão de inscrição deve estar acessível.** Onde a pessoa for
  convencida, seja qual for o motivo, ela precisa conseguir se inscrever ali mesmo, sem voltar ao
  topo.
- Ordem sugerida: dos argumentos que convencem **a maioria** primeiro para os que convencem
  **públicos específicos** depois.

**Oferta para estudantes (ingresso gratuito)**

Fonte: Google Form oficial "Day1 Endeavor 2026: ingresso gratuito para estudantes", divulgado por
WhatsApp.
- **100 ingressos gratuitos** para estudantes, liberados **por ordem de inscrição** até esgotarem.
- O ingresso é **pessoal e intransferível**. A confirmação chega por e-mail (o form pede para
  conferir também o spam).
- Quem não conseguir vaga presencial pode assistir **online**: https://endeavor.org.br/day1-2026/
- Contexto do evento citado no form: Sala São Paulo, 26/10, 18h (o form dizia 17h; horário corrigido
  pelo usuário em 26/10/2026), **mais de 1000 pessoas na
  plateia**. O Day1 reúne os maiores empreendedores do Brasil para contar como foi o primeiro dia
  da jornada de cada um: "as dúvidas, os erros e as decisões que mudaram tudo".
- Use a escassez de verdade ("só 100 vagas"). **Nunca invente** contador de vagas restantes nem
  prazos.

**Links obrigatórios na página (hierarquia)**

| Prioridade | Link | Uso |
|---|---|---|
| **1 (principal)** | Ingresso gratuito para estudantes (Google Form): https://forms.gle/UK5mzH7c9cRPeHNh6 | Destino dos botões de inscrição. É a oferta certa para o público principal (universitários). |
| **2** | Ingresso pago pela Fever: https://feverup.com/m/712650 | Alternativa visível logo abaixo do CTA principal: "Não é estudante ou as vagas esgotaram? Garanta seu ingresso na Fever". |
| 3 | Transmissão online: https://endeavor.org.br/day1-2026/ | Último recurso para quem não conseguir ir presencialmente. |
| 4 (apoio) | Site oficial da Endeavor: https://brasil.endeavor.org | Para quem quer saber mais sobre a Endeavor. Nunca no lugar dos CTAs de inscrição. |

**Regras do botão de inscrição**
- O CTA principal tem o mesmo texto e o mesmo destino (form de estudantes) em toda a página, para
  ficar claro que é uma única ação. A alternativa da Fever aparece como link secundário ao lado
  ou abaixo dele.
- Visual de maior destaque da página (botão teal retangular da identidade, ver 1.6). Links
  secundários usam o estilo de link sublinhado e nunca competem com ele.
- No mobile, considere um botão fixo no rodapé da tela depois que o botão do hero sair da vista.

### 2.2 Tipografia: apenas 3 tamanhos de fonte

A página usa **somente 3 tamanhos de fonte**, para não ficar bagunçada. Essa regra vale mais que a
escala do site da Endeavor (Parte 1, 1.4), que tem muitos tamanhos.

| Token | Desktop | Mobile | Uso |
|---|---|---|---|
| `--fs-lg` | 50px | 32px | Títulos de seção, título do hero, números de destaque. |
| `--fs-md` | 22px | 20px | Subtítulos, citações, botões, links CTA, nomes dos palestrantes. |
| `--fs-sm` | 16px | 16px | Texto corrido, legendas, eyebrows, informações práticas, rodapé. |

- Hierarquia extra vem de **peso** (400/500/700), **caixa alta**, **cor** e **espaçamento**,
  nunca de um quarto tamanho.
- As imagens com texto embutido (como os cards dos palestrantes) não contam como tamanho de fonte.

**Exceção: números de destaque** (autorizada pelo usuário em 26/10/2026)

| Token | Desktop | Mobile | Uso |
|---|---|---|---|
| `--fs-num` | 112px | 72px | Só números gigantes isolados, vazados (Object Sans/Unbounded), como o "100" dos ingressos. |

- Vale **apenas para números** em destaque, no estilo do bloco de estatísticas do site da
  Endeavor (1.6). Nunca para texto.
- O contador regressivo continua em `--fs-lg`, porque precisa caber no círculo do hero.

### 2.3 Tokens iniciais

*(A preencher conforme o projeto avançar. Ponto de partida sugerido:)*

```css
:root {
  --ink: #01000F;
  --white: #FFFFFF;
  --teal: #09E1CD;
  --blue: #273AE9;
  --yellow: #FFCF53;
  --purple: #AC27F4;
  --teal-pale: #DCFBFA;

  --font-display: "Founders Grotesk", "Hanken Grotesk", "Inter", sans-serif;
  --font-body: "Inter", sans-serif;
  --font-numbers: "Object Sans", "Unbounded", sans-serif;

  /* Apenas 3 tamanhos (ver 2.2); no mobile: lg 32px, md 20px */
  --fs-lg: 50px;
  --fs-md: 22px;
  --fs-sm: 16px;
  --fs-num: 112px; /* exceção só para números (ver 2.2); no mobile: 72px */

  --container: 1440px;
  --gutter: 35px;
  --ease: 0.35s;
}
```

Checklist rápido para "parecer Endeavor":
- [ ] Fundo branco com texto `#01000F`; uma cor de destaque chapada por seção.
- [ ] Títulos grandes, pesados, entrelinha fechada; eyebrows em caixa alta com tracking.
- [ ] Ações como links sublinhados em roxo; botão teal retangular só quando necessário.
- [ ] Ao menos um grafismo da marca: diagonal teal, círculo recortado ou pattern ondulado.
- [ ] Fotos reais de pessoas, recortadas em círculo.
- [ ] Sem sombras, sem cantos arredondados em cards, sem gradientes.
- [ ] Números de impacto em destaque (vazados, grandes).
