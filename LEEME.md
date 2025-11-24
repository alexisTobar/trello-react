# ⚛️ Proyecto Trello-Clone (React)

Aplicación de gestión de tareas de alto rendimiento que replica la experiencia de usuario de Trello.

## 🛠️ Stack Tecnológico & Instalación

### 1. Vite (`npm create vite@latest`)
Utilizamos Vite en lugar de Create-React-App porque es **exponencialmente más rápido**. Vite usa módulos ES nativos del navegador durante el desarrollo, lo que hace que el servidor arranque en milisegundos.

### 2. @hello-pangea/dnd
Es la librería encargada de la física del "Drag and Drop".
* **¿Por qué esta?** Es el fork mantenido de `react-beautiful-dnd`.
* **Virtualización:** Permite animaciones de 60fps.
* **Accesibilidad:** Es la única librería que permite arrastrar tareas usando solo el **teclado** (vital para estándares web profesionales).

### 3. UUID (`npm install uuid`)
React necesita que cada elemento de una lista tenga una `key` única. Si usamos índices (0, 1, 2) y movemos las tareas, React se confunde y falla el renderizado. `uuid` genera IDs como `9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d` para garantizar unicidad total.

### 4. Estructura de Datos Normalizada
En lugar de tener Arrays anidados (arrays dentro de arrays), usamos Objetos (Hash Maps).
* **Beneficio:** Buscar una tarea por ID es instantáneo `data.tasks['task-1']` (Complejidad O(1)). Si usáramos arrays, tendríamos que recorrerlos todos para encontrar una tarea (Complejidad O(n)), lo cual haría lenta la app con muchas tareas.

## 🧩 Arquitectura de Componentes (React + DnD)

La implementación sigue el patrón estricto de `@hello-pangea/dnd`:

### 1. DragDropContext (En App.jsx)
Es el componente raíz.
* **Función:** Gestiona el estado global del arrastre.
* **Prop Clave:** `onDragEnd`. Es obligatorio. Define qué hacer con los datos cuando el usuario suelta el mouse. Sin esto, visualmente el elemento vuelve a su origen.

### 2. Droppable (En Column.jsx)
Define una zona de aterrizaje.
* **Render Props:** Usa el patrón "Function as Child". Nos da un objeto `provided`.
* **provided.innerRef:** Conecta el DOM real con la librería para medir posiciones.
* **provided.placeholder:** Elemento invisible que ocupa el espacio del ítem que estamos moviendo para evitar colapsos visuales del layout.

### 3. Draggable (En Task.jsx)
El elemento movible.
* **dragHandleProps:** Define qué parte del elemento sirve para agarrar. Si se lo aplicamos a todo el div, todo el div es agarrable. Podríamos aplicarlo solo a un icono si quisiéramos.
* **snapshot.isDragging:** Nos permite saber si ese elemento está volando en ese instante para cambiar su estilo (ej. cambiar color o sombra).

## 🧠 Lógica de Estado y Persistencia

### Manejo de Estado Inmutable
En React, nunca modificamos el estado directamente (`data.columns = ...` ❌).
En su lugar, seguimos el patrón de:
1.  **Copiar:** Crear copias superficiales de los arrays (`Array.from`).
2.  **Modificar:** Aplicar los cambios (`splice`) sobre la copia.
3.  **Sobrescribir:** Usar `setData` para reemplazar el objeto antiguo con el nuevo.

### Algoritmo de Reordenamiento
Usamos el método `Array.prototype.splice()` para mover los IDs de las tareas.
* **Mismo contenedor:** Se remueve del índice origen y se inserta en el índice destino del mismo array.
* **Distinto contenedor:** Se remueve del array origen y se inserta en el array destino. Esto actualiza dos columnas simultáneamente en un solo ciclo de renderizado.

### Persistencia (LocalStorage + Hooks)
Utilizamos una combinación de `useState` (con inicialización perezosa) y `useEffect` para sincronizar datos:
* **Inicialización:** `useState(() => ...)` verifica si existe 'trello-state' en el navegador antes de cargar los datos por defecto.
* **Sincronización:** `useEffect` escucha cualquier cambio en `data` y actualiza automáticamente el LocalStorage. Esto garantiza que el usuario nunca pierda su progreso.