const STORAGE_KEY = "tablequizz-progress";

const state = {
  mode: "practice",
  score: 0,
  streak: 0,
  xp: 0,
  level: 1,
  correct: 0,
  total: 0,
  reviewPool: [],
  current: null,
  timerId: null,
  timeLeft: 60
};

const els = {
  tabs: document.querySelectorAll(".tab"),
  views: document.querySelectorAll(".view"),
  tablesGrid: document.getElementById("tables-grid"),
  tenseLabel: document.getElementById("tense-label"),
  verbLabel: document.getElementById("verb-label"),
  pronounFr: document.getElementById("pronoun-fr"),
  pronounEn: document.getElementById("pronoun-en"),
  answerInput: document.getElementById("answer-input"),
  submitBtn: document.getElementById("submit-answer"),
  skipBtn: document.getElementById("skip-question"),
  feedback: document.getElementById("feedback"),
  scoreValue: document.getElementById("score-value"),
  countValue: document.getElementById("count-value"),
  levelValue: document.getElementById("level-value"),
  xpValue: document.getElementById("xp-value"),
  streakValue: document.getElementById("streak-value"),
  accuracyValue: document.getElementById("accuracy-value"),
  timer: document.getElementById("timer"),
  modeButtons: document.querySelectorAll(".mode-btn"),
  reviewList: document.getElementById("review-list")
};

const normalize = (value) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

const saveProgress = () => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      score: state.score,
      streak: state.streak,
      xp: state.xp,
      level: state.level,
      correct: state.correct,
      total: state.total
    })
  );
};

const loadProgress = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return;
  try {
    const data = JSON.parse(stored);
    state.score = data.score ?? 0;
    state.streak = data.streak ?? 0;
    state.xp = data.xp ?? 0;
    state.level = data.level ?? 1;
    state.correct = data.correct ?? 0;
    state.total = data.total ?? 0;
  } catch (error) {
    console.error("Could not load progress", error);
  }
};

const renderTables = () => {
  els.tablesGrid.innerHTML = "";
  TENSES.forEach((tense) => {
    const verb = VERBS.find((item) => item.id === tense.exampleVerb);
    if (!verb) return;
    const tableRows = PRONOUNS.map(
      (pronoun) => `
        <tr>
          <td>${pronoun.fr}</td>
          <td>${pronoun.en}</td>
          <td>${verb.conjugations[tense.id][pronoun.key]}</td>
        </tr>
      `
    ).join("");

    const card = document.createElement("div");
    card.className = "card table-card";
    card.innerHTML = `
      <div>
        <h3>${tense.fr}</h3>
        <div class="tense-en">${tense.en}</div>
      </div>
      <div class="table-verb">${verb.fr} — ${verb.en}</div>
      <table>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;
    els.tablesGrid.appendChild(card);
  });
};

const pickQuestion = () => {
  if (state.reviewPool.length > 0 && Math.random() < 0.35) {
    return state.reviewPool.shift();
  }

  const verb = VERBS[Math.floor(Math.random() * VERBS.length)];
  const tense = TENSES[Math.floor(Math.random() * TENSES.length)];
  const pronoun = PRONOUNS[Math.floor(Math.random() * PRONOUNS.length)];
  return { verb, tense, pronoun };
};

const showQuestion = () => {
  state.current = pickQuestion();
  const { verb, tense, pronoun } = state.current;
  els.tenseLabel.textContent = `${tense.fr} · ${tense.en}`;
  els.verbLabel.textContent = `${verb.fr} (${verb.en})`;
  els.pronounFr.textContent = pronoun.fr;
  els.pronounEn.textContent = pronoun.en;
  els.answerInput.value = "";
  els.answerInput.focus();
  els.feedback.textContent = "";
  els.feedback.className = "feedback";
  updateReviewList();
};

const updateStats = () => {
  els.scoreValue.textContent = state.score;
  els.countValue.textContent = `${state.correct} / ${state.total}`;
  els.levelValue.textContent = state.level;
  els.xpValue.textContent = state.xp;
  els.streakValue.textContent = state.streak;
  const accuracy = state.total
    ? Math.round((state.correct / state.total) * 100)
    : 0;
  els.accuracyValue.textContent = `${accuracy}%`;
  saveProgress();
};

const updateLevel = () => {
  const nextLevel = Math.floor(state.xp / 60) + 1;
  if (nextLevel !== state.level) {
    state.level = nextLevel;
  }
};

const addToReview = (question) => {
  if (!question) return;
  state.reviewPool.push(question);
  if (state.reviewPool.length > 12) {
    state.reviewPool.shift();
  }
};

const updateReviewList = () => {
  const items = state.reviewPool.slice(0, 3).map((item) => {
    return `${item.verb.fr} · ${item.tense.fr}`;
  });
  els.reviewList.innerHTML = items.length
    ? items.map((text) => `<div>${text}</div>`).join("")
    : "<div>All clear ✨</div>";
};

const showFeedback = (message, isGood) => {
  els.feedback.textContent = message;
  els.feedback.className = `feedback ${isGood ? "good" : "bad"}`;
};

const checkAnswer = () => {
  if (!state.current) return;
  const { verb, tense, pronoun } = state.current;
  const expected = verb.conjugations[tense.id][pronoun.key];
  const answer = normalize(els.answerInput.value);
  const normalizedExpected = normalize(expected);

  state.total += 1;
  if (answer && answer === normalizedExpected) {
    state.correct += 1;
    state.streak += 1;
    state.score += 10 + Math.min(state.streak, 5);
    state.xp += 10;
    showFeedback("Bien joué! Paw points +10.", true);
  } else {
    state.streak = 0;
    addToReview(state.current);
    showFeedback(`Correct: ${expected}`, false);
  }

  updateLevel();
  updateStats();
  setTimeout(showQuestion, 800);
};

const skipQuestion = () => {
  addToReview(state.current);
  showFeedback("Skipped. It will come back soon.", false);
  setTimeout(showQuestion, 500);
};

const setMode = (mode) => {
  state.mode = mode;
  els.modeButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });
  if (mode === "timed") {
    startTimer();
  } else {
    stopTimer();
    els.timer.textContent = "Ready";
  }
};

const startTimer = () => {
  stopTimer();
  state.timeLeft = 60;
  els.timer.textContent = "01:00";
  state.timerId = setInterval(() => {
    state.timeLeft -= 1;
    const minutes = String(Math.floor(state.timeLeft / 60)).padStart(2, "0");
    const seconds = String(state.timeLeft % 60).padStart(2, "0");
    els.timer.textContent = `${minutes}:${seconds}`;
    if (state.timeLeft <= 0) {
      stopTimer();
      els.timer.textContent = "Time!";
      showFeedback("Sprint finished. Switch mode to restart.", false);
    }
  }, 1000);
};

const stopTimer = () => {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
};

els.tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.view;
    els.tabs.forEach((btn) => btn.classList.remove("active"));
    tab.classList.add("active");
    els.views.forEach((view) => {
      view.classList.toggle("active", view.id === target);
    });
  });
});

els.submitBtn.addEventListener("click", checkAnswer);
els.answerInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    checkAnswer();
  }
});
els.skipBtn.addEventListener("click", skipQuestion);

els.modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => setMode(btn.dataset.mode));
});

loadProgress();
renderTables();
updateStats();
setMode("practice");
showQuestion();
