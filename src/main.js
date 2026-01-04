const MIN_FACTOR = 1;
const MAX_FACTOR = 9;

const questionText = getRequiredElement('question-text');
const answerInput = getRequiredElement('answer-input');
const feedback = getRequiredElement('feedback');
const checkButton = getRequiredElement('check-answer');
const nextButton = getRequiredElement('next-question');
const resetStatsButton = getRequiredElement('reset-stats');
const correctCountLabel = getRequiredElement('correct-count');
const attemptCountLabel = getRequiredElement('attempt-count');
const accuracyLabel = getRequiredElement('accuracy');
const streakLabel = getRequiredElement('streak');
const bestStreakLabel = getRequiredElement('best-streak');
const countdownLabel = getRequiredElement('countdown');
const celebrationLayer = getRequiredElement('celebration-layer');

let currentQuestion = createQuestion();
let correctCount = 0;
let attemptCount = 0;
let streak = 0;
let bestStreak = 0;
let countdownId = null;
let remainingSeconds = 10;

function getRequiredElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Element with id "${id}" is missing from the page.`);
  }
  return element;
}

function createQuestion(previous) {
  let nextQuestion;

  do {
    nextQuestion = {
      left: getRandomFactor(),
      right: getRandomFactor(),
    };
  } while (
    previous &&
    nextQuestion.left === previous.left &&
    nextQuestion.right === previous.right
  );

  return nextQuestion;
}

function getRandomFactor() {
  return Math.floor(Math.random() * (MAX_FACTOR - MIN_FACTOR + 1)) + MIN_FACTOR;
}

function updateQuestionText(question) {
  questionText.textContent = `${question.left} × ${question.right}`;
}

function updateStats() {
  correctCountLabel.textContent = correctCount.toString();
  attemptCountLabel.textContent = attemptCount.toString();

  if (attemptCount === 0) {
    accuracyLabel.textContent = '-';
  } else {
    const accuracy = Math.round((correctCount / attemptCount) * 100);
    accuracyLabel.textContent = `${accuracy}%`;
  }

  streakLabel.textContent = `${streak}問連続`;
  bestStreakLabel.textContent = `${bestStreak}問`;
}

function updateCountdownText() {
  countdownLabel.textContent = `残り ${remainingSeconds} 秒`;
  const status = remainingSeconds <= 3 ? 'warn' : 'safe';
  countdownLabel.dataset.state = status;
}

function setFeedback(message, status) {
  feedback.textContent = message;
  feedback.dataset.status = status;
}

function stopTimer() {
  if (countdownId !== null) {
    clearInterval(countdownId);
  }
  countdownId = null;
}

function startTimer(initialSeconds = 10) {
  stopTimer();
  remainingSeconds = initialSeconds;
  updateCountdownText();

  countdownId = window.setInterval(() => {
    remainingSeconds -= 1;
    updateCountdownText();

    if (remainingSeconds <= 0) {
      stopTimer();
      handleTimeout();
    }
  }, 1000);
}

function resetStats() {
  correctCount = 0;
  attemptCount = 0;
  streak = 0;
  bestStreak = 0;
  updateStats();
  setFeedback('成績をリセットしました。新しい問題に挑戦しましょう。', 'info');
  resetForNextQuestion({ preserveFeedback: true });
}

function resetForNextQuestion(options) {
  const { preserveFeedback = false } = options ?? {};

  stopTimer();

  currentQuestion = createQuestion(currentQuestion);
  updateQuestionText(currentQuestion);

  if (!preserveFeedback) {
    setFeedback('解答を入力して答え合わせをしましょう。', 'info');
  }

  answerInput.value = '';
  answerInput.focus();
  startTimer();
}

function checkAnswer() {
  const value = answerInput.value.trim();

  stopTimer();

  if (value === '') {
    setFeedback('答えを入力してください。', 'error');
    answerInput.focus();
    startTimer(remainingSeconds);
    return;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    setFeedback('数字を入力してください。', 'error');
    answerInput.focus();
    startTimer(remainingSeconds);
    return;
  }

  const correctAnswer = currentQuestion.left * currentQuestion.right;
  attemptCount += 1;

  if (parsed === correctAnswer) {
    correctCount += 1;
    streak += 1;
    bestStreak = Math.max(bestStreak, streak);
    setFeedback('正解です！次の問題に進みましょう。', 'success');
    if (correctCount > 0 && correctCount % 5 === 0) {
      triggerCelebration();
    }
    resetForNextQuestion({ preserveFeedback: true });
  } else {
    streak = 0;
    setFeedback(`残念！正解は ${correctAnswer} です。`, 'error');
    resetForNextQuestion({ preserveFeedback: true });
  }

  updateStats();
}

function handleTimeout() {
  const correctAnswer = currentQuestion.left * currentQuestion.right;
  attemptCount += 1;
  streak = 0;
  setFeedback(`時間切れ！正解は ${correctAnswer} です。`, 'error');
  updateStats();
  resetForNextQuestion({ preserveFeedback: true });
}

function triggerCelebration() {
  const confettiCount = 24;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < confettiCount; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.animationDelay = `${Math.random() * 0.6}s`;
    piece.style.backgroundColor = getConfettiColor();
    fragment.appendChild(piece);
  }

  celebrationLayer.appendChild(fragment);

  window.setTimeout(() => {
    celebrationLayer.innerHTML = '';
  }, 1200);
}

function getConfettiColor() {
  const palette = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];
  const index = Math.floor(Math.random() * palette.length);
  return palette[index];
}

checkButton.addEventListener('click', () => {
  checkAnswer();
});

nextButton.addEventListener('click', () => {
  resetForNextQuestion();
});

resetStatsButton.addEventListener('click', () => {
  resetStats();
});

answerInput.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    checkAnswer();
  }
});

updateQuestionText(currentQuestion);
updateStats();
setFeedback('解答を入力して答え合わせをしましょう。', 'info');
answerInput.focus();
startTimer();
