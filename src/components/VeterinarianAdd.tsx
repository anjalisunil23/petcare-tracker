import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { User } from "@/types/petcare";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface VeterinarianAddProps {
  onVeterinarianAdded: (vet: User) => void;
  onVeterinarianUpdated: (vet: User) => void;
  onVeterinarianDeleted: (id: string) => void;
  veterinarians: User[];
}

export const VeterinarianAdd = ({
  onVeterinarianAdded,
  onVeterinarianUpdated,
  onVeterinarianDeleted,
  veterinarians,
}: VeterinarianAddProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "" });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (vet: User) => {
    setFormData({
      name: vet.name,
      email: vet.email,
      phone: vet.phone,
    });
    setIsEditing(true);
    setEditingId(vet.id);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this veterinarian?")) return;

    try {
      setIsSubmitting(true);
      await api.deleteUser(id);
      onVeterinarianDeleted(id);
      toast({ title: "Veterinarian deleted successfully" });
    } catch (error) {
      toast({
        title: "Failed to delete veterinarian",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast({
        title: "Missing fields",
        description: "Name and email are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      if (isEditing && editingId) {
        const updated = await api.updateUser({
          id: editingId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: "vet",
          joinDate: "",
        });
        onVeterinarianUpdated(updated);
        toast({ title: "Veterinarian updated successfully" });
      } else {
        const newVet = await api.createUser({
          name: formData.name,
          email: formData.email,
          role: "vet",
          phone: formData.phone,
          joinDate: new Date().toISOString().split("T")[0],
        });
        onVeterinarianAdded(newVet);
        toast({ title: "Veterinarian added successfully" });
      }

      resetForm();
      setOpen(false);
    } catch (error) {
      toast({
        title: isEditing ? "Failed to update veterinarian" : "Failed to add veterinarian",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Veterinarian
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Veterinarian" : "Add New Veterinarian"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update the veterinarian's information" : "Fill in the details to add a new veterinarian to the system"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vet-name">Full Name *</Label>
              <Input
                id="vet-name"
                placeholder="Dr. John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vet-email">Email Address *</Label>
              <Input
                id="vet-email"
                type="email"
                placeholder="doctor@vetclinic.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vet-phone">Phone Number</Label>
              <Input
                id="vet-phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (isEditing ? "Updating..." : "Adding...") : isEditing ? "Update" : "Add Veterinarian"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {veterinarians.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No veterinarians added yet. Add one to get started!</p>
            </CardContent>
          </Card>
        ) : (
          veterinarians.map((vet) => (
            <Card key={vet.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{vet.name}</CardTitle>
                    <CardDescription>{vet.email}</CardDescription>
                  </div>
                  <Badge variant="secondary">Veterinarian</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {vet.phone && (
                    <p>
                      <span className="text-muted-foreground">Phone:</span> {vet.phone}
                    </p>
                  )}
                  <p>
                    <span className="text-muted-foreground">Joined:</span> {new Date(vet.joinDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => handleEdit(vet)}
                    disabled={isSubmitting}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-2"
                    onClick={() => handleDelete(vet.id)}
                    disabled={isSubmitting}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default VeterinarianAdd;
