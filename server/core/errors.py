from rest_framework.exceptions import APIException
from rest_framework.views import exception_handler


class RuleError(APIException):
    """Действие нарушает правило платформы. Текст показывается пользователю как есть."""
    status_code = 400
    default_code = "rule"


def handler(exc, context):
    resp = exception_handler(exc, context)
    if resp is not None and isinstance(resp.data, dict) and "detail" in resp.data:
        resp.data = {"error": str(resp.data["detail"]), "code": getattr(exc, "default_code", "error")}
    elif resp is not None:
        resp.data = {"error": "Проверьте поля формы", "code": "invalid", "fields": resp.data}
    return resp
