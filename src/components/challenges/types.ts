import type { L10n } from '../../data/site';

export type ChallengeStatus = 'COMPLETED' | 'ACTIVE' | 'UPCOMING';

export interface Winner {
  place: number;
  name: string;
  avatar: string | null;
  prize: string | null;
}

export interface Challenge {
  id: string;
  number: string;
  status: ChallengeStatus;
  date: string | null;
  placeholder: boolean;
  title: L10n;
  summary: L10n;
  description: L10n;
  prize: L10n | null;
  participants: number | null;
  winners: Winner[];
  youtube: string | null;
  thumbnail: string | null;
}
