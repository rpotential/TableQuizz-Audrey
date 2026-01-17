const PRONOUNS = [
  { key: "je", fr: "je", en: "I" },
  { key: "tu", fr: "tu", en: "you (sing.)" },
  { key: "il", fr: "il / elle / on", en: "he / she / one" },
  { key: "nous", fr: "nous", en: "we" },
  { key: "vous", fr: "vous", en: "you (pl./formal)" },
  { key: "ils", fr: "ils / elles", en: "they" }
];

const TENSES = [
  { id: "present", fr: "Présent", en: "Present", exampleVerb: "parler" },
  {
    id: "passe_compose",
    fr: "Passé composé",
    en: "Compound past",
    exampleVerb: "parler"
  },
  { id: "imparfait", fr: "Imparfait", en: "Imperfect", exampleVerb: "parler" },
  {
    id: "futur_simple",
    fr: "Futur simple",
    en: "Simple future",
    exampleVerb: "parler"
  },
  {
    id: "conditionnel_present",
    fr: "Conditionnel présent",
    en: "Conditional present",
    exampleVerb: "parler"
  }
];

const VERBS = [
  {
    id: "parler",
    fr: "parler",
    en: "to speak",
    conjugations: {
      present: {
        je: "parle",
        tu: "parles",
        il: "parle",
        nous: "parlons",
        vous: "parlez",
        ils: "parlent"
      },
      passe_compose: {
        je: "ai parlé",
        tu: "as parlé",
        il: "a parlé",
        nous: "avons parlé",
        vous: "avez parlé",
        ils: "ont parlé"
      },
      imparfait: {
        je: "parlais",
        tu: "parlais",
        il: "parlait",
        nous: "parlions",
        vous: "parliez",
        ils: "parlaient"
      },
      futur_simple: {
        je: "parlerai",
        tu: "parleras",
        il: "parlera",
        nous: "parlerons",
        vous: "parlerez",
        ils: "parleront"
      },
      conditionnel_present: {
        je: "parlerais",
        tu: "parlerais",
        il: "parlerait",
        nous: "parlerions",
        vous: "parleriez",
        ils: "parleraient"
      }
    }
  },
  {
    id: "finir",
    fr: "finir",
    en: "to finish",
    conjugations: {
      present: {
        je: "finis",
        tu: "finis",
        il: "finit",
        nous: "finissons",
        vous: "finissez",
        ils: "finissent"
      },
      passe_compose: {
        je: "ai fini",
        tu: "as fini",
        il: "a fini",
        nous: "avons fini",
        vous: "avez fini",
        ils: "ont fini"
      },
      imparfait: {
        je: "finissais",
        tu: "finissais",
        il: "finissait",
        nous: "finissions",
        vous: "finissiez",
        ils: "finissaient"
      },
      futur_simple: {
        je: "finirai",
        tu: "finiras",
        il: "finira",
        nous: "finirons",
        vous: "finirez",
        ils: "finiront"
      },
      conditionnel_present: {
        je: "finirais",
        tu: "finirais",
        il: "finirait",
        nous: "finirions",
        vous: "finiriez",
        ils: "finiraient"
      }
    }
  },
  {
    id: "prendre",
    fr: "prendre",
    en: "to take",
    conjugations: {
      present: {
        je: "prends",
        tu: "prends",
        il: "prend",
        nous: "prenons",
        vous: "prenez",
        ils: "prennent"
      },
      passe_compose: {
        je: "ai pris",
        tu: "as pris",
        il: "a pris",
        nous: "avons pris",
        vous: "avez pris",
        ils: "ont pris"
      },
      imparfait: {
        je: "prenais",
        tu: "prenais",
        il: "prenait",
        nous: "prenions",
        vous: "preniez",
        ils: "prenaient"
      },
      futur_simple: {
        je: "prendrai",
        tu: "prendras",
        il: "prendra",
        nous: "prendrons",
        vous: "prendrez",
        ils: "prendront"
      },
      conditionnel_present: {
        je: "prendrais",
        tu: "prendrais",
        il: "prendrait",
        nous: "prendrions",
        vous: "prendriez",
        ils: "prendraient"
      }
    }
  },
  {
    id: "etre",
    fr: "être",
    en: "to be",
    conjugations: {
      present: {
        je: "suis",
        tu: "es",
        il: "est",
        nous: "sommes",
        vous: "êtes",
        ils: "sont"
      },
      passe_compose: {
        je: "ai été",
        tu: "as été",
        il: "a été",
        nous: "avons été",
        vous: "avez été",
        ils: "ont été"
      },
      imparfait: {
        je: "étais",
        tu: "étais",
        il: "était",
        nous: "étions",
        vous: "étiez",
        ils: "étaient"
      },
      futur_simple: {
        je: "serai",
        tu: "seras",
        il: "sera",
        nous: "serons",
        vous: "serez",
        ils: "seront"
      },
      conditionnel_present: {
        je: "serais",
        tu: "serais",
        il: "serait",
        nous: "serions",
        vous: "seriez",
        ils: "seraient"
      }
    }
  },
  {
    id: "avoir",
    fr: "avoir",
    en: "to have",
    conjugations: {
      present: {
        je: "ai",
        tu: "as",
        il: "a",
        nous: "avons",
        vous: "avez",
        ils: "ont"
      },
      passe_compose: {
        je: "ai eu",
        tu: "as eu",
        il: "a eu",
        nous: "avons eu",
        vous: "avez eu",
        ils: "ont eu"
      },
      imparfait: {
        je: "avais",
        tu: "avais",
        il: "avait",
        nous: "avions",
        vous: "aviez",
        ils: "avaient"
      },
      futur_simple: {
        je: "aurai",
        tu: "auras",
        il: "aura",
        nous: "aurons",
        vous: "aurez",
        ils: "auront"
      },
      conditionnel_present: {
        je: "aurais",
        tu: "aurais",
        il: "aurait",
        nous: "aurions",
        vous: "auriez",
        ils: "auraient"
      }
    }
  },
  {
    id: "faire",
    fr: "faire",
    en: "to do / to make",
    conjugations: {
      present: {
        je: "fais",
        tu: "fais",
        il: "fait",
        nous: "faisons",
        vous: "faites",
        ils: "font"
      },
      passe_compose: {
        je: "ai fait",
        tu: "as fait",
        il: "a fait",
        nous: "avons fait",
        vous: "avez fait",
        ils: "ont fait"
      },
      imparfait: {
        je: "faisais",
        tu: "faisais",
        il: "faisait",
        nous: "faisions",
        vous: "faisiez",
        ils: "faisaient"
      },
      futur_simple: {
        je: "ferai",
        tu: "feras",
        il: "fera",
        nous: "ferons",
        vous: "ferez",
        ils: "feront"
      },
      conditionnel_present: {
        je: "ferais",
        tu: "ferais",
        il: "ferait",
        nous: "ferions",
        vous: "feriez",
        ils: "feraient"
      }
    }
  }
];
