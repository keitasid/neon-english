// NEON ENGLISH — Immersion Scenarios (Mode Immersion Réaliste)
// 7 Real-life conversation situations with target vocabulary, audio playback and shadowing prompts.

window.IMMERSION_SCENARIOS = [
  {
    id: "cafe",
    icon: "☕",
    title: "At the Coffee Shop",
    desc: "Ordering artisan coffee and making polite conversation with the barista.",
    dialogue: [
      {
        speaker: "Barista",
        role: "local",
        text: "Good morning! What can I get started for you today?",
        translation: "Bonjour ! Que puis-je vous préparer aujourd'hui ?",
        audio: "Good morning! What can I get started for you today?"
      },
      {
        speaker: "You",
        role: "user",
        text: "Hi there! I'll have an oat flat white, please. Do you have any fresh pastries?",
        translation: "Bonjour ! Je vais prendre un flat white au lait d'avoine, s'il vous plaît. Avez-vous des viennoiseries fraîches ?",
        audio: "Hi there! I'll have an oat flat white, please. Do you have any fresh pastries?"
      },
      {
        speaker: "Barista",
        role: "local",
        text: "We just took out some almond croissants and cinnamon buns. Highly recommended!",
        translation: "Nous venons tout juste de sortir des croissants aux amandes et des roulés à la cannelle. Je vous les recommande vivement !",
        audio: "We just took out some almond croissants and cinnamon buns. Highly recommended!"
      },
      {
        speaker: "You",
        role: "user",
        text: "Sounds great, I'll take an almond croissant. Is there Wi-Fi available for working?",
        translation: "Ça a l'air délicieux, je prends un croissant aux amandes. Y a-t-il du Wi-Fi pour travailler ?",
        audio: "Sounds great, I'll take an almond croissant. Is there Wi-Fi available for working?"
      },
      {
        speaker: "Barista",
        role: "local",
        text: "Yes, the network code is printed right at the bottom of your receipt. That will be $7.50.",
        translation: "Oui, le code du réseau est imprimé tout en bas de votre reçu. Cela fera 7,50 $.",
        audio: "Yes, the network code is printed right at the bottom of your receipt. That will be 7 dollars and 50 cents."
      }
    ]
  },
  {
    id: "supermarket",
    icon: "🛒",
    title: "Grocery Shopping",
    desc: "Finding organic ingredients, asking for recommendations and checkout.",
    dialogue: [
      {
        speaker: "You",
        role: "user",
        text: "Excuse me, could you tell me where I can find the organic spices and olive oil?",
        translation: "Excusez-moi, pourriez-vous me dire où se trouvent les épices bio et l'huile d'olive ?",
        audio: "Excuse me, could you tell me where I can find the organic spices and olive oil?"
      },
      {
        speaker: "Clerk",
        role: "local",
        text: "Sure thing! Aisle 4 on your left, right next to the imported sauces.",
        translation: "Bien sûr ! Allée 4 sur votre gauche, juste à côté des sauces importées.",
        audio: "Sure thing! Aisle 4 on your left, right next to the imported sauces."
      },
      {
        speaker: "You",
        role: "user",
        text: "Thank you! Also, do you sell fresh sourdough bread here?",
        translation: "Merci ! Aussi, vendez-vous du pain au levain frais ici ?",
        audio: "Thank you! Also, do you sell fresh sourdough bread here?"
      },
      {
        speaker: "Clerk",
        role: "local",
        text: "Yes, in the bakery section near the entrance. The local bakery delivers every morning.",
        translation: "Oui, au rayon boulangerie près de l'entrée. La boulangerie locale livre chaque matin.",
        audio: "Yes, in the bakery section near the entrance. The local bakery delivers every morning."
      }
    ]
  },
  {
    id: "housing",
    icon: "🏠",
    title: "Hotel & Apartment Check-in",
    desc: "Checking in, requesting a quiet room and understanding building rules.",
    dialogue: [
      {
        speaker: "Receptionist",
        role: "local",
        text: "Welcome to The Grand! Do you have a reservation with us?",
        translation: "Bienvenue au Grand ! Avez-vous une réservation chez nous ?",
        audio: "Welcome to The Grand! Do you have a reservation with us?"
      },
      {
        speaker: "You",
        role: "user",
        text: "Hello! Yes, under the name of Keita for three nights. Is it possible to have a room on a high floor?",
        translation: "Bonjour ! Oui, au nom de Keita pour trois nuits. Est-il possible d'avoir une chambre à un étage élevé ?",
        audio: "Hello! Yes, under the name of Keita for three nights. Is it possible to have a room on a high floor?"
      },
      {
        speaker: "Receptionist",
        role: "local",
        text: "Let me check... Yes, I have a quiet room on the 8th floor with a courtyard view. Here is your keycard.",
        translation: "Laissez-moi vérifier... Oui, j'ai une chambre calme au 8ème étage avec vue sur la cour. Voici votre carte d'accès.",
        audio: "Let me check... Yes, I have a quiet room on the 8th floor with a courtyard view. Here is your keycard."
      },
      {
        speaker: "You",
        role: "user",
        text: "Perfect. What time is breakfast served in the morning?",
        translation: "Parfait. À quelle heure est servi le petit-déjeuner le matin ?",
        audio: "Perfect. What time is breakfast served in the morning?"
      }
    ]
  },
  {
    id: "transport",
    icon: "🚆",
    title: "Train Station & Commute",
    desc: "Buying express tickets, inquiring about platforms and train connections.",
    dialogue: [
      {
        speaker: "You",
        role: "user",
        text: "Hi, I'd like a return ticket to Oxford departing this afternoon, please.",
        translation: "Bonjour, j'aimerais un aller-retour pour Oxford au départ de cet après-midi, s'il vous plaît.",
        audio: "Hi, I would like a return ticket to Oxford departing this afternoon, please."
      },
      {
        speaker: "Agent",
        role: "local",
        text: "The next direct train leaves from Platform 3 in twenty minutes. Would you like standard or first class?",
        translation: "Le prochain train direct part de la voie 3 dans vingt minutes. Souhaitez-vous la classe standard ou première ?",
        audio: "The next direct train leaves from Platform 3 in twenty minutes. Would you like standard or first class?"
      },
      {
        speaker: "You",
        role: "user",
        text: "Standard is fine. Is there a connection or is it non-stop?",
        translation: "Standard, c'est très bien. Y a-t-il une correspondance ou est-ce direct ?",
        audio: "Standard is fine. Is there a connection or is it non-stop?"
      },
      {
        speaker: "Agent",
        role: "local",
        text: "It is direct, journey time is approximately 52 minutes. Have a pleasant trip!",
        translation: "C'est direct, la durée du trajet est d'environ 52 minutes. Bon voyage !",
        audio: "It is direct, journey time is approximately 52 minutes. Have a pleasant trip!"
      }
    ]
  },
  {
    id: "work",
    icon: "💼",
    title: "Job Meeting & Project Review",
    desc: "Discussing quarterly milestones, resource allocation and risk mitigation.",
    dialogue: [
      {
        speaker: "Colleague",
        role: "local",
        text: "Thanks for joining. Let's benchmark our performance against our initial forecast.",
        translation: "Merci d'être là. Comparons nos performances par rapport à nos prévisions initiales.",
        audio: "Thanks for joining. Let us benchmark our performance against our initial forecast."
      },
      {
        speaker: "You",
        role: "user",
        text: "Overall we are outperforming the baseline, but supply chain volatility remains a potential threat.",
        translation: "Dans l'ensemble, nous dépassons la base de référence, mais la volatilité de la chaîne d'approvisionnement reste une menace potentielle.",
        audio: "Overall we are outperforming the baseline, but supply chain volatility remains a potential threat."
      },
      {
        speaker: "Colleague",
        role: "local",
        text: "Agreed. What measures should we undertake to mitigate that risk before Q3?",
        translation: "D'accord. Quelles mesures devons-nous entreprendre pour atténuer ce risque avant le T3 ?",
        audio: "Agreed. What measures should we undertake to mitigate that risk before Q3?"
      },
      {
        speaker: "You",
        role: "user",
        text: "We should diversify our supplier contracts and maintain a safety buffer of inventory.",
        translation: "Nous devrions diversifier nos contrats fournisseurs et maintenir un stock de sécurité.",
        audio: "We should diversify our supplier contracts and maintain a safety buffer of inventory."
      }
    ]
  },
  {
    id: "restaurant",
    icon: "🍝",
    title: "Dining at the Restaurant",
    desc: "Booking a table, inquiring about chef specialties and settling the bill.",
    dialogue: [
      {
        speaker: "Waiter",
        role: "local",
        text: "Good evening! Welcome. Do you have a table booked for tonight?",
        translation: "Bonsoir ! Bienvenue. Avez-vous une table réservée pour ce soir ?",
        audio: "Good evening! Welcome. Do you have a table booked for tonight?"
      },
      {
        speaker: "You",
        role: "user",
        text: "Good evening. A table for two by the window, under the name Keita.",
        translation: "Bonsoir. Une table pour deux près de la fenêtre, au nom de Keita.",
        audio: "Good evening. A table for two by the window, under the name Keita."
      },
      {
        speaker: "Waiter",
        role: "local",
        text: "Right this way. Tonight's special is roasted sea bass with lemon butter sauce.",
        translation: "Par ici. La suggestion du chef ce soir est le bar rôti avec une sauce au beurre citronné.",
        audio: "Right this way. Tonight's special is roasted sea bass with lemon butter sauce."
      },
      {
        speaker: "You",
        role: "user",
        text: "That sounds wonderful. We'll start with sparkling water and the sea bass.",
        translation: "Ça a l'air délicieux. Nous allons commencer avec de l'eau gazeuse et le bar.",
        audio: "That sounds wonderful. We will start with sparkling water and the sea bass."
      }
    ]
  },
  {
    id: "social",
    icon: "🗣️",
    title: "Everyday Social Conversation",
    desc: "Meeting a friend, discussing weekend plans, culture and tech trends.",
    dialogue: [
      {
        speaker: "Friend",
        role: "local",
        text: "Hey! How have you been? Long time no see!",
        translation: "Salut ! Comment vas-tu ? Ça fait un bail !",
        audio: "Hey! How have you been? Long time no see!"
      },
      {
        speaker: "You",
        role: "user",
        text: "Hey! I've been doing great. I recently got into this daily language habit and it's sticking!",
        translation: "Salut ! Ça va super. J'ai récemment pris cette habitude d'apprentissage quotidien et ça commence à bien rentrer !",
        audio: "Hey! I have been doing great. I recently got into this daily language habit and it is sticking!"
      },
      {
        speaker: "Friend",
        role: "local",
        text: "That's fantastic! Are you free this weekend to catch up over brunch?",
        translation: "C'est génial ! Es-tu libre ce week-end pour qu'on se retrouve autour d'un brunch ?",
        audio: "That is fantastic! Are you free this weekend to catch up over brunch?"
      },
      {
        speaker: "You",
        role: "user",
        text: "Definitely! Sunday morning works best for me. Let's pick a spot downtown.",
        translation: "Carrément ! Dimanche matin me convient parfaitement. Choisissons un endroit en centre-ville.",
        audio: "Definitely! Sunday morning works best for me. Let us pick a spot downtown."
      }
    ]
  }
];
