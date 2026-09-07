// ============================================================
// AppLM — Banco de conteúdo
// Gramática (6º ano), Inteligência Emocional, Curiosidades
// ============================================================

// ---------- BANCO DE GRAMÁTICA ----------
// Cada questão: id, cat (categoria), q (pergunta), opts (opções),
// ans (índice da correta), exp (explicação curta e amigável)
const GRAMMAR_BANK = [
  // --- M antes de P e B ---
  { id: 'mp1', cat: 'M antes de P e B', q: 'Qual palavra está escrita corretamente?', opts: ['tampa', 'tanpa'], ans: 0, exp: 'Antes de P e B usamos sempre M: taMpa, caMpo, boMba.' },
  { id: 'mp2', cat: 'M antes de P e B', q: 'Qual palavra está escrita corretamente?', opts: ['bonbeiro', 'bombeiro'], ans: 1, exp: 'Antes de B usamos M: boMbeiro, boMbom, taMbém.' },
  { id: 'mp3', cat: 'M antes de P e B', q: 'Complete: "O jogo foi no ___ do bairro."', opts: ['canpo', 'campo'], ans: 1, exp: 'Antes de P usamos M: caMpo, teMpo, liMpo.' },
  { id: 'mp4', cat: 'M antes de P e B', q: 'Complete: "Ele toca ___ na banda da escola."', opts: ['tambor', 'tanbor'], ans: 0, exp: 'Antes de B usamos M: taMbor, saMba.' },
  { id: 'mp5', cat: 'M antes de P e B', q: 'Qual palavra está escrita corretamente?', opts: ['senpre', 'sempre'], ans: 1, exp: 'Antes de P usamos M: seMpre, coMprar, liMpar.' },
  { id: 'mp6', cat: 'M antes de P e B', q: 'Qual palavra está escrita corretamente?', opts: ['ombro', 'onbro'], ans: 0, exp: 'Antes de B usamos M: oMbro, soMbra.' },
  { id: 'mp7', cat: 'M antes de P e B', q: 'Complete: "Deixei meu quarto bem ___."', opts: ['linpo', 'limpo'], ans: 1, exp: 'Antes de P usamos M: liMpo, liMpeza.' },
  { id: 'mp8', cat: 'M antes de P e B', q: 'Qual palavra está escrita corretamente?', opts: ['também', 'tanbém'], ans: 0, exp: 'Antes de B usamos M: taMbém. E não esqueça o acento!' },

  // --- Junto ou separado ---
  { id: 'js1', cat: 'Junto ou separado', q: 'Qual é a forma correta?', opts: ['concerteza', 'com certeza'], ans: 1, exp: '"Com certeza" se escreve SEMPRE separado. "Concerteza" não existe!' },
  { id: 'js2', cat: 'Junto ou separado', q: 'Qual é a forma correta?', opts: ['de repente', 'derrepente'], ans: 0, exp: '"De repente" se escreve separado. "Derrepente" não existe.' },
  { id: 'js3', cat: 'Junto ou separado', q: 'Complete: "___ vai ao cinema amanhã."', opts: ['Agente', 'A gente'], ans: 1, exp: '"A gente" (= nós) é separado. "Agente" junto é profissão: agente secreto!' },
  { id: 'js4', cat: 'Junto ou separado', q: 'Complete: "O gato dormiu ___ da cama."', opts: ['embaixo', 'em baixo'], ans: 0, exp: '"Embaixo" se escreve junto. O contrário, "em cima", é separado!' },
  { id: 'js5', cat: 'Junto ou separado', q: 'Qual é a forma correta?', opts: ['denovo', 'de novo'], ans: 1, exp: '"De novo" se escreve separado. "Denovo" não existe.' },
  { id: 'js6', cat: 'Junto ou separado', q: 'Complete: "Estudei muito, ___ fui bem na prova."', opts: ['por isso', 'porisso'], ans: 0, exp: '"Por isso" se escreve separado, sempre.' },
  { id: 'js7', cat: 'Junto ou separado', q: 'Complete: "O livro está ___ da mesa."', opts: ['encima', 'em cima'], ans: 1, exp: '"Em cima" é separado. Curioso: "embaixo" é junto!' },
  { id: 'js8', cat: 'Junto ou separado', q: 'Complete: "Comi chocolate ___ e passei mal." (= muito)', opts: ['demais', 'de mais'], ans: 0, exp: 'Quando significa "muito", usamos "demais" junto.' },

  // --- Mas ou mais ---
  { id: 'mm1', cat: 'Mas ou mais', q: 'Complete: "Quero ir ao parque, ___ está chovendo."', opts: ['mas', 'mais'], ans: 0, exp: '"Mas" = porém. "Mais" = quantidade (mais doce, mais alto).' },
  { id: 'mm2', cat: 'Mas ou mais', q: 'Complete: "Coloque ___ açúcar no suco."', opts: ['mas', 'mais'], ans: 1, exp: '"Mais" fala de quantidade. "Mas" é para ideias opostas.' },
  { id: 'mm3', cat: 'Mas ou mais', q: 'Complete: "Estudei bastante, ___ a prova foi difícil."', opts: ['mais', 'mas'], ans: 1, exp: '"Mas" = porém, ideia contrária. Dica: troque por "porém" e veja se faz sentido!' },
  { id: 'mm4', cat: 'Mas ou mais', q: 'Complete: "Ele é o ___ alto da turma."', opts: ['mais', 'mas'], ans: 0, exp: '"Mais" = quantidade/intensidade. O MAIS alto, o MAIS rápido.' },

  // --- Mal ou mau ---
  { id: 'mb1', cat: 'Mal ou mau', q: 'Complete: "Ele se sentiu ___ depois do almoço."', opts: ['mau', 'mal'], ans: 1, exp: '"Mal" é o contrário de BEM. "Mau" é o contrário de BOM.' },
  { id: 'mb2', cat: 'Mal ou mau', q: 'Complete: "O lobo ___ assustou os três porquinhos."', opts: ['mau', 'mal'], ans: 0, exp: '"Mau" = contrário de bom (lobo mau, mau humor).' },
  { id: 'mb3', cat: 'Mal ou mau', q: 'Complete: "Ela dormiu ___ esta noite."', opts: ['mal', 'mau'], ans: 0, exp: 'Dormiu mal = não dormiu BEM. Lembre: mal↔bem, mau↔bom.' },
  { id: 'mb4', cat: 'Mal ou mau', q: 'Complete: "Hoje acordei de ___ humor."', opts: ['mal', 'mau'], ans: 1, exp: 'Humor pode ser BOM ou MAU. Então é "mau humor"!' },

  // --- Há ou a ---
  { id: 'ha1', cat: 'Há ou a', q: 'Complete: "Moro nesta casa ___ dois anos."', opts: ['há', 'a'], ans: 0, exp: 'Tempo que JÁ PASSOU usa "há" (do verbo haver). Dica: troque por "faz".' },
  { id: 'ha2', cat: 'Há ou a', q: 'Complete: "Vou viajar daqui ___ três dias."', opts: ['há', 'a'], ans: 1, exp: 'Tempo FUTURO usa "a": daqui A três dias.' },
  { id: 'ha3', cat: 'Há ou a', q: 'Complete: "___ muitos livros na estante."', opts: ['Há', 'A'], ans: 0, exp: '"Há" = existe(m). Há muitos livros = existem muitos livros.' },

  // --- Porquês ---
  { id: 'pq1', cat: 'Os porquês', q: 'Complete: "___ você chegou tarde?"', opts: ['Por que', 'Porque'], ans: 0, exp: 'Em PERGUNTAS usamos "por que" separado.' },
  { id: 'pq2', cat: 'Os porquês', q: 'Complete: "Cheguei tarde ___ perdi o ônibus."', opts: ['por que', 'porque'], ans: 1, exp: 'Em RESPOSTAS/explicações usamos "porque" junto.' },
  { id: 'pq3', cat: 'Os porquês', q: 'Complete: "Você faltou à aula por ___?"', opts: ['quê', 'que'], ans: 0, exp: 'No FIM da frase, "quê" leva acento: por quê?' },
  { id: 'pq4', cat: 'Os porquês', q: 'Complete: "Ninguém sabe o ___ da briga."', opts: ['porque', 'porquê'], ans: 1, exp: 'Com "o" antes (o motivo), usamos "porquê" junto e com acento.' },

  // --- Ç, S ou SS ---
  { id: 'cs1', cat: 'Ç, S ou SS', q: 'Qual palavra está escrita corretamente?', opts: ['aniversário', 'aniverssário'], ans: 0, exp: 'Aniversário é com um S só, com som de Z.' },
  { id: 'cs2', cat: 'Ç, S ou SS', q: 'Qual palavra está escrita corretamente?', opts: ['assúcar', 'açúcar'], ans: 1, exp: 'Açúcar é com Ç. O cedilha (ç) só vem antes de A, O e U.' },
  { id: 'cs3', cat: 'Ç, S ou SS', q: 'Qual palavra está escrita corretamente?', opts: ['pásaro', 'pássaro'], ans: 1, exp: 'Entre vogais, o som de S forte precisa de SS: páSSaro.' },
  { id: 'cs4', cat: 'Ç, S ou SS', q: 'Qual palavra está escrita corretamente?', opts: ['almoço', 'almosso'], ans: 0, exp: 'Almoço é com Ç: almoço, almoçar.' },
  { id: 'cs5', cat: 'Ç, S ou SS', q: 'Qual palavra está escrita corretamente?', opts: ['profissão', 'profição'], ans: 0, exp: 'Profissão é com SS, assim como missão e discussão.' },
  { id: 'cs6', cat: 'Ç, S ou SS', q: 'Qual palavra está escrita corretamente?', opts: ['converça', 'conversa'], ans: 1, exp: 'Conversa é com S: conversa, conversar.' },

  // --- X ou CH ---
  { id: 'xc1', cat: 'X ou CH', q: 'Qual palavra está escrita corretamente?', opts: ['enchergar', 'enxergar'], ans: 1, exp: 'Depois de "EN" geralmente vem X: enxergar, enxada, enxame.' },
  { id: 'xc2', cat: 'X ou CH', q: 'Qual palavra está escrita corretamente?', opts: ['mexer', 'mecher'], ans: 0, exp: 'Mexer é com X: mexer, mexerica, México.' },
  { id: 'xc3', cat: 'X ou CH', q: 'Qual palavra está escrita corretamente?', opts: ['xuva', 'chuva'], ans: 1, exp: 'Chuva é com CH: chuva, chuveiro, chão.' },
  { id: 'xc4', cat: 'X ou CH', q: 'Qual palavra está escrita corretamente?', opts: ['peixe', 'peiche'], ans: 0, exp: 'Depois de ditongo (ei, ai, ou) usamos X: peiXe, caiXa, frouXo.' },
  { id: 'xc5', cat: 'X ou CH', q: 'Qual palavra está escrita corretamente?', opts: ['enxer', 'encher'], ans: 1, exp: 'Exceção! "Encher" é com CH porque vem de "cheio".' },

  // --- G ou J ---
  { id: 'gj1', cat: 'G ou J', q: 'Complete: "Fizemos uma ___ incrível nas férias."', opts: ['viagem', 'viajem'], ans: 0, exp: 'A viagem (nome) é com G. "Viajem" com J é verbo: "que eles viajem".' },
  { id: 'gj2', cat: 'G ou J', q: 'Qual palavra está escrita corretamente?', opts: ['geito', 'jeito'], ans: 1, exp: 'Jeito é com J: jeito, jeitoso.' },
  { id: 'gj3', cat: 'G ou J', q: 'Qual palavra está escrita corretamente?', opts: ['gente', 'jente'], ans: 0, exp: 'Gente é com G: gente, gentil.' },
  { id: 'gj4', cat: 'G ou J', q: 'Qual palavra está escrita corretamente?', opts: ['beringela', 'berinjela'], ans: 1, exp: 'Berinjela é com J. Pegadinha clássica!' },
  { id: 'gj5', cat: 'G ou J', q: 'Qual palavra está escrita corretamente?', opts: ['hoje', 'hoge'], ans: 0, exp: 'Hoje é com J (e com H no começo!).' },

  // --- Acentuação ---
  { id: 'ac1', cat: 'Acentuação', q: 'Qual palavra está escrita corretamente?', opts: ['voce', 'você'], ans: 1, exp: 'Você leva acento circunflexo no Ê.' },
  { id: 'ac2', cat: 'Acentuação', q: 'Qual palavra está escrita corretamente?', opts: ['água', 'agua'], ans: 0, exp: 'Água leva acento agudo no Á.' },
  { id: 'ac3', cat: 'Acentuação', q: 'Qual palavra está escrita corretamente?', opts: ['cafe', 'café'], ans: 1, exp: 'Café leva acento agudo no É.' },
  { id: 'ac4', cat: 'Acentuação', q: 'Qual palavra está escrita corretamente?', opts: ['família', 'familia'], ans: 0, exp: 'Família leva acento no Í.' },
  { id: 'ac5', cat: 'Acentuação', q: 'Qual palavra está escrita corretamente?', opts: ['tambem', 'também'], ans: 1, exp: 'Também leva acento no É.' },

  // --- Erros comuns ---
  { id: 'ec1', cat: 'Erros comuns', q: 'Complete: "Hoje tem ___ gente na praça."', opts: ['menas', 'menos'], ans: 1, exp: '"Menas" NÃO existe! É sempre "menos": menos gente, menos comida.' },
  { id: 'ec2', cat: 'Erros comuns', q: 'Complete: "Espero que ele ___ aprovado."', opts: ['seja', 'seje'], ans: 0, exp: '"Seje" não existe. O certo é "seja" (do verbo ser).' },
  { id: 'ec3', cat: 'Erros comuns', q: 'Complete: "Eu ___ o dever de casa ontem."', opts: ['fis', 'fiz'], ans: 1, exp: 'Fiz é com Z: eu fiz, ele fez.' },
  { id: 'ec4', cat: 'Erros comuns', q: 'Qual palavra está escrita corretamente?', opts: ['exceção', 'excessão'], ans: 0, exp: 'Exceção é com Ç. Pegadinha difícil que muito adulto erra!' },
  { id: 'ec5', cat: 'Erros comuns', q: 'Complete: "Nós ___ ao parque ontem."', opts: ['fomos', 'fomus'], ans: 0, exp: 'Nós fomos — terminação -MOS: fomos, vamos, brincamos.' },
  { id: 'ec6', cat: 'Erros comuns', q: 'Qual palavra está escrita corretamente?', opts: ['quizer', 'quiser'], ans: 1, exp: 'Quiser é com S: "quando você quiser".' },
  { id: 'ec7', cat: 'Erros comuns', q: 'Complete: "Ontem eu ___ meu caderno novo."', opts: ['trouxe', 'trazi'], ans: 0, exp: '"Trazi" não existe. O verbo trazer é irregular: eu trouxe.' },
  { id: 'ec8', cat: 'Erros comuns', q: 'Qual palavra está escrita corretamente?', opts: ['pissina', 'piscina'], ans: 1, exp: 'Piscina é com SC: piscina, nascer, crescer.' },

  // --- Concordância ---
  { id: 'co1', cat: 'Concordância', q: 'Complete: "Nós ___ ao cinema amanhã."', opts: ['vamos', 'vai'], ans: 0, exp: 'Nós vamos, ele vai. O verbo combina com quem faz a ação.' },
  { id: 'co2', cat: 'Concordância', q: 'Complete: "A gente ___ jogar bola depois."', opts: ['vamos', 'vai'], ans: 1, exp: '"A gente" usa verbo no singular: a gente VAI (ou: nós VAMOS).' },
  { id: 'co3', cat: 'Concordância', q: 'Complete: "Os meninos ___ felizes com o passeio."', opts: ['está', 'estão'], ans: 1, exp: 'Os meninos (vários) ESTÃO. Um menino ESTÁ.' },
  { id: 'co4', cat: 'Concordância', q: 'Complete: "___ dois anos que moro aqui."', opts: ['Faz', 'Fazem'], ans: 0, exp: 'Falando de tempo, "fazer" fica no singular: FAZ dois anos.' },
];

// ---------- INTELIGÊNCIA EMOCIONAL ----------
// 30 situações do dia a dia (escola, amigos, família).
// quality: 2 = ótima escolha, 1 = mais ou menos, 0 = precisa melhorar
// tags: autocontrole, empatia, comunicacao, resiliencia, responsabilidade, autoconfianca
const EI_LABELS = {
  autocontrole: 'Autocontrole',
  empatia: 'Empatia',
  comunicacao: 'Comunicação',
  resiliencia: 'Resiliência',
  responsabilidade: 'Responsabilidade',
  autoconfianca: 'Autoconfiança',
};

const EI_BANK = [
  { id: 1, ctx: '🏫 Na escola', sit: 'Seu colega tirou uma nota ruim na prova e ficou com os olhos cheios de lágrimas.', tags: ['empatia'], opts: [
    { t: 'Vou até ele e digo: "Na próxima você consegue, quer estudar comigo?"', q: 2 },
    { t: 'Finjo que não vi para não deixar ele com vergonha.', q: 1, tip: 'Boa intenção! Mas quem está triste geralmente gosta de saber que alguém se importa. Um "tô aqui se precisar" já ajuda muito.' },
    { t: 'Comento com outros colegas a nota que ele tirou.', q: 0, tip: 'Espalhar a nota de alguém machuca. Pense: como VOCÊ se sentiria se fosse com você? Isso é empatia.' },
  ]},
  { id: 2, ctx: '👥 Com amigos', sit: 'Você descobriu que seus amigos combinaram de jogar bola no fim de semana e não te chamaram.', tags: ['resiliencia', 'comunicacao'], opts: [
    { t: 'Pergunto com calma: "Vi que vocês jogaram, posso ir na próxima?"', q: 2 },
    { t: 'Fico magoado e paro de falar com eles sem explicar por quê.', q: 0, tip: 'Quando a gente se fecha sem conversar, o outro nem sabe que errou. Falar o que sentiu resolve muito mais que o silêncio.' },
    { t: 'Fico triste, mas não falo nada e espero me chamarem.', q: 1, tip: 'Guardar tudo pesa no coração. Pode ter sido só esquecimento — perguntar tira a dúvida e evita mágoa à toa.' },
  ]},
  { id: 3, ctx: '🏠 Em família', sit: 'Você chegou no quarto e viu que mexeram nas suas coisas e pegaram algo sem pedir.', tags: ['autocontrole', 'comunicacao'], opts: [
    { t: 'Respiro fundo e digo: "Fico chateado quando pegam sem pedir. Pode me avisar antes?"', q: 2 },
    { t: 'Grito e vou pegar algo da pessoa de volta, para ela sentir o mesmo.', q: 0, tip: 'Revidar vira briga em dobro. Respirar fundo antes de reagir dá tempo pro cérebro escolher melhor. Falar firme e calmo funciona mais que gritar.' },
    { t: 'Fico bravo por dentro, mas não falo nada.', q: 1, tip: 'Engolir a raiva não faz ela sumir — ela cresce. Dizer o que sentiu, com respeito, é o caminho do meio entre explodir e engolir.' },
  ]},
  { id: 4, ctx: '🏫 Na escola', sit: 'A professora chamou sua atenção na frente da turma toda e você achou injusto.', tags: ['autocontrole'], opts: [
    { t: 'Fico quieto na hora e, depois da aula, converso com ela em particular.', q: 2 },
    { t: 'Respondo na hora, na frente de todos, para me defender.', q: 1, tip: 'Se defender é válido, mas na frente de todos vira bate-boca. Esperar e conversar em particular quase sempre resolve melhor.' },
    { t: 'Amasso o papel, bufo e fico de cara fechada o resto do dia.', q: 0, tip: 'A raiva passa, mas o dia estragado não volta. Truque: respire fundo 3 vezes e pense "vou resolver isso depois, com calma".' },
  ]},
  { id: 5, ctx: '🎮 Em casa', sit: 'Você perdeu três partidas seguidas no videogame e sentiu muita raiva.', tags: ['autocontrole', 'resiliencia'], opts: [
    { t: 'Paro um pouco, bebo água e volto depois com a cabeça fria.', q: 2 },
    { t: 'Jogo o controle no sofá e grito.', q: 0, tip: 'Quando a raiva manda, a gente quebra coisas e se arrepende. Pausar é coisa de jogador profissional: eles treinam a mente também!' },
    { t: 'Continuo jogando bravo até ganhar de qualquer jeito.', q: 1, tip: 'Jogar com raiva piora a jogada — o cérebro nervoso erra mais. Uma pausa de 5 minutos melhora até seu desempenho.' },
  ]},
  { id: 6, ctx: '🏫 Na escola', sit: 'Chegou um aluno novo na turma e ele está sempre sozinho no recreio.', tags: ['empatia'], opts: [
    { t: 'Chamo ele para lanchar ou brincar com a gente.', q: 2 },
    { t: 'Acho que alguém vai chamar ele uma hora.', q: 1, tip: 'Se todo mundo pensar assim, ninguém chama! Ser o primeiro a estender a mão é coragem — e pode nascer uma grande amizade.' },
    { t: 'Não falo com ele, afinal nem conheço.', q: 0, tip: 'Todo amigo já foi um desconhecido um dia. Imagine estar numa escola nova sem conhecer ninguém — um "oi" mudaria seu dia, né?' },
  ]},
  { id: 7, ctx: '🏠 Em família', sit: 'Seus pais disseram NÃO para algo que você queria muito fazer.', tags: ['autocontrole'], opts: [
    { t: 'Pergunto com respeito o motivo e escuto a resposta.', q: 2 },
    { t: 'Insisto, choro e fico pedindo sem parar.', q: 0, tip: 'Insistir sem ouvir cansa todo mundo e não muda o não. Entender o motivo mostra maturidade — e às vezes abre espaço pra negociar de verdade.' },
    { t: 'Aceito, mas fico o dia todo emburrado.', q: 1, tip: 'Aceitar já é ótimo! O bico o dia inteiro só estraga o SEU dia. Frustração faz parte — todo mundo ouve "não" às vezes, até os adultos.' },
  ]},
  { id: 8, ctx: '🏫 Na escola', sit: 'Você errou um exercício no quadro e alguns colegas riram.', tags: ['autoconfianca', 'resiliencia'], opts: [
    { t: 'Penso: "errar faz parte de aprender" e sigo em frente.', q: 2 },
    { t: 'Fico com tanta vergonha que decido nunca mais ir ao quadro.', q: 0, tip: 'Quem nunca erra é quem nunca tenta. Os maiores cientistas erraram milhares de vezes. Fugir do quadro é fugir de aprender.' },
    { t: 'Rio junto, mas por dentro fico mal o resto da aula.', q: 1, tip: 'Disfarçar ajuda na hora, mas o sentimento fica. Tente trocar o pensamento: "eu errei" ≠ "eu sou ruim". Errar é treino.' },
  ]},
  { id: 9, ctx: '👥 Com amigos', sit: 'Um amigo te contou, em segredo, que está muito triste com problemas em casa.', tags: ['empatia', 'responsabilidade'], opts: [
    { t: 'Escuto com atenção e sugiro que ele converse com um adulto de confiança.', q: 2 },
    { t: 'Mudo de assunto porque não sei o que dizer.', q: 1, tip: 'Você não precisa saber a resposta! Só ouvir já ajuda demais. E problemas grandes pedem ajuda de um adulto de confiança.' },
    { t: 'Conto para outros colegas, afinal é uma notícia e tanto.', q: 0, tip: 'Segredo de amigo é confiança emprestada. Espalhar quebra essa confiança — talvez pra sempre. A exceção: se ele estiver em perigo, aí sim conte a um adulto.' },
  ]},
  { id: 10, ctx: '🏠 Em família', sit: 'Você quebrou sem querer um objeto da casa e ninguém viu.', tags: ['responsabilidade'], opts: [
    { t: 'Conto a verdade na hora e ofereço ajuda para resolver.', q: 2 },
    { t: 'Escondo os pedaços e torço para ninguém notar.', q: 0, tip: 'Mentira é dívida: uma hora cobra juros. Assumir o erro dá um frio na barriga, mas gera algo valioso: seus pais passam a confiar mais em você.' },
    { t: 'Espero alguém perguntar para contar.', q: 1, tip: 'Contar só se perguntarem é meio caminho. Quem assume primeiro mostra coragem — e a bronca quase sempre é menor quando a verdade vem de você.' },
  ]},
  { id: 11, ctx: '🏫 Na escola', sit: 'Amanhã tem uma prova difícil e você está sentindo medo de ir mal.', tags: ['resiliencia', 'autoconfianca'], opts: [
    { t: 'Transformo o medo em plano: revisar hoje o que mais tenho dúvida.', q: 2 },
    { t: 'Fico tão nervoso que desisto de estudar: "não vai adiantar".', q: 0, tip: 'O medo mente! Ele diz "não adianta" pra você desistir. Estudar 30 minutos já acalma, porque o cérebro sente que você está no controle.' },
    { t: 'Tento não pensar na prova e vou jogar para esquecer.', q: 1, tip: 'Distrair ajuda um pouco, mas o medo volta na hora da prova. Enfrentar um pedacinho hoje (revisar 1 matéria) encolhe o medo de verdade.' },
  ]},
  { id: 12, ctx: '🏫 Na escola', sit: 'Na prova, um colega cochicha pedindo para você deixar ele colar sua resposta.', tags: ['responsabilidade'], opts: [
    { t: 'Digo baixinho que não posso, e me ofereço para estudar junto depois.', q: 2 },
    { t: 'Deixo colar, afinal é meu amigo.', q: 0, tip: 'Amizade de verdade não pede pra você se arriscar. Colar prejudica os dois — e ele continua sem aprender. Ajudar é estudar junto, não passar resposta.' },
    { t: 'Ignoro e fico com medo dele ficar bravo comigo.', q: 1, tip: 'Dizer não é difícil, mas você tem esse direito! Um "não posso, depois te ajudo a estudar" resolve sem perder a amizade.' },
  ]},
  { id: 13, ctx: '👥 Com amigos', sit: 'Dois amigos seus brigaram e cada um quer que você fique do lado dele.', tags: ['comunicacao', 'empatia'], opts: [
    { t: 'Digo que gosto dos dois e tento ajudá-los a conversar e se entender.', q: 2 },
    { t: 'Escolho o lado do meu melhor amigo, mesmo sem saber quem errou.', q: 1, tip: 'Lealdade é bonito, mas justiça importa. Ouvir os dois lados antes evita que a briga cresça e sobre pra você também.' },
    { t: 'Falo mal de um para o outro, para agradar os dois.', q: 0, tip: 'Isso é jogar gasolina no fogo — e quando descobrirem (sempre descobrem!), você vira o vilão da história. Quem ajuda a unir, ganha o respeito dos dois.' },
  ]},
  { id: 14, ctx: '🏠 Em família', sit: 'Você está MUITO bravo com seu pai por causa de uma bronca que achou injusta.', tags: ['comunicacao', 'autocontrole'], opts: [
    { t: 'Espero a raiva baixar e depois digo: "posso falar sobre o que aconteceu?"', q: 2 },
    { t: 'Grito "você é injusto!" e bato a porta do quarto.', q: 0, tip: 'Gritar faz o outro parar de ouvir e olhar só pro grito. Regra de ouro: raiva alta, voz baixa. Espere esfriar e aí converse — funciona MUITO mais.' },
    { t: 'Fico calado e trato ele com frieza por uns dias.', q: 1, tip: 'O gelo machuca em silêncio e não conta o que você sente. Seu pai não adivinha — dizer "fiquei chateado porque..." abre a porta pra ele te entender.' },
  ]},
  { id: 15, ctx: '⚽ No esporte', sit: 'Seu time perdeu o jogo e o gol saiu de um erro seu.', tags: ['resiliencia'], opts: [
    { t: 'Fico chateado, mas penso: "até os profissionais erram, vou treinar essa jogada".', q: 2 },
    { t: 'Digo que nunca mais vou jogar futebol.', q: 0, tip: 'Um erro não define você. Todo craque já perdeu gol feito. Desistir garante uma coisa só: nunca melhorar. Persistir transforma erro em treino.' },
    { t: 'Coloco a culpa no goleiro para não sobrar pra mim.', q: 1, tip: 'Empurrar a culpa alivia na hora, mas os colegas percebem. Quem diz "foi mal, vou treinar mais" ganha o respeito do time inteiro.' },
  ]},
  { id: 16, ctx: '🏫 Na escola', sit: 'Você vê um colega maior zoando e humilhando um menor no pátio.', tags: ['empatia', 'responsabilidade'], opts: [
    { t: 'Não entro na briga: chamo um adulto e depois apoio o colega zoado.', q: 2 },
    { t: 'Rio junto para não virar o próximo alvo.', q: 0, tip: 'Rir junto é entrar no time de quem machuca. Você não precisa enfrentar ninguém — avisar um adulto é o jeito inteligente e seguro de ajudar.' },
    { t: 'Sigo em frente, não é problema meu.', q: 1, tip: 'Quem sofre bullying se sente invisível. Você não precisa ser herói: avisar um professor ou só perguntar depois "você tá bem?" já muda tudo pra ele.' },
  ]},
  { id: 17, ctx: '🏠 Em família', sit: 'Um parente te deu um presente que você não gostou, na frente de todo mundo.', tags: ['empatia', 'autocontrole'], opts: [
    { t: 'Agradeço com um sorriso, porque ele pensou em mim ao comprar.', q: 2 },
    { t: 'Faço careta e digo: "não era isso que eu queria".', q: 0, tip: 'A pessoa gastou tempo e carinho escolhendo. Dizer isso na hora machuca. Agradecer não é mentir — é reconhecer o gesto, que vale mais que o objeto.' },
    { t: 'Agradeço sem graça e deixo o presente de lado na frente dele.', q: 1, tip: 'Quase lá! Só cuidado com a cara e o gesto: eles falam mais que a boca. Um obrigado com sorriso protege o coração de quem te deu.' },
  ]},
  { id: 18, ctx: '🏫 Na escola', sit: 'Você não entendeu a matéria, mas ficou com vergonha de perguntar na frente da turma.', tags: ['autoconfianca'], opts: [
    { t: 'Levanto a mão e pergunto — se eu não entendi, outros também não entenderam.', q: 2 },
    { t: 'Fico quieto e deixo a dúvida pra lá.', q: 0, tip: 'Dúvida guardada vira bola de neve na prova. Fato: quando alguém pergunta, metade da sala agradece em silêncio, porque também não entendeu!' },
    { t: 'Espero a aula acabar e pergunto para um colega.', q: 1, tip: 'Boa estratégia! Só não deixe de perguntar ao professor quando o colega também não souber. Perguntar não é fraqueza — é como os inteligentes aprendem.' },
  ]},
  { id: 19, ctx: '👥 Com amigos', sit: 'Você descobriu que um amigo mentiu para você.', tags: ['comunicacao'], opts: [
    { t: 'Falo com ele em particular: "fiquei chateado, por que você mentiu?"', q: 2 },
    { t: 'Exponho a mentira dele na frente dos outros.', q: 0, tip: 'Humilhar em público transforma um erro em guerra. Conversar em particular dá chance dele explicar e se desculpar — e a amizade sobrevive.' },
    { t: 'Minto para ele também, para ficarmos quites.', q: 1, tip: 'Olho por olho, e todo mundo fica cego. Revidar mentira com mentira só ensina que mentir é normal entre vocês. Conversar quebra esse ciclo.' },
  ]},
  { id: 20, ctx: '🏠 Em casa', sit: 'Tem bastante lição de casa, mas você está morrendo de vontade de jogar videogame.', tags: ['responsabilidade', 'autocontrole'], opts: [
    { t: 'Faço a lição primeiro e deixo o jogo como prêmio.', q: 2 },
    { t: 'Jogo primeiro "só um pouquinho"... e a lição fica pra depois.', q: 0, tip: '"Só um pouquinho" é a maior pegadinha do cérebro! O jogo estica e a lição fica pra hora do sono. Dever primeiro = jogar depois sem culpa nenhuma.' },
    { t: 'Faço metade da lição correndo para jogar logo.', q: 1, tip: 'Lição feita com pressa é lição feita duas vezes (quando a professora manda refazer!). Capricho agora poupa retrabalho depois.' },
  ]},
  { id: 21, ctx: '🍿 No dia a dia', sit: 'Você está na fila do lanche há um tempão e alguém fura a fila na sua frente.', tags: ['autocontrole', 'comunicacao'], opts: [
    { t: 'Digo firme e educado: "com licença, a fila começa lá atrás".', q: 2 },
    { t: 'Empurro a pessoa para fora da fila.', q: 0, tip: 'Empurrão transforma você de certo em errado na hora. Falar firme (sem gritar) resolve na maioria das vezes — e se não resolver, chame quem organiza.' },
    { t: 'Não falo nada, mas fico remoendo de raiva.', q: 1, tip: 'Você tem direito de se posicionar! Falar educadamente não é briga, é respeito próprio. Quem engole tudo acumula raiva que estoura depois em casa.' },
  ]},
  { id: 22, ctx: '🎨 Na escola', sit: 'Seu trabalho de arte não ficou como você queria, e o do colega recebeu muitos elogios.', tags: ['autoconfianca'], opts: [
    { t: 'Elogio o dele e pergunto como fez — posso aprender uma técnica nova.', q: 2 },
    { t: 'Amasso meu trabalho: "eu sou horrível em arte mesmo".', q: 0, tip: 'Cuidado com o "eu sou": você não É ruim, você ESTÁ aprendendo. Todo desenhista tem mil desenhos feios na gaveta — eles são os degraus da escada.' },
    { t: 'Fico com inveja e procuro um defeito no trabalho dele.', q: 1, tip: 'Inveja é seta apontando pro que você deseja. Em vez de diminuir o outro, use-a como mapa: "quero aprender isso também". Aí ela vira combustível.' },
  ]},
  { id: 23, ctx: '🏠 Em família', sit: 'Sua mãe pediu ajuda para guardar as compras bem na hora que você ia começar a jogar.', tags: ['responsabilidade', 'empatia'], opts: [
    { t: 'Pauso o jogo e ajudo — são 10 minutos e ela precisa de mim.', q: 2 },
    { t: 'Finjo que não escutei.', q: 0, tip: 'Ela percebe, viu? Fingir surdez diz "meu jogo importa mais que você". Dez minutos de ajuda valem horas de confiança — e mãe lembra de quem ajuda!' },
    { t: 'Digo "já vou!" e demoro até ela terminar sozinha.', q: 1, tip: 'O famoso "já vou" que nunca chega! Ajudar de verdade é ajudar na hora que precisa, não depois que acabou. Pausa rápida no jogo, herói na cozinha.' },
  ]},
  { id: 24, ctx: '🏫 Na escola', sit: 'Você vai apresentar um trabalho para a turma e sente o coração acelerado de nervoso.', tags: ['autoconfianca', 'resiliencia'], opts: [
    { t: 'Respiro fundo e lembro: eu treinei, o frio na barriga é normal e vai passar.', q: 2 },
    { t: 'Invento que estou passando mal para não apresentar.', q: 0, tip: 'Fugir alivia hoje e apavora amanhã: o medo cresce a cada fuga. Segredo: o nervosismo diminui DEPOIS que você começa a falar. O difícil é só o primeiro minuto!' },
    { t: 'Apresento correndo, falando baixinho, olhando pro chão.', q: 1, tip: 'Você enfrentou — isso já é vitória! Próximo passo: treinar em voz alta em casa (até pro espelho). Quanto mais a boca conhece o texto, menos o coração dispara.' },
  ]},
  { id: 25, ctx: '👥 Com amigos', sit: 'Seu amigo está estranho e triste, mas diz que "não é nada".', tags: ['empatia'], opts: [
    { t: 'Respeito o silêncio, mas aviso: "quando quiser falar, tô aqui".', q: 2 },
    { t: 'Fico insistindo: "fala logo! conta! o que foi? conta!"', q: 1, tip: 'Sua preocupação é linda, mas pressão fecha as pessoas. É como flor: não abre na força. Diga que está ali e dê tempo — ele vem quando estiver pronto.' },
    { t: 'Se ele disse que não é nada, então não é nada. Deixo pra lá.', q: 0, tip: '"Não é nada" quase sempre significa "é alguma coisa". Não precisa forçar, mas ficar por perto, chamar pra brincar, mostrar que se importa — isso cura.' },
  ]},
  { id: 26, ctx: '🏫 Na escola', sit: 'Você perdeu a borracha que um colega te emprestou.', tags: ['responsabilidade'], opts: [
    { t: 'Conto a verdade, peço desculpas e me ofereço para repor.', q: 2 },
    { t: 'Devolvo outra borracha parecida sem falar nada.', q: 1, tip: 'Repor é ótimo, mas esconder o que houve deixa uma mentirinha no meio. A verdade + reposição = confiança dobrada. "Perdi a sua, trouxe uma nova, desculpa!"' },
    { t: 'Fico quieto e espero ele esquecer que emprestou.', q: 0, tip: 'Ele pode esquecer da borracha, mas se descobrir, não esquece que você sumiu com ela. Coisas emprestadas são teste de confiança — e confiança vale mais que borracha.' },
  ]},
  { id: 27, ctx: '🏠 Em família', sit: 'Você leva uma bronca e sente aquela vontade GIGANTE de responder grosso.', tags: ['autocontrole'], opts: [
    { t: 'Mordo a língua, respiro e espero minha vez de falar com calma.', q: 2 },
    { t: 'Solto tudo o que vem na cabeça, no grito.', q: 0, tip: 'Palavra dita no grito não volta atrás — e a bronca dobra. Truque dos campeões: conte até 10 devagar. A vontade de gritar dura segundos; o arrependimento, dias.' },
    { t: 'Respondo com ironia: "tá, tá, tanto faz".', q: 1, tip: 'A ironia parece inofensiva, mas é um grito disfarçado — e adulto percebe na hora. Melhor: "posso explicar meu lado?" Isso sim faz te levarem a sério.' },
  ]},
  { id: 28, ctx: '🏫 Na escola', sit: 'No trabalho em grupo, ninguém deixa você dar sua ideia.', tags: ['comunicacao', 'autoconfianca'], opts: [
    { t: 'Espero uma pausa e digo firme: "pessoal, tenho uma ideia, posso falar?"', q: 2 },
    { t: 'Desisto e deixo eles fazerem tudo sozinhos.', q: 0, tip: 'Sua ideia pode ser justamente a que faltava! Desistir ensina o grupo a te ignorar sempre. Insistir com educação ensina o grupo a te ouvir.' },
    { t: 'Grito mais alto que todo mundo até me ouvirem.', q: 1, tip: 'Você tem razão em querer ser ouvido! Mas quem grita vira "o que grita", não "o das boas ideias". Voz firme + momento certo = respeito de verdade.' },
  ]},
  { id: 29, ctx: '🌧️ No dia a dia', sit: 'Hoje deu tudo errado: acordou atrasado, esqueceu o lanche e ainda levou bronca.', tags: ['resiliencia'], opts: [
    { t: 'Penso: "foi um dia ruim, não uma vida ruim. Amanhã recomeço."', q: 2 },
    { t: 'Concluo que sou azarado e que tudo sempre dá errado pra mim.', q: 0, tip: 'Cuidado com as palavras "tudo" e "sempre" — elas são lentes que só mostram o ruim. Teste: liste 3 coisas boas de hoje. Achou? Então não foi "tudo" errado.' },
    { t: 'Desconto minha irritação em quem falar comigo.', q: 1, tip: 'Dia ruim não é passe livre pra magoar os outros — eles não têm culpa. Diga "tô num dia difícil, me dá um tempinho?" As pessoas entendem quem avisa.' },
  ]},
  { id: 30, ctx: '⚽ Com amigos', sit: 'Na hora de montar os times, você percebe que sempre deixam o mesmo colega de fora.', tags: ['empatia', 'responsabilidade'], opts: [
    { t: 'Falo: "ele joga no meu time" e dou uma chance pra ele.', q: 2 },
    { t: 'Acho ruim, mas fico quieto pra não criar caso.', q: 1, tip: 'Perceber a injustiça já mostra seu bom coração — falta só a voz! Uma frase sua ("vem no meu time") custa 2 segundos e muda o dia inteiro dele.' },
    { t: 'Também não escolho ele, afinal ele joga mal mesmo.', q: 0, tip: 'Ninguém melhora ficando de fora. Sabia que muitos craques eram os últimos escolhidos? Quem dá chance aos outros vira o tipo de pessoa que todos querem por perto.' },
  ]},
];

// ---------- CURIOSIDADES DO DIA ----------
const FACTS = [
  '🦷 Você sabia? As bactérias da boca formam uma "capa" nos dentes em só 12 horas. Escovar depois das refeições quebra essa capa antes dela virar cárie!',
  '📚 Você sabia? Ler 30 minutos por dia cria novas conexões no cérebro — é tipo musculação para os neurônios!',
  '🛏️ Você sabia? Arrumar a cama logo cedo dá ao cérebro a primeira "missão cumprida" do dia — e isso te deixa mais motivado para o resto das tarefas!',
  '🧠 Você sabia? Seu cérebro tem cerca de 86 bilhões de neurônios — mais que o número de estrelas que dá pra ver no céu!',
  '💅 Você sabia? Unhas compridas guardam até 10 vezes mais germes que unhas curtas. Por isso unha curta = menos doença!',
  '📖 Você sabia? Quem lê todos os dias aprende em média 3 vezes mais palavras novas por ano do que quem não lê!',
  '👂 Você sabia? A cera do ouvido protege contra poeira, mas o excesso atrapalha a audição. Limpar (por fora!) mantém tudo funcionando.',
  '🚿 Você sabia? O umbigo pode abrigar dezenas de tipos de bactérias diferentes se não for limpo. Uma limpadinha no banho resolve!',
  '🧠 Você sabia? Quando você aprende algo novo, seu cérebro muda fisicamente! Isso se chama neuroplasticidade.',
  '📚 Você sabia? Ler antes de dormir ajuda o cérebro a guardar melhor as memórias do dia — e ainda dá sonhos mais criativos!',
  '🦷 Você sabia? O esmalte do dente é a parte mais dura do corpo humano — mais duro que osso! Mas o açúcar consegue furá-lo aos poucos.',
  '💪 Você sabia? Cumprir pequenas tarefas todo dia treina o "músculo" da disciplina no cérebro — o mesmo que os atletas olímpicos usam!',
  '🧠 Você sabia? Escrever um resumo do que leu faz o cérebro guardar até 50% mais da história. Por isso o resumo vale videogame!',
  '😴 Você sabia? É durante o sono que o cérebro "salva" tudo que você aprendeu no dia, como um videogame salvando o progresso!',
  '📖 Você sabia? Ler histórias treina a imaginação: o cérebro "vive" a aventura como se fosse real, ativando as mesmas áreas!',
  '🧹 Você sabia? Quarto organizado ajuda o cérebro a se concentrar melhor — bagunça visual cansa a mente sem você perceber!',
  '🎮 Você sabia? Jogar videogame com moderação melhora reflexos e raciocínio. O segredo está no equilíbrio: leitura + jogo = cérebro turbinado!',
  '🦠 Você sabia? Lavar as mãos direito remove até 99% dos germes. É a "poção de proteção" mais poderosa que existe!',
  '🧠 Você sabia? Repetir algo por cerca de 21 a 66 dias transforma a ação em hábito — depois o cérebro faz quase no automático!',
  '📚 Você sabia? Pessoas que leem bastante desenvolvem mais empatia, porque "entram na cabeça" dos personagens!',
  '🦷 Você sabia? A cárie é uma das doenças mais comuns do mundo — e uma das mais fáceis de evitar: é só escovar bem os dentes!',
  '⚽ Você sabia? Exercício físico faz o cérebro liberar substâncias que melhoram o humor e a memória. Corpo ativo, mente afiada!',
  '🧠 Você sabia? Errar faz parte do aprendizado: o cérebro aprende MAIS quando erra e corrige do que quando acerta de primeira!',
  '💧 Você sabia? Beber água ajuda o cérebro a pensar mais rápido — ele é 75% água e sente até uma sede pequena!',
  '📖 Você sabia? Só 6 minutos de leitura já reduzem o estresse em quase 70%, segundo pesquisadores. Livro é calmante natural!',
  '🌟 Você sabia? Elogiar e ajudar alguém libera no SEU cérebro os mesmos "hormônios da felicidade" de quem recebeu a ajuda!',
  '🦶 Você sabia? Manter os pés limpos e as unhas cortadas evita fungos e unha encravada — que dói muito mais que cortar unha!',
  '🧠 Você sabia? O cérebro adora rotina: fazer as tarefas sempre no mesmo horário deixa tudo mais fácil com o tempo!',
  '📚 Você sabia? Terminar um livro inteiro dá ao cérebro uma sensação de conquista parecida com zerar um jogo difícil!',
  '🙏 Você sabia? Agradecer todos os dias por 3 coisas boas treina o cérebro a perceber mais coisas boas na vida. É ciência!',
];

// ---------- CONFIG PADRÃO DE TAREFAS ----------
const DAILY_TASKS = [
  { id: 'dentes', icon: 'tooth', name: 'Escovar os dentes após as refeições (sem ninguém pedir!)', value: 0.5 },
  { id: 'cama', icon: 'bed', name: 'Arrumar a cama e o quarto', value: 0.5 },
  { id: 'licao', icon: 'pencil', name: 'Fazer a lição de casa', value: 0.5 },
];

const WEEKLY_TASKS = [
  { id: 'lixo', icon: 'trash', name: 'Tirar o lixo de todos os lixos', value: 1.5, due: 5, dueLabel: 'sexta-feira' },
  { id: 'banheiro', icon: 'spray', name: 'Manter o banheiro limpo', value: 1.5, due: 6, dueLabel: 'sábado' },
  { id: 'unhas', icon: 'scissors', name: 'Unhas curtas (mãos e pés)', value: 1.0, due: 0, dueLabel: 'domingo' },
  { id: 'higiene', icon: 'soap', name: 'Umbigo e orelhas limpos', value: 1.0, due: 0, dueLabel: 'domingo' },
  { id: 'escada', icon: 'shoe', name: 'Escada vazia e sapatos arrumados', value: 1.0, due: 0, dueLabel: 'domingo' },
];

const QUICK_DEBITS = [
  { id: 'escola', icon: 'envelope', name: 'Notificação da escola', value: 2.0 },
  { id: 'desobedecer', icon: 'warn', name: 'Desobedecer os pais', value: 1.0 },
  { id: 'biblia', icon: 'bible', name: 'Não levar a Bíblia para a igreja', value: 1.0 },
];

// ---------- DESAFIOS SURPRESA (1 por semana, dia aleatório, só bônus) ----------
const CHALLENGES = [
  '🚗 Tire o lixo de dentro do carro',
  '🍽️ Guarde a louça da lava-louça',
  '🧦 Arrume a gaveta de meias',
  '📖 Leia um livro para a sua irmã',
  '🧸 Arrume os brinquedos da sala da sua irmã',
  '🛒 Ajude a guardar as compras do mercado',
  '🍽️ Arrume a mesa do jantar sem ninguém pedir',
  '🎁 Separe 3 brinquedos ou roupas em bom estado para doar',
  '💬 Faça um elogio sincero para cada pessoa da casa',
  '🧹 Ajude a varrer a casa',
  '📚 Organize a estante ou os livros do quarto',
  '☕ Ajude um adulto a preparar o café da manhã',
  '✉️ Escreva um bilhete de agradecimento para alguém da família',
  '🌱 Ajude a cuidar das plantas de casa',
];

const AVATARS = [
  { id: 'lion', name: 'Leão Corajoso', gems: 0 },
  { id: 'wolf', name: 'Lobo Esperto', gems: 50 },
  { id: 'eagle', name: 'Águia Visionária', gems: 120 },
  { id: 'tiger', name: 'Tigre Veloz', gems: 200 },
  { id: 'dragon', name: 'Dragão Lendário', gems: 320 },
  { id: 'crown', name: 'Rei da Disciplina', gems: 450 },
];

const THEMES = [
  { id: 'azul', name: 'Azul Galáxia', color: '#2563eb', gems: 0 },
  { id: 'verde', name: 'Verde Floresta', gems: 80, color: '#059669' },
  { id: 'roxo', name: 'Roxo Místico', gems: 160, color: '#7c3aed' },
  { id: 'laranja', name: 'Laranja Fogo', gems: 260, color: '#ea580c' },
  { id: 'dourado', name: 'Dourado Real', gems: 400, color: '#b45309' },
];
