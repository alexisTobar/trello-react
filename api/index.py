import os
import json
import psycopg2
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any
from dotenv import load_dotenv

# Cargamos las variables del archivo .env (solo sirve en local, en Vercel lo hace solo)
load_dotenv()

app = FastAPI()

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELO DE DATOS ---
class TrelloState(BaseModel):
    tasks: Dict[str, Any]
    columns: Dict[str, Any]
    columnOrder: List[str]

# --- DATOS POR DEFECTO (Si la base de datos está vacía) ---
DEFAULT_STATE = {
    "tasks": {
        "task-1": {"id": "task-1", "content": "¡Bienvenido a tu Trello en la Nube! ☁️"},
        "task-2": {"id": "task-2", "content": "Estos datos vienen de PostgreSQL"},
    },
    "columns": {
        "col-1": {"id": "col-1", "title": "Por hacer", "taskIds": ["task-1", "task-2"]},
        "col-2": {"id": "col-2", "title": "En Progreso", "taskIds": []},
        "col-3": {"id": "col-3", "title": "Finalizado", "taskIds": []},
    },
    "columnOrder": ["col-1", "col-2", "col-3"],
}

# --- FUNCIÓN PARA CONECTARSE A LA BD ---
def get_db_connection():
    # Busca la variable DATABASE_URL que pegaste en tu .env
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    return conn

# --- INICIALIZAR TABLA (Se ejecuta al arrancar) ---
@app.on_event("startup")
def startup():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        # Creamos una tabla simple con 2 columnas: ID (siempre 1) y DATA (el JSON completo)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS trello_data (
                id INTEGER PRIMARY KEY,
                data JSONB
            );
        """)
        conn.commit()
        cur.close()
        conn.close()
        print("✅ Base de datos conectada y tabla verificada.")
    except Exception as e:
        print(f"❌ Error conectando a la BD: {e}")

# --- RUTAS ---

@app.get("/api/python")
def hello():
    return {"message": "Backend conectado a PostgreSQL 🐘"}

@app.get("/api/tablero")
def get_tablero():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        # Buscamos la fila con ID = 1
        cur.execute("SELECT data FROM trello_data WHERE id = 1;")
        result = cur.fetchone()
        
        cur.close()
        conn.close()

        if result:
            # Si existe, devolvemos los datos guardados
            return result[0]
        else:
            # Si no existe (es la primera vez), devolvemos los datos por defecto
            return DEFAULT_STATE
            
    except Exception as e:
        print(f"Error: {e}")
        return DEFAULT_STATE

@app.post("/api/tablero")
def save_tablero(estado: TrelloState):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Convertimos el objeto Pydantic a JSON String
        state_json = json.dumps(estado.dict())

        # SQL MÁGICO ("UPSERT"):
        # Intenta Insertar el ID 1. 
        # Si ya existe (CONFLICT), entonces Actualiza (UPDATE) los datos.
        query = """
            INSERT INTO trello_data (id, data) 
            VALUES (1, %s)
            ON CONFLICT (id) 
            DO UPDATE SET data = EXCLUDED.data;
        """
        
        cur.execute(query, (state_json,))
        conn.commit()
        
        cur.close()
        conn.close()
        return {"status": "Guardado en Postgres exitosamente"}
        
    except Exception as e:
        return {"error": str(e)}