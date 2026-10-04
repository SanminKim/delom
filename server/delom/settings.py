"""Настройки сервера «Делом». Всё, что отличается между компьютером разработчика
и боевым сервером, берётся из переменных окружения (файл .env)."""
import os
from pathlib import Path
from urllib.parse import urlparse

BASE_DIR = Path(__file__).resolve().parent.parent


def env(name, default=""):
    return os.environ.get(name, default)


DEBUG = env("DEBUG", "0") == "1"
SECRET_KEY = env("SECRET_KEY") or ("dev-only-key-not-for-production" if DEBUG else "")
if not SECRET_KEY:
    raise RuntimeError("Задайте SECRET_KEY в .env: без него сервер не запускается")

ALLOWED_HOSTS = [h.strip() for h in env("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",") if h.strip()]
CSRF_TRUSTED_ORIGINS = [o.strip() for o in env("CSRF_TRUSTED_ORIGINS").split(",") if o.strip()]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "drf_spectacular",
    "core",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "delom.urls"
WSGI_APPLICATION = "delom.wsgi.application"
TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "DIRS": [],
    "APP_DIRS": True,
    "OPTIONS": {"context_processors": [
        "django.template.context_processors.request",
        "django.contrib.auth.context_processors.auth",
        "django.contrib.messages.context_processors.messages",
    ]},
}]

# База данных: PostgreSQL на сервере (DATABASE_URL), SQLite — для разработки и тестов.
_db = env("DATABASE_URL")
if _db:
    u = urlparse(_db)
    DATABASES = {"default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": u.path.lstrip("/"), "USER": u.username, "PASSWORD": u.password,
        "HOST": u.hostname, "PORT": u.port or 5432, "CONN_MAX_AGE": 60,
    }}
else:
    DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": BASE_DIR / "db.sqlite3"}}

AUTH_USER_MODEL = "core.User"
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 8}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "ru"
TIME_ZONE = "Europe/Moscow"
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedStaticFilesStorage"},
}
# Загруженные решения лежат вне публичной папки и отдаются только через проверку прав.
MEDIA_ROOT = Path(env("MEDIA_ROOT") or BASE_DIR / "media")
MAX_UPLOAD_MB = 50
DATA_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024
ALLOWED_UPLOAD_EXT = {"pdf", "pptx", "ppt", "docx", "doc", "xlsx", "xls", "csv", "txt", "md", "png", "jpg", "jpeg", "zip", "html", "ipynb", "sql"}

# Вход по сессии: cookie недоступна скриптам и не уходит на чужие сайты.
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_AGE = 60 * 60 * 24 * 14
if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_HSTS_SECONDS = 60 * 60 * 24 * 30
    SECURE_CONTENT_TYPE_NOSNIFF = True

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": ["rest_framework.authentication.SessionAuthentication"],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 30,
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_THROTTLE_CLASSES": ["rest_framework.throttling.ScopedRateThrottle"],
    "DEFAULT_THROTTLE_RATES": {"auth": env("AUTH_RATE", "20/hour")},
    "EXCEPTION_HANDLER": "core.errors.handler",
}
SPECTACULAR_SETTINGS = {"TITLE": "Делом API", "VERSION": "1.0", "DESCRIPTION": "Серверная часть платформы «Делом»: проекты, проверка, паспорт навыков, найм."}

import sys
if "test" in sys.argv:  # быстрые хэши паролей только в автотестах
    PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]

# Правила манифеста
ANSWER_DAYS = 7            # компания отвечает на отклик за 7 дней, иначе позиция закрывается
APPLICATIONS_PER_WEEK = 5  # лимит откликов студента
MIN_SUMMARY_CHARS = 150    # минимальная длина итога решения
MIN_PASS_SCORE = 3.0       # ниже — навыки не подтверждаются, решение возвращается
