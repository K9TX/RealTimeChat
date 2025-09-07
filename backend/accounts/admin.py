from django.contrib import admin
from .models import User, OTP

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'username', 'is_verified', 'is_active', 'date_joined')
    list_filter = ('is_verified', 'is_active', 'is_staff')
    search_fields = ('email', 'username')
    readonly_fields = ('date_joined', 'last_login')

@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ('user', 'otp_type', 'otp', 'created_at', 'expires_at', 'is_used')
    list_filter = ('otp_type', 'is_used', 'created_at')
    search_fields = ('user__email', 'user__username')
    readonly_fields = ('created_at',)
