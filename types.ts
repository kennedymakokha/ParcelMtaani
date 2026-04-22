// src/types/auth.ts
export type UserRole = "superAdmin" | "staff" | "agent" | "customer";


export interface ParcelFormData {
  sender: string;
  receiver: string;
  parcel: string;
  receiptNo?: string | null;
}

export interface QRPayload {
  type: 'PARCEL';
  version: number;
  timestamp: number;
  sender: string;
  receiver: string;
  parcel: string;
  receiptNo: string | null;
}

export interface Person {
  name: string;
  phone: string;
  address: string;
}

export interface Parcel {
  weight: string;
  instructions: string;
  destination: string;
  pickup: string;
  price: string;
}

export interface ParcelFormState {
  sender: Person;
  receiver: Person;
  parcel: Parcel;
}