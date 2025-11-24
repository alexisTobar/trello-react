from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any

app = FastAPI()

# Configuración de CORS (Igual que antes)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. MODELOS DE DATOS ---
# Esto le enseña a Python qué esperar.
# Básicamente le decimos: "Espera un diccionario gigante con tareas y columnas"
class TrelloState(BaseModel):
    tasks: Dict[str, Any]
    columns: Dict[str, Any]
    columnOrder: List[str]

# --- 2. BASE DE DATOS FALSA (En Memoria) ---
# Aquí guardaremos los datos mientras el servidor esté encendido.
# Iniciamos con datos vacíos o por defecto.
fake_db = {
    "tasks": {
        "task-1": {"id": "task-1", "content": "Aprender Python Backend"},
        "task-2": {"id": "task-2", "content": "Conectar React con FastAPI"},
    },
    "columns": {
        "column-1": {
            "id": "column-1",
            "title": "Por hacer",
            "taskIds": ["task-1", "task-2"],
        },
        "column-2": {
            "id": "column-2",
            "title": "En Progreso",
            "taskIds": [],
        },
         "column-3": {
            "id": "column-3",
            "title": "Finalizado",
            "taskIds": [],
        },
    },
    "columnOrder": ["column-1", "column-2", "column-3"],
}

# --- 3. RUTAS (ENDPOINTS) ---

@app.get("/api/python")
def hello():
    return {"message": "¡API funcionando correctamente!"}

# RUTA PARA LEER DATOS (GET)
# React llamará a esto para saber qué pintar
@app.get("/api/tablero")
def get_tablero():
    return fake_db

# RUTA PARA GUARDAR DATOS (POST)
# React enviará aquí el estado nuevo cada vez que muevas algo
@app.post("/api/tablero")
def save_tablero(estado: TrelloState):
    global fake_db
    # Actualizamos nuestra "Base de Datos" con lo que mandó React
    fake_db = estado.dict()
    return {"status": "Guardado exitosamente", "data": fake_db}