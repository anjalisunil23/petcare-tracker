import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CrudTable from "@/components/CrudTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { sampleAppointments, sampleMedicalRecords } from "@/data/sampleData";
import { Appointment, MedicalRecord } from "@/types/petcare";
import { Stethoscope, Calendar, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const VetDashboard = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(sampleAppointments);
  const [records, setRecords] = useState<MedicalRecord[]>(sampleMedicalRecords);

  const addAppointment = (appt: Omit<Appointment, "id">) => {
    setAppointments([...appointments, { ...appt, id: `a${Date.now()}` }]);
  };
  const editAppointment = (appt: Appointment) => {
    setAppointments(appointments.map((a) => (a.id === appt.id ? appt : a)));
  };
  const deleteAppointment = (id: string) => {
    setAppointments(appointments.filter((a) => a.id !== id));
  };

  const addRecord = (rec: Omit<MedicalRecord, "id">) => {
    setRecords([...records, { ...rec, id: `m${Date.now()}` }]);
  };
  const editRecord = (rec: MedicalRecord) => {
    setRecords(records.map((r) => (r.id === rec.id ? rec : r)));
  };
  const deleteRecord = (id: string) => {
    setRecords(records.filter((r) => r.id !== id));
  };

  const navItems = [{ label: "Dashboard", href: "/vet" }];

  return (
    <DashboardLayout title="Veterinarian" navItems={navItems} roleColor="bg-accent/10 text-accent-foreground">
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
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
      </div>

      <Tabs defaultValue="appointments">
        <TabsList>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="records">Medical Records</TabsTrigger>
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
              { key: "petName", label: "Pet Name" },
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
            defaultValues={{ petName: "", petId: "", ownerName: "", vetName: "Dr. Sarah Wilson", date: "", time: "", reason: "", status: "scheduled" }}
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
              { key: "petName", label: "Pet Name" },
              { key: "date", label: "Date", type: "date" },
              { key: "diagnosis", label: "Diagnosis" },
              { key: "treatment", label: "Treatment" },
              { key: "vetName", label: "Veterinarian" },
              { key: "notes", label: "Notes" },
            ]}
            onAdd={addRecord}
            onEdit={editRecord}
            onDelete={deleteRecord}
            defaultValues={{ petName: "", petId: "", date: "", diagnosis: "", treatment: "", vetName: "Dr. Sarah Wilson", notes: "" }}
          />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default VetDashboard;
