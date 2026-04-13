from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AppointmentViewSet,
    HealthView,
    LoginView,
    LogoutView,
    MeView,
    MedicalRecordViewSet,
    PetViewSet,
    RegisterView,
    VetDirectoryView,
    UserProfileViewSet,
)

router = DefaultRouter()
router.register("pets", PetViewSet, basename="pet")
router.register("appointments", AppointmentViewSet, basename="appointment")
router.register("medical-records", MedicalRecordViewSet, basename="medical-record")
router.register("users", UserProfileViewSet, basename="user")

urlpatterns = [
    path("health/", HealthView.as_view(), name="health"),
    path("veterinarians/", VetDirectoryView.as_view(), name="veterinarian-directory"),
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("auth/me/", MeView.as_view(), name="auth-me"),
    path("", include(router.urls)),
]
