from rest_framework.permissions import BasePermission


def role_permission(*roles, need=None):
    class P(BasePermission):
        message = "Это действие недоступно для вашей роли"

        def has_permission(self, request, view):
            u = request.user
            if not (u and u.is_authenticated and u.role in roles):
                return False
            return need is None or getattr(u, need + "_id") is not None
    return P


IsStudent = role_permission("student")
IsEmployer = role_permission("employer", need="company")
IsMentor = role_permission("mentor")
IsUniversity = role_permission("university", need="university")
