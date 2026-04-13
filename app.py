from flask import Flask, render_template, request
import sqlite3
import difflib
import os

# Esto averigua exactamente en qué carpeta está el archivo app.py
CARPETA_ACTUAL = os.path.dirname(os.path.abspath(__file__))
RUTA_BD = os.path.join(CARPETA_ACTUAL, 'catalogo.db')

app = Flask(__name__)

# --- FUNCIÓN PARA CONECTAR A LA BASE DE DATOS ---
def obtener_conexion():
    conexion = sqlite3.connect(RUTA_BD)
    conexion.row_factory = sqlite3.Row
    return conexion

# --- RUTA PRINCIPAL ---
@app.route('/')
def inicio():
    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT z.id, z.nombre, z.imagen, z.es_nuevo, z.destacado AS es_destacado, z.tipo_prenda,
               GROUP_CONCAT(DISTINCT g.genero) AS generos,
               GROUP_CONCAT(DISTINCT m.nombre) AS marcas
        FROM productos z
        LEFT JOIN producto_audiencia g ON z.id = g.zapato_id
        LEFT JOIN producto_marca zm ON z.id = zm.zapato_id
        LEFT JOIN marcas m ON zm.marca_id = m.id
        WHERE z.activo = 1 AND z.nombre != ''
        GROUP BY z.id
        ORDER BY z.destacado DESC, z.orden DESC, z.fecha_ingreso DESC
    """)
    lista_zapatos = cursor.fetchall()

    # Zapatos con destacado = 1 para la sección "Productos Destacados" del index
    cursor.execute("""
        SELECT z.id, z.nombre, z.imagen,
               GROUP_CONCAT(DISTINCT m.nombre) AS marcas
        FROM productos z
        LEFT JOIN producto_marca zm ON z.id = zm.zapato_id
        LEFT JOIN marcas m ON zm.marca_id = m.id
        WHERE z.activo = 1 AND z.destacado = 1 AND z.nombre != ''
        GROUP BY z.id
        ORDER BY z.orden ASC, z.fecha_ingreso DESC
    """)
    lista_destacados = cursor.fetchall()

    conexion.close()

    return render_template('index.html', zapatos=lista_zapatos, destacados=lista_destacados)


# --- RUTA DEL CATÁLOGO ---
@app.route('/catalogo')
def catalogo():
    conexion = obtener_conexion()
    cursor = conexion.cursor()

    # 1. Parámetros del filtro
    busqueda = request.args.get('q', '')
    filtro_genero = request.args.get('genero', 'Todos')
    filtro_marca = request.args.get('marca', 'Todas')
    orden_seleccionado = request.args.get('orden', 'destacados')
    filtro_prenda = request.args.get('prenda', 'Todas')

    # 2. CONSTRUIR LA CONSULTA SQL BASE (Filtros de sidebar)
    query = """
        SELECT z.id, z.nombre, z.imagen, z.es_nuevo, z.destacado AS es_destacado, z.tipo_prenda,
               GROUP_CONCAT(DISTINCT g.genero) AS generos,
               GROUP_CONCAT(DISTINCT m.nombre) AS marcas
        FROM productos z
        LEFT JOIN producto_audiencia g ON z.id = g.zapato_id
        LEFT JOIN producto_marca zm ON z.id = zm.zapato_id
        LEFT JOIN marcas m ON zm.marca_id = m.id
        WHERE z.activo = 1 AND z.nombre != ''
    """
    parametros = []

    # 2.0. Filtro de prenda
    if filtro_prenda != 'Todas':
        query += " AND z.tipo_prenda = ?"
        parametros.append(filtro_prenda)

    # 2.1. Filtro de género
    if filtro_genero != 'Todos':
        query += " AND z.id IN (SELECT zapato_id FROM producto_audiencia WHERE genero = ?)"
        parametros.append(filtro_genero)

    # 2.2. Filtro por marca
    if filtro_marca != 'Todas':
        query += """
            AND z.id IN (
                SELECT zm2.zapato_id FROM producto_marca zm2
                JOIN marcas m2 ON zm2.marca_id = m2.id
                WHERE m2.nombre = ?
            )
        """
        parametros.append(filtro_marca)

    # 2.3. GROUP BY + ORDER
    query += " GROUP BY z.id"

    if orden_seleccionado == 'nuevo':
        query += " ORDER BY z.fecha_ingreso DESC"
    elif orden_seleccionado == 'antiguo':
        query += " ORDER BY z.fecha_ingreso ASC"
    else:
        query += " ORDER BY z.destacado DESC, z.orden DESC, z.fecha_ingreso DESC"

    # 3. SQL PRIMERO
    cursor.execute(query, parametros)
    todos_los_zapatos = cursor.fetchall()

    # 4. FILTRO INTELIGENTE DE PYTHON (difflib)
    lista_zapatos = []

    if busqueda:
        busqueda_lower = busqueda.lower()

        for zapato in todos_los_zapatos:
            # Extraemos el nombre y la marca
            nombre_zapato = str(zapato['nombre']).lower() if 'nombre' in zapato.keys() else str(zapato[1]).lower()

            # ¡Ojo aquí! Cambié 'marca' por 'marcas' porque así le pusiste el alias en tu SELECT (AS marcas)
            marca_zapato = str(zapato['marcas']).lower() if 'marcas' in zapato.keys() else str(zapato[5]).lower()

            # Calculamos la similitud
            similitud_nombre = difflib.SequenceMatcher(None, busqueda_lower, nombre_zapato).ratio()
            similitud_marca = difflib.SequenceMatcher(None, busqueda_lower, marca_zapato).ratio()

            if similitud_nombre > 0.6 or similitud_marca > 0.6 or busqueda_lower in nombre_zapato:
                lista_zapatos.append(zapato)
    else:
        # Si la barra de búsqueda está vacía, mostramos lo que trajo SQL
        lista_zapatos = todos_los_zapatos

    # 5. Traer lista de marcas para el sidebar
    cursor.execute("SELECT nombre FROM marcas ORDER BY id")
    # Nota: Si tu fetchall() devuelve diccionarios/Row, esto funciona. Si devuelve tuplas, sería row[0]
    lista_marcas = [row['nombre'] for row in cursor.fetchall()]

    conexion.close()

    # 6. Enviar a FabyStore
    return render_template('catalogo.html',
        zapatos=lista_zapatos,
        busqueda_actual=busqueda,
        prenda_actual=filtro_prenda,
        genero_actual=filtro_genero,
        marca_actual=filtro_marca,
        orden_actual=orden_seleccionado,
        marcas=lista_marcas)


# --- RUTA PARA COMPARTIR EN REDES SOCIALES ---
@app.route('/zapato/<int:id>')
def detalle_zapato(id):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        SELECT z.id, z.nombre, z.imagen,
               GROUP_CONCAT(DISTINCT m.nombre) AS marcas
        FROM productos z
        LEFT JOIN producto_marca zm ON z.id = zm.zapato_id
        LEFT JOIN marcas m ON zm.marca_id = m.id
        WHERE z.id = ?
        GROUP BY z.id
    """, (id,))
    zapato = cursor.fetchone()
    conexion.close()

    return render_template('compartir_zapato.html', zapato=zapato)


if __name__ == '__main__':
    app.run(debug=True)