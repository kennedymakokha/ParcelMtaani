// src/types/auth.ts
export type UserRole = "superadmin" | "staff" | "agent" | "customer"|"admin"|"superuser"|"supersales";


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
  address?: string;
}

export interface Parcel {
  weight: string;
  instructions: string;
  destination: string;
  pickup: string;
  price: string;
  sentFrom: string;
  code: string;
   fragile: boolean;
}
export interface Truck {
  _id: string;
  plate: string;
  model: string;
  capacity: string;
  driverId?: string;
}

export interface ParcelFormState {
  sender: Person;
  receiver: Person;
  parcel: Parcel;
 
}

// types.ts (optional but cleaner)

export interface Pickup {
  _id: string;
  pickup_name: string;
  phone_number: string;
  working_hrs: string;
  contact_number: string;
  latitude: number | null;
  longitude: number | null;
  state: string;
  api_key: string;
  strictMpesa: boolean;
  master_ke: string;
  createdBy: string;
  business: string;
  deletedAt: string | null;
  created_at: string;
  updatedAt: string;
  createdAt: string;
  __v: number;
}

export interface PickupState {
  pickups: Pickup[];
  page: number;
  totalPages: number;
}