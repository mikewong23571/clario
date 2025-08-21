from fastapi import FastAPI

app = FastAPI(title="Clario API")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}