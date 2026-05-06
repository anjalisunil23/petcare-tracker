from django.db import models
from django.contrib.auth.models import User
import uuid
from datetime import timedelta
from django.utils import timezone

class PasswordReset(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="password_reset")
	token = models.CharField(max_length=255, unique=True, default=uuid.uuid4)
	created_at = models.DateTimeField(auto_now_add=True)
	expires_at = models.DateTimeField()

	def save(self, *args, **kwargs):
		if not self.expires_at:
			self.expires_at = timezone.now() + timedelta(hours=24)
		super().save(*args, **kwargs)

	def is_valid(self):
		return timezone.now() < self.expires_at

	def __str__(self):
		return f"Password reset for {self.user.email}"


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


class Vaccination(models.Model):
	pet = models.ForeignKey(Pet, on_delete=models.CASCADE, related_name="vaccinations")
	vaccine_name = models.CharField(max_length=120)
	administered_date = models.DateField(null=True, blank=True)
	next_due_date = models.DateField()
	vet_name = models.CharField(max_length=120)
	reminder_days_before = models.PositiveIntegerField(default=7)
	notes = models.TextField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	def save(self, *args, **kwargs):
		super().save(*args, **kwargs)
		reminder_date = self.next_due_date - timedelta(days=self.reminder_days_before)
		reminder, _ = VaccinationReminder.objects.update_or_create(
			vaccination=self,
			defaults={
				"reminder_date": reminder_date,
				"message": f"{self.pet.name} is due for {self.vaccine_name} on {self.next_due_date.isoformat()}",
			},
		)
		# If the vaccination has been administered, mark the reminder as sent
		if self.administered_date:
			if reminder.status != "sent":
				reminder.status = "sent"
				reminder.save()

	def __str__(self) -> str:
		return f"{self.pet.name} - {self.vaccine_name}"


class VaccinationReminder(models.Model):
	STATUS_CHOICES = [
		("pending", "Pending"),
		("sent", "Sent"),
		("acknowledged", "Acknowledged"),
	]

	vaccination = models.OneToOneField(Vaccination, on_delete=models.CASCADE, related_name="reminder")
	reminder_date = models.DateField()
	message = models.CharField(max_length=255)
	status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
	last_sent_at = models.DateTimeField(null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def is_due(self):
		return timezone.localdate() >= self.reminder_date and self.status == "pending"

	def __str__(self) -> str:
		return f"Reminder for {self.vaccination.pet.name} - {self.vaccination.vaccine_name}"


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
