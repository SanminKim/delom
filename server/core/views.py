from django.contrib.auth import authenticate, login, logout
from django.db import transaction
from django.db.models import Count, Prefetch, Q
from django.http import FileResponse
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from . import serializers as s
from . import services as svc
from .errors import RuleError
from .models import (Application, Company, HiringEntry, Message, Notification, Participation, Project, Review,
                     Skill, SkillConfirmation, StudentProfile, User, Vacancy)
from .permissions import IsEmployer, IsMentor, IsStudent, IsUniversity

STUDENTS = User.objects.filter(role="student").select_related("profile__university").prefetch_related("confirmations__skill")


def read_or(perm):
    """Чтение — всем, изменение — только указанной роли."""
    return [AllowAny()] if perm is None else [perm()]


# ---------- вход и регистрация ----------
@method_decorator(csrf_protect, name="dispatch")
class RegisterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_scope = "auth"

    @transaction.atomic
    def post(self, request):
        ser = s.RegisterSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        d = ser.validated_data
        company = Company.objects.create(name=d["company_name"].strip()) if d["role"] == "employer" else None
        user = User.objects.create_user(d["email"], d["password"], full_name=d["full_name"].strip(), role=d["role"], company=company)
        if user.role == "student":
            StudentProfile.objects.create(user=user)
        login(request, user)
        return Response(s.UserSerializer(user).data, status=201)


@method_decorator(csrf_protect, name="dispatch")
class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_scope = "auth"

    def post(self, request):
        user = authenticate(request, username=str(request.data.get("email", "")).lower(), password=request.data.get("password", ""))
        if not user:
            raise RuleError("Неверная почта или пароль")
        login(request, user)
        return Response(s.UserSerializer(user).data)


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response(status=204)


class MeView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        """Кто вошёл. Заодно выдаёт CSRF-токен, который нужен для изменяющих запросов."""
        u = request.user
        return Response({"csrf": get_token(request), "user": s.UserSerializer(u).data if u.is_authenticated else None})


class ProfileView(APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        return Response(s.ProfileSerializer(request.user.profile).data)

    def patch(self, request):
        ser = s.ProfileSerializer(request.user.profile, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)


class SkillList(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(s.SkillSerializer(Skill.objects.all(), many=True).data)


# ---------- проекты ----------
class ProjectViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.CreateModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    serializer_class = s.ProjectSerializer
    http_method_names = ["get", "post", "patch"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        if self.action == "join":
            return [IsStudent()]
        return [IsEmployer()]

    def get_queryset(self):
        qs = Project.objects.select_related("company", "mentor").prefetch_related("skills", "participations")
        u, p = self.request.user, self.request.query_params
        if self.action not in ("list", "retrieve"):
            return qs.filter(company_id=u.company_id) if u.role == "employer" else qs
        if p.get("mine") and u.is_authenticated and u.role == "employer":
            return qs.filter(company_id=u.company_id)
        if p.get("company"):
            qs = qs.filter(company_id=p["company"])
        if p.get("skill"):
            qs = qs.filter(skills__slug=p["skill"])
        if p.get("q"):
            qs = qs.filter(Q(title__icontains=p["q"]) | Q(company__name__icontains=p["q"]))
        return qs.distinct()

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company, created_by=self.request.user)

    @action(detail=True, methods=["post"])
    def join(self, request, pk=None):
        part = svc.join_project(request.user, self.get_object())
        return Response(s.ParticipationSerializer(part, context={"request": request}).data, status=201)

    @action(detail=True, methods=["post"])
    def close(self, request, pk=None):
        return self._set_open(False)

    @action(detail=True, methods=["post"])
    def open(self, request, pk=None):
        return self._set_open(True)

    def _set_open(self, value):
        p = self.get_object()
        p.is_open = value
        p.save(update_fields=["is_open"])
        return Response(self.get_serializer(p).data)

    @action(detail=True, methods=["get"])
    def solutions(self, request, pk=None):
        """Решения по своему проекту: отправленные и проверенные, избранные сверху."""
        qs = (self.get_object().participations.exclude(status="active").select_related("student__profile__university", "project")
              .prefetch_related("student__confirmations__skill", "reviews__skills", "reviews__mentor", "project__skills").order_by("-favorite", "-score"))
        return Response(s.SolutionSerializer(qs, many=True).data)


class ParticipationViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    serializer_class = s.ParticipationSerializer
    permission_classes = [IsStudent]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    http_method_names = ["get", "post", "patch"]

    def get_queryset(self):
        return (Participation.objects.filter(student=self.request.user).select_related("project__company", "project__mentor")
                .prefetch_related("project__skills", "project__participations", "reviews__skills", "reviews__mentor"))

    def perform_update(self, serializer):
        if serializer.instance.status != "active":
            raise RuleError("Решение отправлено — чтобы изменить его, сначала отзовите")
        serializer.save()

    @action(detail=True, methods=["post"])
    def submit(self, request, pk=None):
        return Response(self.get_serializer(svc.submit(self.get_object())).data)

    @action(detail=True, methods=["post"])
    def withdraw(self, request, pk=None):
        return Response(self.get_serializer(svc.withdraw(self.get_object())).data)


class SolutionFileView(APIView):
    """Файл решения видят только автор, ментор проекта и компания проекта."""

    def get(self, request, pk):
        part = get_object_or_404(Participation.objects.select_related("project"), pk=pk)
        u = request.user
        ok = (part.student_id == u.id or svc.can_mentor(u, part.project) or u.role == "admin"
              or (u.role == "employer" and u.company_id == part.project.company_id and part.status != "active"))
        if not ok or not part.file:
            raise NotFound()
        return FileResponse(part.file.open("rb"), as_attachment=True, filename=part.file.name.rsplit("/", 1)[-1])


class FavoriteView(APIView):
    permission_classes = [IsEmployer]

    def post(self, request, pk):
        part = get_object_or_404(Participation, pk=pk, project__company_id=request.user.company_id)
        part.favorite = not part.favorite
        part.save(update_fields=["favorite"])
        return Response({"favorite": part.favorite})


# ---------- ментор ----------
SOLUTIONS = (Participation.objects.select_related("student__profile__university", "project")
             .prefetch_related("student__confirmations__skill", "reviews__skills", "reviews__mentor", "project__skills"))


class MentorQueue(APIView):
    permission_classes = [IsMentor]

    def get(self, request):
        qs = SOLUTIONS.filter(Q(project__mentor=request.user) | Q(project__mentor__isnull=True)).exclude(status="active").order_by("status", "submitted_at")
        return Response(s.SolutionSerializer(qs, many=True).data)


class ReviewView(APIView):
    permission_classes = [IsMentor]

    def post(self, request, pk):
        part = get_object_or_404(Participation, pk=pk)
        d = request.data
        verdict = d.get("verdict")
        if verdict not in Review.Verdict.values:
            raise RuleError("Выберите: подтвердить навыки или вернуть на доработку")
        skills = list(Skill.objects.filter(slug__in=d.get("skills") or []))
        svc.review(part, request.user, verdict, d.get("stars") or [], str(d.get("comment") or ""), skills)
        return Response(s.SolutionSerializer(SOLUTIONS.get(pk=pk)).data)


# ---------- паспорт навыков ----------
CONFS = SkillConfirmation.objects.select_related("skill", "mentor", "participation__project__company")


class PassportView(APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        return Response(s.ConfirmationSerializer(CONFS.filter(student=request.user), many=True).data)


class PublicPassportView(APIView):
    """Публичная страница студента: открывается по ссылке без входа, пока профиль виден."""
    permission_classes = [AllowAny]

    def get(self, request, pk):
        u = get_object_or_404(STUDENTS, pk=pk)
        if not u.profile.visible:
            raise NotFound("Профиль скрыт")
        done = Participation.objects.filter(student=u, status="done").select_related("project__company")
        return Response({"student": s.StudentBrief(u).data, "about": u.profile.about,
                         "skills": s.ConfirmationSerializer(CONFS.filter(student=u), many=True).data,
                         "projects": [{"title": p.project.title, "company": p.project.company.name, "score": p.score} for p in done]})


# ---------- вакансии и отклики ----------
class VacancyViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.CreateModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    serializer_class = s.VacancySerializer
    http_method_names = ["get", "post", "patch"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsStudent()] if self.action == "apply" else [IsEmployer()]

    def get_queryset(self):
        qs = Vacancy.objects.select_related("company").prefetch_related("skills", "applications")
        u, p = self.request.user, self.request.query_params
        mine = u.is_authenticated and u.role == "employer"
        if self.action not in ("list", "retrieve", "apply"):
            return qs.filter(company_id=u.company_id)
        if self.action == "list":
            if p.get("mine") and mine:
                return qs.filter(company_id=u.company_id)
            qs = qs.filter(status="open")
            if p.get("company"):
                qs = qs.filter(company_id=p["company"])
            if p.get("kind"):
                qs = qs.filter(kind=p["kind"])
        return qs

    def list(self, request, *a, **kw):
        svc.close_overdue()
        return super().list(request, *a, **kw)

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

    @action(detail=True, methods=["post"])
    def apply(self, request, pk=None):
        app = svc.apply(request.user, self.get_object())
        return Response({"id": app.id, "status": app.status, "answer_by": app.answer_by}, status=201)

    @action(detail=True, methods=["post"])
    def close(self, request, pk=None):
        v = self.get_object()
        v.status = "closed"
        v.save(update_fields=["status"])
        return Response(self.get_serializer(v).data)

    @action(detail=True, methods=["post"])
    def open(self, request, pk=None):
        v = self.get_object()
        v.status = "open"
        v.save(update_fields=["status"])
        svc.refresh_vacancy(v)
        return Response(self.get_serializer(v).data)

    @action(detail=True, methods=["get"])
    def applications(self, request, pk=None):
        v = svc.refresh_vacancy(self.get_object())
        qs = v.applications.select_related("vacancy__company", "student__profile__university").prefetch_related("student__confirmations__skill")
        return Response({"status": v.status, "applications": s.ApplicationSerializer(qs, many=True).data})


APPS = Application.objects.select_related("vacancy__company", "student__profile__university").prefetch_related("student__confirmations__skill")


class MyApplications(APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        return Response(s.ApplicationSerializer(APPS.filter(student=request.user), many=True).data)


class AnswerApplication(APIView):
    permission_classes = [IsEmployer]
    invite = True

    def post(self, request, pk):
        app = get_object_or_404(APPS, pk=pk, vacancy__company_id=request.user.company_id)
        svc.answer_application(app, request.user, self.invite, str(request.data.get("reason") or ""), str(request.data.get("note") or ""))
        return Response(s.ApplicationSerializer(app).data)


class RejectApplication(AnswerApplication):
    invite = False


# ---------- кандидаты и воронка ----------
class CandidateSearch(APIView):
    """Поиск по подтверждённым навыкам. В выдаче только те, кто открыл профиль работодателям."""
    permission_classes = [IsEmployer]

    def get(self, request):
        qs = STUDENTS.filter(profile__visible=True)
        for slug in filter(None, (request.query_params.get("skills") or "").split(",")):
            qs = qs.filter(confirmations__skill__slug=slug)
        if request.query_params.get("goal"):
            qs = qs.filter(profile__goal=request.query_params["goal"])
        qs = qs.annotate(n=Count("confirmations", distinct=True)).filter(n__gt=0).order_by("-n")[:100]
        return Response(s.StudentBrief(qs, many=True).data)


HIRING = HiringEntry.objects.select_related("company", "student__profile__university").prefetch_related("student__confirmations__skill")


class HiringList(APIView):
    permission_classes = [IsEmployer]

    def get(self, request):
        return Response(s.HiringSerializer(HIRING.filter(company_id=request.user.company_id), many=True).data)

    def post(self, request):
        """Пригласить кандидата из поиска."""
        student = get_object_or_404(User, pk=request.data.get("student"), role="student")
        entry = svc.invite_candidate(request.user.company, student, request.user, str(request.data.get("position") or ""), str(request.data.get("text") or ""))
        return Response(s.HiringSerializer(HIRING.get(pk=entry.pk)).data, status=201)


class HiringMove(APIView):
    permission_classes = [IsEmployer]

    def post(self, request, pk):
        entry = get_object_or_404(HiringEntry.objects.select_related("company", "student__profile"), pk=pk, company_id=request.user.company_id)
        svc.move(entry, request.data.get("stage"), request.user, request.data)
        return Response(s.HiringSerializer(HIRING.get(pk=pk)).data)


class MyOffers(APIView):
    """Студент видит, на каком он этапе у каждой компании."""
    permission_classes = [IsStudent]

    def get(self, request):
        return Response(s.HiringSerializer(HIRING.filter(student=request.user), many=True).data)


# ---------- страница компании ----------
class CompanyView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        c = get_object_or_404(Company, pk=pk)
        u = request.user
        return Response({"company": s.CompanyBrief(c).data, "about": c.about, "stats": svc.company_stats(c),
                         "reviews": s.CompanyReviewSerializer(c.reviews.select_related("student"), many=True).data,
                         "can_review": u.is_authenticated and u.role == "student" and svc.can_review_company(u, c)})


class CompanyReviewView(APIView):
    permission_classes = [IsStudent]

    def post(self, request, pk):
        c = get_object_or_404(Company, pk=pk)
        try:
            stars = int(request.data.get("stars"))
        except (TypeError, ValueError):
            stars = 0
        text = str(request.data.get("text") or "")
        if not 1 <= stars <= 5 or len(text.strip()) < 20:
            raise RuleError("Поставьте оценку от 1 до 5 и напишите отзыв хотя бы в пару предложений")
        return Response(s.CompanyReviewSerializer(svc.save_company_review(request.user, c, stars, text)).data, status=201)


# ---------- сообщения и уведомления ----------
class MessagesView(APIView):
    def _pair(self, request):
        u = request.user
        src = request.data if request.method == "POST" else request.query_params
        if u.role == "student":
            return get_object_or_404(Company, pk=src.get("company")), u, False
        if u.role == "employer" and u.company_id:
            return u.company, get_object_or_404(User, pk=src.get("student"), role="student"), True
        raise PermissionDenied()

    def get(self, request):
        company, student, _ = self._pair(request)
        if not svc.related(company, student):
            raise NotFound()
        return Response(s.MessageSerializer(Message.objects.filter(company=company, student=student), many=True).data)

    def post(self, request):
        company, student, from_company = self._pair(request)
        text = str(request.data.get("text") or "").strip()
        if not text:
            raise RuleError("Сообщение пустое")
        if not svc.related(company, student):
            raise RuleError("Написать можно после отклика, проекта или приглашения")
        m = svc.say(company, student, text[:4000], sender=request.user, from_company=from_company)
        if from_company:
            svc.notify(student, f"Новое сообщение: {company.name}", text[:120], "messages")
        return Response(s.MessageSerializer(m).data, status=201)


class NotificationsView(APIView):
    def get(self, request):
        return Response(s.NotificationSerializer(request.user.notifications.all()[:50], many=True).data)

    def post(self, request):
        request.user.notifications.filter(read=False).update(read=True)
        return Response(status=204)


# ---------- вуз ----------
class UniversityStudents(APIView):
    """Вуз видит только своих студентов и только тех, кто разрешил делиться прогрессом."""
    permission_classes = [IsUniversity]

    def _qs(self, request):
        return STUDENTS.filter(profile__university_id=request.user.university_id, profile__share_with_university=True)

    def get(self, request):
        qs, p = self._qs(request), request.query_params
        if p.get("program"):
            qs = qs.filter(profile__program=p["program"])
        if p.get("year"):
            qs = qs.filter(profile__year=p["year"])
        qs = qs.annotate(projects_done=Count("participations", filter=Q(participations__status="done"), distinct=True))
        rows = [dict(s.StudentBrief(u).data, projects_done=u.projects_done,
                     hiring=[e.stage for e in u.pipeline.all()]) for u in qs.prefetch_related("pipeline")]
        return Response(rows)


class UniversitySummary(UniversityStudents):
    def get(self, request):
        qs = self._qs(request)
        ids = list(qs.values_list("id", flat=True))
        skills = (SkillConfirmation.objects.filter(student_id__in=ids).values("skill__name").annotate(n=Count("id")).order_by("-n"))
        programs = qs.values("profile__program").annotate(n=Count("id")).order_by("-n")
        hiring = HiringEntry.objects.filter(student_id__in=ids)
        return Response({
            "students": len(ids),
            "confirmed_skills": SkillConfirmation.objects.filter(student_id__in=ids).count(),
            "projects_done": Participation.objects.filter(student_id__in=ids, status="done").count(),
            "interviews": hiring.filter(stage__in=["interview", "offer", "hired"]).count(),
            "hired": hiring.filter(stage="hired").count(),
            "by_skill": [{"skill": r["skill__name"], "students": r["n"]} for r in skills],
            "by_program": [{"program": r["profile__program"] or "не указана", "students": r["n"]} for r in programs],
            "inviting_companies": [{"company": r["company__name"], "students": r["n"]} for r in hiring.exclude(stage="new").values("company__name").annotate(n=Count("id")).order_by("-n")],
        })
