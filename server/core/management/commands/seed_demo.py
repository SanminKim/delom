"""Начальные данные: навыки, две компании, вуз, по пользователю на каждую роль, проекты и вакансии."""
import os
import secrets
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from core.models import Company, Project, Skill, StudentProfile, University, User, Vacancy

SKILLS = [("sql", "SQL"), ("python", "Python"), ("product-analytics", "Product Analytics"), ("ab", "A/B-тестирование"), ("hypotheses", "Работа с гипотезами"),
          ("viz", "Визуализация данных"), ("custdev", "Customer Development"), ("cjm", "CJM"), ("bi", "BI-дашборды"), ("cohorts", "Когортный анализ"),
          ("unit-economics", "Юнит-экономика"), ("excel", "Excel"), ("bpmn", "BPMN"), ("figma", "Figma"), ("ux-research", "UX-исследования")]


class Command(BaseCommand):
    help = "Создаёт начальные данные для первого запуска. Повторный запуск ничего не дублирует."

    def handle(self, *args, **opts):
        sk = {slug: Skill.objects.get_or_create(slug=slug, defaults={"name": name})[0] for slug, name in SKILLS}
        su, _ = Company.objects.get_or_create(name="SkillUp", defaults={"industry": "EdTech · онлайн-курсы для школьников"})
        tb, _ = Company.objects.get_or_create(name="Т-Банк", defaults={"industry": "Финтех · аналитика клиентского опыта"})
        uni, _ = University.objects.get_or_create(name="НИУ ВШЭ")
        password = os.environ.get("DEMO_PASSWORD") or secrets.token_urlsafe(9)
        users = [("student@delom.demo", "Алексей Иванов", "student", {}), ("hr@skillup.demo", "Марина Ковалёва", "employer", {"company": su, "position": "Head of Product"}),
                 ("hr@tbank.demo", "Дмитрий Орлов", "employer", {"company": tb, "position": "лид аналитики"}), ("mentor@delom.demo", "Ольга Сафина", "mentor", {"position": "Senior PM"}),
                 ("career@hse.demo", "Елена Смирнова", "university", {"university": uni})]
        made = []
        for email, name, role, extra in users:
            if not User.objects.filter(email=email).exists():
                User.objects.create_user(email, password, full_name=name, role=role, **extra)
                made.append(email)
        student = User.objects.get(email="student@delom.demo")
        StudentProfile.objects.get_or_create(user=student, defaults={"university": uni, "program": "Бизнес-информатика", "year": 3, "city": "Москва", "goal": "Product Manager", "share_with_university": True})
        mentor = User.objects.get(email="mentor@delom.demo")
        deadline = timezone.localdate() + timedelta(days=21)
        projects = [(su, "Исследование пользовательской воронки EdTech-сервиса", "Компания хочет понять причины падения конверсии между регистрацией и первой покупкой. Найдите проблемные этапы и предложите гипотезы.",
                     ["Корректность расчёта конверсий", "Обоснованность гипотез данными", "Практическая применимость гипотез", "Структура и ясность презентации"], ["product-analytics", "sql", "hypotheses", "viz"], "Product Intern"),
                    (tb, "Дашборд удержания клиентов", "Соберите когорты по месяцу первой операции и покажите, где клиенты перестают пользоваться продуктом.",
                     ["Корректность когорт", "Качество визуализации", "Выводы и рекомендации", "Воспроизводимость расчёта"], ["sql", "python", "cohorts", "bi"], "Junior Product Analyst")]
        for company, title, task, criteria, slugs, pos in projects:
            p, created = Project.objects.get_or_create(company=company, title=title, defaults={"task": task, "criteria": criteria, "direction": "Product / Analytics", "difficulty": "Средняя",
                                                                                              "duration": "1–2 недели", "deadline": deadline, "hire_position": pos, "mentor": mentor})
            if created:
                p.skills.set([sk[x] for x in slugs])
        for company, title, lo, hi in [(su, "Product Intern", 60000, 80000), (tb, "Junior Product Analyst", 120000, 150000)]:
            Vacancy.objects.get_or_create(company=company, title=title, defaults={"salary_from": lo, "salary_to": hi, "work_format": "Гибрид", "city": "Москва"})
        self.stdout.write("Начальные данные готовы.")
        if made:
            self.stdout.write(f"Созданы пользователи: {', '.join(made)}\nПароль для всех: {password}\nСмените его после первого входа.")
