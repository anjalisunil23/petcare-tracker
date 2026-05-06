from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import permissions, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Appointment, MedicalRecord, Pet, UserProfile, PasswordReset, Vaccination, VaccinationReminder
from .serializers import (
	AppointmentSerializer,
	LoginSerializer,
	MedicalRecordSerializer,
	PetSerializer,
	RegisterSerializer,
	UserProfileSerializer,
	PasswordResetRequestSerializer,
	PasswordResetConfirmSerializer,
	VaccinationSerializer,
	VaccinationReminderSerializer,
)


def build_auth_user_payload(user: User) -> dict:
	profile, _ = UserProfile.objects.get_or_create(user=user)
	return {
		"id": user.id,
		"name": user.first_name or user.username,
		"email": user.email,
		"role": profile.role,
		"phone": profile.phone,
	}


class HealthView(APIView):
	permission_classes = [permissions.AllowAny]

	def get(self, request):
		return Response({"status": "ok", "service": "petcare-django-backend"})


class RegisterView(APIView):
	permission_classes = [permissions.AllowAny]

	def post(self, request):
		serializer = RegisterSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)

		email = serializer.validated_data["email"].lower().strip()
		if User.objects.filter(username=email).exists():
			return Response({"detail": "Email already registered."}, status=status.HTTP_400_BAD_REQUEST)

		user = User.objects.create_user(
			username=email,
			email=email,
			first_name=serializer.validated_data["name"],
			password=serializer.validated_data["password"],
		)
		UserProfile.objects.create(user=user, role=serializer.validated_data["role"])
		token, _ = Token.objects.get_or_create(user=user)

		return Response({"token": token.key, "user": build_auth_user_payload(user)}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
	permission_classes = [permissions.AllowAny]

	def post(self, request):
		serializer = LoginSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)

		email = serializer.validated_data["email"].lower().strip()
		password = serializer.validated_data["password"]
		role = serializer.validated_data.get("role")

		user = authenticate(username=email, password=password)
		if not user:
			return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

		profile, _ = UserProfile.objects.get_or_create(user=user)
		if role and profile.role != role:
			return Response({"detail": "Selected role does not match this account."}, status=status.HTTP_400_BAD_REQUEST)

		token, _ = Token.objects.get_or_create(user=user)
		return Response({"token": token.key, "user": build_auth_user_payload(user)})


class LogoutView(APIView):
	def post(self, request):
		if request.auth:
			request.auth.delete()
		return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
	def get(self, request):
		return Response(build_auth_user_payload(request.user))


class VetDirectoryView(APIView):
	permission_classes = [permissions.AllowAny]

	def get(self, request):
		vets = UserProfile.objects.select_related("user").filter(role="vet").order_by("user__first_name", "user__email")
		serializer = UserProfileSerializer(vets, many=True)
		return Response(serializer.data)


class PetViewSet(viewsets.ModelViewSet):
	serializer_class = PetSerializer

	def get_queryset(self):
		queryset = Pet.objects.all().order_by("-created_at")
		owner_name = self.request.query_params.get("owner_name")
		if owner_name:
			queryset = queryset.filter(owner_name=owner_name)
		return queryset


class AppointmentViewSet(viewsets.ModelViewSet):
	serializer_class = AppointmentSerializer

	def get_queryset(self):
		queryset = Appointment.objects.select_related("pet").all().order_by("-date", "-time")
		owner_name = self.request.query_params.get("owner_name")
		vet_name = self.request.query_params.get("vet_name")

		if owner_name:
			queryset = queryset.filter(owner_name=owner_name)
		if vet_name:
			queryset = queryset.filter(vet_name=vet_name)
		return queryset


class MedicalRecordViewSet(viewsets.ModelViewSet):
	serializer_class = MedicalRecordSerializer

	def get_queryset(self):
		queryset = MedicalRecord.objects.select_related("pet").all().order_by("-date", "-created_at")
		vet_name = self.request.query_params.get("vet_name")
		if vet_name:
			queryset = queryset.filter(vet_name=vet_name)
		return queryset


class VaccinationViewSet(viewsets.ModelViewSet):
	serializer_class = VaccinationSerializer

	def get_queryset(self):
		queryset = Vaccination.objects.select_related("pet", "reminder").all().order_by("-next_due_date", "-created_at")
		owner_name = self.request.query_params.get("owner_name")
		vet_name = self.request.query_params.get("vet_name")

		if owner_name:
			queryset = queryset.filter(pet__owner_name=owner_name)
		if vet_name:
			queryset = queryset.filter(vet_name=vet_name)
		return queryset


class VaccinationReminderViewSet(viewsets.ModelViewSet):
	serializer_class = VaccinationReminderSerializer

	def get_queryset(self):
		queryset = VaccinationReminder.objects.select_related("vaccination", "vaccination__pet").all().order_by("reminder_date", "-created_at")
		owner_name = self.request.query_params.get("owner_name")
		vet_name = self.request.query_params.get("vet_name")
		status_filter = self.request.query_params.get("status")

		if owner_name:
			queryset = queryset.filter(vaccination__pet__owner_name=owner_name)
		if vet_name:
			queryset = queryset.filter(vaccination__vet_name=vet_name)
		if status_filter:
			queryset = queryset.filter(status=status_filter)
		return queryset


class UserProfileViewSet(viewsets.ModelViewSet):
	queryset = UserProfile.objects.select_related("user").all().order_by("-user__date_joined")
	serializer_class = UserProfileSerializer

	def destroy(self, request, *args, **kwargs):
		instance = self.get_object()
		user = instance.user
		instance.delete()
		user.delete()
		return Response(status=status.HTTP_204_NO_CONTENT)


class PasswordResetRequestView(APIView):
	permission_classes = [permissions.AllowAny]

	def post(self, request):
		serializer = PasswordResetRequestSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)

		email = serializer.validated_data["email"]
		user = User.objects.get(username=email)

		# Create or update password reset token
		reset, created = PasswordReset.objects.get_or_create(user=user)
		if not created:
			reset.token = str(__import__('uuid').uuid4())
			reset.save()

		return Response({
			"message": "Password reset token generated. Use this token to reset your password.",
			"token": reset.token,
			"email": email
		}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
	permission_classes = [permissions.AllowAny]

	def post(self, request):
		serializer = PasswordResetConfirmSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)

		token = serializer.validated_data["token"]
		new_password = serializer.validated_data["new_password"]

		try:
			reset = PasswordReset.objects.get(token=token)
		except PasswordReset.DoesNotExist:
			return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

		if not reset.is_valid():
			reset.delete()
			return Response({"detail": "Token has expired. Please request a new password reset."}, status=status.HTTP_400_BAD_REQUEST)

		user = reset.user
		user.set_password(new_password)
		user.save()
		reset.delete()

		return Response({
			"message": "Password reset successful. You can now log in with your new password."
		}, status=status.HTTP_200_OK)
