/**
 * NEON ENGLISH — Corpus Pédagogique Officiel BFEM & BAC Sénégal
 * Adapté aux réalités académiques, environnementales et culturelles du Sénégal.
 */
const SENEGAL_ACADEMIC_VOCAB = [
  {
    id: "eng_01",
    word: "Achieve",
    phonetic: "/əˈtʃiːv/",
    meaning: "Accomplir, réussir, atteindre un objectif élevé avec mérite.",
    culturalHook: "🇸🇳 Ancrage : Pense à la réussite au Bac à Thiès ou Saint-Louis. L'effort collectif menant au succès.",
    synonyms: ["Accomplish", "Attain", "Reach", "Fulfill"],
    antonyms: ["Fail", "Forfeit", "Give up"],
    collocations: ["Achieve success", "Achieve a goal", "Achieve high marks in Bac"],
    sampleSentence: "Senegalese students work hard throughout the year to achieve excellence in the Baccalauréat.",
    story: "Au lycée Malick Sy de Thiès, Fatou étudie avec persévérance chaque soir pour achieve son rêve d'intégrer l'université.",
    level: "BFEM / BAC"
  },
  {
    id: "eng_02",
    word: "Sustainable",
    phonetic: "/səˈsteɪ.nə.bəl/",
    meaning: "Durable, respectueux de l'environnement, viable sur le long terme.",
    culturalHook: "🌾 Ancrage : L'agriculture maraîchère des Niayes et l'irrigation solaire de l'arachide.",
    synonyms: ["Renewable", "Enduring", "Eco-friendly", "Viable"],
    antonyms: ["Unsustainable", "Harmful", "Short-lived"],
    collocations: ["Sustainable agriculture", "Sustainable development", "Sustainable energy"],
    sampleSentence: "Drip irrigation is a sustainable farming technique for Senegalese farmers facing climate change.",
    story: "Modou installe un système d'énergie solaire dans les champs de Louga pour développer une agriculture sustainable.",
    level: "BAC S / L"
  },
  {
    id: "eng_03",
    word: "Persevere",
    phonetic: "/ˌpɜː.sɪˈvɪər/",
    meaning: "Persévérer, continuer avec détermination malgré les difficultés.",
    culturalHook: "🤼 Ancrage : Comme le lutteur de l'arène nationale (Laamb) qui refuse d'abandonner le combat.",
    synonyms: ["Persist", "Endure", "Carry on", "Hold out"],
    antonyms: ["Surrender", "Quit", "Give in"],
    collocations: ["Persevere despite obstacles", "Persevere in studies", "Persevere with patience"],
    sampleSentence: "You must persevere when math equations and grammar rules seem challenging.",
    story: "Moussa avait des difficultés en probabilités, mais il a choisi de persevere avec SunuMind jusqu'à maîtriser le sujet.",
    level: "BFEM / BAC"
  },
  {
    id: "eng_04",
    word: "Empower",
    phonetic: "/ɪmˈpaʊ.ər/",
    meaning: "Autonomiser, donner les moyens et la capacité d'agir.",
    culturalHook: "💡 Ancrage : Donner du pouvoir aux jeunes et aux femmes des zones rurales par l'éducation.",
    synonyms: ["Enable", "Authorize", "Equip", "Strengthen"],
    antonyms: ["Disempower", "Restrict", "Weaken"],
    collocations: ["Empower youth", "Empower women", "Empower students through education"],
    sampleSentence: "Quality education empowers young girls in Casamance to become leaders in technology.",
    story: "La coopérative locale utilise le numérique pour empower les jeunes diplômés et dynamiser l'économie locale.",
    level: "BAC L / S"
  },
  {
    id: "eng_05",
    word: "Fulfill",
    phonetic: "/fʊlˈfɪl/",
    meaning: "Réaliser, concrétiser un espoir, une vocation ou un devoir.",
    culturalHook: "📜 Ancrage : Honorer la promesse faite à sa famille d'apporter le savoir au village.",
    synonyms: ["Satisfy", "Execute", "Realize", "Complete"],
    antonyms: ["Neglect", "Breach", "Fail"],
    collocations: ["Fulfill a promise", "Fulfill requirements", "Fulfill potential"],
    sampleSentence: "Amina fulfilled her dream of becoming a civil engineer in Dakar after winning a scholarship.",
    story: "Après des mois de révisions intenses, Amina a pu fulfill ses ambitions académiques avec mention Très Bien.",
    level: "BFEM / BAC"
  },
  {
    id: "eng_06",
    word: "Resilience",
    phonetic: "/rɪˈzɪl.jəns/",
    meaning: "Résilience, capacité à surmonter les crises et à rebondir.",
    culturalHook: "🌳 Ancrage : Le baobab ancestral qui endure les saisons sèches sans jamais perdre sa force.",
    synonyms: ["Fortitude", "Toughness", "Adaptability", "Grit"],
    antonyms: ["Fragility", "Vulnerability"],
    collocations: ["Show resilience", "Build resilience", "Climate resilience"],
    sampleSentence: "Senegalese rural communities display remarkable resilience against severe droughts.",
    story: "Face au manque d'eau, le village de Linguère a fait preuve de resilience en créant un bassin communautaire.",
    level: "BAC S / L"
  },
  {
    id: "eng_07",
    word: "Overcome",
    phonetic: "/ˌəʊ.vəˈkʌm/",
    meaning: "Surmonter un obstacle, triompher d'une épreuve.",
    culturalHook: "🏃 Ancrage : Franchir la ligne d'arrivée avec le diplôme du Baccalauréat en main.",
    synonyms: ["Conquer", "Surmount", "Defeat", "Master"],
    antonyms: ["Succumb", "Yield", "Lose"],
    collocations: ["Overcome obstacles", "Overcome fear", "Overcome challenges"],
    sampleSentence: "With dedicated practice and guidance, every student can overcome difficult exam questions.",
    story: "Ibrahima redoutait l'épreuve écrite d'anglais, mais la méthode NEON lui a permis d'overcome ses appréhensions.",
    level: "BFEM / BAC"
  },
  {
    id: "eng_08",
    word: "Strive",
    phonetic: "/straɪv/",
    meaning: "S'efforcer énergiquement, viser haut avec passion.",
    culturalHook: "🌟 Ancrage : Viser la mention Très Bien au Concours Général et au Baccalauréat.",
    synonyms: ["Endeavor", "Aim", "Try hard", "Aspire"],
    antonyms: ["Neglect", "Idle", "Give up"],
    collocations: ["Strive for excellence", "Strive to improve", "Strive for equality"],
    sampleSentence: "Students in Dakar strive for academic excellence to secure international fellowships.",
    story: "Chaque matin, Khady strive pour perfectionner son expression anglaise avant l'épreuve orale du Bac.",
    level: "BAC L / S"
  },
  {
    id: "eng_09",
    word: "Preserve",
    phonetic: "/prɪˈzɜːv/",
    meaning: "Préserver, sauvegarder le patrimoine culturel ou naturel.",
    culturalHook: "🏛️ Ancrage : La sauvegarde de l'île de Gorée, du parc du Niokolo-Koba et des traditions.",
    synonyms: ["Protect", "Conserve", "Safeguard", "Maintain"],
    antonyms: ["Destroy", "Damage", "Neglect"],
    collocations: ["Preserve heritage", "Preserve biodiversity", "Preserve traditions"],
    sampleSentence: "It is our duty to preserve the historic architecture of Gorée Island and Saint-Louis.",
    story: "Les élèves du club environnement ont planté des filaos le long de la côte pour preserve le littoral de Rufisque.",
    level: "BFEM / BAC"
  },
  {
    id: "eng_10",
    word: "Innovate",
    phonetic: "/ˈɪn.ə.veɪt/",
    meaning: "Innover, créer des méthodes ou technologies nouvelles.",
    culturalHook: "🚀 Ancrage : Les startups de Dakar créant des solutions agricoles et solaires locales.",
    synonyms: ["Pioneer", "Invent", "Modernize", "Revolutionize"],
    antonyms: ["Stagnate", "Regress", "Follow blindly"],
    collocations: ["Innovate constantly", "Innovate in education", "Technological innovation"],
    sampleSentence: "Young African engineers innovate by designing low-cost smart irrigation sensors.",
    story: "Des étudiants de l'EPT de Thiès ont réussi à innovate en concevant un drone de surveillance maraîchère.",
    level: "BAC S / G"
  },
  {
    id: "eng_11",
    word: "Literacy",
    phonetic: "/ˈlɪt.ər.ə.si/",
    meaning: "Littératie, alphabétisation, capacité à lire, écrire et comprendre.",
    culturalHook: "📖 Ancrage : Le droit universel à l'éducation pour chaque enfant dans chaque commune du Sénégal.",
    synonyms: ["Education", "Knowledge", "Scholarliness", "Reading ability"],
    antonyms: ["Illiteracy", "Ignorance"],
    collocations: ["Digital literacy", "Promote literacy", "Literacy rate"],
    sampleSentence: "Digital literacy has become a fundamental requirement for 21st-century youth.",
    story: "Le programme de bibliothèque mobile à Podor a augmenté le taux de literacy chez les collégiens.",
    level: "BFEM / BAC"
  },
  {
    id: "eng_12",
    word: "Solidarity",
    phonetic: "/ˌsɒl.ɪˈdær.ə.ti/",
    meaning: "Solidarité, esprit d'entraide et d'union collective.",
    culturalHook: "🤝 Ancrage : La Teranga sénégalaise et la tontine solidaire pour financer les études.",
    synonyms: ["Unity", "Brotherhood", "Cooperation", "Harmony"],
    antonyms: ["Individualism", "Division", "Discord"],
    collocations: ["Show solidarity", "International solidarity", "Community solidarity"],
    sampleSentence: "Senegalese Teranga is built upon an enduring culture of hospitality and solidarity.",
    story: "Pendant la préparation du Bac, le groupe d'étude a manifesté une vraie solidarity en partageant les fiches.",
    level: "BFEM / BAC"
  },
  {
    id: "eng_13",
    word: "Furthermore",
    phonetic: "/ˌfɜː.ðəˈmɔːr/",
    meaning: "En outre, de plus (connecteur logique clé de dissertation).",
    culturalHook: "✍️ Ancrage : Connecteur logique indispensable pour structurer un paragraphe d'argumentation au Bac.",
    synonyms: ["Moreover", "In addition", "Besides", "What is more"],
    antonyms: ["However", "Nonetheless"],
    collocations: ["Furthermore it must be noted", "Furthermore research shows"],
    sampleSentence: "Solar energy reduces electricity bills; furthermore, it helps combat air pollution.",
    story: "Dans sa dissertation d'anglais au Bac L, Oumar a utilisé furthermore pour enrichir sa démonstration.",
    level: "BAC L / S"
  },
  {
    id: "eng_14",
    word: "Nonetheless",
    phonetic: "/ˌnʌn.ðəˈles/",
    meaning: "Néanmoins, toutefois, malgré cela.",
    culturalHook: "⚖️ Ancrage : L'art de la nuance et de la concession dans l'essai d'anglais au Bac.",
    synonyms: ["Nevertheless", "Even so", "However", "Yet"],
    antonyms: ["Consequently", "Therefore"],
    collocations: ["Nonetheless important", "Nonetheless clear"],
    sampleSentence: "The exam was demanding; nonetheless, students who revised regularly obtained high grades.",
    story: "Le sujet d'anglais était dense ; nonetheless, les élèves formés avec NEON ont répondu avec assurance.",
    level: "BAC L / S"
  },
  {
    id: "eng_15",
    word: "Crucial",
    phonetic: "/ˈkruː.ʃəl/",
    meaning: "Crucial, décisif, d'une importance capitale.",
    culturalHook: "🎯 Ancrage : L'importance cruciale de la gestion du temps pendant l'examen du Bac.",
    synonyms: ["Vital", "Essential", "Pivotal", "Critical"],
    antonyms: ["Trivial", "Minor", "Insignificant"],
    collocations: ["Crucial role", "Crucial decision", "Crucial factor for success"],
    sampleSentence: "Daily vocabulary practice plays a crucial role in reaching fluency.",
    story: "Comprendre la consigne du texte est un élément crucial pour réussir l'épreuve de compréhension écrite.",
    level: "BFEM / BAC"
  }
];

if (typeof window !== 'undefined') {
  window.INITIAL_VOCAB = SENEGAL_ACADEMIC_VOCAB;
  window.VOCABULARY_DATA = SENEGAL_ACADEMIC_VOCAB;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SENEGAL_ACADEMIC_VOCAB };
}
