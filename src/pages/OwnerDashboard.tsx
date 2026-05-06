import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CrudTable from "@/components/CrudTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pet, Appointment, VeterinarianProfile, Vaccination, VaccinationReminder } from "@/types/petcare";
import { PawPrint, Calendar, Heart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useNavigate } from "react-router-dom";

const OwnerDashboard = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const user = getAuthUser();
  const ownerName = user?.name || "";
  const [pets, setPets] = useState<Pet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [veterinarians, setVeterinarians] = useState<VeterinarianProfile[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [reminders, setReminders] = useState<VaccinationReminder[]>([]);
  const [activeTab, setActiveTab] = useState("pets");
  const [openCreateKey, setOpenCreateKey] = useState<number | undefined>(undefined);

  const bookingParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const preselectedVetName = bookingParams.get("vetName")?.trim() || "";
  const shouldStartBooking = bookingParams.get("book") === "1";

  const petIdByName = useMemo(() => {
    const map = new Map<string, string>();
    for (const pet of pets) {
      map.set(pet.name.toLowerCase(), pet.id);
    }
    return map;
  }, [pets]);

  const loadData = async () => {
    const [petsResult, appointmentsResult, veterinariansResult, vaccinationsResult, remindersResult] = await Promise.allSettled([
      api.listPets(ownerName),
      api.listAppointments({ ownerName }),
      api.listVeterinarians(),
      api.listVaccinations({ ownerName }),
      api.listVaccinationReminders({ ownerName }),
    ]);

    if (petsResult.status === "fulfilled") {
      setPets(petsResult.value);
    } else {
      toast({
        title: "Could not load pets",
        description: petsResult.reason instanceof Error ? petsResult.reason.message : "Unknown error",
        variant: "destructive",
      });
    }

    if (appointmentsResult.status === "fulfilled") {
      setAppointments(appointmentsResult.value);
    } else {
      toast({
        title: "Could not load appointments",
        description: appointmentsResult.reason instanceof Error ? appointmentsResult.reason.message : "Unknown error",
        variant: "destructive",
      });
    }

    if (veterinariansResult.status === "fulfilled") {
      setVeterinarians(veterinariansResult.value);
    } else {
      toast({
        title: "Could not load veterinarians",
        description: veterinariansResult.reason instanceof Error ? veterinariansResult.reason.message : "Unknown error",
        variant: "destructive",
      });
    }

    if (vaccinationsResult.status === "fulfilled") {
      setVaccinations(vaccinationsResult.value);
    } else {
      toast({
        title: "Could not load vaccinations",
        description: vaccinationsResult.reason instanceof Error ? vaccinationsResult.reason.message : "Unknown error",
        variant: "destructive",
      });
    }

    if (remindersResult.status === "fulfilled") {
      setReminders(remindersResult.value);
    } else {
      toast({
        title: "Could not load reminders",
        description: remindersResult.reason instanceof Error ? remindersResult.reason.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    void loadData();
  }, [ownerName]);

  useEffect(() => {
    if (!shouldStartBooking) {
      return;
    }

    setActiveTab("appointments");

    if (!pets.length) {
      toast({
        title: "Add a pet first",
        description: "Create a pet profile before booking an appointment.",
      });
      return;
    }

    setOpenCreateKey((prev) => (prev ?? 0) + 1);

    const nextParams = new URLSearchParams(location.search);
    nextParams.delete("book");
    navigate(
      {
        pathname: location.pathname,
        search: nextParams.toString() ? `?${nextParams.toString()}` : "",
      },
      { replace: true }
    );
  }, [shouldStartBooking, pets.length, location.pathname, location.search, navigate, toast]);

  const addPet = async (pet: Omit<Pet, "id">) => {
    try {
      const created = await api.createPet({ ...pet, ownerName, ownerId: "" });
      setPets((prev) => [created, ...prev]);
      toast({ title: "Pet added" });
    } catch (error) {
      toast({
        title: "Failed to add pet",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const editPet = async (pet: Pet) => {
    try {
      const updated = await api.updatePet({ ...pet, ownerName, ownerId: "" });
      setPets((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      toast({ title: "Pet updated" });
    } catch (error) {
      toast({
        title: "Failed to update pet",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const deletePet = async (id: string) => {
    try {
      await api.deletePet(id);
      setPets((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Pet deleted" });
    } catch (error) {
      toast({
        title: "Failed to delete pet",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const resolvePetId = (appointment: Omit<Appointment, "id"> | Appointment): string => {
    return appointment.petId || petIdByName.get(appointment.petName.toLowerCase()) || "";
  };

  const addAppointment = async (appt: Omit<Appointment, "id">) => {
    try {
      const petId = resolvePetId(appt);
      if (!petId) {
        throw new Error("Please select an existing pet.");
      }

      const created = await api.createAppointment({ ...appt, petId, ownerName });
      setAppointments((prev) => [created, ...prev]);
      toast({ title: "Appointment added" });
    } catch (error) {
      toast({
        title: "Failed to add appointment",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const editAppointment = async (appt: Appointment) => {
    try {
      const petId = resolvePetId(appt);
      if (!petId) {
        throw new Error("Please select an existing pet.");
      }

      const updated = await api.updateAppointment({ ...appt, petId, ownerName });
      setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      toast({ title: "Appointment updated" });
    } catch (error) {
      toast({
        title: "Failed to update appointment",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      await api.deleteAppointment(id);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      toast({ title: "Appointment deleted" });
    } catch (error) {
      toast({
        title: "Failed to delete appointment",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const navItems = [
    { label: "Dashboard", href: "/owner" },
  ];

  return (
    <DashboardLayout title="Pet Owner" navItems={navItems} roleColor="bg-primary/10 text-primary">
      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My Pets</CardTitle>
            <PawPrint className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pets.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{appointments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming</CardTitle>
            <Heart className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{appointments.filter((a) => a.status === "scheduled").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reminders</CardTitle>
            <Badge variant="secondary">{reminders.length}</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{reminders.filter((reminder) => reminder.status === "pending").length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pets">My Pets</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
        </TabsList>

        <TabsContent value="pets" className="mt-6">
          <CrudTable<Pet>
            title="Pets"
            data={pets}
            columns={[
              { key: "name", label: "Name" },
              { key: "species", label: "Species" },
              { key: "breed", label: "Breed" },
              { key: "age", label: "Age" },
              { key: "weight", label: "Weight (kg)" },
            ]}
            fields={[
              { key: "name", label: "Name" },
              { key: "species", label: "Species", options: [{ value: "dog", label: "Dog" }, { value: "cat", label: "Cat" }, { value: "bird", label: "Bird" }, { value: "other", label: "Other" }] },
              { key: "breed", label: "Breed" },
              { key: "age", label: "Age", type: "number" },
              { key: "weight", label: "Weight (kg)", type: "number" },
              { key: "notes", label: "Notes" },
            ]}
            onAdd={addPet}
            onEdit={editPet}
            onDelete={deletePet}
            defaultValues={{ name: "", species: "dog", breed: "", age: 0, ownerName, ownerId: "", weight: 0, notes: "" }}
          />
        </TabsContent>

        <TabsContent value="appointments" className="mt-6">
          <CrudTable<Appointment>
            title="Appointments"
            data={appointments}
            columns={[
              { key: "petName", label: "Pet" },
              { key: "vetName", label: "Veterinarian" },
              { key: "date", label: "Date" },
              { key: "time", label: "Time" },
              { key: "reason", label: "Reason" },
              {
                key: "status",
                label: "Status",
                render: (val) => (
                  <Badge variant={val === "completed" ? "default" : val === "cancelled" ? "destructive" : "secondary"}>
                    {String(val)}
                  </Badge>
                ),
              },
            ]}
            fields={[
              {
                key: "petId",
                label: "Pet",
                options: pets.map((pet) => ({ value: pet.id, label: pet.name })),
              },
              {
                key: "vetName",
                label: "Veterinarian",
                options: veterinarians.map((vet) => ({ value: vet.name, label: vet.name })),
              },
              { key: "date", label: "Date", type: "date" },
              { key: "time", label: "Time", type: "time" },
              { key: "reason", label: "Reason" },
              { key: "status", label: "Status", options: [{ value: "scheduled", label: "Scheduled" }, { value: "completed", label: "Completed" }, { value: "cancelled", label: "Cancelled" }] },
            ]}
            onAdd={addAppointment}
            onEdit={editAppointment}
            onDelete={deleteAppointment}
            defaultValues={{ petName: "", petId: pets[0]?.id || "", ownerName, vetName: preselectedVetName || "", date: "", time: "", reason: "", status: "scheduled" }}
            createDraft={{ vetName: preselectedVetName || "" }}
            openCreateKey={openCreateKey}
          />
        </TabsContent>

        <TabsContent value="vaccinations" className="mt-6">
          <CrudTable<Vaccination>
            title="Vaccinations"
            data={vaccinations}
            columns={[
              { key: "petName", label: "Pet" },
              { key: "vaccineName", label: "Vaccine" },
              { key: "administeredDate", label: "Administered" },
              { key: "nextDueDate", label: "Next Due" },
              { key: "vetName", label: "Vet" },
              {
                key: "reminderStatus",
                label: "Reminder",
                render: (val, item) => (
                  <Badge variant={val === "sent" ? "default" : val === "acknowledged" ? "secondary" : "outline"}>
                    {String(val || "pending")} {item.reminderDate ? `• ${item.reminderDate}` : ""}
                  </Badge>
                ),
              },
            ]}
            fields={[] as never[]}
            onAdd={() => undefined}
            onEdit={() => undefined}
            onDelete={() => undefined}
            defaultValues={{ petName: "", petId: "", vaccineName: "", administeredDate: "", nextDueDate: "", vetName: "", reminderDaysBefore: 7, notes: "" }}
            readOnly
          />
        </TabsContent>

        <TabsContent value="reminders" className="mt-6">
          <CrudTable<VaccinationReminder>
            title="Reminders"
            data={reminders}
            columns={[
              { key: "petName", label: "Pet" },
              { key: "vaccineName", label: "Vaccine" },
              { key: "reminderDate", label: "Reminder Date" },
              { key: "message", label: "Message" },
              {
                key: "status",
                label: "Status",
                render: (val) => (
                  <Badge variant={val === "sent" ? "default" : val === "acknowledged" ? "secondary" : "outline"}>
                    {String(val)}
                  </Badge>
                ),
              },
            ]}
            fields={[] as never[]}
            onAdd={() => undefined}
            onEdit={() => undefined}
            onDelete={() => undefined}
            defaultValues={{ vaccinationId: "", petName: "", vaccineName: "", vetName: "", reminderDate: "", message: "", status: "pending", lastSentAt: "" }}
            readOnly
          />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default OwnerDashboard;
