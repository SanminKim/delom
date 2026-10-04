from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from . import models as m


@admin.register(m.User)
class UserAdmin(BaseUserAdmin):
    ordering = ["email"]
    list_display = ["email", "full_name", "role", "company", "university", "is_active", "date_joined"]
    list_filter = ["role", "is_active", "company", "university"]
    search_fields = ["email", "full_name"]
    fieldsets = [(None, {"fields": ["email", "password"]}), ("Кто это", {"fields": ["full_name", "role", "position", "company", "university"]}),
                 ("Доступ", {"fields": ["is_active", "is_staff", "is_superuser"]}), ("Даты", {"fields": ["last_login", "date_joined"]})]
    add_fieldsets = [(None, {"classes": ["wide"], "fields": ["email", "full_name", "role", "company", "university", "password1", "password2"]})]


@admin.register(m.Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ["name", "industry", "created"]
    search_fields = ["name"]


@admin.register(m.Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ["title", "company", "mentor", "deadline", "is_open", "hiring"]
    list_filter = ["company", "is_open", "hiring"]
    search_fields = ["title"]
    filter_horizontal = ["skills"]


@admin.register(m.Participation)
class ParticipationAdmin(admin.ModelAdmin):
    list_display = ["student", "project", "status", "score", "attempt", "submitted_at"]
    list_filter = ["status", "project__company"]
    search_fields = ["student__full_name", "project__title"]


@admin.register(m.Vacancy)
class VacancyAdmin(admin.ModelAdmin):
    list_display = ["title", "company", "kind", "salary_from", "salary_to", "status", "created"]
    list_filter = ["status", "kind", "company"]
    filter_horizontal = ["skills"]


@admin.register(m.Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ["student", "vacancy", "status", "reason", "created", "answered_at"]
    list_filter = ["status", "vacancy__company"]


@admin.register(m.HiringEntry)
class HiringAdmin(admin.ModelAdmin):
    list_display = ["student", "company", "stage", "position", "hired_at", "updated"]
    list_filter = ["stage", "company"]


@admin.register(m.SkillConfirmation)
class ConfirmationAdmin(admin.ModelAdmin):
    list_display = ["student", "skill", "score", "mentor", "created"]
    list_filter = ["skill"]


@admin.register(m.Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ["participation", "mentor", "verdict", "score", "created"]
    list_filter = ["verdict"]


@admin.register(m.StudentProfile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "university", "program", "year", "goal", "visible", "share_with_university"]
    list_filter = ["university", "visible"]


@admin.register(m.Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ["name", "slug"]
    prepopulated_fields = {"slug": ["name"]}


admin.site.register([m.University, m.CompanyReview, m.Message, m.Notification])
