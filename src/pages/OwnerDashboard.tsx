import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CrudTable from "@/components/CrudTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { samplePets, sampleAppointments } from "@/data/sampleData";
import { Pet, Appointment } from "@/types/petcare";
import { PawPrint, Calendar, Heart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const OwnerDashboard = () => {
  const [pets, setPets] = useState<Pet[]>(samplePets.filter((p) => p.ownerId === "u1"));
  const [appointments, setAppointments] = useState<Appointment[]>(
    sampleAppointments.filter((a) => a.ownerName === "John Smith")
  );

  const addPet = (pet: Omit<Pet, "id">) => {
    setPets([...pets, { ...pet, id: `p${Date.now()}`, ownerName: "John Smith", ownerId: "u1" }]);
  };

  const editPet = (pet: Pet) => {
    setPets(pets.map((p) => (p.id === pet.id ? pet : p)));
  };

  const deletePet = (id: string) => {
    setPets(pets.filter((p) => p.id !== id));
  };

  const addAppointment = (appt: Omit<Appointment, "id">) => {
    setAppointments([...appointments, { ...appt, id: `a${Date.now()}`, ownerName: "John Smith" }]);
  };

  const editAppointment = (appt: Appointment) => {
    setAppointments(appointments.map((a) => (a.id === appt.id ? appt : a)));
  };

  const deleteAppointment = (id: string) => {
    setAppointments(appointments.filter((a) => a.id !== id));
  };

  const navItems = [
    { label: "Dashboard", href: "/owner" },
  ];

  return (
    <DashboardLayout title="Pet Owner" navItems={navItems} roleColor="bg-primary/10 text-primary">
      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
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
      </div>

      <Tabs defaultValue="pets">
        <TabsList>
          <TabsTrigger value="pets">My Pets</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
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
              { key: "species", label: "Species", options: [{ value: "Dog", label: "Dog" }, { value: "Cat", label: "Cat" }, { value: "Bird", label: "Bird" }, { value: "Other", label: "Other" }] },
              { key: "breed", label: "Breed" },
              { key: "age", label: "Age", type: "number" },
              { key: "weight", label: "Weight (kg)", type: "number" },
              { key: "notes", label: "Notes" },
            ]}
            onAdd={addPet}
            onEdit={editPet}
            onDelete={deletePet}
            defaultValues={{ name: "", species: "Dog", breed: "", age: 0, ownerName: "John Smith", ownerId: "u1", weight: 0, notes: "" }}
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
              { key: "petName", label: "Pet Name" },
              { key: "vetName", label: "Veterinarian" },
              { key: "date", label: "Date", type: "date" },
              { key: "time", label: "Time", type: "time" },
              { key: "reason", label: "Reason" },
              { key: "status", label: "Status", options: [{ value: "scheduled", label: "Scheduled" }, { value: "completed", label: "Completed" }, { value: "cancelled", label: "Cancelled" }] },
            ]}
            onAdd={addAppointment}
            onEdit={editAppointment}
            onDelete={deleteAppointment}
            defaultValues={{ petName: "", petId: "", ownerName: "John Smith", vetName: "", date: "", time: "", reason: "", status: "scheduled" }}
          />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default OwnerDashboard;
