from django.db import models
from django.contrib.auth.models import User

class Pet(models.Model):
    SPECIES_CHOICES = [
        ("dog", "Dog"),
        ("cat", "Cat"),
        ("bird", "Bird"),
        ("other", "Other"),
    ]

    name = models.CharField(max_length=100)
    species = models.CharField(max_length=20, choices=SPECIES_CHOICES)
    breed = models.CharField(max_length=100, blank=True)
    age = models.PositiveIntegerField(default=0)
    weight = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    owner_name = models.CharField(max_length=120)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.name} ({self.owner_name})"


class Appointment(models.Model):
	STATUS_CHOICES = [
		("scheduled", "Scheduled"),
		("completed", "Completed"),
		("cancelled", "Cancelled"),
	]

	pet = models.ForeignKey(Pet, on_delete=models.CASCADE, related_name="appointments")
	owner_name = models.CharField(max_length=120)
	vet_name = models.CharField(max_length=120)
	date = models.DateField()
	time = models.TimeField()
	reason = models.CharField(max_length=255)
	status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="scheduled")
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self) -> str:
		return f"{self.pet.name} - {self.date} {self.time}"


class MedicalRecord(models.Model):
	pet = models.ForeignKey(Pet, on_delete=models.CASCADE, related_name="medical_records")
	date = models.DateField()
	diagnosis = models.CharField(max_length=255)
	treatment = models.CharField(max_length=255)
	vet_name = models.CharField(max_length=120)
	notes = models.TextField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self) -> str:
		return f"{self.pet.name} - {self.diagnosis}"


class UserProfile(models.Model):
	ROLE_CHOICES = [
		("owner", "Owner"),
		("vet", "Veterinarian"),
		("admin", "Administrator"),
	]

	user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
	role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="owner")
	phone = models.CharField(max_length=30, blank=True)

	def __str__(self) -> str:
		return f"{self.user.email} - {self.role}"
