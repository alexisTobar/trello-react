
const initialData = {
  // Aquí viven todas las tareas, independientemente de la columna
  tasks: {
    'task-1': { id: 'task-1', content: 'Aprender React' },
    'task-2': { id: 'task-2', content: 'Ver la clase de Genesis' },
    'task-3': { id: 'task-3', content: 'Configurar Vite' },
    'task-4': { id: 'task-4', content: 'Comer algo rico' },
  },
  
  // Definen qué tareas tienen dentro y en qué orden
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'Por hacer 📌',
      taskIds: ['task-1', 'task-2', 'task-3', 'task-4'], 
    },
    'column-2': {
      id: 'column-2',
      title: 'En Progreso 🚧',
      taskIds: [],
    },
    'column-3': {
      id: 'column-3',
      title: 'Finalizado ✅',
      taskIds: [],
    },
  },
  
  // 3Para saber cuál pintar primero
  columnOrder: ['column-1', 'column-2', 'column-3'],
};

export default initialData;