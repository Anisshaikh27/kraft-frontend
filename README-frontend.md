# Weblify.AI Frontend

A modern React frontend for the AI-powered web application generator. Features a clean, VS Code-like interface with chat, code editor, and live preview capabilities.

## ✨ Features

- **💬 AI Chat Interface** - Natural language code generation
- **📝 Monaco Code Editor** - Full-featured code editor with syntax highlighting
- **👁️ Live Preview** - Real-time preview of generated React applications
- **📁 File Tree Explorer** - VS Code-style file management
- **🔄 Auto-save** - Automatic file saving with debounce
- **📱 Responsive Design** - Mobile-friendly interface
- **🎨 Modern UI** - Dark theme with Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Backend server running on `http://localhost:3001`

### Installation

1. **Navigate to frontend directory**:
   ```bash
   cd weblify-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm start
   ```

4. **Open in browser**:
   - Frontend: `http://localhost:3000`
   - Make sure backend is running on `http://localhost:3001`

## 🏗️ Project Structure

```
src/
├── components/
│   ├── chat/
│   │   ├── ChatPanel.js      # Main chat interface
│   │   └── ChatMessage.js    # Individual chat messages
│   ├── editor/
│   │   └── CodeEditor.js     # Monaco editor integration
│   ├── files/
│   │   └── FileTree.js       # File explorer component
│   ├── layout/
│   │   ├── MainLayout.js     # Main app layout
│   │   └── Sidebar.js        # Left sidebar with file tree
│   ├── preview/
│   │   └── PreviewPanel.js   # Live preview panel
│   └── ui/
│       ├── LoadingSpinner.js # Loading spinner component
│       └── ErrorMessage.js   # Error display component
├── context/
│   └── AppContext.js         # Global state management
├── pages/
│   ├── HomePage.js           # Landing page
│   └── ProjectPage.js        # Main project workspace
├── services/
│   └── apiClient.js          # Backend API communication
├── App.js                    # Main app component
├── index.js                  # Entry point
└── index.css                 # Global styles
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend root:

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:3001

# Other optional settings
REACT_APP_NAME=Weblify.AI
REACT_APP_VERSION=1.0.0
```

### API Connection

The frontend communicates with the backend through these endpoints:

- `POST /api/ai/generate` - Generate code from prompts
- `POST /api/projects` - Create new projects  
- `GET /api/projects/:id` - Load existing projects
- `POST /api/files/:projectId` - Create/update files
- `GET /api/files/:projectId` - Get project files

## 🎯 Key Features Explained

### Chat Interface
- **Natural Language Input**: Describe what you want to build
- **Example Prompts**: Quick-start suggestions
- **Message History**: Full conversation context
- **File Generation**: Direct integration with code editor

### Code Editor
- **Monaco Editor**: Same editor as VS Code
- **Syntax Highlighting**: Support for JS, JSX, CSS, HTML, JSON, etc.
- **Auto-save**: Changes saved automatically after 2 seconds
- **Keyboard Shortcuts**: Ctrl+S (save), Ctrl+D (download)
- **Multiple File Support**: Tab-based file switching

### Live Preview
- **Real-time Rendering**: Instant preview of React components
- **Responsive Testing**: Mobile, tablet, desktop viewports
- **Error Handling**: Shows compilation errors clearly
- **External Libraries**: Auto-includes React, Tailwind CSS, etc.

### File Management
- **Tree Structure**: Hierarchical file organization
- **File Icons**: Visual file type indicators
- **Click to Open**: Direct file navigation
- **Size Display**: File size information

## 🎨 UI/UX Design

### Color Scheme
```css
Background: #0f172a (Dark blue)
Secondary: #1e293b (Medium blue)
Tertiary: #334155 (Light blue)
Primary: #0ea5e9 (Bright blue)
Text: #e2e8f0 (Light gray)
```

### Typography
- **Font**: System font stack (-apple-system, BlinkMacSystemFont, etc.)
- **Code Font**: Monaco, Menlo, Ubuntu Mono
- **Sizes**: Responsive scale from 12px to 48px

### Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🔧 Development

### Available Scripts

```bash
# Development
npm start          # Start dev server (port 3000)
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App

# Code quality
npm run lint       # Run ESLint
npm run format     # Format with Prettier
```

### Adding New Components

1. **Create component file**:
   ```jsx
   // src/components/example/NewComponent.js
   import React from 'react';
   
   const NewComponent = ({ prop1, prop2 }) => {
     return (
       <div className="...">
         {/* Component content */}
       </div>
     );
   };
   
   export default NewComponent;
   ```

2. **Add to context if needed**:
   ```jsx
   // src/context/AppContext.js
   // Add new state and actions
   ```

3. **Import and use**:
   ```jsx
   import NewComponent from '../components/example/NewComponent';
   ```

### State Management

The app uses React Context for state management:

- **AppContext**: Global state (projects, files, UI state)
- **useAppState()**: Access state values
- **useAppActions()**: Access action functions

Example usage:
```jsx
const { currentProject, files, activeTab } = useAppState();
const { createProject, updateFile, setActiveTab } = useAppActions();
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates a `build/` directory with optimized files.

### Deploy Options

1. **Static Hosting** (Vercel, Netlify, GitHub Pages)
2. **Docker Container**
3. **Traditional Web Server** (Apache, Nginx)

### Environment Setup

For production, update:
```env
REACT_APP_API_URL=https://your-backend-domain.com
```

## 🧪 Testing

### Running Tests

```bash
npm test                    # Interactive test runner
npm test -- --coverage     # With coverage report
npm test -- --watchAll     # Watch all files
```

### Test Structure

```
src/
├── __tests__/             # Global tests
├── components/
│   └── __tests__/         # Component tests
└── services/
    └── __tests__/         # Service tests
```

## 🐛 Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   ```
   Error: Network Error
   ```
   - Ensure backend is running on `http://localhost:3001`
   - Check CORS settings in backend
   - Verify `REACT_APP_API_URL` environment variable

2. **Monaco Editor Not Loading**
   ```
   Error: Cannot resolve '@monaco-editor/react'
   ```
   - Run `npm install @monaco-editor/react`
   - Clear npm cache: `npm cache clean --force`

3. **Build Fails**
   ```
   Error: Build failed with errors
   ```
   - Check for TypeScript errors
   - Verify all imports are correct
   - Run `npm run lint` to check for issues

4. **Preview Not Working**
   ```
   Preview shows "Error rendering component"
   ```
   - Check browser console for JavaScript errors
   - Ensure generated code is valid React
   - Verify all required dependencies are loaded

### Debug Mode

Enable detailed logging:
```jsx
// src/context/AppContext.js
const DEBUG = true; // Set to true for debugging
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- **ESLint**: Follow React/JSX best practices
- **Prettier**: Auto-format code
- **Component Structure**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for functions
- **CSS**: Use Tailwind classes, custom CSS in index.css

## 📝 License

This project is licensed under the MIT License.

---

**Built with ❤️ for developers who want to build React apps with AI assistance!**