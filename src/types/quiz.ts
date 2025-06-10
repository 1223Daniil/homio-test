export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  text: string;
  options: QuizOption[];
}

export interface QuizData {
  title: string;
  description?: string;
  questions: QuizQuestion[];
}
