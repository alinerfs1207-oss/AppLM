# 🦁 Missão Luiz — Tarefas e Mesada

Site interativo de tarefas e recompensas para o Luiz Miguel (11 anos), pensado para celular.

## O que tem no app

| Área | O que faz |
|---|---|
| 🏠 **Início** | Check-in diário, lembretes, curiosidade do dia, baú do grande prêmio, avatares e temas desbloqueáveis com gemas 💎 |
| ✅ **Tarefas** | Tarefas diárias e semanais com valores. Luiz marca "Feito!", os pais aprovam e o valor entra no saldo. Não fez = desconta o mesmo valor automaticamente |
| 🧠 **Quiz** | 5 perguntas de gramática por dia (estilo Duolingo). Questão errada volta nos próximos dias até ele dominar. 5/5 = recompensa em dinheiro |
| 📚 **Leitura** | Cronômetro de leitura. 30 min + resumo aprovado = +30 min de videogame (acumula pro fim de semana). Livro inteiro no mês = +R$ 10 |
| 💛 **Coração** | 1 situação de inteligência emocional por dia (escola, amigos, família), com dica imediata e mapa de competências no fim do mês |
| 🔒 **Área dos pais** | PIN (padrão: `1234` — troque nas configurações!). Aprovações, descontos rápidos, ajustes manuais, histórico com estorno, relatórios, teto da mesada e backup |

## Regras do ciclo

- **Início:** 08/09 • **Fim:** 08/10 • **Pagamento:** 09/10
- Teto da mesada: R$ 100 (visível só na área dos pais — o Luiz não vê o limite)
- Tarefa diária não feita, check-in perdido e quiz não feito **descontam automaticamente** na virada do dia
- Tarefa semanal não feita até o dia de vencimento desconta automaticamente

## Como publicar (GitHub Pages)

1. Faça merge desta branch na `main`
2. No GitHub: **Settings → Pages → Source: Deploy from a branch → `main` / root**
3. O site fica em `https://SEU-USUARIO.github.io/AppLM/`
4. No celular, abra o site e use **"Adicionar à tela inicial"** — vira um app 📱

## ⚠️ Importante sobre os dados

O progresso fica salvo **no navegador do celular** (localStorage). Ou seja:

- Usem sempre o **mesmo celular/navegador** para os dados baterem
- Na área dos pais há **Exportar backup** — façam isso de vez em quando
- Limpar os dados do navegador apaga o progresso (por isso o backup!)

## Personalização

Valores das tarefas, recompensa do quiz, descontos, prêmio final, teto e PIN são todos editáveis na área dos pais (⚙️ Configurações). Os bancos de perguntas ficam em `js/data.js`:

- `GRAMMAR_BANK` — 64 questões de gramática (6º ano)
- `EI_BANK` — 30 situações de inteligência emocional
- `FACTS` — 30 curiosidades diárias
