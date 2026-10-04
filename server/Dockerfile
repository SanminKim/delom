FROM python:3.12-slim
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN SECRET_KEY=build python manage.py collectstatic --noinput \
 && useradd --create-home app && mkdir -p /data/media && chown -R app /data /app
USER app
EXPOSE 8000
CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn delom.wsgi --bind 0.0.0.0:8000 --workers 3 --timeout 60"]
