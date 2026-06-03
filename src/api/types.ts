export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  username?: string;
  role?: string;
};

export type StartSessionRequest = {
  difficultyLevel?: number;
  conditionName?: ConditionName;
};

export type ConditionName =
  | "CONDITION_1_SOKUON"
  | "CONDITION_2_SOKUON"
  | "CONDITION_3_SOKUON"
  | string;

export type Modality = "AUDITORY" | "VISUAL" | "INTEROCEPTIVE" | "PRACTICE" | string;

export type GameSessionResponse = {
  sessionUuid: string;
  difficultyLevel: number;
  conditionName: ConditionName;
  startedAt: string;
};

export type IdeophoneOption = {
  ideophoneId: number;
  kana: string;
  romaji?: string;
  gloss?: string;
  canonicalScript?: string;
  modality?: Modality;
  stimulusFile?: string;
  stimulusUrl?: string;
};

export type RoundResponse = {
  sessionUuid: string;
  roundId: number;
  prompt: string;
  conditionName: ConditionName;
  difficultyLevel: number;
  translations: {
    target?: string;
    other?: string;
  };
  left: IdeophoneOption;
  right: IdeophoneOption;
  timing?: {
    fixationMs?: number;
    preChoiceDelayMs?: number;
  };
};

export type SubmitAnswerRequest = {
  roundId: number;
  selectedIdeophoneId: number;
  responseTimeMs: number;
};

export type AnswerResultResponse = {
  roundId: number;
  selectedIdeophoneId: number;
  correctIdeophoneId?: number;
  correct: boolean;
  prompt?: string;
  correctKana?: string;
  selectedKana?: string;
  totalAnswered: number;
  totalCorrect: number;
};

export type LeaderboardEntry = {
  username: string;
  totalAnswered: number;
  totalCorrect: number;
  accuracy: number;
};

export type AttemptResponse = {
  answeredAt?: string;
  prompt?: string;
  selectedKana?: string;
  correctKana?: string;
  correct: boolean;
  responseTimeMs?: number;
};

export type TrialPhase =
  | "idle"
  | "loading"
  | "fixation"
  | "left-playing"
  | "right-playing"
  | "choice"
  | "submitting"
  | "feedback"
  | "complete"
  | "error";
