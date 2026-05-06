import os
import django
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Pet, Vaccination


def main():
    pets = list(Pet.objects.all()[:5])
    if not pets:
        print('No pets found in DB. Create pets first.')
        return
    print('Found pets:')
    for p in pets:
        print(p.id, p.name)

    created = []
    today = date.today()
    data = []
    if len(pets) >= 1:
        data.append((pets[0], 'Rabies', None, today + timedelta(days=1), 'Dr Test', 1, 'Annual rabies'))
    if len(pets) >= 2:
        data.append((pets[1], 'Distemper', today - timedelta(days=10), today + timedelta(days=2), 'Dr Test', 3, 'Booster'))
    if len(pets) >= 3:
        data.append((pets[2], 'Parvo', None, today, 'Dr Test', 0, 'Due today'))

    for pet, vname, admin, nd, vet, days, notes in data:
        v, created_flag = Vaccination.objects.get_or_create(
            pet=pet,
            vaccine_name=vname,
            defaults={
                'administered_date': admin,
                'next_due_date': nd,
                'vet_name': vet,
                'reminder_days_before': days,
                'notes': notes,
            }
        )
        if not created_flag:
            v.administered_date = admin
            v.next_due_date = nd
            v.vet_name = vet
            v.reminder_days_before = days
            v.notes = notes
            v.save()
        else:
            # ensure save triggers reminder creation
            v.save()
        r = getattr(v, 'reminder', None)
        created.append((str(v.id), v.pet.name, v.vaccine_name, v.next_due_date.isoformat() if v.next_due_date else None, r.reminder_date.isoformat() if r and r.reminder_date else None, r.status if r else None))

    print('\nCreated/Updated vaccinations and reminders:')
    for c in created:
        print('Vaccination ID:', c[0], 'Pet:', c[1], 'Vaccine:', c[2], 'Next due:', c[3], 'Reminder date:', c[4], 'Status:', c[5])


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        import traceback
        traceback.print_exc()
        print('Error:', e)
