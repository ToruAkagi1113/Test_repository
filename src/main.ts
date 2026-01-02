interface MultiplicationQuestion {
  left: number;
  right: number;
}

const MIN_FACTOR = 1;
const MAX_FACTOR = 9;

const questionText = getRequiredElement<HTMLSpanElement>('question-text');
const answerInput = getRequiredElement<HTMLInputElement>('answer-input');
const feedback = getRequiredElement<HTMLDivElement>('feedback');
const checkButton = getRequiredElement<HTMLButtonElement>('check-answer');
const nextButton = getRequiredElement<HTMLButtonElement>('next-question');
const correctCountLabel = getRequiredElement<HTMLSpanElement>('correct-count');
const attemptCountLabel = getRequiredElement<HTMLSpanElement>('attempt-count');
const accuracyLabel = getRequiredElement<HTMLSpanElement>('accuracy');
const streakLabel = getRequiredElement<HTMLSpanElement>('streak');
const bestStreakLabel = getRequiredElement<HTMLSpanElement>('best-streak');

let currentQuestion: MultiplicationQuestion = createQuestion();
let correctCount = 0;
let attemptCount = 0;
let streak = 0;
let bestStreak = 0;

function getRequiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Element with id "${id}" is missing from the page.`);
  }
  return element as T;
}

function createQuestion(previous?: MultiplicationQuestion): MultiplicationQuestion {
  let nextQuestion: MultiplicationQuestion;

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

function getRandomFactor(): number {
  return Math.floor(Math.random() * (MAX_FACTOR - MIN_FACTOR + 1)) + MIN_FACTOR;
}

function updateQuestionText(question: MultiplicationQuestion): void {
  questionText.textContent = `${question.left} × ${question.right}`;
}

function updateStats(): void {
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

function setFeedback(message: string, status: 'info' | 'success' | 'error'): void {
  feedback.textContent = message;
  feedback.dataset.status = status;
}

function resetForNextQuestion(options?: { preserveFeedback?: boolean }): void {
  const { preserveFeedback = false } = options ?? {};

  currentQuestion = createQuestion(currentQuestion);
  updateQuestionText(currentQuestion);

  if (!preserveFeedback) {
    setFeedback('解答を入力して答え合わせをしましょう。', 'info');
  }

  answerInput.value = '';
  answerInput.focus();
}

function checkAnswer(): void {
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

answerInput.addEventListener('keyup', (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    checkAnswer();
  }
});

// Initialize the first question and stats when the page loads.
updateQuestionText(currentQuestion);
updateStats();
setFeedback('解答を入力して答え合わせをしましょう。', 'info');
answerInput.focus();
