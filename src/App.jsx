import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

function App() {
  // Load tasks from localStorage on initial render
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [newTask, setNewTask] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [lastConfetti, setLastConfetti] = useState(null);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Auto-clear tasks every Sunday at 12:00 AM
  useEffect(() => {
    const checkAndClearTasks = () => {
      const now = new Date();
      const day = now.getDay(); // 0 = Sunday
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // Check if it's Sunday at 12:00 AM (00:00)
      if (day === 0 && hours === 0 && minutes === 0) {
        setTasks([]);
        localStorage.setItem('tasks', JSON.stringify([]));
      }
    };

    // Check immediately on mount
    checkAndClearTasks();

    // Check every minute
    const interval = setInterval(checkAndClearTasks, 60000);

    return () => clearInterval(interval);
  }, []);

  // Check if current time is Friday 12:00 AM or later (48h to Sunday deadline)
  const isDeadlineApproaching = () => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
    const hours = now.getHours();

    // Friday 00:00 or later, Saturday any time
    return (day === 5 && hours >= 0) || day === 6;
  };

  // Calculate completion percentage
  const completionPercentage = tasks.length === 0 
    ? 0 
    : Math.round((tasks.filter(task => task.completed).length / tasks.length) * 100);

  // Trigger confetti at 100% (only once per completion)
  useEffect(() => {
    if (completionPercentage === 100 && tasks.length > 0) {
      const currentTasksId = tasks.map(t => t.id).join(',');
      if (lastConfetti !== currentTasksId) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        setLastConfetti(currentTasksId);
      }
    } else if (completionPercentage < 100) {
      setLastConfetti(null);
    }
    // lastConfetti is intentionally excluded from deps to avoid infinite loop
    // We only want to trigger when completionPercentage or tasks change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completionPercentage, tasks]);

  // Add new task
  const addTask = (e) => {
    e.preventDefault();
    if (newTask.trim() === '') return;

    const task = {
      id: Date.now(),
      text: newTask,
      completed: false,
      createdAt: new Date().toISOString()
    };

    setTasks([...tasks, task]);
    setNewTask('');
  };

  // Toggle task completion
  const toggleTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // Delete task
  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Start editing task
  const startEdit = (task) => {
    setEditingId(task.id);
    setEditingText(task.text);
  };

  // Save edited task
  const saveEdit = () => {
    if (editingText.trim() === '') return;
    setTasks(tasks.map(task =>
      task.id === editingId ? { ...task, text: editingText } : task
    ));
    setEditingId(null);
    setEditingText('');
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const urgentMode = isDeadlineApproaching();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-800">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
          initial={{ width: 0 }}
          animate={{ width: `${completionPercentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Weekly Task Tracker
          </h1>
          <p className="text-gray-400">
            Tasks reset every Sunday at 12:00 AM
          </p>
          <div className="mt-4">
            <span className="text-2xl font-bold text-blue-400">
              {completionPercentage}% Complete
            </span>
            {urgentMode && (
              <motion.span
                className="ml-4 text-red-500 font-semibold"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ⚠️ Deadline Approaching!
              </motion.span>
            )}
          </div>
        </motion.div>

        {/* Add Task Form */}
        <motion.form
          onSubmit={addTask}
          className="mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Add Task
            </motion.button>
          </div>
        </motion.form>

        {/* Tasks List */}
        <AnimatePresence>
          {tasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-gray-500 py-12"
            >
              <p className="text-xl">No tasks yet. Add one to get started!</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    rotate: urgentMode && !task.completed ? [0, -1, 1, -1, 0] : 0,
                  }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{
                    rotate: {
                      duration: 0.5,
                      repeat: urgentMode && !task.completed ? Infinity : 0,
                      repeatDelay: 0.5,
                    },
                  }}
                  className={`p-4 rounded-lg border ${
                    urgentMode && !task.completed
                      ? 'bg-red-900/20 border-red-500/50'
                      : task.completed
                      ? 'bg-green-900/20 border-green-500/50'
                      : 'bg-gray-800 border-gray-700'
                  } transition-all`}
                >
                  <div className="flex items-center gap-3">
                    {/* Checkbox */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleTask(task.id)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        task.completed
                          ? 'bg-green-500 border-green-500'
                          : urgentMode
                          ? 'border-red-500'
                          : 'border-gray-600'
                      }`}
                    >
                      {task.completed && (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </motion.svg>
                      )}
                    </motion.button>

                    {/* Task Text */}
                    {editingId === task.id ? (
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit();
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        className="flex-1 px-3 py-1 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                        autoFocus
                      />
                    ) : (
                      <span
                        className={`flex-1 ${
                          task.completed ? 'line-through text-gray-500' : ''
                        } ${urgentMode && !task.completed ? 'text-red-400 font-semibold' : ''}`}
                      >
                        {task.text}
                      </span>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {editingId === task.id ? (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={saveEdit}
                            className="px-3 py-1 bg-green-600 rounded hover:bg-green-700 text-sm font-semibold"
                          >
                            Save
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={cancelEdit}
                            className="px-3 py-1 bg-gray-600 rounded hover:bg-gray-700 text-sm font-semibold"
                          >
                            Cancel
                          </motion.button>
                        </>
                      ) : (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => startEdit(task)}
                            className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 text-sm font-semibold"
                          >
                            Edit
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => deleteTask(task.id)}
                            className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 text-sm font-semibold"
                          >
                            Delete
                          </motion.button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Footer Stats */}
        {tasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-center text-gray-400"
          >
            <p>
              {tasks.filter(t => t.completed).length} of {tasks.length} tasks completed
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default App;
