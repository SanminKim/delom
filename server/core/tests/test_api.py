"""Сценарии и права доступа серверной части «Делом»."""
import shutil
import tempfile
from datetime import timedelta

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from core.models import (Application, Company, HiringEntry, Participation, Project, Skill, SkillConfirmation,
                         StudentProfile, University, User, Vacancy)
from core.services import close_overdue

MEDIA = tempfile.mkdtemp()
SUMMARY = "Нашёл три проблемных этапа воронки и проверил гипотезы на данных компании. " * 3
RATES = {"DEFAULT_THROTTLE_RATES": {"auth": "1000/hour"}}


@override_settings(MEDIA_ROOT=MEDIA)
class Base(TestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(MEDIA, ignore_errors=True)

    def setUp(self):
        self.sql, self.pa = Skill.objects.create(slug="sql", name="SQL"), Skill.objects.create(slug="pa", name="Product Analytics")
        self.other_skill = Skill.objects.create(slug="figma", name="Figma")
        self.co, self.co2 = Company.objects.create(name="SkillUp"), Company.objects.create(name="Т-Банк")
        self.uni, self.uni2 = University.objects.create(name="НИУ ВШЭ"), University.objects.create(name="МФТИ")
        mk = lambda email, role, **kw: User.objects.create_user(email, "Str0ng-pass!", full_name=kw.pop("name", email), role=role, **kw)  # noqa: E731
        self.student, self.student2 = mk("s1@x.ru", "student", name="Алексей Иванов"), mk("s2@x.ru", "student", name="Анна Петрова")
        StudentProfile.objects.create(user=self.student, university=self.uni, program="Бизнес-информатика", year=3, share_with_university=True)
        StudentProfile.objects.create(user=self.student2, university=self.uni, program="Экономика", year=4)
        self.emp, self.emp2 = mk("hr@su.ru", "employer", company=self.co), mk("hr@tb.ru", "employer", company=self.co2)
        self.mentor, self.mentor2 = mk("m@x.ru", "mentor", name="Ольга Сафина"), mk("m2@x.ru", "mentor")
        self.career, self.career2 = mk("c@hse.ru", "university", university=self.uni), mk("c@mipt.ru", "university", university=self.uni2)
        self.project = Project.objects.create(company=self.co, title="Воронка", task="Найти провалы", criteria=["A", "B", "C", "D"], mentor=self.mentor, hire_position="Product Intern")
        self.project.skills.set([self.sql, self.pa])
        self.vac = Vacancy.objects.create(company=self.co, title="Product Intern", salary_from=60000)

    def as_(self, user):
        c = APIClient()
        c.force_authenticate(user)
        return c

    def solve(self, student=None):
        """Студент вступает в проект, загружает решение и отправляет на проверку."""
        c = self.as_(student or self.student)
        pid = c.post(f"/api/projects/{self.project.id}/join/").json()["id"]
        f = SimpleUploadedFile("решение.pdf", b"%PDF-1.4 demo", content_type="application/pdf")
        r = c.patch(f"/api/participations/{pid}/", {"summary": SUMMARY, "file": f}, format="multipart")
        self.assertEqual(r.status_code, 200, r.content)
        self.assertEqual(c.post(f"/api/participations/{pid}/submit/").status_code, 200)
        return pid

    def approve(self, pid, stars=(5, 4, 5, 4), skills=("sql", "pa")):
        return self.as_(self.mentor).post(f"/api/participations/{pid}/review/", {"verdict": "approved", "stars": list(stars), "skills": list(skills),
                                                                                "comment": "Сильный анализ воронки, выводы подтверждены данными."}, format="json")


@override_settings(REST_FRAMEWORK={**__import__("django.conf").conf.settings.REST_FRAMEWORK, **RATES})
class AuthTests(Base):
    def test_register_login_logout(self):
        c = APIClient()
        r = c.post("/api/auth/register/", {"email": "New@Mail.ru", "password": "Str0ng-pass!", "full_name": "Иван Новый", "role": "student", "consent": True}, format="json")
        self.assertEqual(r.status_code, 201, r.content)
        self.assertEqual(c.get("/api/auth/me/").json()["user"]["email"], "new@mail.ru")
        self.assertTrue(StudentProfile.objects.filter(user__email="new@mail.ru").exists())
        c.post("/api/auth/logout/")
        self.assertIsNone(c.get("/api/auth/me/").json()["user"])
        self.assertEqual(c.post("/api/auth/login/", {"email": "new@mail.ru", "password": "wrong"}, format="json").status_code, 400)
        self.assertEqual(c.post("/api/auth/login/", {"email": "new@mail.ru", "password": "Str0ng-pass!"}, format="json").status_code, 200)

    def test_weak_password_and_missing_consent_rejected(self):
        c = APIClient()
        base = {"email": "a@b.ru", "full_name": "Имя", "role": "student", "consent": True}
        self.assertEqual(c.post("/api/auth/register/", {**base, "password": "12345678"}, format="json").status_code, 400)
        self.assertEqual(c.post("/api/auth/register/", {**base, "password": "Str0ng-pass!", "consent": False}, format="json").status_code, 400)

    def test_cannot_register_into_existing_company_or_privileged_role(self):
        c = APIClient()
        base = {"email": "evil@x.ru", "password": "Str0ng-pass!", "full_name": "Чужой", "consent": True}
        self.assertEqual(c.post("/api/auth/register/", {**base, "role": "employer", "company_name": "skillup"}, format="json").status_code, 400)
        self.assertEqual(c.post("/api/auth/register/", {**base, "role": "mentor"}, format="json").status_code, 400)
        self.assertEqual(c.post("/api/auth/register/", {**base, "role": "admin"}, format="json").status_code, 400)

    def test_csrf_is_enforced_for_browser_requests(self):
        c = APIClient(enforce_csrf_checks=True)
        self.assertEqual(c.post("/api/auth/login/", {"email": "s1@x.ru", "password": "Str0ng-pass!"}, format="json").status_code, 403)
        token = c.get("/api/auth/me/").json()["csrf"]
        self.assertEqual(c.post("/api/auth/login/", {"email": "s1@x.ru", "password": "Str0ng-pass!"}, format="json", HTTP_X_CSRFTOKEN=token).status_code, 200)
        self.assertEqual(c.post(f"/api/projects/{self.project.id}/join/").status_code, 403)

    def test_anonymous_sees_catalogue_but_cannot_act(self):
        c = APIClient()
        self.assertEqual(c.get("/api/projects/").status_code, 200)
        self.assertEqual(c.get("/api/vacancies/").status_code, 200)
        self.assertEqual(c.post(f"/api/projects/{self.project.id}/join/").status_code, 403)
        self.assertEqual(c.get("/api/hiring/").status_code, 403)


class ProjectFlowTests(Base):
    def test_full_cycle_confirms_skills_and_puts_student_in_pipeline(self):
        pid = self.solve()
        r = self.approve(pid)
        self.assertEqual(r.status_code, 200, r.content)
        self.assertEqual(r.json()["score"], "4.5")
        passport = self.as_(self.student).get("/api/passport/").json()
        self.assertEqual({x["skill"]["slug"] for x in passport}, {"sql", "pa"})
        self.assertEqual(passport[0]["mentor"], "Ольга Сафина")
        entry = HiringEntry.objects.get(company=self.co, student=self.student)
        self.assertEqual((entry.stage, entry.position), ("new", "Product Intern"))
        self.assertTrue(self.student.notifications.filter(title__startswith="Подтверждено").exists())

    def test_submit_needs_summary_and_file(self):
        c = self.as_(self.student)
        pid = c.post(f"/api/projects/{self.project.id}/join/").json()["id"]
        self.assertEqual(c.post(f"/api/participations/{pid}/submit/").status_code, 400)
        c.patch(f"/api/participations/{pid}/", {"summary": SUMMARY}, format="json")
        r = c.post(f"/api/participations/{pid}/submit/")
        self.assertEqual(r.status_code, 400)
        self.assertIn("файл", r.json()["error"])

    def test_upload_rejects_dangerous_file_types(self):
        c = self.as_(self.student)
        pid = c.post(f"/api/projects/{self.project.id}/join/").json()["id"]
        r = c.patch(f"/api/participations/{pid}/", {"file": SimpleUploadedFile("virus.exe", b"MZ")}, format="multipart")
        self.assertEqual(r.status_code, 400)

    def test_return_for_rework_then_resubmit(self):
        pid = self.solve()
        r = self.as_(self.mentor).post(f"/api/participations/{pid}/review/", {"verdict": "returned", "comment": "Добавьте расчёт конверсии по каждому шагу."}, format="json")
        self.assertEqual(r.status_code, 200, r.content)
        part = Participation.objects.get(pk=pid)
        self.assertEqual((part.status, part.attempt), ("active", 2))
        self.assertFalse(SkillConfirmation.objects.exists())
        self.assertEqual(self.as_(self.student).post(f"/api/participations/{pid}/submit/").status_code, 200)
        self.assertEqual(self.approve(pid).status_code, 200)

    def test_low_score_cannot_confirm_skills(self):
        pid = self.solve()
        r = self.approve(pid, stars=(2, 3, 2, 3))
        self.assertEqual(r.status_code, 400)
        self.assertFalse(SkillConfirmation.objects.exists())

    def test_mentor_cannot_confirm_skill_outside_project(self):
        pid = self.solve()
        self.approve(pid, skills=("sql", "figma"))
        self.assertEqual(list(SkillConfirmation.objects.values_list("skill__slug", flat=True)), ["sql"])

    def test_only_assigned_mentor_reviews_and_student_cannot_review_himself(self):
        pid = self.solve()
        body = {"verdict": "approved", "stars": [5, 5, 5, 5], "skills": ["sql"], "comment": "Отличная работа, всё подтверждаю."}
        self.assertEqual(self.as_(self.mentor2).post(f"/api/participations/{pid}/review/", body, format="json").status_code, 400)
        self.assertEqual(self.as_(self.student).post(f"/api/participations/{pid}/review/", body, format="json").status_code, 403)
        self.assertEqual(self.as_(self.emp).post(f"/api/participations/{pid}/review/", body, format="json").status_code, 403)

    def test_closed_or_expired_project_cannot_be_joined(self):
        self.assertEqual(self.as_(self.emp).post(f"/api/projects/{self.project.id}/close/").status_code, 200)
        self.assertEqual(self.as_(self.student).post(f"/api/projects/{self.project.id}/join/").status_code, 400)
        self.as_(self.emp).post(f"/api/projects/{self.project.id}/open/")
        Project.objects.filter(pk=self.project.id).update(deadline=timezone.localdate() - timedelta(days=1))
        self.assertEqual(self.as_(self.student).post(f"/api/projects/{self.project.id}/join/").status_code, 400)

    def test_solution_file_is_private(self):
        pid = self.solve()
        url = f"/api/participations/{pid}/file/"
        for user, code in [(self.student, 200), (self.mentor, 200), (self.emp, 200), (self.student2, 404), (self.emp2, 404), (self.mentor2, 404), (self.career, 404)]:
            self.assertEqual(self.as_(user).get(url).status_code, code, user.email)
        self.assertEqual(APIClient().get(url).status_code, 403)

    def test_student_sees_only_own_participations(self):
        pid = self.solve()
        self.assertEqual(self.as_(self.student2).get(f"/api/participations/{pid}/").status_code, 404)
        self.assertEqual(self.as_(self.student2).patch(f"/api/participations/{pid}/", {"summary": "x"}, format="json").status_code, 404)

    def test_employer_manages_only_own_projects(self):
        self.assertEqual(self.as_(self.emp2).post(f"/api/projects/{self.project.id}/close/").status_code, 404)
        self.assertEqual(self.as_(self.emp2).get(f"/api/projects/{self.project.id}/solutions/").status_code, 404)
        self.assertEqual(self.as_(self.emp2).patch(f"/api/projects/{self.project.id}/", {"title": "Взлом"}, format="json").status_code, 404)
        r = self.as_(self.emp2).post("/api/projects/", {"title": "Когорты", "task": "Собрать когорты", "criteria": ["Точность"], "skills": ["sql"]}, format="json")
        self.assertEqual(r.status_code, 201, r.content)
        self.assertEqual(r.json()["company"]["name"], "Т-Банк")

    def test_company_sees_solutions_and_marks_favourite(self):
        pid = self.solve()
        self.approve(pid)
        c = self.as_(self.emp)
        rows = c.get(f"/api/projects/{self.project.id}/solutions/").json()
        self.assertEqual(rows[0]["student"]["full_name"], "Алексей Иванов")
        self.assertNotIn("email", rows[0]["student"])
        self.assertTrue(c.post(f"/api/participations/{pid}/favorite/").json()["favorite"])
        self.assertEqual(self.as_(self.emp2).post(f"/api/participations/{pid}/favorite/").status_code, 404)


class VacancyTests(Base):
    def test_salary_is_required(self):
        r = self.as_(self.emp).post("/api/vacancies/", {"title": "Стажёр"}, format="json")
        self.assertEqual(r.status_code, 400)
        r = self.as_(self.emp).post("/api/vacancies/", {"title": "Стажёр", "salary_from": 50000, "salary_to": 40000}, format="json")
        self.assertEqual(r.status_code, 400)
        self.assertEqual(self.as_(self.emp).post("/api/vacancies/", {"title": "Стажёр", "salary_from": 50000}, format="json").status_code, 201)

    def test_apply_once_and_weekly_limit(self):
        c = self.as_(self.student)
        self.assertEqual(c.post(f"/api/vacancies/{self.vac.id}/apply/").status_code, 201)
        self.assertEqual(c.post(f"/api/vacancies/{self.vac.id}/apply/").status_code, 400)
        more = [Vacancy.objects.create(company=self.co2, title=f"V{i}", salary_from=1) for i in range(5)]
        codes = [c.post(f"/api/vacancies/{v.id}/apply/").status_code for v in more]
        self.assertEqual(codes, [201, 201, 201, 201, 400])
        Application.objects.filter(student=self.student).update(created=timezone.now() - timedelta(days=8))
        self.assertEqual(c.post(f"/api/vacancies/{more[4].id}/apply/").status_code, 201)

    def test_reject_requires_reason_and_student_gets_it(self):
        self.as_(self.student).post(f"/api/vacancies/{self.vac.id}/apply/")
        app = Application.objects.get()
        c = self.as_(self.emp)
        self.assertEqual(c.post(f"/api/applications/{app.id}/reject/", {}, format="json").status_code, 400)
        self.assertEqual(c.post(f"/api/applications/{app.id}/reject/", {"reason": "Не хватает подтверждённых навыков"}, format="json").status_code, 200)
        mine = self.as_(self.student).get("/api/applications/").json()
        self.assertEqual((mine[0]["status"], mine[0]["reason"]), ("rejected", "Не хватает подтверждённых навыков"))
        self.assertTrue(self.student.notifications.filter(body__startswith="Причина").exists())
        self.assertEqual(c.post(f"/api/applications/{app.id}/invite/").status_code, 400)

    def test_invite_moves_candidate_to_pipeline(self):
        self.as_(self.student).post(f"/api/vacancies/{self.vac.id}/apply/")
        app = Application.objects.get()
        self.assertEqual(self.as_(self.emp).post(f"/api/applications/{app.id}/invite/").status_code, 200)
        self.assertEqual(HiringEntry.objects.get().stage, "invited")
        self.assertEqual(len(self.as_(self.student).get(f"/api/messages/?company={self.co.id}").json()), 1)

    def test_vacancy_autocloses_after_seven_days_and_reopens_when_answered(self):
        self.as_(self.student).post(f"/api/vacancies/{self.vac.id}/apply/")
        Application.objects.update(created=timezone.now() - timedelta(days=7, minutes=1))
        self.assertEqual(close_overdue(), 1)
        self.vac.refresh_from_db()
        self.assertEqual(self.vac.status, "auto_closed")
        self.assertEqual(self.as_(self.student2).post(f"/api/vacancies/{self.vac.id}/apply/").status_code, 400)
        self.assertEqual(self.as_(self.student2).get("/api/vacancies/").json()["count"], 0)
        app = Application.objects.get()
        self.as_(self.emp).post(f"/api/applications/{app.id}/reject/", {"reason": "Позиция закрыта"}, format="json")
        self.vac.refresh_from_db()
        self.assertEqual(self.vac.status, "open")

    def test_other_company_cannot_touch_applications(self):
        self.as_(self.student).post(f"/api/vacancies/{self.vac.id}/apply/")
        app = Application.objects.get()
        c = self.as_(self.emp2)
        self.assertEqual(c.get(f"/api/vacancies/{self.vac.id}/applications/").status_code, 404)
        self.assertEqual(c.post(f"/api/applications/{app.id}/reject/", {"reason": "x"}, format="json").status_code, 404)
        self.assertEqual(c.post(f"/api/vacancies/{self.vac.id}/close/").status_code, 404)
        self.assertEqual(self.as_(self.student).post(f"/api/applications/{app.id}/invite/").status_code, 403)


class HiringTests(Base):
    def entry(self):
        self.approve(self.solve())
        return HiringEntry.objects.get(company=self.co, student=self.student)

    def test_pipeline_goes_in_order_to_hire(self):
        e, c = self.entry(), self.as_(self.emp)
        url = f"/api/hiring/{e.id}/move/"
        self.assertEqual(c.post(url, {"stage": "offer"}, format="json").status_code, 400)  # нельзя перепрыгнуть
        self.assertEqual(c.post(url, {"stage": "invited", "position": "Product Intern"}, format="json").status_code, 200)
        self.assertEqual(c.post(url, {"stage": "interview"}, format="json").status_code, 400)  # нужно время
        self.assertEqual(c.post(url, {"stage": "interview", "interview_at": "Ср, 14:00"}, format="json").status_code, 200)
        self.assertEqual(c.post(url, {"stage": "offer", "offer_salary": "70 000 ₽", "offer_start": "1 ноября"}, format="json").status_code, 200)
        self.assertEqual(c.post(url, {"stage": "hired"}, format="json").json()["stage"], "hired")
        self.assertEqual(c.post(url, {"stage": "rejected", "reason": "Передумали"}, format="json").status_code, 400)
        self.assertEqual(self.as_(self.student).get("/api/hiring/mine/").json()[0]["offer_salary"], "70 000 ₽")
        self.assertTrue(self.student.notifications.filter(title__contains="оффер").exists())
        self.assertEqual(APIClient().get(f"/api/companies/{self.co.id}/").json()["stats"]["hires"], 1)

    def test_reject_needs_reason(self):
        e, c = self.entry(), self.as_(self.emp)
        self.assertEqual(c.post(f"/api/hiring/{e.id}/move/", {"stage": "rejected"}, format="json").status_code, 400)
        self.assertEqual(c.post(f"/api/hiring/{e.id}/move/", {"stage": "rejected", "reason": "Выбрали другого кандидата"}, format="json").status_code, 200)

    def test_other_company_cannot_move_candidate(self):
        e = self.entry()
        self.assertEqual(self.as_(self.emp2).post(f"/api/hiring/{e.id}/move/", {"stage": "invited"}, format="json").status_code, 404)
        self.assertEqual(self.as_(self.emp2).get("/api/hiring/").json(), [])

    def test_candidate_search_respects_visibility_and_invite_settings(self):
        self.entry()
        c = self.as_(self.emp2)
        found = c.get("/api/candidates/?skills=sql").json()
        self.assertEqual([x["full_name"] for x in found], ["Алексей Иванов"])
        self.assertEqual(c.get("/api/candidates/?skills=sql,figma").json(), [])
        StudentProfile.objects.filter(user=self.student).update(allow_invites=False)
        self.assertEqual(c.post("/api/hiring/", {"student": self.student.id, "position": "Аналитик"}, format="json").status_code, 400)
        StudentProfile.objects.filter(user=self.student).update(allow_invites=True, visible=False)
        self.assertEqual(c.get("/api/candidates/?skills=sql").json(), [])
        self.assertEqual(APIClient().get(f"/api/students/{self.student.id}/").status_code, 404)
        self.assertEqual(self.as_(self.student).get("/api/candidates/").status_code, 403)

    def test_messages_need_a_relation(self):
        c = self.as_(self.emp2)
        self.assertEqual(c.post("/api/messages/", {"student": self.student.id, "text": "Привет"}, format="json").status_code, 400)
        self.assertEqual(c.get(f"/api/messages/?student={self.student.id}").status_code, 404)
        self.entry()
        self.assertEqual(self.as_(self.emp).post("/api/messages/", {"student": self.student.id, "text": "Здравствуйте!"}, format="json").status_code, 201)
        self.assertEqual(self.as_(self.student).post("/api/messages/", {"company": self.co.id, "text": "Добрый день"}, format="json").status_code, 201)
        self.assertEqual(len(self.as_(self.emp).get(f"/api/messages/?student={self.student.id}").json()), 2)


class CompanyAndUniversityTests(Base):
    def test_company_review_only_after_project_or_interview(self):
        body = {"stars": 5, "text": "Настоящая задача и подробный отзыв ментора."}
        self.assertEqual(self.as_(self.student).post(f"/api/companies/{self.co.id}/review/", body, format="json").status_code, 400)
        self.approve(self.solve())
        self.assertEqual(self.as_(self.student).post(f"/api/companies/{self.co.id}/review/", body, format="json").status_code, 201)
        self.as_(self.student).post(f"/api/companies/{self.co.id}/review/", {**body, "stars": 3}, format="json")
        page = APIClient().get(f"/api/companies/{self.co.id}/").json()
        self.assertEqual((page["stats"]["rating"], page["stats"]["reviews"]), (3.0, 1))
        self.assertEqual(page["reviews"][0]["author"], "Алексей И.")
        self.assertEqual(self.as_(self.emp).post(f"/api/companies/{self.co.id}/review/", body, format="json").status_code, 403)

    def test_company_stats_count_answers(self):
        for st in (self.student, self.student2):
            self.as_(st).post(f"/api/vacancies/{self.vac.id}/apply/")
        app = Application.objects.filter(student=self.student).get()
        self.as_(self.emp).post(f"/api/applications/{app.id}/reject/", {"reason": "Позиция закрыта"}, format="json")
        self.assertEqual(APIClient().get(f"/api/companies/{self.co.id}/").json()["stats"]["response_rate"], 50)

    def test_university_sees_only_own_sharing_students(self):
        self.approve(self.solve())
        rows = self.as_(self.career).get("/api/university/students/").json()
        self.assertEqual([r["full_name"] for r in rows], ["Алексей Иванов"])  # Анна не разрешила делиться
        self.assertEqual(rows[0]["projects_done"], 1)
        self.assertEqual(self.as_(self.career2).get("/api/university/students/").json(), [])
        summary = self.as_(self.career).get("/api/university/summary/").json()
        self.assertEqual((summary["students"], summary["confirmed_skills"], summary["projects_done"]), (1, 2, 1))
        self.assertEqual(self.as_(self.emp).get("/api/university/students/").status_code, 403)

    def test_profile_update_and_public_passport(self):
        c = self.as_(self.student)
        self.assertEqual(c.patch("/api/profile/", {"city": "Казань", "about": "Люблю аналитику"}, format="json").json()["city"], "Казань")
        self.approve(self.solve())
        page = APIClient().get(f"/api/students/{self.student.id}/").json()
        self.assertEqual(len(page["skills"]), 2)
        self.assertEqual(page["projects"][0]["company"], "SkillUp")
        self.assertNotIn("email", page["student"])

    def test_notifications_are_private_and_can_be_read(self):
        self.approve(self.solve())
        self.assertTrue(self.as_(self.student).get("/api/notifications/").json())
        self.assertEqual(self.as_(self.student2).get("/api/notifications/").json(), [])
        self.as_(self.student).post("/api/notifications/")
        self.assertFalse(self.student.notifications.filter(read=False).exists())
