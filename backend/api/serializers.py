from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password

from .models import Appointment, MedicalRecord, Pet, UserProfile


class PetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pet
        fields = "__all__"


class AppointmentSerializer(serializers.ModelSerializer):
    pet_name = serializers.CharField(source="pet.name", read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "pet",
            "pet_name",
            "owner_name",
            "vet_name",
            "date",
            "time",
            "reason",
            "status",
            "created_at",
        ]


class MedicalRecordSerializer(serializers.ModelSerializer):
    pet_name = serializers.CharField(source="pet.name", read_only=True)

    class Meta:
        model = MedicalRecord
        fields = [
            "id",
            "pet",
            "pet_name",
            "date",
            "diagnosis",
            "treatment",
            "vet_name",
            "notes",
            "created_at",
        ]


class UserProfileSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="user.id", read_only=True)
    name = serializers.CharField(source="user.first_name")
    email = serializers.EmailField(source="user.email")
    join_date = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False, min_length=6)

    class Meta:
        model = UserProfile
        fields = ["id", "name", "email", "role", "phone", "join_date", "password"]

    def get_join_date(self, obj):
        # Convert datetime to YYYY-MM-DD expected by the frontend table.
        return obj.user.date_joined.date().isoformat()

    def validate(self, attrs):
        user_data = attrs.get("user", {})
        email = user_data.get("email", "").lower().strip()
        if email:
            existing = User.objects.filter(username=email)
            if self.instance:
                existing = existing.exclude(pk=self.instance.user_id)
            if existing.exists():
                raise serializers.ValidationError({"email": "Email already registered."})
            user_data["email"] = email
            attrs["user"] = user_data
        return attrs

    def create(self, validated_data):
        user_data = validated_data.pop("user", {})
        password = validated_data.pop("password", None)
        email = user_data.get("email", "").lower().strip()
        name = user_data.get("first_name", "")

        if not email:
            raise serializers.ValidationError({"email": "This field is required."})

        user = User.objects.create_user(
            username=email,
            email=email,
            first_name=name,
            password=password or User.objects.make_random_password(),
        )
        return UserProfile.objects.create(user=user, **validated_data)

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        password = validated_data.pop("password", None)

        user = instance.user
        if "first_name" in user_data:
            user.first_name = user_data["first_name"]
        if "email" in user_data:
            user.email = user_data["email"].lower().strip()
            user.username = user_data["email"].lower().strip()
        if password:
            user.set_password(password)
        user.save()

        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        return instance


class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES)

    def validate_password(self, value):
        validate_password(value)
        return value


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES, required=False)
