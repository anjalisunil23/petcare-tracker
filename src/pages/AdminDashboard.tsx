import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CrudTable from "@/components/CrudTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { samplePets, sampleAppointments, sampleUsers } from "@/data/sampleData";
import { Pet, Appointment, User } from "@/types/petcare";
import { Users, PawPrint, Calendar, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const [pets, setPets] = useState<Pet[]>(samplePets);
  const [appointments, setAppointments] = useState<Appointment[]>(sampleAppointments);

  // Users CRUD
  const addUser = (u: Omit<User, "id">) => setUsers([...users, { ...u, id: `u${Date.now()}` }]);
  const editUser = (u: User) => setUsers(users.map((x) => (x.id === u.id ? u : x)));
  const deleteUser = (id: string) => setUsers(users.filter((x) => x.id !== id));

  // Pets CRUD
  const addPet = (p: Omit<Pet, "id">) => setPets([...pets, { ...p, id: `p${Date.now()}` }]);
  const editPet = (p: Pet) => setPets(pets.map((x) => (x.id === p.id ? p : x)));
  const deletePet = (id: string) => setPets(pets.filter((x) => x.id !== id));

  // Appointments CRUD
  const addAppt = (a: Omit<Appointment, "id">) => setAppointments([...appointments, { ...a, id: `a${Date.now()}` }]);
  const editAppt = (a: Appointment) => setAppointments(appointments.map((x) => (x.id === a.id ? a : x)));
  const deleteAppt = (id: string) => setAppointments(appointments.filter((x) => x.id !== id));

  const navItems = [{ label: "Dashboard", href: "/admin" }];

  return (
    <DashboardLayout title="Administrator" navItems={navItems} roleColor="bg-secondary text-secondary-foreground">
      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-3xl font-bold">{users.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pets</CardTitle>
            <PawPrint className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-3xl font-bold">{pets.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent><p className="text-3xl font-bold">{appointments.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vets</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-3xl font-bold">{users.filter((u) => u.role === "vet").length}</p></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="pets">Pets</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <CrudTable<User>
            title="Users"
            data={users}
            columns={[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "role", label: "Role", render: (val) => <Badge variant={val === "admin" ? "default" : "secondary"}>{String(val)}</Badge> },
              { key: "phone", label: "Phone" },
              { key: "joinDate", label: "Joined" },
            ]}
            fields={[
              { key: "name", label: "Name" },
              { key: "email", label: "Email", type: "email" },
              { key: "role", label: "Role", options: [{ value: "owner", label: "Pet Owner" }, { value: "vet", label: "Veterinarian" }, { value: "admin", label: "Admin" }] },
              { key: "phone", label: "Phone" },
              { key: "joinDate", label: "Join Date", type: "date" },
            ]}
            onAdd={addUser}
            onEdit={editUser}
            onDelete={deleteUser}
            defaultValues={{ name: "", email: "", role: "owner", phone: "", joinDate: new Date().toISOString().split("T")[0] }}
          />
        </TabsContent>

        <TabsContent value="pets" className="mt-6">
          <CrudTable<Pet>
            title="Pets"
            data={pets}
            columns={[
              { key: "name", label: "Name" },
              { key: "species", label: "Species" },
              { key: "breed", label: "Breed" },
              { key: "ownerName", label: "Owner" },
              { key: "age", label: "Age" },
            ]}
            fields={[
              { key: "name", label: "Name" },
              { key: "species", label: "Species", options: [{ value: "Dog", label: "Dog" }, { value: "Cat", label: "Cat" }, { value: "Bird", label: "Bird" }, { value: "Other", label: "Other" }] },
              { key: "breed", label: "Breed" },
              { key: "ownerName", label: "Owner Name" },
              { key: "age", label: "Age", type: "number" },
              { key: "weight", label: "Weight (kg)", type: "number" },
              { key: "notes", label: "Notes" },
            ]}
            onAdd={addPet}
            onEdit={editPet}
            onDelete={deletePet}
            defaultValues={{ name: "", species: "Dog", breed: "", age: 0, ownerName: "", ownerId: "", weight: 0, notes: "" }}
          />
        </TabsContent>

        <TabsContent value="appointments" className="mt-6">
          <CrudTable<Appointment>
            title="Appointments"
            data={appointments}
            columns={[
              { key: "petName", label: "Pet" },
              { key: "ownerName", label: "Owner" },
              { key: "vetName", label: "Vet" },
              { key: "date", label: "Date" },
              { key: "status", label: "Status", render: (val) => <Badge variant={val === "completed" ? "default" : val === "cancelled" ? "destructive" : "secondary"}>{String(val)}</Badge> },
            ]}
            fields={[
              { key: "petName", label: "Pet Name" },
              { key: "ownerName", label: "Owner Name" },
              { key: "vetName", label: "Veterinarian" },
              { key: "date", label: "Date", type: "date" },
              { key: "time", label: "Time", type: "time" },
              { key: "reason", label: "Reason" },
              { key: "status", label: "Status", options: [{ value: "scheduled", label: "Scheduled" }, { value: "completed", label: "Completed" }, { value: "cancelled", label: "Cancelled" }] },
            ]}
            onAdd={addAppt}
            onEdit={editAppt}
            onDelete={deleteAppt}
            defaultValues={{ petName: "", petId: "", ownerName: "", vetName: "", date: "", time: "", reason: "", status: "scheduled" }}
          />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default AdminDashboard;
