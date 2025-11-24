import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import initialData from './initial-data';
import Column from './Column';
import { DragDropContext } from '@hello-pangea/dnd';
import './App.css';

export default function App() {
  // --- 1. ESTADOS (HOOKS) SIEMPRE ARRIBA ---
  
  // Estado para el mensaje de Python
  const [mensajePython, setMensajePython] = useState("");

  // Estado principal de las tareas (con LocalStorage)
  const [data, setData] = useState(null);

  // --- 2. EFECTOS (HOOKS) DESPUÉS DE LOS ESTADOS ---

  // Efecto A: Conectar con Python (Solo al cargar la página)
  useEffect(() => {
    fetch('/api/tablero')
      .then(res => res.json())
      .then(datosServidor => {
        console.log("Datos recibidos desde pythpom:", datosServidor);
        setData(datosServidor);
      })
      .catch(error => console.error("Error cargando el tablero:", error));
  }, []); // Array vacío = Ejecutar solo una vez

  // Efecto B: Guardar en LocalStorage (Cada vez que cambia 'data')
  useEffect(() => {
    // Solo guardamos si 'data' tiene algo (para evitar guardar null al inicio)
    if (data) {
      fetch('/api/tablero', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // Enviamos todo el objeto a Python
      })
      .then(res => res.json())
      .then(resp => console.log("Guardado en Python:", resp))
      .catch(err => console.error("Error guardando:", err));
    }
  }, [data]);


  // --- 3. FUNCIONES LÓGICAS (CRUD & DND) ---

  const addTask = (columnId, content) => {
    const newTaskId = uuidv4();
    const newTask = { id: newTaskId, content: content };
    
    const newTasks = { ...data.tasks, [newTaskId]: newTask };
    const column = data.columns[columnId];
    const newTaskIds = [...column.taskIds, newTaskId];
    
    const newColumn = { ...column, taskIds: newTaskIds };

    setData({
      ...data,
      tasks: newTasks,
      columns: { ...data.columns, [newColumn.id]: newColumn },
    });
  };

  const deleteTask = (taskId, columnId) => {
    const column = data.columns[columnId];
    const newTaskIds = column.taskIds.filter((id) => id !== taskId);
    
    const newColumn = { ...column, taskIds: newTaskIds };
    const newTasks = { ...data.tasks };
    delete newTasks[taskId];

    setData({
      ...data,
      tasks: newTasks,
      columns: { ...data.columns, [newColumn.id]: newColumn },
    });
  };

  const updateTask = (taskId, newContent) => {
    const newTasks = {
      ...data.tasks,
      [taskId]: { ...data.tasks[taskId], content: newContent },
    };
    setData({ ...data, tasks: newTasks });
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    const startColumn = data.columns[source.droppableId];
    const finishColumn = data.columns[destination.droppableId];

    if (startColumn === finishColumn) {
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = { ...startColumn, taskIds: newTaskIds };
      setData({
        ...data,
        columns: { ...data.columns, [newColumn.id]: newColumn },
      });
      return;
    }

    const startTaskIds = Array.from(startColumn.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = { ...startColumn, taskIds: startTaskIds };

    const finishTaskIds = Array.from(finishColumn.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = { ...finishColumn, taskIds: finishTaskIds };

    setData({
      ...data,
      columns: {
        ...data.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    });
  };

  if (!data) {
    return (
      <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>
        <h2>Pruebas con el servidos de python</h2>
      </div>
    );
  }
  // --- 4. RENDERIZADO (JSX) ---
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <header className="app-header">
        <span className="app-logo">📊 Trello Clone React</span>
        
        {/* Aquí mostramos el mensaje de Python */}
        <span style={{ marginLeft: '20px', fontSize: '12px', color: '#4ade80', fontWeight: 'bold' }}>
          {mensajePython ? `✅ ${mensajePython}` : "Python"}
        </span>
      </header>
      
      <div className="board-container">
        {data.columnOrder.map((columnId) => {
          const column = data.columns[columnId];
          const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);

          return (
            <Column
              key={column.id}
              column={column}
              tasks={tasks}
              addTask={addTask}
              deleteTask={deleteTask}
              updateTask={updateTask}
            />
          );
        })}
      </div>
    </DragDropContext>
  );
}
