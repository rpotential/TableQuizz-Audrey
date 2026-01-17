// TableQuizz — App Logic
(function () {
  "use strict";

const state = {
    currentVerb: null,
    currentTense: null,
    currentPronounIndex: 0,
  mode: "practice",
    isTimerRunning: false,
    timerInterval: null,
    timeRemaining: 60,
    isAnswerLocked: false,
  score: 0,
    correct: 0,
    total: 0,
  streak: 0,
    maxStreak: 0,
  xp: 0,
  level: 1,
    reviewList: [],
    selectedVerbs: [],
    selectedTenses: [],
    flashMode: "en-fr",
    flashSeen: 0,
    flashCorrect: 0,
    flashCurrent: null,
    flashFlipped: false,
  };

  const XP_PER_LEVEL = 100;
  const XP_PER_CORRECT = 10;
  const XP_STREAK_BONUS = 5;

  const elements = {};

  function init() {
    // Cache DOM elements
    elements.tablesView = document.getElementById("tables");
    elements.quizView = document.getElementById("quiz");
    elements.tablesGrid = document.getElementById("tables-grid");
    elements.tenseLabel = document.getElementById("tense-label");
    elements.verbLabel = document.getElementById("verb-label");
    elements.pronounFr = document.getElementById("pronoun-fr");
    elements.pronounEn = document.getElementById("pronoun-en");
    elements.answerInput = document.getElementById("answer-input");
    elements.submitBtn = document.getElementById("submit-answer");
    elements.skipBtn = document.getElementById("skip-question");
    elements.feedback = document.getElementById("feedback");
    elements.timer = document.getElementById("timer");
    elements.levelValue = document.getElementById("level-value");
    elements.xpValue = document.getElementById("xp-value");
    elements.streakValue = document.getElementById("streak-value");
    elements.accuracyValue = document.getElementById("accuracy-value");
    elements.scoreValue = document.getElementById("score-value");
    elements.countValue = document.getElementById("count-value");
    elements.reviewList = document.getElementById("review-list");
    elements.tenseGuide = document.getElementById("tense-guide");
    elements.tenseGuides = document.getElementById("tense-guides");
    elements.verbGroups = document.getElementById("verb-groups");
    elements.flashFront = document.getElementById("flash-front");
    elements.flashBack = document.getElementById("flash-back");
    elements.flashFlip = document.getElementById("flash-flip");
    elements.flashKnown = document.getElementById("flash-known");
    elements.flashMissed = document.getElementById("flash-missed");
    elements.flashSeen = document.getElementById("flash-seen");
    elements.flashCorrect = document.getElementById("flash-correct");
    elements.flashAccuracy = document.getElementById("flash-accuracy");
    elements.flashModeButtons = document.querySelectorAll("[data-flash-mode]");

    loadProgress();
    renderTables();
    renderLearn();
    setupEventListeners();
    generateNewQuestion();
    updateUI();
    setQuizEnabled(true);
    initFlashcards();
  }

  function renderTables() {
    const grid = elements.tablesGrid;
    if (!grid) return;
    grid.innerHTML = "";

    Object.entries(VERBS).forEach(function(verbEntry) {
      var verbKey = verbEntry[0];
      var verb = verbEntry[1];
      Object.entries(TENSES).forEach(function(tenseEntry) {
        var tenseKey = tenseEntry[0];
        var tense = tenseEntry[1];
        var card = createConjugationCard(verb, verbKey, tense, tenseKey);
        if (card) grid.appendChild(card);
      });
    });
  }

  function createConjugationCard(verb, verbKey, tense, tenseKey) {
    var conjugations = verb.tenses[tenseKey];
    if (!conjugations) return null;

    var card = document.createElement("div");
    card.className = "conjugation-card";
    card.dataset.tense = tenseKey;
    card.dataset.verb = verbKey;

    var tableRows = PRONOUNS.map(function(pronoun, i) {
      var frenchLine = buildFrenchLine(pronoun, conjugations[i]);
      return '<tr><td class="french-cell">' + frenchLine + 
             '</td><td class="english-cell">' + pronoun.en + '</td></tr>';
    }).join("");

    card.innerHTML = 
      '<div class="conjugation-header">' +
        '<h3>' + verb.infinitive + ' — ' + verb.english + '</h3>' +
        '<div class="conjugation-meta">' +
          '<span class="tense-badge tense-' + tenseKey + '">' + tense.name + '</span>' +
          '<span class="verb-badge">' + verb.group + '</span>' +
        '</div>' +
      '</div>' +
      '<table class="conjugation-table">' +
        '<thead><tr><th>Français</th><th>English</th></tr></thead>' +
        '<tbody>' + tableRows + '</tbody>' +
      '</table>';

    return card;
  }

  function startsWithVowelSound(word) {
    if (!word) return false;
    var normalized = word
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return /^[aeiouh]/.test(normalized);
  }

  function getFlashPronoun(pronoun) {
    switch (pronoun.fr) {
      case "il/elle/on":
        return { fr: "elle", en: "she" };
      case "ils/elles":
        return { fr: "ils", en: "they" };
      case "tu":
        return { fr: "tu", en: "you" };
      case "vous":
        return { fr: "vous", en: "you" };
      case "nous":
        return { fr: "nous", en: "we" };
      case "je":
      default:
        return { fr: "je", en: "I" };
    }
  }

  function getPronounDisplay(pronoun, conjugation) {
    if (pronoun.elided && startsWithVowelSound(conjugation)) return pronoun.elided;
    return pronoun.fr;
  }

  function buildFrenchLine(pronoun, conjugation) {
    var displayPronoun = getPronounDisplay(pronoun, conjugation);
    if (displayPronoun === "j'") return displayPronoun + conjugation;
    return displayPronoun + " " + conjugation;
  }

  function buildEnglishPrompt(verb, tenseKey, pronoun) {
    var base = verb.english.replace(/^to\s+/, "").trim();
    var subject = getFlashPronoun(pronoun).en;

    var irregularPast = {
      "be": "was",
      "have": "had",
      "go": "went",
      "do": "did",
      "make": "made",
      "take": "took",
      "come": "came",
      "see": "saw",
      "say": "said",
      "know": "knew",
      "leave": "left",
      "put": "put",
      "eat": "ate",
      "speak": "spoke",
      "be able to": "was able to",
      "must": "had to"
    };

    var past = irregularPast[base];
    if (!past) {
      if (/e$/.test(base)) past = base + "d";
      else if (/[^aeiou]y$/.test(base)) past = base.replace(/y$/, "ied");
      else past = base + "ed";
    }

    var thirdSingular = base;
    if (subject === "she" || subject === "he" || subject === "it") {
      if (/[^aeiou]y$/.test(base)) thirdSingular = base.replace(/y$/, "ies");
      else if (/s$|x$|z$|ch$|sh$/.test(base)) thirdSingular = base + "es";
      else thirdSingular = base + "s";
    }

    switch (tenseKey) {
      case "present":
        return subject + " " + thirdSingular;
      case "futurSimple":
        return subject + " will " + base;
      case "conditionnelPresent":
        return subject + " would " + base;
      case "subjonctifPresent":
        return "that " + subject + " " + base;
      case "passeCompose":
      case "imparfait":
      default:
        return subject + " " + past;
    }
  }

  function generateNewQuestion() {
    state.isAnswerLocked = false;
    var verbKeys = Object.keys(VERBS);
    var randomVerbKey = verbKeys[Math.floor(Math.random() * verbKeys.length)];
    state.currentVerb = Object.assign({ key: randomVerbKey }, VERBS[randomVerbKey]);

    var tenseKeys = Object.keys(TENSES);
    var randomTenseKey = tenseKeys[Math.floor(Math.random() * tenseKeys.length)];
    state.currentTense = Object.assign({ key: randomTenseKey }, TENSES[randomTenseKey]);

    state.currentPronounIndex = Math.floor(Math.random() * PRONOUNS.length);
    displayQuestion();
  }

  function displayQuestion() {
    var pronoun = PRONOUNS[state.currentPronounIndex];
    var conjugation = state.currentVerb.tenses[state.currentTense.key][state.currentPronounIndex];
    var displayPronoun = getPronounDisplay(pronoun, conjugation);

    if (elements.tenseLabel) {
      elements.tenseLabel.textContent = state.currentTense.name + " · " + state.currentTense.nameEn;
      elements.tenseLabel.className = "tense-badge tense-" + state.currentTense.key;
    }
    if (elements.verbLabel) {
      elements.verbLabel.textContent = state.currentVerb.infinitive + " (" + state.currentVerb.english + ")";
    }
    if (elements.pronounFr) elements.pronounFr.textContent = displayPronoun;
    if (elements.pronounEn) elements.pronounEn.textContent = "(" + pronoun.en + ")";

    if (elements.answerInput) {
      elements.answerInput.value = "";
      elements.answerInput.focus();
    }
    if (elements.feedback) {
      elements.feedback.textContent = "";
      elements.feedback.className = "feedback";
    }
    updateTenseGuide();
  }

  function checkAnswer() {
    if (isTimedOver()) {
      elements.feedback.textContent = "Sprint finished. Switch mode to restart.";
      elements.feedback.className = "feedback incorrect";
      return;
    }
    if (state.isAnswerLocked) return;
    state.isAnswerLocked = true;
    var userAnswer = elements.answerInput.value.trim().toLowerCase();
    var correctAnswer = state.currentVerb.tenses[state.currentTense.key][state.currentPronounIndex];

    var normalizedUser = normalizeAnswer(userAnswer);
    var normalizedCorrect = normalizeAnswer(correctAnswer);
    var normalizedWithoutParens = normalizeAnswer(correctAnswer.replace(/\([^)]*\)/g, ""));

    var answerVariants = buildAnswerVariants(correctAnswer, state.currentVerb, PRONOUNS[state.currentPronounIndex]);
    var normalizedVariants = answerVariants.map(normalizeAnswer);

    var isCorrect = normalizedUser === normalizedCorrect ||
      normalizedUser === normalizedWithoutParens ||
      normalizedVariants.indexOf(normalizedUser) !== -1;

    state.total++;

    if (isCorrect) {
      handleCorrectAnswer();
    } else {
      handleIncorrectAnswer(correctAnswer);
    }

    updateUI();
    saveProgress();

    setTimeout(function() {
      generateNewQuestion();
    }, isCorrect ? 800 : 2000);
  }

  function normalizeAnswer(str) {
    return str.toLowerCase()
    .trim()
      .replace(/[’']/g, "")
      .replace(/\s+/g, " ")
    .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function buildAnswerVariants(answer, verb, pronoun) {
    var variants = [answer, answer.replace(/\([^)]*\)/g, "")];
    var pronounParts = pronoun.fr.split("/").map(function(item) { return item.trim(); }).filter(Boolean);
    pronounParts.forEach(function(part) {
      if (part === "je" && pronoun.elided && startsWithVowelSound(answer)) {
        variants.push(pronoun.elided + answer);
        variants.push("je " + answer);
      } else {
        variants.push(part + " " + answer);
      }
    });
    return variants;
  }

  function handleCorrectAnswer() {
    state.correct++;
    state.streak++;
    if (state.streak > state.maxStreak) state.maxStreak = state.streak;

    var xpGained = XP_PER_CORRECT;
    if (state.streak >= 3) xpGained += XP_STREAK_BONUS;
    if (state.streak >= 5) xpGained += XP_STREAK_BONUS;
    if (state.streak >= 10) xpGained += XP_STREAK_BONUS * 2;

    state.xp += xpGained;
    state.score += xpGained;
    checkLevelUp();

    var encouragement = ENCOURAGEMENTS.correct[Math.floor(Math.random() * ENCOURAGEMENTS.correct.length)];
    elements.feedback.textContent = encouragement + " +" + xpGained + " XP";
    elements.feedback.className = "feedback correct";
    elements.answerInput.classList.add("pulse");
    setTimeout(function() { elements.answerInput.classList.remove("pulse"); }, 400);
  }

  function addToReview(correctAnswer) {
    var reviewItem = {
      verb: state.currentVerb.infinitive,
      tense: state.currentTense.name,
      pronoun: PRONOUNS[state.currentPronounIndex].fr,
      correct: correctAnswer,
      timestamp: Date.now(),
    };
    state.reviewList.unshift(reviewItem);
    if (state.reviewList.length > 20) state.reviewList.pop();
  updateReviewList();
  }

  function handleIncorrectAnswer(correctAnswer) {
    state.streak = 0;
    addToReview(correctAnswer);
    var explanation = buildTenseExplanation(state.currentTense.key);
    elements.feedback.innerHTML = "La réponse : <strong>" + correctAnswer + "</strong>" + explanation;
    elements.feedback.className = "feedback incorrect";
    elements.answerInput.classList.add("shake");
    setTimeout(function() { elements.answerInput.classList.remove("shake"); }, 300);
  }

  function skipQuestion() {
    if (isTimedOver()) {
      elements.feedback.textContent = "Sprint finished. Switch mode to restart.";
      elements.feedback.className = "feedback incorrect";
      return;
    }
    if (state.isAnswerLocked) return;
    state.isAnswerLocked = true;
    state.total++;
    state.streak = 0;
    var correctAnswer = state.currentVerb.tenses[state.currentTense.key][state.currentPronounIndex];
    addToReview(correctAnswer);
    var explanation = buildTenseExplanation(state.currentTense.key);
    elements.feedback.innerHTML = "Skipped. Réponse : <strong>" + correctAnswer + "</strong>" + explanation;
    elements.feedback.className = "feedback incorrect";
    updateUI();
    saveProgress();
    setTimeout(function() { generateNewQuestion(); }, 1500);
  }

  function checkLevelUp() {
    var newLevel = Math.floor(state.xp / XP_PER_LEVEL) + 1;
    if (newLevel > state.level) state.level = newLevel;
  }

  function startTimer() {
    state.isTimerRunning = true;
    state.timeRemaining = 60;
    updateTimerDisplay();
    setQuizEnabled(true);

    state.timerInterval = setInterval(function() {
      state.timeRemaining--;
      updateTimerDisplay();
      if (state.timeRemaining <= 0) endTimedMode();
    }, 1000);
  }

  function endTimedMode() {
    clearInterval(state.timerInterval);
    state.isTimerRunning = false;
    state.timeRemaining = 0;
    if (elements.timer) elements.timer.textContent = "Terminé! Score: " + state.score;
    if (elements.feedback) {
      elements.feedback.textContent = "Sprint finished. Switch mode to restart.";
      elements.feedback.className = "feedback incorrect";
    }
    setQuizEnabled(false);
  }

  function updateTimerDisplay() {
    if (elements.timer) elements.timer.textContent = state.timeRemaining + "s";
  }

  function isTimedOver() {
    return state.mode === "timed" && (!state.isTimerRunning || state.timeRemaining <= 0);
  }

  function setQuizEnabled(enabled) {
    if (elements.answerInput) elements.answerInput.disabled = !enabled;
    if (elements.submitBtn) elements.submitBtn.disabled = !enabled;
    if (elements.skipBtn) elements.skipBtn.disabled = !enabled;
  }

  function updateUI() {
    if (elements.levelValue) elements.levelValue.textContent = state.level;
    if (elements.xpValue) elements.xpValue.textContent = state.xp;
    if (elements.streakValue) elements.streakValue.textContent = state.streak;

    var accuracy = state.total > 0 ? Math.round((state.correct / state.total) * 100) : 0;
    if (elements.accuracyValue) elements.accuracyValue.textContent = accuracy + "%";
    if (elements.scoreValue) elements.scoreValue.textContent = state.score;
    if (elements.countValue) elements.countValue.textContent = state.correct + " / " + state.total;
  }

  function updateReviewList() {
    if (!elements.reviewList) return;
    if (state.reviewList.length === 0) {
      elements.reviewList.innerHTML = '<p class="review-empty">Pas d\'erreurs!</p>';
      return;
    }

    elements.reviewList.innerHTML = state.reviewList.slice(0, 10).map(function(item) {
      return '<div class="review-item"><span>' + item.pronoun + '</span> ' +
             '<span class="correct-answer">' + item.correct + '</span> ' +
             '<span class="review-meta">(' + item.verb + ', ' + item.tense + ')</span></div>';
    }).join("");
  }

  function buildTenseExplanation(tenseKey) {
    var tense = TENSES[tenseKey];
    if (!tense) return "";
    var usage = tense.usageEn && tense.usageFr ? tense.usageEn + " / " + tense.usageFr : "";
    var formation = tense.formationEn && tense.formationFr ? tense.formationEn + " / " + tense.formationFr : "";
    var example = tense.example ? tense.example.fr + " — " + tense.example.en : "";
    var signals = Array.isArray(tense.signalWords) ? tense.signalWords.join(", ") : "";
    return (
      '<div class="feedback-explain">' +
        (usage ? "<div><strong>When:</strong> " + usage + "</div>" : "") +
        (formation ? "<div><strong>Build:</strong> " + formation + "</div>" : "") +
        (signals ? "<div><strong>Signal words:</strong> " + signals + "</div>" : "") +
        (example ? "<div><strong>Example:</strong> " + example + "</div>" : "") +
      "</div>"
    );
  }

  function updateTenseGuide() {
    if (!elements.tenseGuide || !state.currentTense) return;
    var tense = TENSES[state.currentTense.key];
    if (!tense) {
      elements.tenseGuide.textContent = "";
      return;
    }
    var usage = tense.usageEn && tense.usageFr ? tense.usageEn + " / " + tense.usageFr : "";
    var formation = tense.formationEn && tense.formationFr ? tense.formationEn + " / " + tense.formationFr : "";
    var example = tense.example ? tense.example.fr + " — " + tense.example.en : "";
    var signals = Array.isArray(tense.signalWords) ? tense.signalWords.join(", ") : "";
    elements.tenseGuide.innerHTML =
      '<div><strong>When:</strong> ' + usage + '</div>' +
      '<div><strong>Build:</strong> ' + formation + '</div>' +
      '<div><strong>Signal words:</strong> ' + signals + '</div>' +
      '<div><strong>Example:</strong> ' + example + '</div>';
  }

  function renderLearn() {
    if (elements.tenseGuides) {
      elements.tenseGuides.innerHTML = Object.entries(TENSES).map(function(entry) {
        var tense = entry[1];
        var signals = Array.isArray(tense.signalWords) ? tense.signalWords.join(", ") : "";
        return (
          '<div class="guide-card">' +
            '<h4>' + tense.name + ' <span>(' + tense.nameEn + ')</span></h4>' +
            '<p>' + tense.descriptionFr + " — " + tense.description + '</p>' +
            '<div class="guide-list">' +
              '<div><strong>When:</strong> ' + tense.usageEn + " / " + tense.usageFr + '</div>' +
              '<div><strong>Build:</strong> ' + tense.formationEn + " / " + tense.formationFr + '</div>' +
              '<div><strong>Signal words:</strong> ' + signals + '</div>' +
              '<div><strong>Example:</strong> ' + tense.example.fr + " — " + tense.example.en + '</div>' +
            '</div>' +
          '</div>'
        );
      }).join("");
    }

    if (elements.verbGroups && typeof VERB_GROUPS !== "undefined") {
      elements.verbGroups.innerHTML = VERB_GROUPS.map(function(group) {
        return (
          '<div class="guide-card">' +
            '<h4>' + group.name + '</h4>' +
            '<p>' + group.descriptionFr + " / " + group.descriptionEn + '</p>' +
            '<div class="guide-list">' +
              '<div><strong>Rule:</strong> ' + group.rulesFr + " / " + group.rulesEn + '</div>' +
              '<div><strong>Examples:</strong> ' + group.examples.join(", ") + '</div>' +
            '</div>' +
          '</div>'
        );
      }).join("");
    }
  }

  function initFlashcards() {
    if (!elements.flashFront || !elements.flashBack) return;
    setFlashMode("en-fr");
    updateFlashStats();
    renderFlashcard();
  }

  function setFlashMode(mode) {
    state.flashMode = mode;
    state.flashFlipped = false;
    elements.flashModeButtons.forEach(function(btn) {
      btn.classList.toggle("active", btn.dataset.flashMode === mode);
    });
    renderFlashcard();
  }

  function generateFlashcard() {
    var verbKeys = Object.keys(VERBS);
    var verbKey = verbKeys[Math.floor(Math.random() * verbKeys.length)];
    var verb = VERBS[verbKey];

    var tenseKeys = Object.keys(TENSES);
    var tenseKey = tenseKeys[Math.floor(Math.random() * tenseKeys.length)];
    var tense = TENSES[tenseKey];

    var pronounIndex = Math.floor(Math.random() * PRONOUNS.length);
    var pronoun = PRONOUNS[pronounIndex];
    var conjugation = verb.tenses[tenseKey][pronounIndex];

    return {
      verbKey: verbKey,
      verb: verb,
      tenseKey: tenseKey,
      tense: tense,
      pronounIndex: pronounIndex,
      pronoun: pronoun,
      conjugation: conjugation
    };
  }

  function renderFlashcard() {
    if (!elements.flashFront || !elements.flashBack) return;
    state.flashCurrent = generateFlashcard();
    var card = state.flashCurrent;
    var flashPronoun = getFlashPronoun(card.pronoun);
    var frenchLine = buildFrenchLine({ fr: flashPronoun.fr, elided: card.pronoun.elided }, card.conjugation);
    var englishPrompt = buildEnglishPrompt(card.verb, card.tenseKey, card.pronoun);

    if (state.flashMode === "en-fr") {
      elements.flashFront.innerHTML =
        '<div class="flash-title">Conjugate in French</div>' +
        '<div class="flash-prompt">' + englishPrompt + '</div>' +
        '<div class="flash-meta">' + card.verb.infinitive + " · " + card.tense.name + '</div>';
      elements.flashBack.innerHTML =
        '<div class="flash-answer">' + frenchLine + '</div>' +
        '<div class="feedback-explain">Build: ' + card.tense.formationEn + '</div>';
    } else {
      elements.flashFront.innerHTML =
        '<div class="flash-title">Translate to English</div>' +
        '<div class="flash-prompt">' + frenchLine + '</div>' +
        '<div class="flash-meta">' + card.verb.infinitive + " · " + card.tense.name + '</div>';
      elements.flashBack.innerHTML =
        '<div class="flash-answer">' + englishPrompt + '</div>' +
        '<div class="feedback-explain">Use: ' + card.tense.usageEn + '</div>';
    }

    setFlashFlipped(false);
  }

  function setFlashFlipped(flipped) {
    state.flashFlipped = flipped;
    elements.flashBack.classList.toggle("is-hidden", !flipped);
    elements.flashFront.classList.toggle("is-hidden", flipped);
  }

  function handleFlashResult(isCorrect) {
    state.flashSeen += 1;
    if (isCorrect) state.flashCorrect += 1;
    updateFlashStats();
    renderFlashcard();
  }

  function updateFlashStats() {
    if (elements.flashSeen) elements.flashSeen.textContent = state.flashSeen;
    if (elements.flashCorrect) elements.flashCorrect.textContent = state.flashCorrect;
    var accuracy = state.flashSeen ? Math.round((state.flashCorrect / state.flashSeen) * 100) : 0;
    if (elements.flashAccuracy) elements.flashAccuracy.textContent = accuracy + "%";
  }

  function setupEventListeners() {
    document.querySelectorAll(".tab").forEach(function(tab) {
      tab.addEventListener("click", function() {
        var view = tab.dataset.view;
        switchView(view);
  });
});

    if (elements.submitBtn) elements.submitBtn.addEventListener("click", checkAnswer);
    if (elements.skipBtn) elements.skipBtn.addEventListener("click", skipQuestion);

    if (elements.answerInput) {
      elements.answerInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") checkAnswer();
      });
    }

    if (elements.flashFlip) {
      elements.flashFlip.addEventListener("click", function() {
        setFlashFlipped(!state.flashFlipped);
      });
    }

    if (elements.flashKnown) {
      elements.flashKnown.addEventListener("click", function() {
        handleFlashResult(true);
      });
    }

    if (elements.flashMissed) {
      elements.flashMissed.addEventListener("click", function() {
        handleFlashResult(false);
      });
    }

    if (elements.flashModeButtons && elements.flashModeButtons.length) {
      elements.flashModeButtons.forEach(function(btn) {
        btn.addEventListener("click", function() {
          setFlashMode(btn.dataset.flashMode);
        });
      });
    }

    document.querySelectorAll(".mode-btn").forEach(function(btn) {
      btn.addEventListener("click", function() {
        document.querySelectorAll(".mode-btn").forEach(function(b) { b.classList.remove("active"); });
        btn.classList.add("active");
        state.mode = btn.dataset.mode;

        if (state.mode === "timed") {
          resetQuizState();
          startTimer();
        } else {
          clearInterval(state.timerInterval);
          state.isTimerRunning = false;
          state.timeRemaining = 60;
          resetQuizState();
          generateNewQuestion();
          if (elements.timer) elements.timer.textContent = "Ready";
          setQuizEnabled(true);
        }
      });
    });
  }

  function switchView(viewName) {
    document.querySelectorAll(".tab").forEach(function(tab) {
      tab.classList.toggle("active", tab.dataset.view === viewName);
    });

    document.querySelectorAll(".view").forEach(function(view) {
      view.classList.toggle("active", view.id === viewName);
    });

    if (viewName === "quiz" && elements.answerInput) elements.answerInput.focus();
    if (viewName === "flashcards") renderFlashcard();
  }

  function resetQuizState() {
    state.score = 0;
    state.correct = 0;
    state.total = 0;
    state.streak = 0;
    updateUI();
  }

  function saveProgress() {
    var data = {
      xp: state.xp,
      level: state.level,
      maxStreak: state.maxStreak,
      reviewList: state.reviewList,
    };
    localStorage.setItem("tablequizz_progress", JSON.stringify(data));
  }

  function loadProgress() {
    try {
      var data = JSON.parse(localStorage.getItem("tablequizz_progress"));
      if (data) {
        state.xp = data.xp || 0;
        state.level = data.level || 1;
        state.maxStreak = data.maxStreak || 0;
        state.reviewList = data.reviewList || [];
      }
    } catch (e) {
      console.log("No saved progress found");
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
