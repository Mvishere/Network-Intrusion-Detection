FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "nsl_kdd_pipeline.py", "--top-n-features", "30", "--output-dir", "artifacts"]
