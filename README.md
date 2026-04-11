# DiKeVoi-Server

A simple server built with Python and [FastAPI](https://fastapi.tiangolo.com/).

## Project Structure

```
DiKeVoi-Server/
├── app/
│   ├── main.py          # FastAPI application entry point
│   ├── api/ │   │   └── routes/ │   │       └── health.py  # Health-check endpoint
│   ├── core/
│   │   └── config.py    # Application settings (pydantic-settings)
│   └── models/          # Data models (Pydantic schemas)
├── tests/
│   └── test_health.py   # Endpoint tests (pytest)
└── requirements.txt
```

## Getting Started

### Install dependencies

```bash
pip install -r requirements.txt
```

For development (includes test dependencies):

```bash
pip install -r requirements-dev.txt
```

### Run the server

```bash
uvicorn app.main:app --reload
```

The API will be available at <http://localhost:8000>.  
Interactive docs: <http://localhost:8000/docs>

### Run the tests

```bash
pytest
```

### OpenAPI docs

```bash
localhost:8000/docs
```