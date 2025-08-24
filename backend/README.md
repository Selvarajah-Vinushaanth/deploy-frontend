# Tamil Songwriting Assistant Backend

This is the FastAPI backend for the Tamil Songwriting Assistant application. The backend integrates with Hugging Face Spaces to provide ML-based services for Tamil songwriting assistance.

## Services

1. **Lyric Generation**: Generate Tamil lyrics based on a theme, mood, and other parameters.
2. **Metaphor Generation**: Get metaphor suggestions for Tamil words based on source and target contexts.
3. **Metaphor Classification**: Get a detailed overview of metaphor usage in an input text.

## Technologies Used

- FastAPI: High-performance web framework
- Firebase: Authentication
- Hugging Face: ML model hosting and inference
- Python 3.12+

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/aaivu/tamil-songwriting-assistant.git
   cd tamil-songwriting-assistant/backend
   ```

2. Create a virtual environment:

   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   ```

3. Install the required packages:

   ```bash
   pip install -r requirements.txt
   ```

4. Set up Firebase:
   - Create a Firebase project
   - Generate a service account key
   - Save the key in a secure location
   - Update the path in the `.env` file

5. Create a `.env` file from the example:

   ```bash
   cp .env.example .env
   ```

6. Update the `.env` file with your configuration settings.

## Running the App

### Development

```bash
uvicorn main:app --reload
```

### Production

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Using Docker

```bash
docker-compose up -d
```

## API Documentation

Once the server is running, you can access the API documentation at:

- Swagger UI: `http://localhost:8000/api/v1/docs`
- ReDoc: `http://localhost:8000/api/v1/redoc`

## Authentication

This API uses Firebase Authentication. Include an ID token in the `Authorization` header:

```txt
Authorization: Bearer <firebase-id-token>
```

## Environment Variables

- `ENV`: Environment (`development` or `production`)
- `DEBUG`: Enable debug mode
- `APP_HOST`: Host to bind the server
- `APP_PORT`: Port to bind the server
- `API_PREFIX`: Prefix for API routes
- `FIREBASE_SERVICE_ACCOUNT_KEY_PATH`: Path to Firebase service account key
- `HUGGINGFACE_API_TOKEN`: Hugging Face API token
- `LYRIC_GENERATOR_SPACE`: Name of the Hugging Face Space for lyric generation
- `METAPHOR_GENERATION_SPACE`: Name of the Hugging Face Space for metaphor generation
- `METAPHOR_CLASSIFICATION_SPACE`: Name of the Hugging Face Space for metaphor classification
- `CORS_ORIGINS`: List of allowed origins for CORS

## Project Structure

```txt
backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── lyrics.py
│   │   │   ├── melodies.py
│   │   │   ├── rhymes.py
│   │   │   └── users.py
│   │   └── __init__.py
│   ├── auth/
│   │   ├── __init__.py
│   │   └── firebase_auth.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   └── middleware.py
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py
│   ├── services/
│   │   ├── __init__.py
│   │   └── huggingface_service.py
│   ├── utils/
│   │   ├── __init__.py
│   │   └── helpers.py
│   └── __init__.py
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── main.py
├── README.md
└── requirements.txt
```
