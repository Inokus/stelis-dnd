import type { ColumnType } from 'kysely';

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Campaigns {
  id: Generated<number>;
  name: string;
}

export interface Characters {
  campaignId: number;
  downtime: Generated<number>;
  id: Generated<number>;
  name: string;
  userId: number;
}

export interface CharactersItems {
  characterId: number;
  id: Generated<number>;
  itemId: number;
  quantity: number;
}

export interface Downtimes {
  characterId: number;
  createdAt: Generated<Timestamp>;
  days: number;
  description: string;
  id: Generated<number>;
  type: string;
}

export interface Items {
  description: string;
  id: Generated<number>;
  isCurrency: Generated<boolean>;
  name: string;
  value: number;
}

export interface RestrictedItems {
  campaignId: number;
  id: Generated<number>;
  itemId: number;
}

export interface Transactions {
  characterId: number;
  createdAt: Generated<Timestamp>;
  id: Generated<number>;
  itemId: number;
  quantity: number;
  type: string;
  value: number;
}

export interface Users {
  email: string;
  id: Generated<number>;
  isAdmin: Generated<boolean>;
  password: string;
  salt: string;
  username: string;
}

export interface DB {
  campaigns: Campaigns;
  characters: Characters;
  charactersItems: CharactersItems;
  downtimes: Downtimes;
  items: Items;
  restrictedItems: RestrictedItems;
  transactions: Transactions;
  users: Users;
}
