import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import Task from './Task';

export default function Column({ column, tasks, addTask, deleteTask, updateTask }) {
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleAdd = () => {
    if (!inputValue.trim()) return;
    addTask(column.id, inputValue);
    setInputValue('');
    setShowInput(false); 
  };

  return (
    <div className="column-container">
      <h3 className="column-title">{column.title}</h3>
      
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            className={`task-list ${snapshot.isDraggingOver ? 'task-list-dragging-over' : ''}`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {tasks.map((task, index) => (
              <Task 
                key={task.id} 
                task={task} 
                index={index}
                columnId={column.id} 
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className="add-task-container">
        {!showInput ? (
          <button className="btn-add-initial" onClick={() => setShowInput(true)}>
            + Añadir una tarjeta
          </button>
        ) : (
          <div className="add-task-form">
            <input
              autoFocus
              type="text"
              placeholder="Introduzca un título..."
              className="input-task"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <div className="add-task-controls">
              <button className="btn-add-confirm" onClick={handleAdd}>Añadir tarjeta</button>
              <button className="btn-add-cancel" onClick={() => setShowInput(false)}>✕</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}