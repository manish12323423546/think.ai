from typing import Dict, Any, Optional, List
import json
import os
import logging
from datetime import datetime
from .agents.script_parser_agent import ScriptParserAgent
from .agents.eighths_calculator_agent import EighthsCalculatorAgent
from .agents.breakdown_specialist_agent import BreakdownSpecialistAgent
from .agents.department_coordinator_agent import DepartmentCoordinatorAgent
from .agents.production_analyzer_agent import ProductionAnalyzerAgent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ScriptIngestionCoordinator:
    """
    🎬 Agent 1: Script Ingestion Coordinator (Main Orchestrator)
    
    Coordinates 5 specialized sub-agents:
    ├── 🎬 ScriptParserAgent (FOUNDATIONAL)
    ├── ✅ EighthsCalculatorAgent (INDUSTRY STANDARD)
    ├── ✅ BreakdownSpecialistAgent (AD WORKFLOW)
    ├── ✅ DepartmentCoordinatorAgent (CREW NEEDS)
    └── ✅ ProductionAnalyzerAgent (RISK ASSESSMENT)
    """
    
    def __init__(self):
        logger.info("Initializing ScriptIngestionCoordinator with 5 specialized agents")
        
        # Initialize all 5 specialized agents
        self.script_parser = ScriptParserAgent()
        self.eighths_calculator = EighthsCalculatorAgent()
        self.breakdown_specialist = BreakdownSpecialistAgent()
        self.department_coordinator = DepartmentCoordinatorAgent()
        self.production_analyzer = ProductionAnalyzerAgent()
        
        # Create necessary directories
        os.makedirs("data/scripts", exist_ok=True)
        os.makedirs("data/scripts/metadata", exist_ok=True)
        os.makedirs("data/scripts/validation", exist_ok=True)
        logger.info("Data directories ensured")
        logger.info("All 5 specialized agents initialized successfully")
    
    async def process_script(
        self,
        script_text: str,
        department_focus: Optional[list] = None,
        validation_level: str = "lenient"
    ) -> Dict[str, Any]:
        """
        Process a script through the complete 5-agent pipeline.
        
        Args:
            script_text: The input script text
            department_focus: Optional list of departments to focus analysis on
            validation_level: Validation strictness ('strict' or 'lenient')
            
        Returns:
            Dict containing processed results from all 5 agents
        """
        logger.info("Starting 5-agent script processing pipeline")
        processing_start = datetime.now()
        
        try:
            # Initialize processing status
            processing_status = {
                "started_at": processing_start.isoformat(),
                "current_stage": "script_parsing",
                "completed_stages": [],
                "errors": [],
                "warnings": [],
                "agents_used": ["ScriptParserAgent", "EighthsCalculatorAgent", 
                               "BreakdownSpecialistAgent", "DepartmentCoordinatorAgent", 
                               "ProductionAnalyzerAgent"]
            }
            
            # 🎬 STAGE 1: Script Parsing (FOUNDATIONAL)
            logger.info("🎬 Stage 1: Script Parsing with ScriptParserAgent")
            try:
                parsed_data = await self.script_parser.parse_script(script_text)
                if "error" in parsed_data:
                    raise ValueError(f"Script parsing failed: {parsed_data['error']}")
                
                processing_status["completed_stages"].append({
                    "stage": "script_parsing",
                    "agent": "ScriptParserAgent",
                    "completed_at": datetime.now().isoformat(),
                    "success": True
                })
                logger.info("✅ Script parsing completed successfully")
            except Exception as e:
                logger.error(f"❌ Error in script parsing stage: {str(e)}")
                processing_status["errors"].append({
                    "stage": "script_parsing",
                    "agent": "ScriptParserAgent",
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                })
                raise
            
            # 🎬 STAGE 2: Eighths Calculation (INDUSTRY STANDARD)
            logger.info("✅ Stage 2: Eighths Calculation with EighthsCalculatorAgent")
            processing_status["current_stage"] = "eighths_calculation"
            try:
                eighths_data = self.eighths_calculator.calculate_eighths(parsed_data)
                if "error" in eighths_data:
                    raise ValueError(f"Eighths calculation failed: {eighths_data['error']}")
                
                processing_status["completed_stages"].append({
                    "stage": "eighths_calculation",
                    "agent": "EighthsCalculatorAgent",
                    "completed_at": datetime.now().isoformat(),
                    "success": True
                })
                logger.info("✅ Eighths calculation completed successfully")
            except Exception as e:
                logger.error(f"❌ Error in eighths calculation stage: {str(e)}")
                processing_status["errors"].append({
                    "stage": "eighths_calculation",
                    "agent": "EighthsCalculatorAgent",
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                })
                if validation_level == "strict":
                    raise
                eighths_data = {"error": str(e)}
            
            # 🎬 STAGE 3: Scene Breakdown (AD WORKFLOW)
            logger.info("✅ Stage 3: Scene Breakdown with BreakdownSpecialistAgent")
            processing_status["current_stage"] = "scene_breakdown"
            try:
                breakdown_data = self.breakdown_specialist.analyze_scene_breakdown(parsed_data)
                if "error" in breakdown_data:
                    raise ValueError(f"Scene breakdown failed: {breakdown_data['error']}")
                
                processing_status["completed_stages"].append({
                    "stage": "scene_breakdown",
                    "agent": "BreakdownSpecialistAgent",
                    "completed_at": datetime.now().isoformat(),
                    "success": True
                })
                logger.info("✅ Scene breakdown completed successfully")
            except Exception as e:
                logger.error(f"❌ Error in scene breakdown stage: {str(e)}")
                processing_status["errors"].append({
                    "stage": "scene_breakdown",
                    "agent": "BreakdownSpecialistAgent",
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                })
                if validation_level == "strict":
                    raise
                breakdown_data = {"error": str(e)}
            
            # 🎬 STAGE 4: Department Coordination (CREW NEEDS)
            logger.info("✅ Stage 4: Department Coordination with DepartmentCoordinatorAgent")
            processing_status["current_stage"] = "department_coordination"
            try:
                department_data = self.department_coordinator.coordinate_departments(parsed_data)
                if "error" in department_data:
                    raise ValueError(f"Department coordination failed: {department_data['error']}")
                
                processing_status["completed_stages"].append({
                    "stage": "department_coordination",
                    "agent": "DepartmentCoordinatorAgent",
                    "completed_at": datetime.now().isoformat(),
                    "success": True
                })
                logger.info("✅ Department coordination completed successfully")
            except Exception as e:
                logger.error(f"❌ Error in department coordination stage: {str(e)}")
                processing_status["errors"].append({
                    "stage": "department_coordination",
                    "agent": "DepartmentCoordinatorAgent",
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                })
                if validation_level == "strict":
                    raise
                department_data = {"error": str(e)}
            
            # 🎬 STAGE 5: Production Analysis (RISK ASSESSMENT)
            logger.info("✅ Stage 5: Production Analysis with ProductionAnalyzerAgent")
            processing_status["current_stage"] = "production_analysis"
            try:
                # Combine all metadata for comprehensive analysis
                combined_metadata = {
                    "eighths_data": eighths_data,
                    "breakdown_data": breakdown_data,
                    "department_data": department_data
                }
                
                production_analysis = self.production_analyzer.analyze_production(
                    parsed_data, combined_metadata)
                if "error" in production_analysis:
                    raise ValueError(f"Production analysis failed: {production_analysis['error']}")
                
                processing_status["completed_stages"].append({
                    "stage": "production_analysis",
                    "agent": "ProductionAnalyzerAgent",
                    "completed_at": datetime.now().isoformat(),
                    "success": True
                })
                logger.info("✅ Production analysis completed successfully")
            except Exception as e:
                logger.error(f"❌ Error in production analysis stage: {str(e)}")
                processing_status["errors"].append({
                    "stage": "production_analysis",
                    "agent": "ProductionAnalyzerAgent",
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                })
                if validation_level == "strict":
                    raise
                production_analysis = {"error": str(e)}
            
            # 🎬 STAGE 6: Data Integration and Finalization
            logger.info("🎯 Stage 6: Integrating all agent outputs")
            processing_status["current_stage"] = "data_integration"
            
            # Create comprehensive result structure
            result = {
                "parsed_data": parsed_data,
                "metadata": self._integrate_metadata(
                    eighths_data, breakdown_data, department_data, production_analysis),
                "agent_outputs": {
                    "script_parser": parsed_data,
                    "eighths_calculator": eighths_data,
                    "breakdown_specialist": breakdown_data,
                    "department_coordinator": department_data,
                    "production_analyzer": production_analysis
                },
                "processing_status": processing_status,
                "statistics": self._generate_comprehensive_statistics(
                    parsed_data, eighths_data, breakdown_data, department_data, production_analysis),
                "ui_metadata": self._generate_ui_metadata(
                    parsed_data, eighths_data, breakdown_data, department_data, production_analysis)
            }
            
            # Add department-specific metadata if focus specified
            if department_focus:
                result["metadata"]["department_focus"] = {
                    dept: self._extract_department_metadata(parsed_data, department_data, dept)
                    for dept in department_focus
                }
            
            # Save results
            try:
                saved_paths = self._save_to_disk(result)
                result["saved_paths"] = saved_paths
            except Exception as e:
                logger.error(f"Error saving to disk: {str(e)}")
                processing_status["warnings"].append({
                    "type": "storage",
                    "message": "Failed to save results to disk",
                    "details": str(e)
                })
            
            # Mark processing as complete
            processing_status["current_stage"] = "completed"
            processing_status["completed_at"] = datetime.now().isoformat()
            processing_status["duration"] = str(datetime.now() - processing_start)
            
            logger.info("🎉 5-agent script processing completed successfully")
            return result
            
        except Exception as e:
            logger.error(f"❌ 5-agent script processing failed: {str(e)}", exc_info=True)
            if processing_status:
                processing_status["current_stage"] = "failed"
                processing_status["failed_at"] = datetime.now().isoformat()
                processing_status["final_error"] = str(e)
            
            return {
                "error": str(e),
                "status": "failed",
                "processing_status": processing_status
            }
    
    def _integrate_metadata(self, eighths_data: Dict[str, Any], 
                           breakdown_data: Dict[str, Any],
                           department_data: Dict[str, Any],
                           production_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Integrate metadata from all 5 agents into unified structure."""
        integrated_metadata = {
            "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "agent_integration": "5-agent specialized pipeline"
        }
        
        # Integrate eighths data
        if "eighths_breakdown" in eighths_data:
            integrated_metadata["eighths_breakdown"] = eighths_data["eighths_breakdown"]
            integrated_metadata["industry_standards"] = eighths_data.get("industry_standards", {})
        
        # Integrate breakdown data
        if "time_of_day_breakdown" in breakdown_data:
            integrated_metadata["time_of_day_breakdown"] = breakdown_data["time_of_day_breakdown"]
            integrated_metadata["scene_breakdown_cards"] = breakdown_data.get("scene_breakdown_cards", [])
            integrated_metadata["scheduling_analysis"] = breakdown_data.get("scheduling_analysis", {})
        
        # Integrate department data
        if "crew_requirements" in department_data:
            integrated_metadata["detailed_crew_requirements"] = department_data["crew_requirements"]
            integrated_metadata["department_analysis"] = {
                "camera": department_data.get("camera_department", {}),
                "sound": department_data.get("sound_department", {}),
                "art": department_data.get("art_department", {}),
                "costume": department_data.get("costume_department", {})
            }
            integrated_metadata["resource_sharing"] = department_data.get("resource_sharing", {})
        
        # Integrate production analysis
        if "complexity_analysis" in production_analysis:
            integrated_metadata["technical_complexity"] = production_analysis["complexity_analysis"]["scene_complexity_scores"]
            integrated_metadata["risk_assessment"] = production_analysis.get("risk_assessment", {})
            integrated_metadata["feasibility_assessment"] = production_analysis.get("feasibility_assessment", {})
            integrated_metadata["production_recommendations"] = production_analysis.get("recommendations", [])
        
        # Generate global requirements from all agents
        integrated_metadata["global_requirements"] = self._generate_global_requirements(
            breakdown_data, department_data)
        
        return integrated_metadata
    
    def _generate_global_requirements(self, breakdown_data: Dict[str, Any], 
                                    department_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate global requirements from agent outputs."""
        global_requirements = {
            "equipment": set(),
            "props": set(),
            "special_effects": set(),
            "crew_specialties": set()
        }
        
        # Extract from department data
        if "camera_department" in department_data:
            camera_dept = department_data["camera_department"]
            global_requirements["equipment"].update(camera_dept.get("equipment_needed", []))
            global_requirements["equipment"].update(camera_dept.get("special_rigs", []))
        
        if "sound_department" in department_data:
            sound_dept = department_data["sound_department"]
            global_requirements["equipment"].update(sound_dept.get("equipment_needed", []))
        
        if "art_department" in department_data:
            art_dept = department_data["art_department"]
            for category in art_dept.get("prop_categories", {}).values():
                global_requirements["props"].update(category if isinstance(category, list) else [])
        
        # Extract from breakdown data
        if "scene_breakdown_cards" in breakdown_data:
            for card in breakdown_data["scene_breakdown_cards"]:
                global_requirements["equipment"].update(card.get("special_equipment", []))
                if card.get("weather", {}).get("effects_needed"):
                    global_requirements["special_effects"].update(card["weather"]["effects_needed"])
        
        # Convert sets to lists for JSON serialization
        for key in global_requirements:
            global_requirements[key] = list(global_requirements[key])
        
        return global_requirements
    
    def _extract_department_metadata(self, parsed_data: Dict[str, Any],
                                   department_data: Dict[str, Any],
                                   department: str) -> Dict[str, Any]:
        """Extract department-specific metadata from parsed data and department analysis."""
        metadata = {
            "relevant_scenes": [],
            "requirements": set(),
            "technical_notes": [],
            "crew_needs": {},
            "equipment_list": []
        }
        
        # Extract from department coordinator output
        dept_lower = department.lower()
        if f"{dept_lower}_department" in department_data:
            dept_data = department_data[f"{dept_lower}_department"]
            
            if "scene_requirements" in dept_data:
                for scene_req in dept_data["scene_requirements"]:
                    metadata["relevant_scenes"].append(scene_req.get("scene"))
            
            if "equipment_needed" in dept_data:
                metadata["equipment_list"].extend(dept_data["equipment_needed"])
        
        # Extract from parsed scene data
        for scene in parsed_data.get("scenes", []):
            dept_notes = scene.get("department_notes", {}).get(department, [])
            if dept_notes:
                metadata["relevant_scenes"].append(scene.get("scene_number"))
                metadata["technical_notes"].extend(dept_notes)
            
            # Extract requirements from technical cues
            tech_cues = scene.get("technical_cues", [])
            for cue in tech_cues:
                if department.lower() in cue.lower():
                    metadata["requirements"].add(cue)
        
        # Convert set to list for JSON serialization
        metadata["requirements"] = list(metadata["requirements"])
        return metadata
    
    def _generate_comprehensive_statistics(self, parsed_data: Dict[str, Any],
                                         eighths_data: Dict[str, Any],
                                         breakdown_data: Dict[str, Any],
                                         department_data: Dict[str, Any],
                                         production_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive statistics from all agent outputs."""
        stats = {
            "agent_summary": {
                "total_agents": 5,
                "successful_agents": sum(1 for data in [eighths_data, breakdown_data, 
                                                      department_data, production_analysis] 
                                       if "error" not in data)
            }
        }
        
        # Basic scene statistics
        scenes = parsed_data.get("scenes", [])
        stats.update({
            "total_scenes": len(scenes),
            "total_characters": len(set(char for scene in scenes 
                                      for char in scene.get("main_characters", []))),
            "total_locations": len(set(scene.get("location", {}).get("place", "") 
                                     for scene in scenes))
        })
        
        # Eighths statistics
        if "eighths_breakdown" in eighths_data:
            stats["eighths_summary"] = {
                "total_eighths": eighths_data["eighths_breakdown"].get("total_script_eighths", 0),
                "estimated_days": eighths_data["eighths_breakdown"].get("estimated_total_shoot_days", 0)
            }
        
        # Complexity statistics
        if "complexity_analysis" in production_analysis:
            complexity = production_analysis["complexity_analysis"]
            stats["complexity_summary"] = {
                "average_complexity": complexity.get("average_complexity", 0),
                "high_complexity_scenes": len(complexity.get("high_complexity_scenes", []))
            }
        
        # Department statistics
        if "crew_requirements" in department_data:
            crew_reqs = department_data["crew_requirements"]
            total_crew = sum(req.get("total_crew", 0) for req in crew_reqs)
            stats["crew_summary"] = {
                "average_crew_size": round(total_crew / len(crew_reqs), 1) if crew_reqs else 0,
                "total_crew_hours": sum(req.get("total_hours", 0) for req in crew_reqs)
            }
        
        return stats
    
    def _generate_ui_metadata(self, parsed_data: Dict[str, Any],
                            eighths_data: Dict[str, Any],
                            breakdown_data: Dict[str, Any],
                            department_data: Dict[str, Any],
                            production_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate metadata specifically for UI rendering."""
        ui_metadata = {
            "agent_status": {
                "script_parser": "error" not in parsed_data,
                "eighths_calculator": "error" not in eighths_data,
                "breakdown_specialist": "error" not in breakdown_data,
                "department_coordinator": "error" not in department_data,
                "production_analyzer": "error" not in production_analysis
            },
            "visualization_data": {},
            "dashboard_summary": {}
        }
        
        # Scene complexity for visualization
        if "complexity_analysis" in production_analysis:
            complexity_scores = production_analysis["complexity_analysis"].get("scene_complexity_scores", [])
            ui_metadata["visualization_data"]["scene_complexity"] = {
                str(scene["scene"]): scene["complexity_score"] 
                for scene in complexity_scores if isinstance(scene, dict)
            }
        
        # Timeline data
        ui_metadata["timeline_data"] = parsed_data.get("timeline", {})
        
        # Color coding from breakdown specialist
        if "time_of_day_breakdown" in breakdown_data:
            ui_metadata["color_coding"] = {
                "time_colors": {
                    "DAY": "#FFD700",
                    "NIGHT": "#191970", 
                    "DUSK": "#483D8B",
                    "DAWN": "#FFA07A"
                }
            }
        
        # Dashboard summary
        scenes_count = len(parsed_data.get("scenes", []))
        ui_metadata["dashboard_summary"] = {
            "total_scenes": scenes_count,
            "agents_completed": sum(ui_metadata["agent_status"].values()),
            "processing_complete": all(ui_metadata["agent_status"].values())
        }
        
        return ui_metadata
    
    def _save_to_disk(self, data: Dict[str, Any]) -> Dict[str, str]:
        """Save processed data to disk in organized structure."""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            paths = {}
            
            # Save main data with agent outputs
            main_path = f"data/scripts/script_{timestamp}.json"
            with open(main_path, "w") as f:
                json.dump({
                    "parsed_data": data["parsed_data"],
                    "processing_status": data["processing_status"],
                    "statistics": data["statistics"],
                    "agent_outputs": data["agent_outputs"]
                }, f, indent=2)
            paths["main"] = main_path
            
            # Save integrated metadata
            metadata_path = f"data/scripts/metadata/metadata_{timestamp}.json"
            with open(metadata_path, "w") as f:
                json.dump({
                    "metadata": data["metadata"],
                    "ui_metadata": data["ui_metadata"]
                }, f, indent=2)
            paths["metadata"] = metadata_path
            
            # Save individual agent outputs
            agents_path = f"data/scripts/agents/agents_{timestamp}.json"
            os.makedirs("data/scripts/agents", exist_ok=True)
            with open(agents_path, "w") as f:
                json.dump(data["agent_outputs"], f, indent=2)
            paths["agents"] = agents_path
            
            logger.info(f"Data saved successfully to {len(paths)} files")
            return paths
            
        except Exception as e:
            logger.error(f"Failed to save data to disk: {str(e)}")
            raise