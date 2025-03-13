FROM python:3.12-slim

WORKDIR /app

# Copy requirements.txt from root directory
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy backend directory contents
COPY backend/ .

EXPOSE 8000

CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:8000"]
