from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, PasswordResetRequestView,
    VerifyOTPView, ChangePasswordView, SendVerificationView,
    EmailVerificationView, GoogleLoginView, UpdateUsernameView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-email/', EmailVerificationView.as_view(), name='verify_email'),
    path('login/', LoginView.as_view(), name='login'),
    path('google-login/', GoogleLoginView.as_view(), name='google_login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('password-reset/request/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password-reset/verify/', VerifyOTPView.as_view(), name='verify_otp'),
    path('password/change/', ChangePasswordView.as_view(), name='change_password'),
    path('send-verification/', SendVerificationView.as_view(), name='send_verification'),
    path('profile/update-username/', UpdateUsernameView.as_view(), name='update_username'),
]
