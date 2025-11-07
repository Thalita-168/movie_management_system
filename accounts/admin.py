from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserActivityLog


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin panel configuration for custom User model"""

    list_display = ['username', 'email', 'role', 'is_banned', 'is_staff', 'created_at']
    list_filter = ['role', 'is_banned', 'is_staff', 'is_superuser']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering = ['-created_at']

    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('role', 'phone', 'date_of_birth', 'is_banned')
        }),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {
            'fields': ('role', 'phone', 'date_of_birth')
        }),
    )


@admin.register(UserActivityLog)
class UserActivityLogAdmin(admin.ModelAdmin):
    """Read-only log of user authentication activities"""

    list_display = ['user', 'activity_type', 'ip_address', 'timestamp']
    list_filter = ['activity_type', 'timestamp']
    search_fields = ['user__username', 'user__email', 'ip_address']
    readonly_fields = ['user', 'activity_type', 'ip_address', 'user_agent', 'timestamp']
    date_hierarchy = 'timestamp'

    def has_add_permission(self, request):
        """Prevent manual log creation"""
        return False

    def has_change_permission(self, request, obj=None):
        """Prevent log editing"""
        return False
