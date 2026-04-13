import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CrudTable from "@/components/CrudTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pet, Appointment, User } from "@/types/petcare";
import { Users, PawPrint, Calendar, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const petIdByName = useMemo(() => {
    const map = new Map<string, string>();
    for (const pet of pets) {
      map.set(pet.name.toLowerCase(), pet.id);
    }
    return map;
  }, [pets]);

  useEffect(() => {
    const loadData = async () => {
      const [usersResult, petsResult, appointmentsResult] = await Promise.allSettled([
        api.listUsers(),
        api.listPets(),
        api.listAppointments(),
      ]);

      if (usersResult.status === "fulfilled") {
        setUsers(usersResult.value);
      } else {
        toast({
          title: "Could not load users",
          description: usersResult.reason instanceof Error ? usersResult.reason.message : "Unknown error",
          variant: "destructive",
        });
      }

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
    };

    void loadData();
  }, []);

  // Users CRUD
  const addUser = async (u: Omit<User, "id">) => {
    try {
      const created = await api.createUser({ ...u, password: "ChangeMe123!" });
      setUsers((prev) => [created, ...prev]);
      toast({ title: "User added" });
    } catch (error) {
      toast({
        title: "Failed to add user",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };
  const editUser = async (u: User) => {
    try {
      const updated = await api.updateUser(u);
      setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      toast({ title: "User updated" });
    } catch (error) {
      toast({
        title: "Failed to update user",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };
  const deleteUser = async (id: string) => {
    try {
      await api.deleteUser(id);
      setUsers((prev) => prev.filter((x) => x.id !== id));
      toast({ title: "User deleted" });
    } catch (error) {
      toast({
        title: "Failed to delete user",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  // Pets CRUD
  const addPet = async (p: Omit<Pet, "id">) => {
    try {
      const created = await api.createPet(p);
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
  const editPet = async (p: Pet) => {
    try {
      const updated = await api.updatePet(p);
      setPets((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
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
      setPets((prev) => prev.filter((x) => x.id !== id));
      toast({ title: "Pet deleted" });
    } catch (error) {
      toast({
        title: "Failed to delete pet",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  // Appointments CRUD
  const resolvePetId = (appointment: Omit<Appointment, "id"> | Appointment): string => {
    return appointment.petId || petIdByName.get(appointment.petName.toLowerCase()) || "";
  };

  const addAppt = async (a: Omit<Appointment, "id">) => {
    try {
      const petId = resolvePetId(a);
      if (!petId) {
        throw new Error("Please select an existing pet.");
      }

      const created = await api.createAppointment({ ...a, petId });
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
  const editAppt = async (a: Appointment) => {
    try {
      const petId = resolvePetId(a);
      if (!petId) {
        throw new Error("Please select an existing pet.");
      }

      const updated = await api.updateAppointment({ ...a, petId });
      setAppointments((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      toast({ title: "Appointment updated" });
    } catch (error) {
      toast({
        title: "Failed to update appointment",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };
  const deleteAppt = async (id: string) => {
    try {
      await api.deleteAppointment(id);
      setAppointments((prev) => prev.filter((x) => x.id !== id));
      toast({ title: "Appointment deleted" });
    } catch (error) {
      toast({
        title: "Failed to delete appointment",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

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
              { key: "species", label: "Species", options: [{ value: "dog", label: "Dog" }, { value: "cat", label: "Cat" }, { value: "bird", label: "Bird" }, { value: "other", label: "Other" }] },
              { key: "breed", label: "Breed" },
              { key: "ownerName", label: "Owner Name" },
              { key: "age", label: "Age", type: "number" },
              { key: "weight", label: "Weight (kg)", type: "number" },
              { key: "notes", label: "Notes" },
            ]}
            onAdd={addPet}
            onEdit={editPet}
            onDelete={deletePet}
            defaultValues={{ name: "", species: "dog", breed: "", age: 0, ownerName: "", ownerId: "", weight: 0, notes: "" }}
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
            onAdd={addAppt}
            onEdit={editAppt}
            onDelete={deleteAppt}
            defaultValues={{ petName: "", petId: pets[0]?.id || "", ownerName: "", vetName: "", date: "", time: "", reason: "", status: "scheduled" }}
          />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default AdminDashboard;
