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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Progress Bar */}
      <div className="w-full h-3 bg-gray-800/50 backdrop-blur-sm shadow-lg">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg"
          initial={{ width: 0 }}
          animate={{ width: `${completionPercentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold mb-3 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-2xl">
            Weekly Task Tracker
          </h1>
          <p className="text-gray-400 text-lg mb-6">
            Tasks reset every Sunday at 12:00 AM
          </p>
          <div className="inline-block bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl px-8 py-4 border border-blue-500/20 shadow-2xl">
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {completionPercentage}% Complete
            </span>
            {urgentMode && (
              <motion.span
                className="ml-4 text-red-400 font-semibold text-lg"
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
          className="mb-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex gap-3 bg-gray-800/50 backdrop-blur-xl p-2 rounded-2xl border border-gray-700/50 shadow-2xl">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 px-6 py-4 bg-transparent text-white placeholder-gray-500 focus:outline-none text-lg"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05, boxShadow: "0 20px 50px rgba(139, 92, 246, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl font-bold text-white shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
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
              className="text-center text-gray-400 py-20"
            >
              <div className="text-6xl mb-6">📝</div>
              <p className="text-2xl font-light">No tasks yet. Add one to get started!</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
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
                  className={`group p-5 rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
                    urgentMode && !task.completed
                      ? 'bg-red-500/10 border-red-500/50 shadow-lg shadow-red-500/20'
                      : task.completed
                      ? 'bg-green-500/10 border-green-500/50 shadow-lg shadow-green-500/20'
                      : 'bg-gray-800/50 border-gray-700/50 hover:border-purple-500/50 shadow-lg hover:shadow-purple-500/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Checkbox */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleTask(task.id)}
                      className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                        task.completed
                          ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-400 shadow-lg shadow-green-500/50'
                          : urgentMode
                          ? 'border-red-500 hover:border-red-400 hover:bg-red-500/10'
                          : 'border-gray-600 hover:border-purple-500 hover:bg-purple-500/10'
                      }`}
                    >
                      {task.completed && (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-5 h-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
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
                        className="flex-1 px-4 py-2 bg-gray-900/50 border border-purple-500/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                        autoFocus
                      />
                    ) : (
                      <span
                        className={`flex-1 text-lg transition-all ${
                          task.completed ? 'line-through text-gray-500' : 'text-white'
                        } ${urgentMode && !task.completed ? 'text-red-300 font-semibold' : ''}`}
                      >
                        {task.text}
                      </span>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                      {editingId === task.id ? (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={saveEdit}
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl hover:shadow-lg hover:shadow-green-500/50 text-sm font-bold transition-all"
                          >
                            Save
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={cancelEdit}
                            className="px-4 py-2 bg-gray-700 rounded-xl hover:bg-gray-600 hover:shadow-lg text-sm font-bold transition-all"
                          >
                            Cancel
                          </motion.button>
                        </>
                      ) : (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => startEdit(task)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-blue-500/50 text-sm font-bold transition-all"
                          >
                            Edit
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => deleteTask(task.id)}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl hover:shadow-lg hover:shadow-red-500/50 text-sm font-bold transition-all"
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
            className="mt-10 text-center"
          >
            <div className="inline-block bg-gray-800/30 backdrop-blur-xl rounded-2xl px-8 py-4 border border-gray-700/50 shadow-xl">
              <p className="text-gray-300 text-lg">
                <span className="font-bold text-purple-400">{tasks.filter(t => t.completed).length}</span>
                {' of '}
                <span className="font-bold text-blue-400">{tasks.length}</span>
                {' tasks completed'}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default App;
