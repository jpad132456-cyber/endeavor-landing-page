# Guia de checagem da landing page · Day1 Endeavor 2026

Este guia explica como avaliar a qualidade da landing page de forma **repetível e objetiva**.
Toda avaliação é uma pergunta de **SIM ou NÃO** respondida por script. Ninguém precisa "achar"
nada: o script mede, compara com uma regra escrita e responde.

O que o guia cobre:

1. [Como rodar](#1-como-rodar)
2. [Como ler o resultado](#2-como-ler-o-resultado)
3. [Tamanhos de tela e navegadores testados](#3-tamanhos-de-tela-e-navegadores-testados)
4. [Prints de todas as seções](#4-prints-de-todas-as-seções)
5. [Teste de todos os botões e links](#5-teste-de-todos-os-botões-e-links)
6. [Lista completa de checagens](#6-lista-completa-de-checagens)
7. [O que os scripts não julgam](#7-o-que-os-scripts-não-julgam)
8. [Teste dos testes](#8-teste-dos-testes)
9. [Histórico de ajustes nas checagens](#9-histórico-de-ajustes-nas-checagens)
10. [Arquivos](#10-arquivos)

---

## 1. Como rodar

Na primeira vez (instala o Playwright e os navegadores Chromium, WebKit/Safari e Firefox):

```bash
cd qa && npm run setup
```

Checagem completa da página local (16 tamanhos de tela × 3 navegadores, ~10 min):

```bash
cd qa && npm run check
```

Outras formas:

| Comando | O que faz |
|---|---|
| `npm run check:rapido` | Só Chromium e 5 tamanhos (~3 min). Bom para conferir uma mudança. |
| `npm run check:producao` | Roda contra o site publicado (https://endeavor-landing-page.vercel.app). |
| `node checagem.mjs --url <endereço>` | Roda contra qualquer endereço (ex.: preview do Vercel). |
| `node checagem.mjs --sem-prints` | Pula os prints (mais rápido). |
| `node checagem.mjs --sem-links-externos` | Não consulta os sites de destino (C06), para rodar sem internet. |

O comando termina com código de saída **1** se alguma checagem **Crítica** der NÃO, então dá para
usá-lo como trava antes de publicar.

---

## 2. Como ler o resultado

Ao final, o terminal mostra uma linha por checagem, e o relatório completo fica em
`qa/relatorio/index.html` (abra no navegador).

- Cada checagem roda em vários **contextos** (tamanho de tela × navegador). Ela só é **SIM** se
  passou em **todos**. Se falhar em um, é **NÃO**, e o relatório mostra onde e o que foi medido.
- **Prioridade:**
  - **Crítico**: impede a inscrição, quebra a página ou fere uma regra obrigatória do projeto.
    Não publique com NÃO aqui.
  - **Importante**: prejudica a experiência, a acessibilidade ou a marca. Corrija antes de divulgar.
  - **Recomendação**: melhoria com efeito real, mas não bloqueia.
- O relatório tem 4 abas: **Checagens** (com filtro "Só NÃO"), **Inventário de cliques**,
  **Prints por tela** e **Comparar seção** (a mesma seção em todos os tamanhos lado a lado).
- Também são gerados `relatorio/resultado.json` e `relatorio/resultado.csv` (abre no Excel/Sheets).

---

## 3. Tamanhos de tela e navegadores testados

A altura usada é a **área visível de verdade** (tela menos as barras do navegador), porque é ela
que define o que aparece "sem rolar".

| Tamanho (largura × altura visível) | Aparelho | Por que está aqui |
|---|---|---|
| 320 × 568 | iPhone SE 1ª geração | **Caso-limite:** menor largura em uso e largura mínima exigida pela WCAG (1.4.10). Ver nota abaixo. |
| 360 × 800 | Android mais comum (Galaxy A/S) | Resolução de celular mais usada no Brasil. |
| 375 × 667 | iPhone SE 2/3, iPhone 8 | iPhone de tela baixa, ainda muito usado. |
| 390 × 844 | iPhone 12/13/14 | iPhone mais comum. |
| 390 × 664 | iPhone 14 com as barras do Safari | O que de fato aparece sem rolar no Safari. |
| 393 × 852 | iPhone 15/16, Pixel | iPhones e Androids recentes. |
| 430 × 932 | iPhone Pro Max / Plus | Celular grande. |
| 768 × 1024 | iPad (retrato) | Tablet mais comum. |
| 820 × 1180 | iPad Air (retrato) | Tablet recente. |
| 1024 × 768 | iPad (paisagem) | Tablet deitado: já usa o layout de desktop. |
| 1280 × 720 | Notebook HD | Notebook de entrada. |
| 1366 × 657 | Notebook 1366×768 com navegador | Tela de notebook mais comum. |
| 1440 × 900 | MacBook Air 13" | Mac mais comum. |
| 1536 × 730 | Notebook Full HD com zoom 125% (Windows), com navegador | Configuração padrão de muitos notebooks Windows. |
| 1920 × 953 | Monitor Full HD com navegador | Monitor mais comum. |
| 2560 × 1305 | Monitor QHD/2K com navegador | Tela grande: confere se o layout não "estica". |

**Navegadores:**

| Navegador | Representa | Onde roda |
|---|---|---|
| Chromium | Chrome, Edge, Samsung Internet, Opera | Todos os 16 tamanhos. Também roda testes de velocidade, teclado, relógio simulado, "reduzir movimento" e sem JavaScript. |
| WebKit | Safari (todo navegador do iPhone usa WebKit) | 375×667, 390×844, 390×664, 430×932, 820×1180, 1440×900. |
| Firefox | Firefox | 1366×657 e 1920×953. |

Celulares e tablets são simulados como aparelhos de toque (sem hover) e com a densidade de pixels de
tela retina (2×).

**Nota sobre 320 × 568 (caso-limite).** Decidido em 26/10/2026: essa tela roda todas as checagens,
menos 5 que não têm como passar nela sem quebrar a regra de só 3 tamanhos de fonte (DESIGN.md 2.2):

| Checagem pulada | Por quê |
|---|---|
| D02, D03, D04 (subtítulo, botão e Fever na primeira dobra) | Com título em 32px e texto em 20px, título + subtítulo sozinhos ocupam mais de 568px. |
| L03 (botão em uma linha) | "Quero meu ingresso gratuito →" em 20px precisa de 259px; a tela deixa 252px úteis. |
| C13 (barra fixa escondida no topo) | Como o botão do topo começa fora da tela, a barra fixa aparece logo de início, o que é o comportamento certo. |

Todas as outras checagens (texto cortado, sobreposição, rolagem lateral, título na dobra, cliques
etc.) continuam valendo em 320px. As 5 isentas **rodam mesmo assim**: o resultado real delas
aparece no terminal e numa caixa à parte no relatório, fora do placar. A lista fica em `PULAR_NO_LIMITE`, no início de `checagem.mjs`.

---

## 4. Prints de todas as seções

Em cada tamanho e navegador, o script salva em `relatorio/prints/<navegador>/<tamanho>/`:

| Arquivo | O que mostra |
|---|---|
| `01-dobra.jpg` | Exatamente o que aparece ao abrir a página, sem rolar. |
| `02-hero.jpg` | O hero inteiro, incluindo o círculo que passa da dobra. |
| `03-faixa.jpg` | A faixa rolante com os nomes. |
| `04-palestrantes.jpg` | Quem sobe no palco + faixa de CTA. |
| `05-como-funciona.jpg` | Seção azul do ingresso gratuito. |
| `06-informacoes.jpg` | Quando, onde, quem estará lá e foto do local. |
| `07-sobre.jpg` | Seção azul "Sobre a Endeavor": missão, números e CTA. |
| `08-patrocinio.jpg` | Logos de patrocínio e apoio. |
| `09-cta-final.jpg` | CTA final. |
| `10-rodape.jpg` | Rodapé. |
| `11-barra-fixa.jpg` | A tela no meio da rolagem, com a barra fixa (celular) ou o header fixo (desktop). |
| `12-pagina-inteira.jpg` | A página inteira numa imagem só (bom para ver ritmo e espaçamento). |

Prints de **estados especiais** ficam em `relatorio/prints/estados/`: o contador nos 4 momentos
(2 dias antes, manhã do evento, durante, depois) e a primeira dobra sem JavaScript.

Nos prints de seção, as barras fixas ficam escondidas para não cobrir o conteúdo. Elas aparecem
no print `11-barra-fixa`. Animações infinitas (faixa rolante, selo girando) são congeladas no
início, para os prints saírem iguais de uma rodada para outra.

**Como revisar a estética:** no relatório, aba **Comparar seção**, escolha uma seção e veja todos os
tamanhos lado a lado. É o jeito mais rápido de achar uma tela onde algo quebrou.

---

## 5. Teste de todos os botões e links

O script **encontra sozinho** todo elemento clicável da página (links, botões, campos) e clica de
verdade em cada um, nos tamanhos 390×844 e 1440×900 (Chromium e Safari) e 1366×657 (Firefox).
Para cada elemento ele responde SIM/NÃO para:

| Pergunta | Como |
|---|---|
| Está visível neste tamanho? | Elementos escondidos de propósito (ex.: menu no celular) são marcados e não clicados. |
| Tem nome para leitor de tela? | Texto, aria-label ou alt de imagem interna. |
| Tem ≥ 24px e ≥ 44px? | Tamanho do retângulo clicável. |
| O clique funciona? | **Link externo:** precisa abrir nova aba com o endereço exato. **Âncora do menu:** precisa rolar até a seção sem esconder o título atrás do header fixo. **"Adicionar à agenda":** precisa baixar um .ics com data e hora certas. **Barras fixas:** a página é rolada até a barra aparecer antes do clique. |

Durante o teste de clique, os sites de destino são **simulados** (a aba abre, mas o Google Form, a
Fever etc. não são carregados nem preenchidos). Se os sites reais estão no ar é verificado
separadamente, uma vez por endereço (checagem C06).

Além disso: hover em cada tipo de botão/link (C09), navegação só com a tecla Tab (A06–A08) e o
link do WhatsApp (C08). O resultado elemento a elemento fica na aba **Inventário de cliques**.

---

## 6. Lista completa de checagens

Cada linha é uma pergunta de SIM/NÃO. "Como o script decide" diz exatamente o que é medido.

### 1. Carregamento e técnica

| ID | Pergunta (SIM/NÃO) | Prioridade | Como o script decide | Fonte da regra |
|---|---|---|---|---|
| T01 | A página abre sem erro (HTTP 200)? | Crítico | Status da resposta do endereço testado. | Básico |
| T02 | Nenhum erro de JavaScript no console? | Crítico | Escuta erros da página e mensagens console.error durante carregamento, rolagem e cliques. | Básico |
| T03 | Nenhum arquivo deixou de carregar (sem 404/500/erro de rede)? | Importante | Lista toda requisição com status ≥ 400 ou falha de rede. | Básico |
| T04 | Todas as imagens carregaram (nenhuma quebrada)? | Crítico | Depois de rolar a página inteira, toda <img> visível tem naturalWidth > 0. | Básico |
| T05 | As fontes da página (Hanken Grotesk, Inter e Unbounded) carregaram? | Importante | document.fonts: cada família tem ao menos um arquivo com status "loaded". | DESIGN.md 1.4 |
| T06 | Nenhum elemento passa da largura da tela (sem rolagem lateral)? | Crítico | Mede a borda direita/esquerda de todo elemento visível, descontando só recortes intencionais (overflow) de ancestrais que não sejam o body. Tolerância 1px. O overflow-x do body não conta, porque no iPhone ele não impede a rolagem lateral. | WCAG 1.4.10 |

### 2. Primeira dobra (sem rolar)

| ID | Pergunta (SIM/NÃO) | Prioridade | Como o script decide | Fonte da regra |
|---|---|---|---|---|
| D01 | O título (H1) aparece inteiro sem rolar? | Crítico | Retângulo do H1 inteiro dentro da janela, com a página no topo. | DESIGN.md 2.1 |
| D02 | O subtítulo aparece inteiro sem rolar? | Importante | Retângulo do .lead inteiro dentro da janela. | DESIGN.md 2.1 |
| D03 | O botão "Quero meu ingresso gratuito" do hero aparece inteiro sem rolar? | Crítico | Retângulo de #hero-cta inteiro dentro da janela e não coberto por outro elemento (elementFromPoint no centro). | DESIGN.md 2.1 |
| D04 | O link da Fever (alternativa) aparece sem rolar? | Recomendação | Retângulo do link da Fever do hero inteiro dentro da janela. | DESIGN.md 2.1 |
| D05 | O logo da Endeavor fica inteiro dentro do triângulo teal? | Importante | Os 4 cantos do logo ficam dentro do triângulo (x/L + y/A ≤ 1). | DESIGN.md 1.5 |
| D06 | O contador fica inteiro dentro do círculo e dentro da tela? | Importante | Os 4 cantos dos dígitos (ou do aviso "Acontecendo agora") ficam dentro do círculo do hero e da largura da tela. | DESIGN.md 2.2 |
| D07 | O selo amarelo "100 vagas" não cobre o contador? | Importante | Distância entre o centro do selo e o retângulo do contador maior que o raio do selo. | Comentários do CSS |

### 3. Layout e formatação

| ID | Pergunta (SIM/NÃO) | Prioridade | Como o script decide | Fonte da regra |
|---|---|---|---|---|
| L01 | Nenhum texto aparece cortado? | Crítico | Cada linha de texto (Range.getClientRects) fica dentro da área visível dos ancestrais com overflow e dentro da largura da tela. A faixa rolante decorativa é ignorada. | Básico |
| L02 | Nenhum texto ou imagem fica sobreposto a outro? | Crítico | Compara a área de tinta de cada linha de texto (do topo da letra mais alta ao pé da mais baixa), imagens e selos (círculos tratados como círculos). Sobreposição > 2px nos dois eixos = NÃO. | Básico |
| L03 | Os botões cabem em uma linha (o texto não quebra)? | Importante | Conta as linhas de texto de cada .btn, .share e .utility-cta visível. | Comentários do CSS |
| L04 | A página usa só os tamanhos de fonte permitidos? | Importante | Todo texto visível usa 50/22/16/112px (desktop) ou 32/20/16/72px (≤ 860px). | DESIGN.md 2.2 |
| L05 | Nenhum texto menor que 16px? | Importante | Tamanho de fonte calculado de todo texto visível ≥ 16px. | Legibilidade no celular |
| L06 | Nenhuma imagem distorcida (proporção original mantida)? | Crítico | Proporção exibida = proporção do arquivo (±2%), exceto com object-fit cover/contain. | Básico |
| L07 | Nenhuma imagem ampliada além do tamanho do arquivo (sem pixelizar)? | Importante | Escala de exibição (considerando object-fit) ≤ 1× o arquivo. SVG é ignorado. | Básico |
| L08 | Imagens nítidas em tela retina (arquivo com 2× o tamanho exibido)? | Recomendação | Escala de exibição ≤ 0,5× o arquivo. SVG é ignorado. | Boas práticas (telas 2×/3×) |
| L09 | Os cards de palestrantes estão alinhados em grade e com o mesmo tamanho? | Importante | Todas as fotos com mesma largura/altura (±1px), linhas com o mesmo número de colunas e colunas alinhadas. | Básico |
| L10 | Os parágrafos têm no máximo ~90 caracteres por linha? | Recomendação | Caracteres ÷ linhas reais de cada parágrafo com 2+ linhas. | Tipografia (45–90 caracteres) |
| L11 | No fim da página, a barra fixa não cobre o rodapé? | Importante | Rola até o fim e confere se o retângulo da barra fixa visível cruza algum elemento do rodapé. | Básico |
| L12 | Ao clicar no menu, o título da seção não fica escondido atrás do header fixo? | Importante | Depois do clique em cada âncora, o topo do cabeçalho da seção fica abaixo do header fixo e na metade de cima da tela. | Básico |
| L13 | Todo texto respeita a margem lateral mínima de 16px? | Importante | Cada linha de texto começa a ≥ 16px da borda esquerda e termina a ≥ 16px da direita. | DESIGN.md 1.7 |
| L14 | Todo bloco com animação de entrada aparece ao rolar (nada fica invisível)? | Crítico | Rola a página de meia em meia tela e confere se todo .reveal exibido (sem display:none) ganhou a classe is-seen. | Básico |

### 4. Botões e links (cliques)

| ID | Pergunta (SIM/NÃO) | Prioridade | Como o script decide | Fonte da regra |
|---|---|---|---|---|
| C01 | Todo link tem destino (nada com href vazio ou "#")? | Crítico | Depois do JavaScript rodar, nenhum <a> com href vazio, "#" ou javascript:. | Básico |
| C02 | Todos os botões de inscrição têm o mesmo texto e levam ao formulário de estudantes? | Crítico | Todo link com o texto "Quero meu ingresso gratuito" aponta para o Google Form, e todo link para o form tem esse texto. | DESIGN.md 2.1 |
| C03 | Todo botão de inscrição no conteúdo tem o link da Fever ao lado ou abaixo? | Importante | O bloco de cada botão do form (exceto barra preta do topo e header fixo) contém o link da Fever. | DESIGN.md 2.1 |
| C04 | Links que abrem outra aba têm rel=noopener? | Importante | Todo target=_blank tem noopener ou noreferrer. | Segurança |
| C05 | Cada link/botão funciona ao ser clicado? | Crítico | Clica de verdade em cada elemento clicável visível: links externos precisam abrir nova aba com o endereço certo, âncoras precisam rolar até a seção, "Adicionar à agenda" precisa baixar o arquivo. Destinos externos são simulados (o clique não carrega o site real). | Básico |
| C06 | Os sites de destino respondem (sem erro 404/500)? | Crítico | Requisição GET (seguindo redirecionamentos) para cada endereço externo único da página. Se bloquear robôs, tenta de novo com um navegador real. | Básico |
| C07 | "Adicionar à agenda" baixa um .ics válido com 26/10 às 18h (Brasília)? | Importante | Arquivo baixado tem BEGIN/END:VCALENDAR, DTSTART:20261026T210000Z (18h BRT), título e local. | Básico |
| C08 | "Chamar um colega" abre o WhatsApp com mensagem e link da página? | Importante | href começa com https://wa.me/?text= e a mensagem cita Day1, 18h, Sala São Paulo e o endereço da página. | Básico |
| C09 | Botões e links mudam de aparência ao passar o mouse? | Recomendação | Compara cor, fundo, borda, sublinhado e transformações antes e depois do hover (só desktop). | DESIGN.md 1.6 |
| C10 | Todo alvo de clique tem pelo menos 24×24 px? | Importante | Retângulo de cada link/botão visível. | WCAG 2.2 (2.5.8, AA) |
| C11 | Todo alvo de toque tem pelo menos 44×44 px? | Recomendação | Retângulo de cada link/botão visível (só celular e tablet). | Apple HIG / Material (44–48px) |
| C12 | Nada parece clicável (cursor de mãozinha) sem ser clicável? | Importante | Elementos com cursor:pointer fora de links/botões. | Básico |
| C13 | No celular, a barra fixa de inscrição aparece quando o botão do topo sai da tela e some no CTA final? | Importante | Confere a barra no topo (escondida), no meio da página (visível) e com o CTA final na tela (escondida). | DESIGN.md 2.1 |
| C14 | No desktop, o header fixo aparece quando o botão do topo sai da tela e some no CTA final? | Importante | Mesmo teste da C13, para o header fixo do desktop. | Comentários do CSS |
| C15 | Ao chegar ao fim de cada seção, há um botão de inscrição visível na tela? | Crítico | Rola até o fim de cada seção e procura um link para o form inteiro na tela e não coberto (vale o botão da seção ou a barra fixa). | DESIGN.md 2.1 |

### 5. Conteúdo e regras do evento

| ID | Pergunta (SIM/NÃO) | Prioridade | Como o script decide | Fonte da regra |
|---|---|---|---|---|
| R01 | Data, hora e local corretos aparecem? | Crítico | O texto da página contém 26.10 (ou 26/10), 18h, Sala São Paulo e Praça Júlio Prestes, 16. | CLAUDE.md / DESIGN.md 2.1 |
| R02 | A oferta "100 ingressos gratuitos para estudantes" aparece? | Crítico | Texto exato presente. | DESIGN.md 2.1 |
| R03 | As regras do ingresso aparecem (ordem de inscrição, pessoal e intransferível, e-mail, spam)? | Importante | Os 4 termos estão no texto. | DESIGN.md 2.1 |
| R04 | Todos os 6 palestrantes de 2026 aparecem, com foto e nome? | Crítico | As 6 fotos da pasta 1-palestrantes-hoje-2026 (em qualquer formato) estão na seção, cada uma com alt preenchido. | assets/images/README.md |
| R05 | Nenhuma pessoa de edições anteriores aparece como palestrante de 2026? | Crítico | Nenhuma imagem da pasta 2-palestrantes-edicoes-anteriores (nem hero-decor) na seção de palestrantes, e fora dela só com alt vazio (sem nome). | assets/images/README.md |
| R06 | Patrocinadores e apoiadores estão na lista certa? | Importante | Logos sob "Patrocínio" vêm só de 3-patrocinadores; sob "Apoio", só de 4-parceiros-e-apoiadores. | assets/images/README.md |
| R07 | Nenhum contador de vagas restantes ou prazo inventado? | Crítico | O texto não contém "restam", "restantes", "últimas N vagas", "N vagas disponíveis", "prazo" etc. | DESIGN.md 2.1 |
| R08 | Os 4 links obrigatórios estão na página? | Crítico | Há links para o form de estudantes, a Fever, a transmissão online e o site da Endeavor. | CLAUDE.md / DESIGN.md 2.1 |
| R09 | Só o formulário de estudantes usa o botão de destaque? | Importante | Todo .btn e todo link com fundo teal apontam para o form; Fever, transmissão e site da Endeavor nunca usam .btn. | DESIGN.md 2.1 |
| R10 | O contador mostra o estado certo em cada horário? | Importante | Relógio simulado: 2 dias antes (48:00:00), 26/10 10h (08:00:00), 26/10 19h ("Acontecendo agora" + link online) e 27/10 ("aconteceu" + link). | Script da página |
| R11 | Os textos com "Hoje" estão corretos para a data atual? | Crítico | Se a página diz "hoje", a data atual em Brasília precisa ser 26/10/2026. | Conteúdo |
| R12 | Nenhum texto de rascunho ou erro de dado aparece? | Importante | O texto visível não contém lorem, undefined, NaN, null, [object, {{; e o texto original (sem caixa alta do CSS) não contém TODO ou FIXME. | Básico |

### 6. Acessibilidade

| ID | Pergunta (SIM/NÃO) | Prioridade | Como o script decide | Fonte da regra |
|---|---|---|---|---|
| A01 | axe-core: nenhuma falha de acessibilidade crítica ou séria? | Crítico | Biblioteca axe-core (regras WCAG 2.0/2.1/2.2 A e AA + boas práticas), impacto critical ou serious. | WCAG 2.2 AA |
| A02 | axe-core: nenhuma falha de acessibilidade de qualquer nível? | Recomendação | Mesma análise, qualquer impacto. | WCAG 2.2 AA |
| A03 | Todo texto tem contraste suficiente com o fundo? | Importante | Cor do texto (com opacidade) sobre a cor de fundo efetiva: ≥ 4,5:1, ou ≥ 3:1 em texto grande (≥ 24px, ou ≥ 18,66px em negrito). | WCAG 1.4.3 |
| A04 | Toda imagem tem texto alternativo (ou está marcada como decorativa)? | Importante | Nenhuma <img> sem atributo alt. | WCAG 1.1.1 |
| A05 | Há um único H1 e os títulos seguem a ordem? | Importante | Exatamente 1 H1 e nenhum salto de nível (ex.: H2 → H4). | WCAG 1.3.1 |
| A06 | Todo elemento focado pelo teclado mostra contorno visível e não fica coberto? | Importante | Aperta Tab por toda a página: cada elemento focado tem outline e não fica atrás de barra fixa. | WCAG 2.4.7 / 2.4.11 |
| A07 | O botão de inscrição é alcançado com até 3 Tabs? | Importante | Posição do primeiro link para o form na ordem do Tab. | Usabilidade |
| A08 | Elementos escondidos não recebem foco do teclado? | Importante | Nenhum foco cai em barra fixa escondida ou fora da tela, e nada focável dentro de aria-hidden=true. | WCAG 2.4.3 / 4.1.2 |
| A09 | Com "reduzir movimento" ligado, as animações param e todo o conteúdo aparece? | Importante | Navegador com prefers-reduced-motion: nenhuma animação rodando e nenhum .reveal invisível. | WCAG 2.3.3 |
| A10 | Sem JavaScript, todo o conteúdo e os botões funcionam? | Recomendação | JavaScript desligado: nenhum .reveal invisível, H1 visível, botões do form presentes e nenhum link visível apontando para "#". | Melhoria progressiva |
| A11 | O idioma da página está definido como pt-BR? | Importante | <html lang="pt-BR">. | WCAG 3.1.1 |
| A12 | A página tem as regiões header, nav, main e footer? | Recomendação | Os 4 elementos existem. | WCAG 1.3.1 |
| A13 | Não há IDs repetidos? | Importante | Todo id é único. | HTML válido |

### 7. Velocidade e peso

| ID | Pergunta (SIM/NÃO) | Prioridade | Como o script decide | Fonte da regra |
|---|---|---|---|---|
| P01 | Peso total da página (depois de rolar tudo) ≤ 3 MB? | Importante | Soma dos bytes transferidos (corpo + cabeçalhos) de todas as requisições. | Boas práticas para 4G |
| P02 | Peso do carregamento inicial (antes de rolar) ≤ 1,5 MB? | Importante | Mesma soma, só até o load + fontes, sem rolar. | Boas práticas para 4G |
| P03 | Nenhuma imagem com arquivo maior que 300 KB? | Importante | Bytes de cada resposta de imagem. | Boas práticas |
| P04 | LCP ≤ 2,5 s no celular com 4G simulado? | Crítico | Largest Contentful Paint medido no Chromium com rede 4G lenta (1,6 Mbps, 150 ms) e CPU 4× mais lenta (perfil do Lighthouse). No desktop: 10 Mbps, 40 ms. | Google Core Web Vitals |
| P05 | CLS ≤ 0,1 (a página não "pula" ao carregar e rolar)? | Importante | Soma das layout-shift sem input recente, do carregamento até o fim da rolagem. | Google Core Web Vitals |
| P06 | FCP ≤ 1,8 s no celular com 4G simulado? | Recomendação | First Contentful Paint no mesmo cenário da P04. | Google (web.dev) |
| P07 | Imagens fora da dobra usam carregamento preguiçoso, e as da dobra não? | Importante | Nenhuma imagem da primeira tela com loading=lazy; toda imagem que começa mais de uma tela abaixo da dobra (só aparece depois de rolar mais de uma tela) com loading=lazy, exceto arquivo já usado acima. | Boas práticas |
| P08 | Toda imagem declara largura e altura no HTML? | Recomendação | Atributos width e height em toda <img>. | Boas práticas (evita CLS) |
| P09 | No máximo 60 requisições? | Recomendação | Número de requisições depois de rolar tudo. | Boas práticas |
| P10 | As fontes usam font-display: swap? | Recomendação | O link do Google Fonts contém display=swap. | Boas práticas |

### 8. SEO e compartilhamento

| ID | Pergunta (SIM/NÃO) | Prioridade | Como o script decide | Fonte da regra |
|---|---|---|---|---|
| S01 | O título da aba tem de 30 a 65 caracteres? | Importante | Comprimento de document.title. | Google (resultados de busca) |
| S02 | A meta description tem de 70 a 160 caracteres? | Importante | Comprimento do conteúdo. | Google (resultados de busca) |
| S03 | As tags Open Graph estão completas? | Importante | og:title, og:description, og:image (endereço absoluto), og:url e og:type preenchidas. | Open Graph (WhatsApp, LinkedIn) |
| S04 | A imagem de compartilhamento existe e tem 1200×630? | Importante | Carrega o arquivo de og:image e mede. | Open Graph |
| S05 | og:url aponta para o endereço publicado? | Recomendação | og:url = https://endeavor-landing-page.vercel.app/. | Open Graph |
| S06 | O cartão do X/Twitter está configurado? | Recomendação | twitter:card = summary_large_image. | X/Twitter |
| S07 | Favicon e ícone de iPhone existem? | Importante | Os arquivos de rel=icon e rel=apple-touch-icon respondem 200. | Básico |
| S08 | Há link canônico? | Recomendação | <link rel="canonical"> presente. | Google |
| S09 | A meta viewport está certa e não bloqueia o zoom? | Importante | Contém width=device-width e não tem user-scalable=no nem maximum-scale=1. | WCAG 1.4.4 |
| S10 | Há dados estruturados de evento (schema.org Event)? | Recomendação | JSON-LD com @type Event. | Google (resultado rico de evento) |
| S11 | A página não está bloqueada para buscadores? | Crítico | Sem meta robots noindex e sem cabeçalho X-Robots-Tag noindex. | Google |

### 9. Identidade visual Endeavor

| ID | Pergunta (SIM/NÃO) | Prioridade | Como o script decide | Fonte da regra |
|---|---|---|---|---|
| V01 | Só cores da paleta Endeavor em textos, fundos e bordas? | Importante | Cor do texto, do fundo e das bordas de todo elemento visível (e ::before/::after) pertence à paleta do DESIGN.md (transparência permitida). | DESIGN.md 1.3 |
| V02 | Sem sombras? | Importante | box-shadow e text-shadow = none em tudo. | DESIGN.md 1.5 |
| V03 | Sem cantos arredondados fora de círculos? | Importante | border-radius só 0 ou círculo (50% / raio ≥ metade do lado) em elementos com fundo, borda ou imagem. | DESIGN.md 1.5 |
| V04 | Sem gradientes de cor? | Importante | Nenhum background-image com gradiente de 2+ cores diferentes. | DESIGN.md 1.3 |
| V05 | Os títulos (H1/H2) usam a fonte de display com peso forte? | Importante | Primeira fonte da pilha é Founders/Hanken Grotesk e peso ≥ 700. | DESIGN.md 1.4 |
| V06 | O grafismo da marca (diagonal teal) aparece na primeira dobra? | Recomendação | Pseudo-elemento ::before do hero visível, teal e com ≥ 100px. | DESIGN.md 1.5 |

---

## 7. O que os scripts não julgam

Os scripts verificam regras objetivas. Ficam de fora, de propósito, e devem ser vistos nos prints:

- **Gosto e hierarquia visual**: se a página está bonita, equilibrada e "parecendo Endeavor" além
  das regras medíveis (cores, cantos, sombras, fontes, grafismos).
- **Qualidade do texto**: tom, clareza e poder de convencimento.
- **Conteúdo dos sites de destino**: o script confere que o Google Form e a Fever respondem, não que
  as vagas ainda estão abertas.
- **Velocidade real em produção**: as medidas de LCP/FCP usam rede e CPU simuladas sobre um servidor
  local. Para números de produção, rode `npm run check:producao` ou use o PageSpeed Insights.

Ajustes de limite (ex.: 3 MB de peso) ficam em `checagem.mjs`, e o texto de cada checagem em
`lib/catalogo.mjs`. Mudar um limite muda o que a checagem exige: registre o motivo.

---

## 8. Teste dos testes

Uma checagem que sempre responde SIM não serve para nada. Para provar que elas pegam defeitos
de verdade:

```bash
cd qa && npm run testar-checagens
```

O script cria cópias da página com **um defeito plantado** cada (o `index.html` não é tocado),
roda a checagem e exige que ela dê **NÃO**. A página original roda com a mesma configuração
(controle) e precisa dar **SIM**. Defeitos plantados hoje: texto "TODO" esquecido, texto por cima do
título, entrelinha apertada demais, bloco animado que nunca aparece, imagem da dobra com lazy,
imagens longe da dobra sem lazy, palestrante faltando, foco do teclado invisível, foco em barra
escondida, imagem pesada, barras fixas desligadas, barra fixa atrasada, links com área de toque
pequena, contraste baixo, botão quebrando em 360px, botão fora da dobra e texto pulando quando
a fonte carrega. O resumo fica em `qa/relatorio-mutantes/resumo.md`.

Rode de novo sempre que mudar uma checagem.

---

## 9. Histórico de ajustes nas checagens

Ajustes feitos em 26/10/2026, depois da primeira rodada, porque a checagem marcava NÃO sem a página
ter o problema que a regra descreve. Nenhum deles afrouxa a regra, e as checagens ajustadas estão
cobertas pelo teste dos testes (seção 8).

| Checagem | Antes | Depois | Por quê |
|---|---|---|---|
| R12 | Procurava "todo" sem diferenciar maiúsculas | Procura TODO/FIXME no texto original | "Todo gigante teve um Day 1" virava "TODO" por causa da caixa alta do CSS. |
| L02 | Comparava a área reservada pela fonte | Compara a área de tinta das letras | Com entrelinha 1,04, a área reservada de linhas vizinhas se cruza sem as letras se tocarem. A versão nova pega letras encostando de verdade (caso "entrelinha apertada demais"). |
| L14 | Contava blocos com display:none | Conta só blocos exibidos | A foto da seção azul é escondida de propósito no celular e nunca entra na tela. |
| P07 | "Fora da dobra" = abaixo da 1ª tela | = mais de uma tela abaixo da 1ª | O logo do hero está na dobra no desktop e logo abaixo dela no celular. A regra antiga exigia lazy e não-lazy na mesma imagem. |
| R04 | Nome exato do arquivo .png | Mesmo nome, qualquer formato, na pasta de 2026 | As fotos passaram a ser servidas em WebP. |
| A06/A08 | Media o foco 80 ms depois do Tab | Espera a rolagem suave terminar | O elemento ainda estava rolando para a tela. |
| P01/P09 | Somava tudo, inclusive o recarregamento do teste de teclado | Soma um carregamento | A página era contada duas vezes em 1440×900. |
| D02, D03, D04, C13, L03 em 320×568 | Contavam no placar | Isentas, com resultado real exibido à parte | Decisão do usuário. Impossível com os 3 tamanhos de fonte do DESIGN.md (seção 3). |

---

## 10. Arquivos

| Arquivo | Para quê |
|---|---|
| `qa/GUIA-DE-CHECAGEM.md` | Este guia. |
| `qa/checagem.mjs` | Script principal: roda tudo e gera o relatório. |
| `qa/lib/catalogo.mjs` | Lista de checagens (pergunta, prioridade, como decide, fonte). `node lib/catalogo.mjs` imprime a tabela da seção 6. |
| `qa/lib/no-navegador.js` | Medições feitas dentro da página (posições, cores, fontes, sobreposições). |
| `qa/lib/relatorio.mjs` | Gera o relatório HTML. |
| `qa/testar-checagens.mjs` | Teste dos testes: planta defeitos e confere se as checagens dão NÃO. |
| `qa/otimizar-imagens.mjs` | Gera as versões WebP leves das imagens da página (pastas `web/`). |
| `qa/relatorio/` e `qa/relatorio-mutantes/` | Saída de cada rodada (não vão para o Git). |
