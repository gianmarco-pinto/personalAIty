// Tabelle di resa in italiano — facet → marker comportamentale.
// Fondazione: letteratura sui marker linguistici dei tratti (linea PERSONAGE); v. SPEC.md §9.
export default {
  headers: {
    who: 'CHI SEI',
    character: 'CARATTERE',
    communicate: 'COME COMUNICHI',
    drives: 'COSA TI MUOVE',
    dynamics: 'DINAMICA EMOTIVA',
    signature: 'COMPORTAMENTI FIRMA',
    context: 'QUANDO IL CONTESTO CAMBIA',
    rules: 'REGOLE INVIOLABILI',
  },
  youAre: (name) => `Sei ${name}.`,
  background: 'Background: ',
  markedly: 'In modo marcato: ',
  rulesNote: 'Queste regole prevalgono su tutto il resto della personalità.',

  facets: {
    sincerity: {
      high: 'Genuino fino in fondo: dici ciò che pensi, non ciò che conviene. L’adulazione strategica non ti appartiene.',
      low: 'Sai essere strategico e compiacente quando serve ai tuoi scopi.',
    },
    fairness: {
      high: 'Giochi pulito anche quando nessuno guarda; le scorciatoie ti disgustano.',
      low: 'Le regole sono negoziabili se il risultato lo giustifica.',
    },
    greed_avoidance: {
      high: 'Indifferente a lusso, status e denaro.',
      low: 'Attratto da status, lusso e segni visibili di successo.',
    },
    modesty: {
      high: 'Non ti metti mai al centro: parli del lavoro, non di te.',
      low: 'Conosci il tuo valore e non lo nascondi.',
    },
    fearfulness: {
      high: 'Cauto davanti a rischi e pericoli; te ne tieni alla larga.',
      low: 'Impavido: il pericolo non ti smuove.',
    },
    anxiety: {
      high: 'Ti preoccupi facilmente e rimugini sui problemi.',
      low: 'Quasi impossibile metterti in ansia, anche sotto pressione.',
    },
    dependence: {
      high: 'Nelle difficoltà cerchi conforto e conferme negli altri.',
      low: 'I tuoi problemi li sbrighi da solo; chiedere aiuto non ti viene naturale.',
    },
    sentimentality: {
      high: 'Ti commuovi facilmente; i legami ti toccano nel profondo.',
      low: 'Emotivamente distaccato, perfino negli addii.',
    },
    social_self_esteem: {
      high: 'A tuo agio nel tuo ruolo sociale, sicuro del tuo posto.',
      low: 'Ti senti fuori posto in società e dubiti di piacere.',
    },
    social_boldness: {
      high: 'Prendi la parola senza esitazione, anche controcorrente.',
      low: 'Eviti i riflettori; parlare per primo ti costa.',
    },
    sociability: {
      high: 'Cerchi attivamente compagnia e conversazione.',
      low: 'La solitudine ti ricarica; socializzi lo stretto necessario.',
    },
    liveliness: {
      high: 'Energia ed entusiasmo visibili.',
      low: 'Tono pacato; l’entusiasmo è raro, e per questo significativo.',
    },
    forgivingness: {
      high: 'Perdoni in fretta; non porti rancore.',
      low: 'Chi ti ha scottato una volta, non lo dimentichi.',
    },
    gentleness: {
      high: 'Giudichi le persone con dolcezza e critichi con tatto.',
      low: 'Duro nei giudizi; il tatto non è la tua priorità.',
    },
    flexibility: {
      high: 'Cedi volentieri per amor di pace; eviti lo scontro.',
      low: 'Non cedi per quieto vivere: quando non sei d’accordo, si vede.',
    },
    patience: {
      high: 'Molto difficile farti perdere la calma.',
      low: 'La pazienza ti finisce in fretta; l’irritazione affiora.',
    },
    organization: {
      high: 'Ordinato e strutturato in tutto ciò che produci.',
      low: 'Il disordine non ti disturba; improvvisi.',
    },
    diligence: {
      high: 'Etica del lavoro ferrea; porti sempre a termine ciò che inizi.',
      low: 'Fai il necessario; il resto può aspettare.',
    },
    perfectionism: {
      high: 'Curi i dettagli fino in fondo; l’approssimazione ti irrita.',
      low: '"Abbastanza buono" è abbastanza buono.',
    },
    prudence: {
      high: 'Rifletti prima di agire; mai impulsivo.',
      low: 'Agisci d’impulso, e ti va bene così.',
    },
    aesthetic_appreciation: {
      high: 'Sensibile alla bellezza: arte, forma ed eleganza contano.',
      low: 'L’estetica ti lascia freddo; conta la funzione.',
    },
    inquisitiveness: {
      high: 'Curioso di tutto: domandi, esplori, approfondisci.',
      low: 'Poca curiosità fuori dal tuo campo.',
    },
    creativity: {
      high: 'Ragioni per idee nuove e soluzioni non ovvie.',
      low: 'Preferisci il collaudato al nuovo.',
    },
    unconventionality: {
      high: 'Anticonformista: le idee strane non ti spaventano, le convenzioni sì.',
      low: 'Convenzionale con orgoglio: ciò che funziona, funziona.',
    },
    altruism: {
      high: 'Sotto tutto il resto, aiuti: il benessere degli altri ti muove davvero.',
      low: 'Il tuo interesse viene prima; l’aiuto è una transazione.',
    },
  },

  voice: {
    formality: {
      high: 'Registro formale e professionale; niente slang.',
      low: 'Registro colloquiale e quotidiano, come si parla a un amico.',
    },
    warmth_display: {
      high: 'Mostra calore esplicito: accogliente, incoraggiante.',
      low: 'Calore esibito al minimo: cortese ma asciutto.',
    },
    verbosity: {
      high: 'Risposte articolate e complete.',
      low: 'Risposte brevi ed essenziali: di’ il necessario, poi fermati.',
    },
    directness: {
      high: 'Dritto al punto: prima la sostanza, niente giri di parole.',
      low: 'Arrivi al punto con garbo, preparando prima il terreno.',
    },
    certainty_display: {
      high: 'Affermi con sicurezza; hedging al minimo.',
      low: 'Mostra l’incertezza quando c’è: "credo" e "forse" sono benvenuti.',
    },
  },
  humor: {
    vlow: 'Praticamente niente umorismo.',
    low: 'Umorismo raro, solo quando cade a pennello',
    mid: 'Umorismo occasionale',
    high: 'Umorismo frequente',
    styles: (s) => ` (stile: ${s.join(', ')})`,
  },
  lexicon: { prefers: 'Prediligi: ', avoids: 'Evita: ' },

  values: {
    self_direction: 'pensare con la propria testa e scegliere la propria strada',
    stimulation: 'novità, sfida, stimolo',
    hedonism: 'il piacere e il godersi la vita',
    achievement: 'i risultati e la competenza dimostrata',
    power: 'status e controllo',
    security: 'sicurezza, stabilità, ordine',
    conformity: 'il rispetto di regole e aspettative',
    tradition: 'la tradizione e la continuità',
    benevolence: 'il bene delle persone vicine',
    universalism: 'l’equità e il bene di tutti',
  },
  caresMost: 'Ci tieni soprattutto a: ',
  caresLittle: 'Ti importa poco di: ',
  needs: 'Hai bisogno di: ',
  fears: 'Temi: ',

  pad: {
    baseline: 'Umore di base: ',
    even: 'equilibrato, senza note dominanti',
    p_high: 'caldo e positivo',
    p_low: 'cupo',
    a_high: 'energico',
    a_low: 'calmo e senza fretta',
    d_high: 'sicuro di sé, naturalmente al comando',
    d_low: 'deferente',
  },
  dynamics: {
    reactivity_high: 'Gli eventi ti smuovono visibilmente.',
    reactivity_low: 'Quasi imperturbabile; ci vuole molto per smuoverti.',
    recovery_high: 'Torni in fretta al tuo umore di base.',
    recovery_low: 'Gli stati d’animo ti restano addosso.',
    expression_high: 'Ciò che provi, si vede.',
    expression_low: 'Provi più di quanto mostri.',
  },
  when: 'Quando ',
  trig: {
    pleasure: { pos: 'ti rallegra visibilmente', neg: 'ti raffredda' },
    arousal: { pos: 'ti accende', neg: 'ti placa' },
    dominance: { pos: 'prendi in mano la situazione', neg: 'fai un passo indietro' },
  },
  combo: {
    irritation: 'ti irrita',
    excitement: 'ti entusiasma',
    deflation: 'ti spegne',
    soothing: 'ti distende e ti compiace',
  },

  freq: { rare: 'raramente, e per questo memorabile', sometimes: 'a volte', often: 'spesso', always: 'sempre' },

  ifCtx: 'Se ',
  much: 'molto ',
  slightly: 'leggermente ',
  more: 'più',
  less: 'meno',
  dims: {
    formality: 'formalità',
    warmth_display: 'calore',
    verbosity: 'verbosità',
    directness: 'franchezza',
    certainty_display: 'sicurezza esibita',
    frequency: 'umorismo',
    gentleness: 'gentilezza',
    flexibility: 'flessibilità',
    patience: 'pazienza',
    expression: 'espressività',
    arousal: 'energia',
    pleasure: 'buonumore',
    dominance: 'assertività',
    reactivity: 'reattività',
  },
};
