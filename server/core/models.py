"""Модели данных «Делом»: кто есть на платформе и что между ними происходит."""
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create(self, email, password, **extra):
        if not email:
            raise ValueError("Нужна почта")
        user = self.model(email=self.normalize_email(email).lower(), **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra):
        extra.setdefault("is_staff", False)
        extra.setdefault("is_superuser", False)
        return self._create(email, password, **extra)

    def create_superuser(self, email, password=None, **extra):
        extra.update(is_staff=True, is_superuser=True, role=User.Role.ADMIN)
        return self._create(email, password, **extra)


class Company(models.Model):
    name = models.CharField("название", max_length=120, unique=True)
    industry = models.CharField("отрасль", max_length=200, blank=True)
    about = models.TextField("о компании", blank=True)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name, verbose_name_plural = "компания", "компании"
        ordering = ["name"]

    def __str__(self):
        return self.name


class University(models.Model):
    name = models.CharField("название", max_length=160, unique=True)

    class Meta:
        verbose_name, verbose_name_plural = "вуз", "вузы"
        ordering = ["name"]

    def __str__(self):
        return self.name


class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = "student", "Студент"
        EMPLOYER = "employer", "Работодатель"
        MENTOR = "mentor", "Ментор"
        UNIVERSITY = "university", "Вуз"
        ADMIN = "admin", "Администратор"

    username = None
    email = models.EmailField("почта", unique=True)
    full_name = models.CharField("имя и фамилия", max_length=120)
    role = models.CharField("роль", max_length=12, choices=Role.choices, default=Role.STUDENT)
    company = models.ForeignKey(Company, verbose_name="компания", null=True, blank=True, on_delete=models.SET_NULL, related_name="staff")
    university = models.ForeignKey(University, verbose_name="вуз", null=True, blank=True, on_delete=models.SET_NULL, related_name="staff")
    position = models.CharField("должность", max_length=120, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]
    objects = UserManager()

    class Meta:
        verbose_name, verbose_name_plural = "пользователь", "пользователи"

    def __str__(self):
        return f"{self.full_name} ({self.email})"


class Skill(models.Model):
    slug = models.SlugField("код", unique=True)
    name = models.CharField("название", max_length=80, unique=True)

    class Meta:
        verbose_name, verbose_name_plural = "навык", "навыки"
        ordering = ["name"]

    def __str__(self):
        return self.name


class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    university = models.ForeignKey(University, verbose_name="вуз", null=True, blank=True, on_delete=models.SET_NULL, related_name="students")
    program = models.CharField("программа", max_length=120, blank=True)
    year = models.PositiveSmallIntegerField("курс", null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(6)])
    city = models.CharField("город", max_length=80, blank=True)
    goal = models.CharField("цель (профессия)", max_length=80, blank=True)
    about = models.TextField("о себе", blank=True, max_length=1000)
    visible = models.BooleanField("виден работодателям", default=True)
    allow_invites = models.BooleanField("принимает приглашения", default=True)
    share_with_university = models.BooleanField("делится прогрессом с вузом", default=False)

    class Meta:
        verbose_name, verbose_name_plural = "профиль студента", "профили студентов"

    def __str__(self):
        return self.user.full_name


class Project(models.Model):
    class Format(models.TextChoices):
        SOLO = "solo", "Индивидуальный"
        TEAM = "team", "Командный"

    company = models.ForeignKey(Company, verbose_name="компания", on_delete=models.CASCADE, related_name="projects")
    title = models.CharField("название", max_length=200)
    task = models.TextField("задача")
    direction = models.CharField("направление", max_length=80, blank=True)
    difficulty = models.CharField("сложность", max_length=40, blank=True)
    duration = models.CharField("срок выполнения", max_length=40, blank=True)
    format = models.CharField("формат", max_length=8, choices=Format.choices, default=Format.SOLO)
    criteria = models.JSONField("критерии оценки", default=list, help_text="Список строк. По каждому критерию ментор ставит от 1 до 5.")
    skills = models.ManyToManyField(Skill, verbose_name="навыки, которые подтверждает проект", related_name="projects", blank=True)
    deadline = models.DateField("приём решений до", null=True, blank=True)
    hiring = models.BooleanField("лучшие получают интервью", default=True)
    hire_position = models.CharField("позиция для лучших", max_length=120, blank=True)
    mentor = models.ForeignKey(User, verbose_name="ментор", null=True, blank=True, on_delete=models.SET_NULL, related_name="mentored_projects", limit_choices_to={"role": "mentor"})
    is_open = models.BooleanField("приём открыт", default=True)
    created_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="+")
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name, verbose_name_plural = "проект", "проекты"
        ordering = ["-created"]

    def __str__(self):
        return f"{self.company}: {self.title}"

    @property
    def accepting(self):
        return self.is_open and (self.deadline is None or self.deadline >= timezone.localdate())


def solution_path(instance, filename):
    return f"solutions/{instance.project_id}/{instance.student_id}/{filename}"


class Participation(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Выполняет"
        REVIEW = "review", "На проверке"
        DONE = "done", "Проверено"

    student = models.ForeignKey(User, verbose_name="студент", on_delete=models.CASCADE, related_name="participations")
    project = models.ForeignKey(Project, verbose_name="проект", on_delete=models.CASCADE, related_name="participations")
    status = models.CharField("статус", max_length=8, choices=Status.choices, default=Status.ACTIVE)
    summary = models.TextField("итог решения", blank=True)
    file = models.FileField("файл решения", upload_to=solution_path, blank=True, max_length=300)
    attempt = models.PositiveSmallIntegerField("попытка", default=1)
    score = models.DecimalField("оценка", max_digits=2, decimal_places=1, null=True, blank=True)
    favorite = models.BooleanField("в избранном у компании", default=False)
    joined = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField("отправлено", null=True, blank=True)

    class Meta:
        verbose_name, verbose_name_plural = "участие в проекте", "участия в проектах"
        constraints = [models.UniqueConstraint(fields=["student", "project"], name="one_participation")]
        ordering = ["-joined"]

    def __str__(self):
        return f"{self.student.full_name} → {self.project.title}"


class Review(models.Model):
    class Verdict(models.TextChoices):
        APPROVED = "approved", "Навыки подтверждены"
        RETURNED = "returned", "Возвращено на доработку"

    participation = models.ForeignKey(Participation, on_delete=models.CASCADE, related_name="reviews")
    mentor = models.ForeignKey(User, verbose_name="ментор", on_delete=models.PROTECT, related_name="reviews")
    verdict = models.CharField("решение", max_length=8, choices=Verdict.choices)
    stars = models.JSONField("оценки по критериям", default=list)
    score = models.DecimalField("итоговая оценка", max_digits=2, decimal_places=1, null=True, blank=True)
    comment = models.TextField("отзыв")
    skills = models.ManyToManyField(Skill, verbose_name="подтверждённые навыки", blank=True)
    attempt = models.PositiveSmallIntegerField(default=1)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name, verbose_name_plural = "проверка решения", "проверки решений"
        ordering = ["-created"]


class SkillConfirmation(models.Model):
    """Запись паспорта навыков: навык и основание, на котором он подтверждён."""
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="confirmations")
    skill = models.ForeignKey(Skill, on_delete=models.PROTECT, related_name="confirmations")
    participation = models.ForeignKey(Participation, null=True, blank=True, on_delete=models.SET_NULL, related_name="confirmations")
    mentor = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="+")
    score = models.DecimalField(max_digits=2, decimal_places=1, null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name, verbose_name_plural = "подтверждённый навык", "подтверждённые навыки"
        constraints = [models.UniqueConstraint(fields=["student", "skill"], name="one_confirmation")]
        ordering = ["-created"]


class Vacancy(models.Model):
    class Kind(models.TextChoices):
        INTERNSHIP = "internship", "Стажировка"
        JOB = "job", "Вакансия"

    class Status(models.TextChoices):
        OPEN = "open", "Активна"
        CLOSED = "closed", "Закрыта компанией"
        AUTO = "auto_closed", "Закрыта автоматически: нет ответа на отклики"

    company = models.ForeignKey(Company, verbose_name="компания", on_delete=models.CASCADE, related_name="vacancies")
    title = models.CharField("название", max_length=160)
    kind = models.CharField("тип", max_length=10, choices=Kind.choices, default=Kind.INTERNSHIP)
    work_format = models.CharField("формат", max_length=40, blank=True)
    city = models.CharField("город", max_length=80, blank=True)
    salary_from = models.PositiveIntegerField("оплата от, ₽ в месяц", help_text="Вилка указана всегда — правило платформы")
    salary_to = models.PositiveIntegerField("оплата до, ₽ в месяц", null=True, blank=True)
    description = models.TextField("описание", blank=True)
    skills = models.ManyToManyField(Skill, verbose_name="навыки", blank=True, related_name="vacancies")
    status = models.CharField("статус", max_length=12, choices=Status.choices, default=Status.OPEN)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name, verbose_name_plural = "вакансия", "вакансии"
        ordering = ["-created"]

    def __str__(self):
        return f"{self.company}: {self.title}"


class Application(models.Model):
    class Status(models.TextChoices):
        NEW = "new", "Ждёт ответа"
        INVITED = "invited", "Приглашён"
        REJECTED = "rejected", "Отказ"

    student = models.ForeignKey(User, verbose_name="студент", on_delete=models.CASCADE, related_name="applications")
    vacancy = models.ForeignKey(Vacancy, verbose_name="вакансия", on_delete=models.CASCADE, related_name="applications")
    status = models.CharField("статус", max_length=8, choices=Status.choices, default=Status.NEW)
    reason = models.CharField("причина отказа", max_length=200, blank=True)
    note = models.TextField("комментарий кандидату", blank=True)
    created = models.DateTimeField("отправлен", default=timezone.now)
    answered_at = models.DateTimeField("ответ дан", null=True, blank=True)

    class Meta:
        verbose_name, verbose_name_plural = "отклик", "отклики"
        constraints = [models.UniqueConstraint(fields=["student", "vacancy"], name="one_application")]
        ordering = ["-created"]

    @property
    def answer_by(self):
        return self.created + timedelta(days=settings.ANSWER_DAYS)

    @property
    def overdue(self):
        return self.status == self.Status.NEW and timezone.now() >= self.answer_by


class HiringEntry(models.Model):
    """Кандидат в воронке найма компании."""
    class Stage(models.TextChoices):
        NEW = "new", "Решение или отклик"
        INVITED = "invited", "Приглашён"
        INTERVIEW = "interview", "Интервью"
        OFFER = "offer", "Оффер"
        HIRED = "hired", "Нанят"
        REJECTED = "rejected", "Отказ"

    ORDER = ["new", "invited", "interview", "offer", "hired"]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="pipeline")
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="pipeline")
    stage = models.CharField("этап", max_length=10, choices=Stage.choices, default=Stage.NEW)
    position = models.CharField("позиция", max_length=160, blank=True)
    source = models.CharField("откуда кандидат", max_length=200, blank=True)
    interview_at = models.CharField("время интервью", max_length=80, blank=True)
    offer_salary = models.CharField("оффер: оплата", max_length=80, blank=True)
    offer_start = models.CharField("оффер: дата выхода", max_length=80, blank=True)
    reason = models.CharField("причина отказа", max_length=200, blank=True)
    hired_at = models.DateField("вышел на работу", null=True, blank=True)
    updated = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name, verbose_name_plural = "кандидат в воронке", "воронка найма"
        constraints = [models.UniqueConstraint(fields=["company", "student"], name="one_pipeline_entry")]
        ordering = ["-updated"]


class CompanyReview(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="reviews")
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="company_reviews")
    stars = models.PositiveSmallIntegerField("оценка", validators=[MinValueValidator(1), MaxValueValidator(5)])
    text = models.TextField("отзыв", max_length=2000)
    created = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name, verbose_name_plural = "отзыв о компании", "отзывы о компаниях"
        constraints = [models.UniqueConstraint(fields=["company", "student"], name="one_company_review")]
        ordering = ["-created"]


class Message(models.Model):
    """Переписка компании и студента — одна лента на пару."""
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="messages")
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, related_name="+")
    from_company = models.BooleanField(default=False)
    text = models.TextField(max_length=4000)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name, verbose_name_plural = "сообщение", "сообщения"
        ordering = ["created"]


class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=200)
    body = models.CharField(max_length=400, blank=True)
    link = models.CharField(max_length=200, blank=True)
    read = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name, verbose_name_plural = "уведомление", "уведомления"
        ordering = ["-created"]
