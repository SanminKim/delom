"""Правила продукта. Всё, что нельзя доверять браузеру, проверяется здесь."""
from datetime import timedelta
from decimal import Decimal

from django.conf import settings
from django.db import transaction
from django.db.models import Avg, Count, F, Q
from django.utils import timezone

from .errors import RuleError
from .models import (Application, CompanyReview, HiringEntry, Message, Notification, Participation,
                     Review, SkillConfirmation, Vacancy)

REASONS = [
    "Не хватает подтверждённых навыков для позиции",
    "Выбрали кандидата с более близким опытом",
    "Не совпали формат работы или город",
    "Позиция закрыта",
]


def notify(user, title, body="", link=""):
    Notification.objects.create(user=user, title=title[:200], body=body[:400], link=link)


def say(company, student, text, sender=None, from_company=True):
    return Message.objects.create(company=company, student=student, sender=sender, from_company=from_company, text=text)


def related(company, student):
    """Есть ли у компании и студента общее дело: отклик, проект или воронка."""
    return (HiringEntry.objects.filter(company=company, student=student).exists()
            or Application.objects.filter(vacancy__company=company, student=student).exists()
            or Participation.objects.filter(project__company=company, student=student).exists())


# ---------- проекты ----------
def join_project(student, project):
    if not project.accepting:
        raise RuleError("Компания закрыла приём решений по этому проекту")
    part, created = Participation.objects.get_or_create(student=student, project=project)
    if not created:
        raise RuleError("Вы уже участвуете в этом проекте")
    return part


def submit(part):
    if part.status != Participation.Status.ACTIVE:
        raise RuleError("Решение уже отправлено")
    if len(part.summary.strip()) < settings.MIN_SUMMARY_CHARS:
        raise RuleError(f"Опишите итог решения: минимум {settings.MIN_SUMMARY_CHARS} знаков")
    if not part.file:
        raise RuleError("Загрузите файл с решением")
    part.status, part.submitted_at = Participation.Status.REVIEW, timezone.now()
    part.save(update_fields=["status", "submitted_at"])
    if part.project.mentor:
        notify(part.project.mentor, "Новое решение на проверку", part.project.title, f"review-{part.id}")
    return part


def withdraw(part):
    if part.status != Participation.Status.REVIEW:
        raise RuleError("Отозвать можно только решение, которое ждёт проверки")
    part.status = Participation.Status.ACTIVE
    part.save(update_fields=["status"])
    return part


def can_mentor(user, project):
    return user.role == "mentor" and (project.mentor_id in (None, user.id))


@transaction.atomic
def review(part, mentor, verdict, stars, comment, skills):
    part = Participation.objects.select_for_update().select_related("project", "student").get(pk=part.pk)
    project = part.project
    if not can_mentor(mentor, project):
        raise RuleError("Этот проект проверяет другой ментор")
    if part.status != Participation.Status.REVIEW:
        raise RuleError("Решение не ждёт проверки")
    if len(comment.strip()) < 20:
        raise RuleError("Напишите отзыв: что получилось и что улучшить")
    n = len(project.criteria) or 1
    if verdict == Review.Verdict.APPROVED:
        if len(stars) != n or any(not isinstance(s, int) or s < 1 or s > 5 for s in stars):
            raise RuleError(f"Поставьте оценку от 1 до 5 по каждому из {n} критериев")
        score = (Decimal(sum(stars)) / Decimal(len(stars))).quantize(Decimal("0.1"))
        if score < Decimal(str(settings.MIN_PASS_SCORE)):
            raise RuleError("Оценка ниже 3 — навыки подтвердить нельзя, верните решение на доработку")
        allowed = set(project.skills.values_list("id", flat=True))
        skills = [s for s in skills if s.id in allowed]
        if not skills:
            raise RuleError("Выберите хотя бы один навык проекта для подтверждения")
        r = Review.objects.create(participation=part, mentor=mentor, verdict=verdict, stars=stars, score=score, comment=comment.strip(), attempt=part.attempt)
        r.skills.set(skills)
        part.status, part.score = Participation.Status.DONE, score
        part.save(update_fields=["status", "score"])
        for s in skills:
            SkillConfirmation.objects.update_or_create(student=part.student, skill=s, defaults={"participation": part, "mentor": mentor, "score": score})
        notify(part.student, f"Подтверждено навыков: {len(skills)}", f"{project.company.name} · оценка {score}", f"complete-{project.id}")
        if project.hiring:
            entry, _ = HiringEntry.objects.get_or_create(company=project.company, student=part.student, defaults={
                "position": project.hire_position, "source": f"Проект «{project.title}» · оценка {score}"})
    else:
        r = Review.objects.create(participation=part, mentor=mentor, verdict=verdict, stars=[], comment=comment.strip(), attempt=part.attempt)
        part.status, part.attempt = Participation.Status.ACTIVE, F("attempt") + 1
        part.save(update_fields=["status", "attempt"])
        notify(part.student, "Решение вернули на доработку", comment.strip()[:200], f"workspace-{project.id}")
    return r


# ---------- вакансии и отклики ----------
def refresh_vacancy(vacancy):
    """Закрывает позицию, если есть отклик без ответа дольше срока, и открывает, когда ответили всем."""
    if vacancy.status == Vacancy.Status.CLOSED:
        return vacancy
    limit = timezone.now() - timedelta(days=settings.ANSWER_DAYS)
    overdue = vacancy.applications.filter(status=Application.Status.NEW, created__lte=limit).exists()
    new = Vacancy.Status.AUTO if overdue else Vacancy.Status.OPEN
    if new != vacancy.status:
        vacancy.status = new
        vacancy.save(update_fields=["status"])
    return vacancy


def close_overdue():
    changed = 0
    for v in Vacancy.objects.exclude(status=Vacancy.Status.CLOSED):
        before = v.status
        if refresh_vacancy(v).status != before:
            changed += 1
    return changed


def apply(student, vacancy):
    refresh_vacancy(vacancy)
    if vacancy.status != Vacancy.Status.OPEN:
        raise RuleError("Позиция закрыта")
    week = timezone.now() - timedelta(days=7)
    if Application.objects.filter(student=student, created__gte=week).count() >= settings.APPLICATIONS_PER_WEEK:
        raise RuleError(f"Лимит — {settings.APPLICATIONS_PER_WEEK} откликов в неделю. Так каждый отклик читают внимательно")
    app, created = Application.objects.get_or_create(student=student, vacancy=vacancy)
    if not created:
        raise RuleError("Вы уже откликались на эту позицию")
    return app


@transaction.atomic
def answer_application(app, user, invite, reason="", note=""):
    if app.status != Application.Status.NEW:
        raise RuleError("На этот отклик уже ответили")
    company = app.vacancy.company
    if invite:
        if not getattr(app.student, "profile", None) or not app.student.profile.allow_invites:
            raise RuleError("Кандидат закрыл приглашения в настройках профиля")
        app.status = Application.Status.INVITED
        entry, _ = HiringEntry.objects.get_or_create(company=company, student=app.student, defaults={"source": "Отклик на вакансию"})
        if entry.stage in (HiringEntry.Stage.NEW, HiringEntry.Stage.REJECTED):
            entry.stage, entry.position, entry.reason = HiringEntry.Stage.INVITED, app.vacancy.title, ""
            entry.save()
        say(company, app.student, note.strip() or f"Здравствуйте! Приглашаем на интервью на позицию «{app.vacancy.title}».", sender=user)
        notify(app.student, f"{company.name} приглашает на интервью", app.vacancy.title, "applications")
    else:
        if not reason.strip():
            raise RuleError("Укажите причину отказа — это правило платформы")
        app.status, app.reason, app.note = Application.Status.REJECTED, reason.strip()[:200], note.strip()
        notify(app.student, f"{company.name} ответила на отклик", "Причина: " + app.reason, "applications")
    app.answered_at = timezone.now()
    app.save()
    refresh_vacancy(app.vacancy)
    return app


# ---------- воронка найма ----------
def invite_candidate(company, student, user, position, text):
    prof = getattr(student, "profile", None)
    if student.role != "student" or not prof:
        raise RuleError("Кандидат не найден")
    if not (prof.visible and prof.allow_invites) and not related(company, student):
        raise RuleError("Кандидат закрыл приглашения в настройках профиля")
    entry, created = HiringEntry.objects.get_or_create(company=company, student=student, defaults={"source": "Поиск кандидатов"})
    if not created and entry.stage not in (HiringEntry.Stage.NEW, HiringEntry.Stage.REJECTED):
        raise RuleError("Кандидат уже в работе")
    entry.stage, entry.position, entry.reason = HiringEntry.Stage.INVITED, position, ""
    entry.save()
    say(company, student, text.strip() or f"Здравствуйте! Приглашаем на интервью на позицию «{position}».", sender=user)
    notify(student, f"{company.name} приглашает на интервью", position, "messages")
    return entry


def move(entry, stage, user, data):
    S, order = HiringEntry.Stage, HiringEntry.ORDER
    company, student = entry.company, entry.student
    if stage == S.REJECTED:
        reason = (data.get("reason") or "").strip()
        if not reason:
            raise RuleError("Укажите причину отказа — это правило платформы")
        if entry.stage == S.HIRED:
            raise RuleError("Кандидат уже нанят")
        entry.stage, entry.reason = S.REJECTED, reason[:200]
        entry.save()
        say(company, student, f"Спасибо за интерес к {company.name}. К сожалению, сейчас мы не готовы продолжить. Причина: {reason}.", sender=user)
        notify(student, f"{company.name}: отказ с причиной", reason, "messages")
        return entry
    if stage not in order or entry.stage not in order or order.index(stage) != order.index(entry.stage) + 1:
        raise RuleError("Этапы идут по порядку: приглашение, интервью, оффер, найм")
    if stage == S.INVITED:
        return invite_candidate(company, student, user, data.get("position") or entry.position, data.get("text") or "")
    if stage == S.INTERVIEW:
        when = (data.get("interview_at") or "").strip()
        if not when:
            raise RuleError("Укажите время интервью")
        entry.interview_at = when[:80]
        say(company, student, f"Назначили интервью: {when}.", sender=user)
        notify(student, "Интервью назначено", f"{company.name} · {when}", "messages")
    if stage == S.OFFER:
        sal, start = (data.get("offer_salary") or "").strip(), (data.get("offer_start") or "").strip()
        if not sal or not start:
            raise RuleError("Укажите оплату и дату выхода")
        entry.offer_salary, entry.offer_start = sal[:80], start[:80]
        say(company, student, f"Мы готовы сделать вам оффер: {sal}, выход {start}.", sender=user)
        notify(student, f"{company.name} сделала вам оффер", f"{sal} · выход {start}", "messages")
    if stage == S.HIRED:
        entry.hired_at = timezone.localdate()
        notify(student, "Поздравляем с выходом на работу", company.name, "messages")
    entry.stage = stage
    entry.save()
    return entry


# ---------- рейтинг компании ----------
def company_stats(company):
    for v in company.vacancies.exclude(status=Vacancy.Status.CLOSED):
        refresh_vacancy(v)
    apps = Application.objects.filter(vacancy__company=company)
    total, answered = apps.count(), apps.exclude(status=Application.Status.NEW)
    days = [(a.answered_at - a.created).total_seconds() / 86400 for a in answered if a.answered_at]
    limit = timezone.now() - timedelta(days=settings.ANSWER_DAYS)
    agg = company.reviews.aggregate(avg=Avg("stars"), n=Count("id"))
    return {
        "response_rate": round(answered.count() / total * 100) if total else None,
        "avg_response_days": round(sum(days) / len(days), 1) if days else None,
        "overdue": apps.filter(status=Application.Status.NEW, created__lte=limit).count(),
        "hires": company.pipeline.filter(stage=HiringEntry.Stage.HIRED).count(),
        "rating": round(agg["avg"], 1) if agg["avg"] else None,
        "reviews": agg["n"],
    }


def can_review_company(student, company):
    return (Participation.objects.filter(student=student, project__company=company, status=Participation.Status.DONE).exists()
            or HiringEntry.objects.filter(student=student, company=company, stage__in=["interview", "offer", "hired"]).exists())


def save_company_review(student, company, stars, text):
    if not can_review_company(student, company):
        raise RuleError("Отзыв могут оставить те, кто завершил проект компании или прошёл интервью")
    obj, _ = CompanyReview.objects.update_or_create(company=company, student=student, defaults={"stars": stars, "text": text.strip()})
    return obj
