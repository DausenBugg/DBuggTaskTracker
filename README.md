# DBuggTaskTracker

A modern, feature-rich weekly task tracker built with React, Tailwind CSS, Framer Motion, and Canvas-Confetti.

## Features

-  **Full CRUD Operations**: Create, Read, Update, and Delete tasks
-  **LocalStorage Persistence**: Tasks are automatically saved and persist across browser sessions
-  **Progress Bar**: Visual progress bar showing completion percentage
-  **Confetti Animation**: Celebration animation triggers at 100% completion
-  **Auto-Clear**: All tasks automatically clear every Sunday at 12:00 AM
-  **Deadline Warning**: 48-hour warning system
  - If current time is Friday 12:00 AM or later (48 hours before Sunday deadline)
  - Incomplete tasks shake and turn red
  - Warning message displayed
-  **Modern Dark UI**: Clean, professional dark mode interface
-  **Smooth Animations**: Beautiful animations powered by Framer Motion

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Canvas-Confetti** - Celebration effects
- **LocalStorage** - Client-side data persistence

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment to GitHub Pages

This app is configured to be deployed to GitHub Pages. To deploy:

```bash
# Deploy to GitHub Pages
npm run deploy
```

This will build the app and push it to the `gh-pages` branch. Make sure you have:
1. Set up GitHub Pages in your repository settings to use the `gh-pages` branch
2. The repository visibility allows GitHub Pages (public repos or GitHub Pro/Team/Enterprise for private repos)

The app will be available at: `https://DausenBugg.github.io/DBuggTaskTracker`

## Usage

1. **Add a Task**: Type in the input field and click "Add Task" or press Enter
2. **Complete a Task**: Click the checkbox next to a task to mark it as complete
3. **Edit a Task**: Click the "Edit" button, modify the text, then click "Save"
4. **Delete a Task**: Click the "Delete" button to remove a task
5. **Track Progress**: Watch the progress bar at the top update as you complete tasks
6. **Celebrate**: Complete all tasks to trigger a confetti animation!

## Key Implementation Details

### Auto-Clear Logic
Tasks automatically clear every Sunday at 12:00 AM. The app checks the current date and time every minute.

### Deadline Warning (Friday 12:00 AM onwards)
When Friday arrives at midnight, the app enters "urgent mode":
- Incomplete tasks display in red
- A shake animation loops on incomplete tasks
- A warning message appears at the top

### Progress Tracking
- Progress percentage is calculated as: `(completed tasks / total tasks) × 100`
- The progress bar animates smoothly when the percentage changes
- Stats are displayed at the bottom showing "X of Y tasks completed"

### Data Persistence
- All tasks are stored in the browser's LocalStorage
- Data persists across page refreshes and browser sessions
- Tasks are automatically loaded when the app starts

## Development

The app was built with modern React practices:
- Functional components with Hooks
- Proper state management
- Clean component structure
- Responsive design with Tailwind CSS
- Smooth animations with Framer Motion

## License

Open source - feel free to use and modify as needed.
