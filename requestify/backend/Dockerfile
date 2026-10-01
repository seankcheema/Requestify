# API image: Flask REST API + Flask-SocketIO (song queue, upvotes, tips)
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
WORKDIR /app/backend

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY *.py ./

# Run as an unprivileged user; spotipy writes its token cache to the working directory
RUN useradd --create-home --uid 10001 app && chown -R app /app
USER app

EXPOSE 5001
# Flask-SocketIO needs a single worker (no sticky sessions across workers); threads handle concurrency
CMD ["gunicorn", "--workers", "1", "--threads", "100", "--bind", "0.0.0.0:5001", "main:app"]
