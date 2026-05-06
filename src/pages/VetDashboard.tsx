import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CrudTable from "@/components/CrudTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Appointment, MedicalRecord, Pet, Vaccination, VaccinationReminder } from "@/types/petcare";
import { Stethoscope, Calendar, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const VetDashboard = () => {
  const { toast } = useToast();
  const user = getAuthUser();
  const vetName = user?.name || "";
  const [pets, setPets] = useState<Pet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [reminders, setReminders] = useState<VaccinationReminder[]>([]);

  const petIdByName = useMemo(() => {
    const map = new Map<string, string>();
    for (const pet of pets) {
      map.set(pet.name.toLowerCase(), pet.id);
    }
    return map;
  }, [pets]);

  const loadData = async () => {
    const [petsResult, appointmentsResult, recordsResult, vaccinationsResult, remindersResult] = await Promise.allSettled([
      api.listPets(),
      // Show all data to vets so they can manage clinic workload.
      api.listAppointments(),
      api.listMedicalRecords(),
      api.listVaccinations(),
      api.listVaccinationReminders(),
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

    if (recordsResult.status === "fulfilled") {
      setRecords(recordsResult.value);
    } else {
      toast({
        title: "Could not load medical records",
        description: recordsResult.reason instanceof Error ? recordsResult.reason.message : "Unknown error",
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
  }, [vetName]);

  const resolvePetId = (petName: string, petId: string): string => {
    return petId || petIdByName.get(petName.toLowerCase()) || "";
  };

  const addAppointment = async (appt: Omit<Appointment, "id">) => {
    try {
      const petId = resolvePetId(appt.petName, appt.petId);
      if (!petId) {
        throw new Error("Please select an existing pet.");
      }

      const created = await api.createAppointment({ ...appt, petId, vetName });
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
      const petId = resolvePetId(appt.petName, appt.petId);
      if (!petId) {
        throw new Error("Please select an existing pet.");
      }

      const updated = await api.updateAppointment({ ...appt, petId, vetName });
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

  const addRecord = async (rec: Omit<MedicalRecord, "id">) => {
    try {
      const petId = resolvePetId(rec.petName, rec.petId);
      if (!petId) {
        throw new Error("Please select an existing pet.");
      }

      const created = await api.createMedicalRecord({ ...rec, petId, vetName });
      setRecords((prev) => [created, ...prev]);
      toast({ title: "Medical record added" });
    } catch (error) {
      toast({
        title: "Failed to add medical record",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const addVaccination = async (vaccination: Omit<Vaccination, "id">) => {
    try {
      const petId = resolvePetId(vaccination.petName, vaccination.petId);
      if (!petId) {
        throw new Error("Please select an existing pet.");
      }

      const created = await api.createVaccination({ ...vaccination, petId, vetName });
      setVaccinations((prev) => [created, ...prev]);
      setReminders((prev) => [{
        id: `tmp-${Date.now()}`,
        vaccinationId: created.id,
        petName: created.petName,
        vaccineName: created.vaccineName,
        vetName: created.vetName,
        reminderDate: created.reminderDate || created.nextDueDate,
        message: created.reminderMessage || `${created.petName} is due for ${created.vaccineName}`,
        status: created.reminderStatus || "pending",
        lastSentAt: "",
      }, ...prev]);
      toast({ title: "Vaccination added" });
    } catch (error) {
      toast({
        title: "Failed to add vaccination",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const editVaccination = async (vaccination: Vaccination) => {
    try {
      const petId = resolvePetId(vaccination.petName, vaccination.petId);
      if (!petId) {
        throw new Error("Please select an existing pet.");
      }

      const updated = await api.updateVaccination({ ...vaccination, petId, vetName });
      setVaccinations((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setReminders((prev) => prev.map((item) => (
        item.vaccinationId === updated.id
          ? {
              ...item,
              petName: updated.petName,
              vaccineName: updated.vaccineName,
              vetName: updated.vetName,
              reminderDate: updated.reminderDate || updated.nextDueDate,
              message: updated.reminderMessage || item.message,
              status: updated.reminderStatus || item.status,
            }
          : item
      )));
      toast({ title: "Vaccination updated" });
    } catch (error) {
      toast({
        title: "Failed to update vaccination",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const deleteVaccination = async (id: string) => {
    try {
      await api.deleteVaccination(id);
      setVaccinations((prev) => prev.filter((item) => item.id !== id));
      setReminders((prev) => prev.filter((item) => item.vaccinationId !== id));
      toast({ title: "Vaccination deleted" });
    } catch (error) {
      toast({
        title: "Failed to delete vaccination",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const editRecord = async (rec: MedicalRecord) => {
    try {
      const petId = resolvePetId(rec.petName, rec.petId);
      if (!petId) {
        throw new Error("Please select an existing pet.");
      }

      const updated = await api.updateMedicalRecord({ ...rec, petId, vetName });
      setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      toast({ title: "Medical record updated" });
    } catch (error) {
      toast({
        title: "Failed to update medical record",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      await api.deleteMedicalRecord(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "Medical record deleted" });
    } catch (error) {
      toast({
        title: "Failed to delete medical record",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const navItems = [{ label: "Dashboard", href: "/vet" }];

  return (
    <DashboardLayout title="Veterinarian" navItems={navItems} roleColor="bg-accent/10 text-accent-foreground">
      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{appointments.filter((a) => a.status === "scheduled").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Medical Records</CardTitle>
            <FileText className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{records.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <Stethoscope className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{appointments.filter((a) => a.status === "completed").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vaccinations</CardTitle>
            <FileText className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{vaccinations.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="appointments">
        <TabsList>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="records">Medical Records</TabsTrigger>
          <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="mt-6">
          <CrudTable<Appointment>
            title="Appointments"
            data={appointments}
            columns={[
              { key: "petName", label: "Pet" },
              { key: "ownerName", label: "Owner" },
              { key: "date", label: "Date" },
              { key: "time", label: "Time" },
              { key: "reason", label: "Reason" },
              { key: "status", label: "Status", render: (val) => <Badge variant={val === "completed" ? "default" : val === "cancelled" ? "destructive" : "secondary"}>{String(val)}</Badge> },
            ]}
            fields={[
              {
                key: "petId",
                label: "Pet",
                options: pets.map((pet) => ({ value: pet.id, label: `${pet.name} (${pet.ownerName})` })),
              },
              { key: "ownerName", label: "Owner Name" },
              { key: "vetName", label: "Veterinarian" },
              { key: "date", label: "Date", type: "date" },
              { key: "time", label: "Time", type: "time" },
              { key: "reason", label: "Reason" },
              { key: "status", label: "Status", options: [{ value: "scheduled", label: "Scheduled" }, { value: "completed", label: "Completed" }, { value: "cancelled", label: "Cancelled" }] },
            ]}
            onAdd={addAppointment}
            onEdit={editAppointment}
            onDelete={deleteAppointment}
            defaultValues={{ petName: "", petId: pets[0]?.id || "", ownerName: "", vetName, date: "", time: "", reason: "", status: "scheduled" }}
          />
        </TabsContent>

        <TabsContent value="records" className="mt-6">
          <CrudTable<MedicalRecord>
            title="Medical Records"
            data={records}
            columns={[
              { key: "petName", label: "Pet" },
              { key: "date", label: "Date" },
              { key: "diagnosis", label: "Diagnosis" },
              { key: "treatment", label: "Treatment" },
              { key: "vetName", label: "Vet" },
            ]}
            fields={[
              {
                key: "petId",
                label: "Pet",
                options: pets.map((pet) => ({ value: pet.id, label: `${pet.name} (${pet.ownerName})` })),
              },
              { key: "date", label: "Date", type: "date" },
              { key: "diagnosis", label: "Diagnosis" },
              { key: "treatment", label: "Treatment" },
              { key: "vetName", label: "Veterinarian" },
              { key: "notes", label: "Notes" },
            ]}
            onAdd={addRecord}
            onEdit={editRecord}
            onDelete={deleteRecord}
            defaultValues={{ petName: "", petId: pets[0]?.id || "", date: "", diagnosis: "", treatment: "", vetName, notes: "" }}
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
            fields={[
              { key: "petId", label: "Pet", options: pets.map((pet) => ({ value: pet.id, label: `${pet.name} (${pet.ownerName})` })) },
              { key: "vaccineName", label: "Vaccine Name" },
              { key: "administeredDate", label: "Administered Date", type: "date" },
              { key: "nextDueDate", label: "Next Due Date", type: "date" },
              { key: "vetName", label: "Veterinarian" },
              { key: "reminderDaysBefore", label: "Reminder Days Before", type: "number" },
              { key: "notes", label: "Notes" },
            ]}
            onAdd={addVaccination}
            onEdit={editVaccination}
            onDelete={deleteVaccination}
            defaultValues={{ petName: "", petId: pets[0]?.id || "", vaccineName: "", administeredDate: "", nextDueDate: "", vetName, reminderDaysBefore: 7, notes: "" }}
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
            fields={[{ key: "status", label: "Status", options: [{ value: "pending", label: "Pending" }, { value: "sent", label: "Sent" }, { value: "acknowledged", label: "Acknowledged" }] }]}
            onAdd={() => undefined}
            onEdit={() => undefined}
            onDelete={() => undefined}
            defaultValues={{ vaccinationId: "", petName: "", vaccineName: "", vetName, reminderDate: "", message: "", status: "pending", lastSentAt: "" }}
            readOnly
          />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default VetDashboard;
