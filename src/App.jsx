import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import initialData from './initial-data';
import Column from './Column';
import { DragDropContext } from '@hello-pangea/dnd';
import './App.css';

export default function App() {
  // LocalStorage
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem('trello-state');
    return savedData ? JSON.parse(savedData) : initialData;
  });

  // Guardar 
  useEffect(() => {
    localStorage.setItem('trello-state', JSON.stringify(data));
  }, [data]);

  // CREAR 
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

  // BORRAR 
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

  // EDITAR
  const updateTask = (taskId, newContent) => {
    const newTasks = {
      ...data.tasks,
      [taskId]: { ...data.tasks[taskId], content: newContent },
    };
    setData({ ...data, tasks: newTasks });
  };

  // DRAG & DROP 
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

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <header className="app-header">
        <span className="app-logo">📊 Trello Clone React</span>
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
