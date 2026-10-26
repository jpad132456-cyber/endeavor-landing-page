# Endeavor landing page

## Regra de transparência (obrigatória)

- Toda **decisão ou ação** que não esteja diretamente baseada em uma instrução prévia explícita
  (do chat, deste `CLAUDE.md` ou do `DESIGN.md`) deve ser **reportada imediatamente no chat**
  ao usuário.
- Ao reportar, diga **o que foi decidido ou feito** e **por quê**, deixando claro que partiu de
  você e não de uma instrução. Isso vale também para escolhas pequenas: textos, cores, ordem de
  seções, nomes de arquivos, links e suposições sobre pedidos ambíguos.
- Na dúvida se algo tem base explícita, trate como se não tivesse e reporte.

## Git, GitHub e Vercel — commits e pushes só com autorização (obrigatória, sem exceções)

- O projeto está no GitHub, em repositório **público**:
  https://github.com/jpad132456-cyber/endeavor-landing-page (branch `main`).
- O repositório está ligado ao Vercel (projeto `endeavor-landing-page`): **todo push na `main`
  publica o site automaticamente** em https://endeavor-landing-page.vercel.app.
- **Nunca faça `git commit` nem `git push` sem autorização expressa do usuário.** Antes de cada
  um, pergunte no chat e espere um "sim" claro. Isso vale para os dois comandos, separadamente:
  autorização para commit não autoriza push, e vice-versa.
- A autorização vale **só para aquele commit/push específico**. Não vale para os próximos, mesmo
  que sejam parecidos ou na mesma conversa. Autorização antiga ou genérica não conta.
- Pedidos como "faça a página", "corrige isso" ou "deixe pronto" **não** autorizam commit nem
  push. Só conta um pedido explícito para commitar ou para enviar.
- O mesmo vale para qualquer coisa que grave no histórico ou publique: `git commit --amend`,
  `git merge`, `git rebase`, `git tag`, `git push --force`, PRs e deploys pelo Vercel CLI
  (`vercel deploy`, `vercel --prod`).
- Ao pedir autorização, diga o que vai entrar (arquivos e mensagem do commit) e, no caso de
  push, que ele publica o site.

## Objetivo e público

- **Objetivo máximo:** convencer quem visita a ir ao **Day1 Endeavor 2026**. Tudo na página deve
  levar ao CTA principal.
- **CTA:** o principal é o **ingresso gratuito para estudantes** (Google Form, 100 vagas:
  https://forms.gle/UK5mzH7c9cRPeHNh6). Depois vêm o ingresso pago pela Fever
  (https://feverup.com/m/712650), a transmissão online e o site oficial da Endeavor
  (https://brasil.endeavor.org). Hierarquia e detalhes da oferta em `DESIGN.md` 2.1.
- **Público-alvo:**
  - Universitários interessados em empreendedorismo.
  - Pessoas curiosas sobre o Day1 Endeavor e sobre quem vai palestrar nele.
  - Pessoas curiosas sobre a Endeavor em geral.
- Escreva para esse público: linguagem acessível e inspiradora, sem jargão de investidor.
  Destaque as histórias dos palestrantes e o que a pessoa ganha indo ao evento.

## Referências

- Identidade visual e referências de design: `DESIGN.md`.
- Imagens do Day1 Endeavor 2026 em `assets/images/`, separadas por pasta: palestrantes de hoje,
  palestrantes de edições anteriores (não vão em 2026), patrocinadores, parceiros/apoiadores
  e identidade/local do evento.
  **Não abra nem liste as imagens por padrão.** Quando precisar de uma, leia primeiro
  `assets/images/README.md` (índice com descrição de cada arquivo) e abra apenas a imagem
  escolhida, e só se for preciso vê-la.
