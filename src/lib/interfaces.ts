import { EnumBandScore, EnumRank, EnumSkill } from "./enums";

export interface IBucket {
  id: string;
  name: string;
  permission: string;
  createdAt: string;
  updatedAt: string;
  uploadStatus: string;
  url: string;
}
export interface IUser {
  id: string;
  username: string;
  email: string;
  role: string;
  fullName: string | null;
  dob: string | null;
  createdAt: string;
  learnerProfile: ILearnerProfile | null;
  gender: string | null;
}

export interface ILearnerProfile {
  id: string;
  rank: EnumRank;
  levelId: number;
  xp: number;
  carrots: number;
  streakId: number;
  createdAt: string;
  updatedAt: string;
  streak: IStreak;
}

export interface IStreak {
  id: number;
  current: number;
  target: number;
  record: number;
}

export interface IQuestionType {
  id: number;
  name: string;
  skill: EnumSkill;
  imageId: string | null; // The image ID to update via bucket service
  image: IBucket | null; // The image URL
  updatedAt: string;
}

export interface ILesson {
  id: number;
  name: string;
  order: number;
  bandScore: EnumBandScore;
}
