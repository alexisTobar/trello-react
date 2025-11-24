import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';

export default function Task({ task, index, columnId, deleteTask, updateTask }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(task.content);

  const handleSave = () => {
    if (editContent.trim()) {
      updateTask(task.id, editContent);
    } else {
      setEditContent(task.content); 
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          className={`task-container ${snapshot.isDragging ? 'task-dragging' : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={provided.draggableProps.style}
        >
          {isEditing ? (
            <input
              autoFocus
              className="task-edit-input"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onBlur={handleSave} 
              onKeyDown={handleKeyDown}
            />
          ) : (
            <div className="task-content-wrapper">
              <span className="task-text">{task.content}</span>
              <div className="task-actions">
                <button 
                  className="btn-action" 
                  onClick={() => setIsEditing(true)}
                  title="Editar">
                  ✎
                </button>
                <button 
                  className="btn-action btn-delete" 
                  onClick={() => deleteTask(task.id, columnId)}
                  title="Eliminar">
                  🗑️
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}