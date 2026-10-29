# SehatYar API image for Render (includes Tesseract for medicine OCR).
# Build context: repository root.

FROM python:3.12.10-slim-bookworm

RUN apt-get update \
  && apt-get install -y --no-install-recommends tesseract-ocr \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY apps/api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY apps/api/ .
COPY data/ /data/

ENV FAQ_DATA_DIR=/data/faqs
ENV MEDICINE_DATA_DIR=/data/medicines

EXPOSE 8000

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
