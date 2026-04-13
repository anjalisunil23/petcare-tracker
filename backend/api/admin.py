from django.contrib import admin
from .models import Appointment, MedicalRecord, Pet, UserProfile

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


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
	list_display = ("id", "user", "role", "phone")
	list_filter = ("role",)
	search_fields = ("user__email", "user__first_name", "phone")
