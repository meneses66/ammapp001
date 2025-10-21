FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Copy dependency metadata
COPY requirements.txt /tmp/requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# Copy the backend source (preserve package folder)
COPY appfpet001/backend/ /app/backend/

ENV PYTHONPATH=/app

EXPOSE 5000

CMD ["python", "-m", "backend.app"]
