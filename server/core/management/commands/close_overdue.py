from django.core.management.base import BaseCommand

from core.services import close_overdue


class Command(BaseCommand):
    help = "Закрывает позиции с откликами без ответа дольше 7 дней и открывает те, где ответили всем."

    def handle(self, *args, **opts):
        self.stdout.write(f"Изменено позиций: {close_overdue()}")
