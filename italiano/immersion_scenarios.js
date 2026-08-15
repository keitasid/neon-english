// NEON ITALIANO — Scenari d'Immersione (Situazioni di vita reale in Italia)
// 7 Real-life contextual situations with Italian vocabulary, audio playback and shadowing prompts.

window.ITALIANO_IMMERSION_SCENARIOS = [
  {
    id: "cafe",
    icon: "☕",
    title: "Al Bar / Al Caffè",
    desc: "Ordinare un caffè al banco, cornetto e scambiare due parole.",
    dialogue: [
      {
        speaker: "Barista",
        role: "local",
        text: "Buongiorno! Cosa ti porto oggi?",
        translation: "Bonjour ! Que puis-je vous servir aujourd'hui ?",
        audio: "Buongiorno! Cosa ti porto oggi?"
      },
      {
        speaker: "Tu",
        role: "user",
        text: "Buongiorno! Un espresso e un cornetto alla crema, per favore. Il caffè è al banco?",
        translation: "Bonjour ! Un espresso et un croissant à la crème, s'il vous plaît. Le café se prend au comptoir ?",
        audio: "Buongiorno! Un espresso e un cornetto alla crema, per favore. Il caffè è al banco?"
      },
      {
        speaker: "Barista",
        role: "local",
        text: "Sì, accomodati pure qui al banco. Ti lascio anche un bicchier d'acqua naturale.",
        translation: "Oui, installe-toi bien ici au comptoir. Je te laisse aussi un verre d'eau plate.",
        audio: "Sì, accomodati pure qui al banco. Ti lascio anche un bicchier d'acqua naturale."
      },
      {
        speaker: "Tu",
        role: "user",
        text: "Grazie mille! Quant'è in tutto? Pago con la carta.",
        translation: "Merci mille fois ! Combien cela fait au total ? Je paie par carte.",
        audio: "Grazie mille! Quant'è in tutto? Pago con la carta."
      },
      {
        speaker: "Barista",
        role: "local",
        text: "Sono due euro e cinquanta. Fai pure contactless. Buona giornata!",
        translation: "Cela fait deux euros cinquante. Passe en sans-contact. Bonne journée !",
        audio: "Sono due euro e cinquanta. Fai pure contactless. Buona giornata!"
      }
    ]
  },
  {
    id: "supermarket",
    icon: "🛒",
    title: "Fare la Spesa al Supermercato",
    desc: "Cercare ingredienti freschi, chiedere al banco gastronomia e pagare.",
    dialogue: [
      {
        speaker: "Tu",
        role: "user",
        text: "Mi scusi, dove posso trovare l'olio extravergine d'oliva e la passata di pomodoro?",
        translation: "Excusez-moi, où puis-je trouver l'huile d'olive extra-vierge et le coulis de tomate ?",
        audio: "Mi scusi, dove posso trovare l'olio extravergine d'oliva e la passata di pomodoro?"
      },
      {
        speaker: "Commesso",
        role: "local",
        text: "Corsia tre, subito sulla destra vicino alla pasta artigianale.",
        translation: "Allée trois, tout de suite sur la droite près des pâtes artisanales.",
        audio: "Corsia tre, subito sulla destra vicino alla pasta artigianale."
      },
      {
        speaker: "Tu",
        role: "user",
        text: "Perfetto, grazie! Vorrei anche duecento grammi di parmigiano reggiano stagionato al banco.",
        translation: "Parfait, merci ! J'aimerais aussi deux cents grammes de parmesan affiné au rayon fromage.",
        audio: "Perfetto, grazie! Vorrei anche duecento grammi di parmigiano reggiano stagionato al banco."
      },
      {
        speaker: "Commesso",
        role: "local",
        text: "Certamente, ti servo subito. Stagionatura ventiquattro o trentasei mesi?",
        translation: "Certainement, je vous sers tout de suite. Affinage 24 ou 36 mois ?",
        audio: "Certamente, ti servo subito. Stagionatura ventiquattro o trentasei mesi?"
      }
    ]
  },
  {
    id: "housing",
    icon: "🏠",
    title: "Check-in Alloggio & Hotel",
    desc: "Arrivo all'appartamento, chiavi e informazioni sul quartiere.",
    dialogue: [
      {
        speaker: "Host",
        role: "local",
        text: "Benvenuto a Roma! Hai fatto un buon viaggio?",
        translation: "Bienvenue à Rome ! Avez-vous fait bon voyage ?",
        audio: "Benvenuto a Roma! Hai fatto un buon viaggio?"
      },
      {
        speaker: "Tu",
        role: "user",
        text: "Sì, tutto benissimo! Ci siamo sbrigati con i bagagli e siamo arrivati facilmente.",
        translation: "Oui, tout s'est très bien passé ! Nous avons fait vite avec les bagages et sommes arrivés facilement.",
        audio: "Sì, tutto benissimo! Ci siamo sbrigati con i bagagli e siamo arrivati facilmente."
      },
      {
        speaker: "Host",
        role: "local",
        text: "Ecco le chiavi. Il Wi-Fi è indicato sul modem. Se hai bisogno di qualcosa, fammi sapere.",
        translation: "Voici les clés. Le Wi-Fi est indiqué sur la box. Si vous avez besoin de quoi que ce soit, faites-le moi savoir.",
        audio: "Ecco le chiavi. Il Wi-Fi è indicato sul modem. Se hai bisogno di qualcosa, fammi sapere."
      },
      {
        speaker: "Tu",
        role: "user",
        text: "Grazie mille! C'è una farmacia o una panetteria aperta nelle vicinanze?",
        translation: "Merci beaucoup ! Y a-t-il une pharmacie ou une boulangerie ouverte à proximité ?",
        audio: "Grazie mille! C'è una farmacia o una panetteria aperta nelle vicinanze?"
      }
    ]
  },
  {
    id: "transport",
    icon: "🚆",
    title: "In Stazione & Treno",
    desc: "Acquistare un biglietto Frecciarossa e trovare il binario.",
    dialogue: [
      {
        speaker: "Tu",
        role: "user",
        text: "Salve, vorrei un biglietto per Firenze sul prossimo treno ad alta velocità.",
        translation: "Bonjour, je voudrais un billet pour Florence sur le prochain train à grande vitesse.",
        audio: "Salve, vorrei un biglietto per Firenze sul prossimo treno ad alta velocità."
      },
      {
        speaker: "Biglietteria",
        role: "local",
        text: "Il Frecciarossa parte dal binario 8 alle 14:25. Preferisci posto corridoio o finestrino?",
        translation: "Le Frecciarossa part de la voie 8 à 14h25. Préférez-vous une place couloir ou fenêtre ?",
        audio: "Il Frecciarossa parte dal binario otto alle quattordici e venticinque. Preferisci posto corridoio o finestrino?"
      },
      {
        speaker: "Tu",
        role: "user",
        text: "Finestrino, grazie. Il biglietto è già convalidato digitalmente?",
        translation: "Fenêtre, merci. Le billet est déjà composté numériquement ?",
        audio: "Finestrino, grazie. Il biglietto è già convalidato digitalmente?"
      },
      {
        speaker: "Biglietteria",
        role: "local",
        text: "Esatto, basta mostrare il codice QR al controllore a bordo. Buon viaggio!",
        translation: "Exactement, il suffit de montrer le QR code au contrôleur à bord. Bon voyage !",
        audio: "Esatto, basta mostrare il codice QR al controllore a bordo. Buon viaggio!"
      }
    ]
  },
  {
    id: "work",
    icon: "💼",
    title: "Lavoro & Riunione d'Affari",
    desc: "Presentare un progetto, discutere scadenze e accordarsi con i colleghi.",
    dialogue: [
      {
        speaker: "Collega",
        role: "local",
        text: "Ciao Keita, facciamo il punto della situazione sul progetto prima della scadenza?",
        translation: "Salut Keita, faisons le point sur la situation du projet avant la date limite ?",
        audio: "Ciao Keita, facciamo il punto della situazione sul progetto prima della scadenza?"
      },
      {
        speaker: "Tu",
        role: "user",
        text: "Certamente! Abbiamo svolto la maggior parte dei compiti e tenuto conto dei vincoli.",
        translation: "Certainement ! Nous avons effectué la plupart des tâches et tenu compte des contraintes.",
        audio: "Certamente! Abbiamo svolto la maggior parte dei compiti e tenuto conto dei vincoli."
      },
      {
        speaker: "Collega",
        role: "local",
        text: "Ottimo lavoro. Pensi che riusciremo a consegnare la relazione completa entro venerdì?",
        translation: "Excellent travail. Penses-tu que nous réussirons à livrer le rapport complet d'ici vendredi ?",
        audio: "Ottimo lavoro. Pensi che riusciremo a consegnare la relazione completa entro venerdì?"
      },
      {
        speaker: "Tu",
        role: "user",
        text: "Sì, ce la facciamo senza problemi. Ci penso io a rivedere i dettagli finali.",
        translation: "Oui, nous y arriverons sans problème. Je m'occupe de réviser les détails finaux.",
        audio: "Sì, ce la facciamo senza problemi. Ci penso io a rivedere i dettagli finali."
      }
    ]
  },
  {
    id: "restaurant",
    icon: "🍝",
    title: "A Cena in Trattoria",
    desc: "Consigli dello chef, ordinare piatti tipici e conto.",
    dialogue: [
      {
        speaker: "Cameriere",
        role: "local",
        text: "Buonasera! Vi siete già fatti un'idea o volete qualche consiglio del giorno?",
        translation: "Bonsoir ! Vous vous êtes déjà fait une idée ou vous voulez quelques suggestions du jour ?",
        audio: "Buonasera! Vi siete già fatti un'idea o volete qualche consiglio del giorno?"
      },
      {
        speaker: "Tu",
        role: "user",
        text: "Buonasera! Cosa ci consiglia come primo piatto tipico della casa?",
        translation: "Bonsoir ! Que nous conseillez-vous comme premier plat typique de la maison ?",
        audio: "Buonasera! Cosa ci consiglia come primo piatto tipico della casa?"
      },
      {
        speaker: "Cameriere",
        role: "local",
        text: "Oggi abbiamo tagliatelle fatte a mano al ragù bianco di cinta senese. Squisite!",
        translation: "Aujourd'hui nous avons des tagliatelles faites maison au ragoût blanc. Exquises !",
        audio: "Oggi abbiamo tagliatelle fatte a mano al ragù bianco. Squisite!"
      },
      {
        speaker: "Tu",
        role: "user",
        text: "Prendiamo due tagliatelle e una bottiglia di Chianti classico, grazie.",
        translation: "Nous prenons deux tagliatelles et une bouteille de Chianti classique, merci.",
        audio: "Prendiamo due tagliatelle e una bottiglia di Chianti classico, grazie."
      }
    ]
  },
  {
    id: "social",
    icon: "🗣️",
    title: "Conversazione Quotidiana con Amici",
    desc: "Incontrare un amico, parlare del tempo libero e organizzare un'uscita.",
    dialogue: [
      {
        speaker: "Amico",
        role: "local",
        text: "Ciao! Da quanto tempo! Come te la cavi ultimamente con l'italiano?",
        translation: "Salut ! Ça fait un bail ! Comment tu te débrouilles ces derniers temps en italien ?",
        audio: "Ciao! Da quanto tempo! Come te la cavi ultimamente con l'italiano?"
      },
      {
        speaker: "Tu",
        role: "user",
        text: "Ciao! Me la cavo sempre meglio, sto migliorando la pronuncia ogni giorno con il shadowing.",
        translation: "Salut ! Je me débrouille de mieux en mieux, j'améliore la prononciation chaque jour avec le shadowing.",
        audio: "Ciao! Me la cavo sempre meglio, sto migliorando la pronuncia ogni giorno con il shadowing."
      },
      {
        speaker: "Amico",
        role: "local",
        text: "Si sente davvero, parli molto più sciolto! Ti va di fare un aperitivo questo fine settimana?",
        translation: "Ça s'entend vraiment, tu parles beaucoup plus couramment ! Ça te dit de prendre un apéro ce week-end ?",
        audio: "Si sente davvero, parli molto più sciolto! Ti va di fare un aperitivo questo fine settimana?"
      },
      {
        speaker: "Tu",
        role: "user",
        text: "Magari! Sabato pomeriggio per me è perfetto. Ci aggiorniamo per il posto!",
        translation: "Avec grand plaisir ! Samedi après-midi pour moi c'est parfait. On se tient au courant pour l'endroit !",
        audio: "Magari! Sabato pomeriggio per me è perfetto. Ci aggiorniamo per il posto!"
      }
    ]
  }
];
