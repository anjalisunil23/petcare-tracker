export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  ownerName: string;
  ownerId: string;
  weight: number;
  notes: string;
}

export interface Appointment {
  id: string;
  petName: string;
  petId: string;
  ownerName: string;
  vetName: string;
  date: string;
  time: string;
  reason: string;
  status: "scheduled" | "completed" | "cancelled";
}

export interface MedicalRecord {
  id: string;
  petName: string;
  petId: string;
  date: string;
  diagnosis: string;
  treatment: string;
  vetName: string;
  notes: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "vet";
  phone: string;
  joinDate: string;
}

export interface VeterinarianProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
}

export type Role = "owner" | "admin" | "vet";
