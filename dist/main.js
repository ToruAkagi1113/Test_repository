const MIN_FACTOR = 1;
const MAX_FACTOR = 9;
const questionText = getRequiredElement('question-text');
const answerInput = getRequiredElement('answer-input');
const feedback = getRequiredElement('feedback');
const checkButton = getRequiredElement('check-answer');
const nextButton = getRequiredElement('next-question');
const correctCountLabel = getRequiredElement('correct-count');
const attemptCountLabel = getRequiredElement('attempt-count');
const accuracyLabel = getRequiredElement('accuracy');
const streakLabel = getRequiredElement('streak');
const bestStreakLabel = getRequiredElement('best-streak');
let currentQuestion = createQuestion();
let correctCount = 0;
let attemptCount = 0;
let streak = 0;
let bestStreak = 0;
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
function setFeedback(message, status) {
  feedback.textContent = message;
  feedback.dataset.status = status;
}
function resetForNextQuestion(options) {
  const { preserveFeedback = false } = options ?? {};
  currentQuestion = createQuestion(currentQuestion);
  updateQuestionText(currentQuestion);
  if (!preserveFeedback) {
    setFeedback('解答を入力して答え合わせをしましょう。', 'info');
  }
  answerInput.value = '';
  answerInput.focus();
}
function checkAnswer() {
  const value = answerInput.value.trim();
  if (value === '') {
    setFeedback('答えを入力してください。', 'error');
    answerInput.focus();
    return;
  }
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    setFeedback('数字を入力してください。', 'error');
    answerInput.focus();
    return;
  }
  const correctAnswer = currentQuestion.left * currentQuestion.right;
  attemptCount += 1;
  if (parsed === correctAnswer) {
    correctCount += 1;
    streak += 1;
    bestStreak = Math.max(bestStreak, streak);
    setFeedback('正解です！次の問題に進みましょう。', 'success');
    resetForNextQuestion({ preserveFeedback: true });
  } else {
    streak = 0;
    setFeedback(`残念！正解は ${correctAnswer} です。`, 'error');
  }
  updateStats();
}
checkButton.addEventListener('click', () => {
  checkAnswer();
});
nextButton.addEventListener('click', () => {
  resetForNextQuestion();
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
