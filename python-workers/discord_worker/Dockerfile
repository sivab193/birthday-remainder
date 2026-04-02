FROM python:3.12-slim
WORKDIR /app
COPY shared/ /app/shared/
COPY discord_worker/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY discord_worker/main.py .
CMD ["python", "main.py"]