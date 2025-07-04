# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with Vite on port 8080
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build

### Code Quality
- `npm run lint` - Run ESLint
- `npm run format` - Format code automatically

### UI Components
- `npx shadcn@latest add [component-name]` - Install Shadcn UI components

## Architecture

Think AI is a React-based film pre-production platform that provides AI-powered tools for script analysis, character breakdown, scheduling, budgeting, and storyboarding. The application follows a tabbed workflow where users progress through different stages of film pre-production.

### Core Technology Stack
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite with SWC plugin
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API with localStorage persistence
- **HTTP Client**: Fetch API with custom wrapper
- **Routing**: React Router DOM

### Application Flow
The app follows a sequential workflow managed by `ScriptDataContext`:

1. **Script Upload** - Users upload script files or paste text
2. **Script Analysis** - AI analyzes script structure and metadata
3. **One-Liner Generation** - Creates scene summaries
4. **Character Breakdown** - Analyzes character objectives and relationships
5. **Schedule Planning** - Generates shooting schedules
6. **Budget Creation** - Calculates production costs
7. **Storyboard Generation** - Creates visual storyboards
8. **Project Overview** - Final project summary

### Key Components

#### Context System
- `ScriptDataContext` - Central state management for all script-related data
- Automatic localStorage persistence for offline access
- Cross-tab synchronization via storage events
- Validation checks to prevent accessing features without prerequisites

#### Data Flow Pattern
```typescript
// Data flows through context with automatic persistence
const { scriptData, updateScriptData } = useScriptData();
updateScriptData(newData); // Automatically saves to localStorage
```

#### API Integration
- External API at `https://varun324242-sjuu.hf.space`
- Automatic fallback to localStorage on API failure
- Centralized error handling with toast notifications
- Type-safe interfaces for all API responses

### Component Structure

#### Main Layout
- `AppHeader` - Navigation and branding
- `MainSidebar` - Tab navigation with progress tracking
- `TabContent/` - Individual feature components

#### Tab Components
- `UploadScriptTab` - File upload and text input
- `ScriptAnalysisTab` - Display parsed script data
- `OneLinerTab` - Scene summaries
- `CharacterBreakdownTab` - Character analysis
- `ScheduleTab` - Production scheduling
- `BudgetTab` - Cost estimation
- `StoryboardTab` - Visual storyboard generation
- `ProjectOverviewTab` - Final project summary

### Data Persistence Strategy
- **Primary**: localStorage for client-side persistence
- **Secondary**: External API for processing
- **Synchronization**: Storage events for cross-tab updates
- **Validation**: Context-level data dependency checking

### Error Handling
- Toast notifications for user feedback
- Automatic fallback to cached data
- Graceful degradation when API unavailable
- Console logging for debugging

### Type Safety
- Comprehensive TypeScript interfaces for all data structures
- Type-safe API service layer
- Strict typing for component props and state

### Development Patterns
- Custom hooks for data access (`useScriptData`)
- Centralized storage keys in `STORAGE_KEYS`
- Consistent error handling across API calls
- Automatic data validation for workflow progression

### Performance Considerations
- Vite for fast development builds
- SWC for optimized compilation
- Lazy loading for large datasets
- Efficient re-renders with React context

### Build Configuration
- Path aliases configured (`@/` maps to `src/`)
- ESLint with React and TypeScript rules
- Unused variable warnings disabled for development
- Development server on port 8080

### Key Files
- `src/contexts/ScriptDataContext.tsx` - Central state management
- `src/services/scriptApiService.ts` - API integration layer
- `src/components/TabContent/` - Feature implementations
- `vite.config.ts` - Build configuration
- `components.json` - shadcn/ui configuration