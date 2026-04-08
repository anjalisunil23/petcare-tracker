import { Pet, Appointment, MedicalRecord, User } from "@/types/petcare";

export const samplePets: Pet[] = [
  { id: "p1", name: "Buddy", species: "Dog", breed: "Golden Retriever", age: 3, ownerName: "John Smith", ownerId: "u1", weight: 30, notes: "Friendly, loves fetch" },
  { id: "p2", name: "Whiskers", species: "Cat", breed: "Siamese", age: 5, ownerName: "Jane Doe", ownerId: "u2", weight: 4, notes: "Indoor cat" },
  { id: "p3", name: "Max", species: "Dog", breed: "German Shepherd", age: 2, ownerName: "John Smith", ownerId: "u1", weight: 35, notes: "Active, needs regular exercise" },
  { id: "p4", name: "Luna", species: "Cat", breed: "Persian", age: 4, ownerName: "Emily Davis", ownerId: "u3", weight: 5, notes: "Loves grooming" },
];

export const sampleAppointments: Appointment[] = [
  { id: "a1", petName: "Buddy", petId: "p1", ownerName: "John Smith", vetName: "Dr. Sarah Wilson", date: "2026-04-10", time: "10:00", reason: "Annual checkup", status: "scheduled" },
  { id: "a2", petName: "Whiskers", petId: "p2", ownerName: "Jane Doe", vetName: "Dr. Mark Lee", date: "2026-04-08", time: "14:00", reason: "Vaccination", status: "completed" },
  { id: "a3", petName: "Max", petId: "p3", ownerName: "John Smith", vetName: "Dr. Sarah Wilson", date: "2026-04-12", time: "09:00", reason: "Skin irritation", status: "scheduled" },
];

export const sampleMedicalRecords: MedicalRecord[] = [
  { id: "m1", petName: "Buddy", petId: "p1", date: "2026-03-15", diagnosis: "Healthy", treatment: "Routine vaccination", vetName: "Dr. Sarah Wilson", notes: "All vitals normal" },
  { id: "m2", petName: "Whiskers", petId: "p2", date: "2026-04-08", diagnosis: "Mild allergy", treatment: "Antihistamine prescribed", vetName: "Dr. Mark Lee", notes: "Follow up in 2 weeks" },
];

export const sampleUsers: User[] = [
  { id: "u1", name: "John Smith", email: "john@example.com", role: "owner", phone: "555-0101", joinDate: "2025-01-15" },
  { id: "u2", name: "Jane Doe", email: "jane@example.com", role: "owner", phone: "555-0102", joinDate: "2025-03-20" },
  { id: "u3", name: "Emily Davis", email: "emily@example.com", role: "owner", phone: "555-0103", joinDate: "2025-06-10" },
  { id: "u4", name: "Dr. Sarah Wilson", email: "sarah@example.com", role: "vet", phone: "555-0201", joinDate: "2024-08-01" },
  { id: "u5", name: "Dr. Mark Lee", email: "mark@example.com", role: "vet", phone: "555-0202", joinDate: "2024-10-15" },
  { id: "u6", name: "Admin User", email: "admin@example.com", role: "admin", phone: "555-0301", joinDate: "2024-01-01" },
];
