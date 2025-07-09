# Tool Mapping Strategy: EighthsCalculatorAgent → Google ADK

## Overview
This document outlines the mapping strategy for converting the custom EighthsCalculatorAgent to use Google ADK's built-in tools and architecture.

## Tool Mapping Table

| Current Method | ADK Tool Function | Description | Parameters |
|----------------|-------------------|-------------|------------|
| `calculate_eighths()` | `calculate_scene_eighths_tool` | Main calculation function | scene_data: Dict |
| `_calculate_scene_eighths()` | `calculate_single_scene_tool` | Calculate eighths for one scene | page_count: float, scene: Dict |
| `_determine_complexity_factor()` | `determine_complexity_tool` | Calculate complexity multiplier | scene: Dict |
| `generate_eighths_report()` | `generate_report_tool` | Format results into report | eighths_data: Dict |

## ADK Architecture Design

### 1. Tool Functions (Declarative)
Each method will be converted to a declarative tool function with:
- Proper type annotations using Pydantic models
- Clear descriptions for LLM understanding
- Return type schemas

### 2. Agent Configuration
```python
from google.genai.extensions import ToolFunction
from google.adk.agents import Agent

agent = Agent(
    name="eighths_calculator_agent",
    model="gemini-2.0-flash",
    tools=[
        calculate_scene_eighths_tool,
        calculate_single_scene_tool,
        determine_complexity_tool,
        generate_report_tool
    ],
    instruction=EIGHTHS_CALCULATOR_INSTRUCTION
)
```

### 3. Industry Standards Constants
All constants will be maintained in a configuration dictionary:
```python
INDUSTRY_STANDARDS = {
    "words_per_page": 250,
    "eighths_per_page": 8,
    "minutes_per_eighth": 9,
    "hours_per_eighth": 0.15,
    "standard_shoot_day_eighths": 60,
    "base_crew_hours": 12,
    "setup_time_percentage": 0.3,
    "wrap_time_percentage": 0.2,
    "minimum_scene_size": 0.125
}
```

### 4. Complexity Factors
```python
COMPLEXITY_FACTORS = {
    "base_factor": 1.0,
    "technical_cue_factor": 0.1,
    "exterior_factor": 0.2,
    "night_factor": 0.3,
    "dusk_dawn_factor": 0.2,
    "character_threshold": 3,
    "character_factor": 0.1,
    "dialogue_threshold": 10,
    "dialogue_factor": 0.1,
    "max_complexity": 3.0
}
```

## Implementation Strategy

### Phase 1: Tool Function Creation
1. Create Pydantic models for input/output schemas
2. Implement each tool function with proper decorators
3. Maintain exact calculation logic from original

### Phase 2: Agent Assembly
1. Create main agent with all tools registered
2. Set up proper instructions for the agent
3. Configure model settings (gemini-2.0-flash)

### Phase 3: Testing Framework
1. Create test script for PDF processing
2. Implement logging for each calculation step
3. Generate comparison reports (original vs ADK)

### Phase 4: Storage Integration
1. Implement page-by-page eighth storage
2. Add metadata for each calculation
3. Enable retrieval and aggregation

## Benefits of ADK Implementation

1. **Declarative Tools**: Clear separation of tool logic
2. **Type Safety**: Pydantic models ensure data validation
3. **LLM Integration**: Agent can reason about tool usage
4. **Scalability**: Easy to add new calculation methods
5. **Maintainability**: Standardized tool architecture

## Migration Path

1. Keep original agent as reference
2. Implement ADK version in parallel
3. Run comparison tests
4. Switch to ADK version after validation
5. Deprecate original implementation