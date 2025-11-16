import { EnumCEFRLevel } from "../enums";

export enum EnumQuestion {
  MultipleChoice = "multiple_choice",
  FillInTheBlank = "fill_in_the_blank",
  Matching = "matching",
}

type ReadingQuestion = {
  paragraph: string;
  question: string;
};

type BaseQuestion = {
  id: string;
  explanation: string | null;
  cefrLevel: EnumCEFRLevel;
  imageId: string | null;
  audioId: string | null;
  createdAt: string;
  updatedAt: string;
};

type MultipleChoiceQuestion = BaseQuestion & {
  contentType: EnumQuestion.MultipleChoice;
  content: ReadingQuestion & {
    options: string[];
    answer: number[] | number;
  };
};

type FillInTheBlankQuestion = BaseQuestion & {
  contentType: EnumQuestion.FillInTheBlank;
  content: ReadingQuestion;
};

type MatchingQuestion = BaseQuestion & {
  contentType: EnumQuestion.Matching;
  content: ReadingQuestion & {
    options: string[];
    answer: number[];
  };
};

export type Question = MultipleChoiceQuestion | FillInTheBlankQuestion | MatchingQuestion;
