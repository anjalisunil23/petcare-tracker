import { Appointment, MedicalRecord, Pet, Role, User, VeterinarianProfile, Vaccination, VaccinationReminder } from "@/types/petcare";
import { AuthUser, getAuthToken } from "@/lib/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

interface RequestOptions extends RequestInit {
  auth?: boolean;
}

const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { auth = true, headers, ...rest } = options;
  const token = getAuthToken();

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string> | undefined),
  };

  if (auth && token) {
    requestHeaders.Authorization = `Token ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
  });

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      detail = data.detail || JSON.stringify(data);
    } catch {
      // Ignore JSON parse failures for non-JSON error responses.
    }
    throw new Error(detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

type BackendPet = {
  id: number;
  name: string;
  species: string;
  breed: string;
  age: number;
  owner_name: string;
  weight: number;
  notes: string;
};

type BackendAppointment = {
  id: number;
  pet: number;
  pet_name: string;
  owner_name: string;
  vet_name: string;
  date: string;
  time: string;
  reason: string;
  status: "scheduled" | "completed" | "cancelled";
};

type BackendMedicalRecord = {
  id: number;
  pet: number;
  pet_name: string;
  date: string;
  diagnosis: string;
  treatment: string;
  vet_name: string;
  notes: string;
};

type BackendVaccination = {
  id: number;
  pet: number;
  pet_name: string;
  vaccine_name: string;
  administered_date: string | null;
  next_due_date: string;
  vet_name: string;
  reminder_days_before: number;
  reminder_date: string | null;
  reminder_status: "pending" | "sent" | "acknowledged";
  reminder_message: string;
  notes: string;
  created_at: string;
};

type BackendVaccinationReminder = {
  id: number;
  vaccination: number;
  pet_name: string;
  vaccine_name: string;
  vet_name: string;
  reminder_date: string;
  message: string;
  status: "pending" | "sent" | "acknowledged";
  last_sent_at: string | null;
  created_at: string;
  updated_at: string;
};

type BackendUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone: string;
  join_date: string;
};

const mapPet = (pet: BackendPet): Pet => ({
  id: String(pet.id),
  name: pet.name,
  species: pet.species,
  breed: pet.breed,
  age: pet.age,
  ownerName: pet.owner_name,
  ownerId: "",
  weight: Number(pet.weight),
  notes: pet.notes,
});

const mapAppointment = (appointment: BackendAppointment): Appointment => ({
  id: String(appointment.id),
  petName: appointment.pet_name,
  petId: String(appointment.pet),
  ownerName: appointment.owner_name,
  vetName: appointment.vet_name,
  date: appointment.date,
  time: appointment.time,
  reason: appointment.reason,
  status: appointment.status,
});

const mapMedicalRecord = (record: BackendMedicalRecord): MedicalRecord => ({
  id: String(record.id),
  petName: record.pet_name,
  petId: String(record.pet),
  date: record.date,
  diagnosis: record.diagnosis,
  treatment: record.treatment,
  vetName: record.vet_name,
  notes: record.notes,
});

const mapVaccination = (vaccination: BackendVaccination): Vaccination => ({
  id: String(vaccination.id),
  petName: vaccination.pet_name,
  petId: String(vaccination.pet),
  vaccineName: vaccination.vaccine_name,
  administeredDate: vaccination.administered_date || "",
  nextDueDate: vaccination.next_due_date,
  vetName: vaccination.vet_name,
  reminderDaysBefore: vaccination.reminder_days_before,
  reminderDate: vaccination.reminder_date || undefined,
  reminderStatus: vaccination.reminder_status,
  reminderMessage: vaccination.reminder_message,
  notes: vaccination.notes,
});

const mapVaccinationReminder = (reminder: BackendVaccinationReminder): VaccinationReminder => ({
  id: String(reminder.id),
  vaccinationId: String(reminder.vaccination),
  petName: reminder.pet_name,
  vaccineName: reminder.vaccine_name,
  vetName: reminder.vet_name,
  reminderDate: reminder.reminder_date,
  message: reminder.message,
  status: reminder.status,
  lastSentAt: reminder.last_sent_at || "",
});

const mapUser = (user: BackendUser): User => ({
  id: String(user.id),
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  joinDate: user.join_date,
});

const mapVeterinarian = (user: BackendUser): VeterinarianProfile => ({
  id: String(user.id),
  name: user.name,
  email: user.email,
  phone: user.phone,
  joinDate: user.join_date,
});

export const api = {
  async register(payload: { name: string; email: string; password: string; role: Role }): Promise<{ token: string; user: AuthUser }> {
    return apiRequest<{ token: string; user: AuthUser }>("/auth/register/", {
      method: "POST",
      auth: false,
      body: JSON.stringify(payload),
    });
  },

  async login(payload: { email: string; password: string; role: Role }): Promise<{ token: string; user: AuthUser }> {
    return apiRequest<{ token: string; user: AuthUser }>("/auth/login/", {
      method: "POST",
      auth: false,
      body: JSON.stringify(payload),
    });
  },

  async logout(): Promise<void> {
    return apiRequest<void>("/auth/logout/", { method: "POST" });
  },

  async me(): Promise<AuthUser> {
    return apiRequest<AuthUser>("/auth/me/");
  },

  async listPets(ownerName?: string): Promise<Pet[]> {
    const query = ownerName ? `?owner_name=${encodeURIComponent(ownerName)}` : "";
    const pets = await apiRequest<BackendPet[]>(`/pets/${query}`);
    return pets.map(mapPet);
  },

  async createPet(payload: Omit<Pet, "id">): Promise<Pet> {
    const pet = await apiRequest<BackendPet>("/pets/", {
      method: "POST",
      body: JSON.stringify({
        name: payload.name,
        species: payload.species,
        breed: payload.breed,
        age: payload.age,
        owner_name: payload.ownerName,
        weight: payload.weight,
        notes: payload.notes,
      }),
    });
    return mapPet(pet);
  },

  async updatePet(payload: Pet): Promise<Pet> {
    const pet = await apiRequest<BackendPet>(`/pets/${payload.id}/`, {
      method: "PUT",
      body: JSON.stringify({
        name: payload.name,
        species: payload.species,
        breed: payload.breed,
        age: payload.age,
        owner_name: payload.ownerName,
        weight: payload.weight,
        notes: payload.notes,
      }),
    });
    return mapPet(pet);
  },

  async deletePet(id: string): Promise<void> {
    return apiRequest<void>(`/pets/${id}/`, { method: "DELETE" });
  },

  async listAppointments(filters?: { ownerName?: string; vetName?: string }): Promise<Appointment[]> {
    const params = new URLSearchParams();
    if (filters?.ownerName) params.set("owner_name", filters.ownerName);
    if (filters?.vetName) params.set("vet_name", filters.vetName);
    const query = params.toString() ? `?${params.toString()}` : "";
    const appointments = await apiRequest<BackendAppointment[]>(`/appointments/${query}`);
    return appointments.map(mapAppointment);
  },

  async createAppointment(payload: Omit<Appointment, "id">): Promise<Appointment> {
    const appointment = await apiRequest<BackendAppointment>("/appointments/", {
      method: "POST",
      body: JSON.stringify({
        pet: Number(payload.petId),
        owner_name: payload.ownerName,
        vet_name: payload.vetName,
        date: payload.date,
        time: payload.time,
        reason: payload.reason,
        status: payload.status,
      }),
    });
    return mapAppointment(appointment);
  },

  async updateAppointment(payload: Appointment): Promise<Appointment> {
    const appointment = await apiRequest<BackendAppointment>(`/appointments/${payload.id}/`, {
      method: "PUT",
      body: JSON.stringify({
        pet: Number(payload.petId),
        owner_name: payload.ownerName,
        vet_name: payload.vetName,
        date: payload.date,
        time: payload.time,
        reason: payload.reason,
        status: payload.status,
      }),
    });
    return mapAppointment(appointment);
  },

  async deleteAppointment(id: string): Promise<void> {
    return apiRequest<void>(`/appointments/${id}/`, { method: "DELETE" });
  },

  async listMedicalRecords(vetName?: string): Promise<MedicalRecord[]> {
    const query = vetName ? `?vet_name=${encodeURIComponent(vetName)}` : "";
    const records = await apiRequest<BackendMedicalRecord[]>(`/medical-records/${query}`);
    return records.map(mapMedicalRecord);
  },

  async listVaccinations(filters?: { ownerName?: string; vetName?: string }): Promise<Vaccination[]> {
    const params = new URLSearchParams();
    if (filters?.ownerName) params.set("owner_name", filters.ownerName);
    if (filters?.vetName) params.set("vet_name", filters.vetName);
    const query = params.toString() ? `?${params.toString()}` : "";
    const vaccinations = await apiRequest<BackendVaccination[]>(`/vaccinations/${query}`);
    return vaccinations.map(mapVaccination);
  },

  async createVaccination(payload: Omit<Vaccination, "id" | "reminderDate" | "reminderStatus" | "reminderMessage">): Promise<Vaccination> {
    const vaccination = await apiRequest<BackendVaccination>("/vaccinations/", {
      method: "POST",
      body: JSON.stringify({
        pet: Number(payload.petId),
        vaccine_name: payload.vaccineName,
        administered_date: payload.administeredDate || null,
        next_due_date: payload.nextDueDate,
        vet_name: payload.vetName,
        reminder_days_before: payload.reminderDaysBefore,
        notes: payload.notes,
      }),
    });
    return mapVaccination(vaccination);
  },

  async updateVaccination(payload: Vaccination): Promise<Vaccination> {
    const vaccination = await apiRequest<BackendVaccination>(`/vaccinations/${payload.id}/`, {
      method: "PUT",
      body: JSON.stringify({
        pet: Number(payload.petId),
        vaccine_name: payload.vaccineName,
        administered_date: payload.administeredDate || null,
        next_due_date: payload.nextDueDate,
        vet_name: payload.vetName,
        reminder_days_before: payload.reminderDaysBefore,
        notes: payload.notes,
      }),
    });
    return mapVaccination(vaccination);
  },

  async deleteVaccination(id: string): Promise<void> {
    return apiRequest<void>(`/vaccinations/${id}/`, { method: "DELETE" });
  },

  async listVaccinationReminders(filters?: { ownerName?: string; vetName?: string; status?: string }): Promise<VaccinationReminder[]> {
    const params = new URLSearchParams();
    if (filters?.ownerName) params.set("owner_name", filters.ownerName);
    if (filters?.vetName) params.set("vet_name", filters.vetName);
    if (filters?.status) params.set("status", filters.status);
    const query = params.toString() ? `?${params.toString()}` : "";
    const reminders = await apiRequest<BackendVaccinationReminder[]>(`/vaccination-reminders/${query}`);
    return reminders.map(mapVaccinationReminder);
  },

  async updateVaccinationReminder(payload: VaccinationReminder): Promise<VaccinationReminder> {
    const reminder = await apiRequest<BackendVaccinationReminder>(`/vaccination-reminders/${payload.id}/`, {
      method: "PUT",
      body: JSON.stringify({
        status: payload.status,
        reminder_date: payload.reminderDate,
        message: payload.message,
        vaccination: Number(payload.vaccinationId),
      }),
    });
    return mapVaccinationReminder(reminder);
  },

  async createMedicalRecord(payload: Omit<MedicalRecord, "id">): Promise<MedicalRecord> {
    const record = await apiRequest<BackendMedicalRecord>("/medical-records/", {
      method: "POST",
      body: JSON.stringify({
        pet: Number(payload.petId),
        date: payload.date,
        diagnosis: payload.diagnosis,
        treatment: payload.treatment,
        vet_name: payload.vetName,
        notes: payload.notes,
      }),
    });
    return mapMedicalRecord(record);
  },

  async updateMedicalRecord(payload: MedicalRecord): Promise<MedicalRecord> {
    const record = await apiRequest<BackendMedicalRecord>(`/medical-records/${payload.id}/`, {
      method: "PUT",
      body: JSON.stringify({
        pet: Number(payload.petId),
        date: payload.date,
        diagnosis: payload.diagnosis,
        treatment: payload.treatment,
        vet_name: payload.vetName,
        notes: payload.notes,
      }),
    });
    return mapMedicalRecord(record);
  },

  async deleteMedicalRecord(id: string): Promise<void> {
    return apiRequest<void>(`/medical-records/${id}/`, { method: "DELETE" });
  },

  async listUsers(): Promise<User[]> {
    const users = await apiRequest<BackendUser[]>("/users/");
    return users.map(mapUser);
  },

  async listVeterinarians(): Promise<VeterinarianProfile[]> {
    const vets = await apiRequest<BackendUser[]>("/veterinarians/", { auth: false });
    return vets.map(mapVeterinarian);
  },

  async createUser(payload: Omit<User, "id"> & { password?: string }): Promise<User> {
    const user = await apiRequest<BackendUser>("/users/", {
      method: "POST",
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        role: payload.role,
        phone: payload.phone,
        password: payload.password || "ChangeMe123!",
      }),
    });
    return mapUser(user);
  },

  async updateUser(payload: User): Promise<User> {
    const user = await apiRequest<BackendUser>(`/users/${payload.id}/`, {
      method: "PUT",
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        role: payload.role,
        phone: payload.phone,
      }),
    });
    return mapUser(user);
  },

  async deleteUser(id: string): Promise<void> {
    return apiRequest<void>(`/users/${id}/`, { method: "DELETE" });
  },

  async requestPasswordReset(email: string): Promise<{ message: string; token: string; email: string }> {
    return apiRequest<{ message: string; token: string; email: string }>("/auth/password-reset/", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email }),
    });
  },

  async confirmPasswordReset(token: string, newPassword: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>("/auth/password-reset-confirm/", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ token, new_password: newPassword }),
    });
  },
};
