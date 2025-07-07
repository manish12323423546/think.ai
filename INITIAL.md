# INITIAL.md - Feature Requirements Document (FRD)

## FEATURE
**Script Integration Agent System with Admin Dashboard Tabs**

Create a comprehensive script integration agent system that processes scripts through multiple AI agents and displays results in separate tabs within the admin dashboard script section. The system should leverage existing SD1 backend infrastructure while providing a modern frontend interface for real-time monitoring and result visualization.

### Core Requirements:
1. **Multi-Agent Processing Pipeline**: Coordinate script processing through 5 specialized agents (Script Parser, Eighths Calculator, Breakdown Specialist, Department Coordinator, Production Analyzer)
2. **Real-time Frontend Integration**: Display agent outputs in separate tabs within the admin script analysis page
3. **Status Monitoring**: Show processing status, progress, and agent-specific results
4. **Error Handling**: Graceful error handling with retry mechanisms and fallback states
5. **Data Persistence**: Store results in both SD1 backend and Think AI database for cross-system compatibility

## INTEGRATION WITH EXISTING

### Backend Integration (SD1 System)
- **Existing Coordinator**: `/sd1/src/script_ingestion/coordinator.py` - ScriptIngestionCoordinator with 5-agent pipeline
- **Agent Architecture**: Pre-built agents in `/sd1/src/script_ingestion/agents/` directory
- **API Endpoints**: `/app/api/sd1/[...path]/route.ts` - FastAPI proxy for SD1 backend
- **Data Storage**: SD1 stores results in `/sd1/data/scripts/` with timestamped JSON files

### Frontend Integration (Think AI System)
- **Admin Dashboard**: `/app/(authenticated)/dashboard/(pages)/admin/script-analysis/page.tsx` - Existing tabbed interface
- **Role-Based Access**: Admin-only access through RoleGate component
- **Context Management**: `/lib/contexts/script-data-context.tsx` - Script data state management
- **Storage Service**: `/services/storageService.ts` - Data persistence layer

### Database Integration
- **Think AI Database**: PostgreSQL via Supabase with Drizzle ORM
- **SD1 Storage**: File-based JSON storage with metadata tracking
- **Synchronization**: Bi-directional sync between systems for data consistency

## EXAMPLES FROM EXISTING CODE

### SD1 Agent Coordinator Pattern
```python
# /sd1/src/script_ingestion/coordinator.py
class ScriptIngestionCoordinator:
    def __init__(self):
        self.script_parser = ScriptParserAgent()
        self.eighths_calculator = EighthsCalculatorAgent()
        self.breakdown_specialist = BreakdownSpecialistAgent()
        self.department_coordinator = DepartmentCoordinatorAgent()
        self.production_analyzer = ProductionAnalyzerAgent()
```

### Think AI Tab Structure
```typescript
// /app/(authenticated)/dashboard/(pages)/admin/script-analysis/page.tsx
<Tabs defaultValue="parser" className="w-full">
  <TabsList className="grid w-full grid-cols-8">
    <TabsTrigger value="parser">Parser Results</TabsTrigger>
    <TabsTrigger value="eighths">Eighths Analysis</TabsTrigger>
    <TabsTrigger value="breakdown">Scene Breakdown</TabsTrigger>
    <TabsTrigger value="departments">Dept Planning</TabsTrigger>
    <TabsTrigger value="production">Production Analysis</TabsTrigger>
  </TabsList>
</Tabs>
```

### API Integration Pattern
```typescript
// /app/api/sd1/[...path]/route.ts
const API_URL = 'http://localhost:8000/api'
export async function POST(request: Request) {
  const response = await fetch(`${API_URL}/script/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return Response.json(await response.json())
}
```

## EXISTING DEPENDENCIES TO USE

### Backend Dependencies (SD1)
- **Google Gen AI SDK**: Gemini 2.5 Flash for all AI agents
- **FastAPI**: Web framework for API endpoints
- **Python**: Core language with async support
- **Pydantic**: Data validation and serialization

### Frontend Dependencies (Think AI)
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type safety throughout
- **Tailwind CSS**: Utility-first styling
- **Shadcn/ui**: Component library (Card, Tabs, Badge, Button, Progress)
- **Lucide React**: Icon library
- **Sonner**: Toast notifications

### Database Dependencies
- **Supabase**: PostgreSQL database hosting
- **Drizzle ORM**: Type-safe database queries
- **PostgreSQL**: Primary database engine

### Authentication & Authorization
- **Clerk**: User authentication and management
- **Role-Based Access Control**: Admin-only access patterns

## OTHER CONSIDERATIONS

### Performance Optimization
- **Async Processing**: All agent operations run asynchronously
- **Caching Strategy**: Cache results in both localStorage and database
- **Progressive Loading**: Show results as each agent completes
- **Error Recovery**: Graceful degradation if individual agents fail

### Security Considerations
- **API Rate Limiting**: Prevent abuse of AI agent endpoints
- **Input Validation**: Sanitize script content before processing
- **Role Verification**: Ensure only admin users can access agent features
- **Data Encryption**: Secure sensitive script content during transmission

### Scalability Planning
- **Queue System**: Handle multiple concurrent script processing requests
- **Resource Management**: Monitor AI API usage and costs
- **Database Optimization**: Efficient indexing for script metadata queries
- **CDN Integration**: Serve static assets efficiently

### User Experience Enhancements
- **Real-time Updates**: WebSocket connections for live agent progress
- **Offline Support**: Cache results for offline viewing
- **Export Capabilities**: PDF/CSV export of analysis results
- **Collaboration Features**: Share analysis results with team members

### Monitoring & Analytics
- **Agent Performance**: Track success rates and processing times
- **Error Logging**: Comprehensive error tracking and reporting
- **Usage Metrics**: Monitor feature adoption and user engagement
- **Cost Tracking**: Monitor AI API usage and associated costs

### Technical Debt Considerations
- **Code Duplication**: Minimize duplicate logic between SD1 and Think AI
- **Data Model Alignment**: Ensure consistent data structures across systems
- **API Versioning**: Plan for future API changes and backwards compatibility
- **Testing Strategy**: Comprehensive unit and integration tests

### Integration Challenges
- **Cross-System Communication**: Reliable communication between SD1 and Think AI
- **Data Synchronization**: Ensure data consistency across systems
- **Environment Management**: Handle different development/production environments
- **Dependency Management**: Keep both systems' dependencies in sync

This FRD provides a comprehensive foundation for implementing the script integration agent system while leveraging existing infrastructure and maintaining system coherence.