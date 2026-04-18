import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'catalogo.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Activar soporte de Foreign Keys en SQLite
    cursor.execute("PRAGMA foreign_keys = ON")

    # Tabla principal de zapatos
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS productos (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre        TEXT    NOT NULL,
            tipo_prenda   TEXT    DEFAULT 'Calzados',
            categoria     TEXT    NOT NULL,
            descripcion   TEXT,
            imagen        TEXT    NOT NULL,
            fecha_ingreso DATE    DEFAULT (date('now')),
            activo        INTEGER DEFAULT 1,
            destacado     INTEGER DEFAULT 0,
            visitas       INTEGER DEFAULT 0,
            orden         INTEGER DEFAULT 0,
            es_nuevo      INTEGER DEFAULT 1
        )
    ''')

    # Tabla puente para géneros (permite multi-género por zapato)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS producto_audiencia (
            zapato_id   INTEGER NOT NULL,
            genero      TEXT    NOT NULL,
            PRIMARY KEY (zapato_id, genero),
            FOREIGN KEY (zapato_id) REFERENCES productos(id) ON DELETE CASCADE
        )
    ''')

    # Catálogo de marcas
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS marcas (
        id     INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL UNIQUE
    );  
    ''')

    # Tabla puente (un zapato puede tener varias marcas)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS producto_marca (
        zapato_id INTEGER NOT NULL,
        marca_id  INTEGER NOT NULL,
        PRIMARY KEY (zapato_id, marca_id),
        FOREIGN KEY (zapato_id) REFERENCES productos(id) ON DELETE CASCADE,
        FOREIGN KEY (marca_id)  REFERENCES marcas(id)  ON DELETE CASCADE
    );
    ''')

    # Tabla para múltiples imágenes por producto (Galería)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS producto_imagenes (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        producto_id INTEGER NOT NULL,
        imagen_url  TEXT    NOT NULL,
        orden       INTEGER DEFAULT 0,
        FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
    );
    ''')

    conn.commit()
    conn.close()
    print("✅ Base de datos inicializada correctamente.")
    print(f"📁 Ubicación: {DB_PATH}")

if __name__ == '__main__':
    init_db()