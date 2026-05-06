from django.test import TestCase
from datetime import date, timedelta

from .models import Pet, Vaccination, VaccinationReminder


class VaccinationReminderTests(TestCase):
    def setUp(self):
        self.pet = Pet.objects.create(
            name="TestPet",
            species="dog",
            breed="TestBreed",
            age=3,
            weight=10.5,
            owner_name="Tester",
        )

    def test_reminder_created_and_marked_sent_on_administered(self):
        next_due = date.today() + timedelta(days=30)
        v = Vaccination.objects.create(
            pet=self.pet,
            vaccine_name="Rabies",
            administered_date=None,
            next_due_date=next_due,
            vet_name="Dr Test",
            reminder_days_before=3,
            notes="Initial",
        )

        # Reminder should be created and initially pending
        r = VaccinationReminder.objects.get(vaccination=v)
        self.assertEqual(r.status, "pending")

        # Mark vaccination administered and save
        v.administered_date = date.today()
        v.save()

        # Refresh reminder from DB and verify status updated to 'sent'
        r.refresh_from_db()
        self.assertEqual(r.status, "sent")
