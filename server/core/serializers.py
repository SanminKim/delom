from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import (Application, Company, CompanyReview, HiringEntry, Message, Notification, Participation,
                     Project, Review, Skill, SkillConfirmation, StudentProfile, User, Vacancy)

SkillSlugs = lambda **kw: serializers.SlugRelatedField(slug_field="slug", queryset=Skill.objects.all(), many=True, **kw)  # noqa: E731


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["slug", "name"]


class CompanyBrief(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ["id", "name", "industry"]


class UserSerializer(serializers.ModelSerializer):
    company = CompanyBrief(read_only=True)
    university = serializers.StringRelatedField()

    class Meta:
        model = User
        fields = ["id", "email", "full_name", "role", "position", "company", "university"]


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField(max_length=120)
    role = serializers.ChoiceField(choices=["student", "employer"])
    company_name = serializers.CharField(max_length=120, required=False, allow_blank=True)
    consent = serializers.BooleanField()

    def validate_email(self, v):
        v = v.lower()
        if User.objects.filter(email=v).exists():
            raise serializers.ValidationError("Эта почта уже зарегистрирована")
        return v

    def validate_consent(self, v):
        if not v:
            raise serializers.ValidationError("Нужно согласие на обработку персональных данных")
        return v

    def validate(self, d):
        validate_password(d["password"], User(email=d["email"], full_name=d["full_name"]))
        if d["role"] == "employer":
            name = (d.get("company_name") or "").strip()
            if not name:
                raise serializers.ValidationError({"company_name": "Укажите название компании"})
            if Company.objects.filter(name__iexact=name).exists():
                raise serializers.ValidationError({"company_name": "Компания уже зарегистрирована. Попросите администратора платформы добавить вас в её кабинет"})
        return d


class ProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    university = serializers.StringRelatedField()

    class Meta:
        model = StudentProfile
        fields = ["full_name", "university", "program", "year", "city", "goal", "about", "visible", "allow_invites", "share_with_university"]


class ConfirmationSerializer(serializers.ModelSerializer):
    skill = SkillSerializer()
    project = serializers.CharField(source="participation.project.title", default=None)
    company = serializers.CharField(source="participation.project.company.name", default=None)
    mentor = serializers.CharField(source="mentor.full_name", default=None)

    class Meta:
        model = SkillConfirmation
        fields = ["skill", "score", "project", "company", "mentor", "created"]


class StudentBrief(serializers.ModelSerializer):
    """Что компания видит о студенте: без почты, связь — через сообщения на платформе."""
    university = serializers.CharField(source="profile.university.name", default=None)
    program = serializers.CharField(source="profile.program", default="")
    year = serializers.IntegerField(source="profile.year", default=None)
    city = serializers.CharField(source="profile.city", default="")
    goal = serializers.CharField(source="profile.goal", default="")
    skills = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "full_name", "university", "program", "year", "city", "goal", "skills"]

    def get_skills(self, u):
        return [c.skill.name for c in u.confirmations.all()]


class ProjectSerializer(serializers.ModelSerializer):
    company = CompanyBrief(read_only=True)
    skills = SkillSlugs(required=False)
    skill_names = serializers.SerializerMethodField()
    mentor = serializers.CharField(source="mentor.full_name", default=None, read_only=True)
    accepting = serializers.BooleanField(read_only=True)
    my_status = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ["id", "company", "title", "task", "direction", "difficulty", "duration", "format", "criteria", "skills", "skill_names",
                  "deadline", "hiring", "hire_position", "mentor", "is_open", "accepting", "my_status", "created"]
        read_only_fields = ["is_open", "created"]

    def get_skill_names(self, p):
        return [s.name for s in p.skills.all()]

    def get_my_status(self, p):
        u = self.context["request"].user
        if not u.is_authenticated or u.role != "student":
            return None
        part = next((x for x in p.participations.all() if x.student_id == u.id), None)
        return part.status if part else None

    def validate_criteria(self, v):
        if not isinstance(v, list) or not (1 <= len(v) <= 8) or any(not isinstance(x, str) or not x.strip() for x in v):
            raise serializers.ValidationError("Укажите от 1 до 8 критериев оценки")
        return [x.strip()[:200] for x in v]


class ReviewSerializer(serializers.ModelSerializer):
    mentor = serializers.CharField(source="mentor.full_name")
    skills = SkillSerializer(many=True)

    class Meta:
        model = Review
        fields = ["verdict", "stars", "score", "comment", "skills", "mentor", "attempt", "created"]


class ParticipationSerializer(serializers.ModelSerializer):
    project = ProjectSerializer(read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    file_name = serializers.SerializerMethodField()

    class Meta:
        model = Participation
        fields = ["id", "project", "status", "summary", "file", "file_name", "attempt", "score", "submitted_at", "reviews"]
        read_only_fields = ["status", "attempt", "score", "submitted_at"]
        extra_kwargs = {"file": {"write_only": True, "required": False}}

    def get_file_name(self, p):
        return p.file.name.rsplit("/", 1)[-1] if p.file else None

    def validate_file(self, f):
        ext = f.name.rsplit(".", 1)[-1].lower() if "." in f.name else ""
        if ext not in settings.ALLOWED_UPLOAD_EXT:
            raise serializers.ValidationError("Такой тип файла не принимается. Подойдут PDF, презентации, таблицы, документы, архив ZIP")
        if f.size > settings.MAX_UPLOAD_MB * 1024 * 1024:
            raise serializers.ValidationError(f"Файл больше {settings.MAX_UPLOAD_MB} МБ")
        return f


class SolutionSerializer(serializers.ModelSerializer):
    """Решение глазами компании и ментора."""
    student = StudentBrief()
    reviews = ReviewSerializer(many=True)
    file_name = serializers.SerializerMethodField()
    project_title = serializers.CharField(source="project.title")
    criteria = serializers.JSONField(source="project.criteria")
    project_skills = SkillSerializer(source="project.skills", many=True)

    class Meta:
        model = Participation
        fields = ["id", "student", "project_id", "project_title", "criteria", "project_skills", "status", "summary", "file_name", "attempt", "score", "favorite", "submitted_at", "reviews"]

    get_file_name = ParticipationSerializer.get_file_name


class VacancySerializer(serializers.ModelSerializer):
    company = CompanyBrief(read_only=True)
    skills = SkillSlugs(required=False)
    waiting = serializers.SerializerMethodField()
    my_application = serializers.SerializerMethodField()

    class Meta:
        model = Vacancy
        fields = ["id", "company", "title", "kind", "work_format", "city", "salary_from", "salary_to", "description", "skills", "status", "waiting", "my_application", "created"]
        read_only_fields = ["status", "created"]

    def validate(self, d):
        lo, hi = d.get("salary_from", getattr(self.instance, "salary_from", None)), d.get("salary_to", getattr(self.instance, "salary_to", None))
        if not lo:
            raise serializers.ValidationError({"salary_from": "Вилка зарплаты указана всегда — это правило платформы"})
        if hi and hi < lo:
            raise serializers.ValidationError({"salary_to": "Верхняя граница меньше нижней"})
        return d

    def _user(self):
        return self.context["request"].user

    def get_waiting(self, v):
        u = self._user()
        if u.is_authenticated and u.role == "employer" and u.company_id == v.company_id:
            return sum(1 for a in v.applications.all() if a.status == "new")
        return None

    def get_my_application(self, v):
        u = self._user()
        if not u.is_authenticated or u.role != "student":
            return None
        a = next((x for x in v.applications.all() if x.student_id == u.id), None)
        return {"status": a.status, "reason": a.reason} if a else None


class ApplicationSerializer(serializers.ModelSerializer):
    vacancy = serializers.CharField(source="vacancy.title")
    vacancy_id = serializers.IntegerField()
    company = serializers.CharField(source="vacancy.company.name")
    student = StudentBrief()

    class Meta:
        model = Application
        fields = ["id", "vacancy", "vacancy_id", "company", "student", "status", "reason", "note", "created", "answer_by", "overdue", "answered_at"]


class HiringSerializer(serializers.ModelSerializer):
    student = StudentBrief()
    company = serializers.CharField(source="company.name")

    class Meta:
        model = HiringEntry
        fields = ["id", "company", "student", "stage", "position", "source", "interview_at", "offer_salary", "offer_start", "reason", "hired_at", "updated"]


class CompanyReviewSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()

    class Meta:
        model = CompanyReview
        fields = ["stars", "text", "author", "created"]

    def get_author(self, r):
        parts = r.student.full_name.split()
        return parts[0] + (f" {parts[1][0]}." if len(parts) > 1 else "")


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["id", "from_company", "text", "created"]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "title", "body", "link", "read", "created"]
