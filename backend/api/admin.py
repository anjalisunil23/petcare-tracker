from django.contrib import admin
from .models import Appointment, MedicalRecord, Pet, UserProfile, Vaccination, VaccinationReminder

@admin.register(Pet)
class PetAdmin(admin.ModelAdmin):
	list_display = ("id", "name", "species", "owner_name", "created_at")
	search_fields = ("name", "owner_name", "breed")


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
	list_display = ("id", "pet", "owner_name", "vet_name", "date", "time", "status")
	list_filter = ("status", "date")
	search_fields = ("pet__name", "owner_name", "vet_name", "reason")


@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
	list_display = ("id", "pet", "date", "diagnosis", "vet_name")
	list_filter = ("date",)
	search_fields = ("pet__name", "diagnosis", "treatment", "vet_name")


@admin.register(Vaccination)
class VaccinationAdmin(admin.ModelAdmin):
	list_display = ("id", "pet", "vaccine_name", "administered_date", "next_due_date", "vet_name")
	list_filter = ("next_due_date", "vet_name")
	search_fields = ("pet__name", "vaccine_name", "vet_name")


@admin.register(VaccinationReminder)
class VaccinationReminderAdmin(admin.ModelAdmin):
	list_display = ("id", "vaccination", "reminder_date", "status", "last_sent_at")
	list_filter = ("status", "reminder_date")
	search_fields = ("vaccination__pet__name", "vaccination__vaccine_name", "message")


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
	list_display = ("id", "user", "role", "phone")
	list_filter = ("role",)
	search_fields = ("user__email", "user__first_name", "phone")
