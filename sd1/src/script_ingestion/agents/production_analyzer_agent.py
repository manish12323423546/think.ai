from typing import Dict, Any, List
import json
import logging
from datetime import datetime
from ...base_config import AGENT_INSTRUCTIONS, get_model_config
from google import genai
from google.genai import types
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ProductionAnalyzerAgent:
    """
    ✅ ProductionAnalyzerAgent (RISK ASSESSMENT)
    
    Specialized agent for production analysis and risk assessment.
    Responsibilities:
    - Complexity scoring (1-10 scale)
    - Risk factors identification
    - Scheduling implications analysis
    - Safety considerations
    """
    
    def __init__(self):
        self.client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY"))
        self.model_config = get_model_config()
        self.instructions = """You are a Production Analyzer Agent for film production.
        Your expertise:
        1. Assess technical complexity and risk factors
        2. Score scenes on difficulty scale (1-10)
        3. Identify scheduling and budget implications
        4. Recommend risk mitigation strategies
        5. Validate production feasibility"""
        logger.info("ProductionAnalyzerAgent initialized")
    
    def analyze_production(self, scene_data: Dict[str, Any], 
                          metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Analyze production complexity and risks across all scenes."""
        logger.info("Starting production analysis")
        
        if not scene_data or not isinstance(scene_data, dict):
            logger.error("Invalid scene data received")
            return {"error": "Invalid scene data format"}
        
        scenes = scene_data.get('scenes', [])
        logger.info(f"Processing production analysis for {len(scenes)} scenes")
        
        # Core analysis components
        complexity_analysis = self._analyze_complexity(scenes)
        risk_assessment = self._assess_risks(scenes)
        scheduling_analysis = self._analyze_scheduling_implications(scenes)
        budget_implications = self._analyze_budget_implications(scenes, metadata)
        safety_analysis = self._analyze_safety_requirements(scenes)
        feasibility_report = self._assess_production_feasibility(scenes, metadata)
        
        result = {
            "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "complexity_analysis": complexity_analysis,
            "risk_assessment": risk_assessment,
            "scheduling_implications": scheduling_analysis,
            "budget_implications": budget_implications,
            "safety_requirements": safety_analysis,
            "feasibility_assessment": feasibility_report,
            "recommendations": self._generate_recommendations(scenes, complexity_analysis, risk_assessment)
        }
        
        logger.info(f"Generated production analysis for {len(scenes)} scenes")
        return result
    
    def _analyze_complexity(self, scenes: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze technical complexity for each scene."""
        complexity_analysis = {
            "scene_complexity_scores": [],
            "average_complexity": 0,
            "high_complexity_scenes": [],
            "complexity_distribution": {"1-3": 0, "4-6": 0, "7-8": 0, "9-10": 0},
            "complexity_factors": {
                "technical_requirements": 0,
                "cast_size": 0,
                "location_challenges": 0,
                "time_constraints": 0,
                "equipment_needs": 0
            }
        }
        
        total_complexity = 0
        
        for scene in scenes:
            scene_number = scene.get('scene_number', '0')
            complexity_score = self._calculate_scene_complexity(scene)
            
            scene_complexity = {
                "scene": scene_number,
                "complexity_score": complexity_score,
                "contributing_factors": self._identify_complexity_factors(scene),
                "risk_level": self._determine_risk_level(complexity_score),
                "estimated_setup_time": self._estimate_setup_time(complexity_score),
                "crew_multiplier": self._calculate_crew_multiplier(complexity_score)
            }
            
            complexity_analysis["scene_complexity_scores"].append(scene_complexity)
            total_complexity += complexity_score
            
            # Track high complexity scenes
            if complexity_score >= 7:
                complexity_analysis["high_complexity_scenes"].append({
                    "scene": scene_number,
                    "score": complexity_score,
                    "primary_challenges": scene_complexity["contributing_factors"][:3]
                })
            
            # Update distribution
            if complexity_score <= 3:
                complexity_analysis["complexity_distribution"]["1-3"] += 1
            elif complexity_score <= 6:
                complexity_analysis["complexity_distribution"]["4-6"] += 1
            elif complexity_score <= 8:
                complexity_analysis["complexity_distribution"]["7-8"] += 1
            else:
                complexity_analysis["complexity_distribution"]["9-10"] += 1
        
        complexity_analysis["average_complexity"] = round(total_complexity / len(scenes), 2)
        
        return complexity_analysis
    
    def _calculate_scene_complexity(self, scene: Dict[str, Any]) -> float:
        """Calculate complexity score (1-10) for a single scene."""
        base_score = 3.0  # Base complexity
        
        # Technical requirements factor
        technical_cues = scene.get('technical_cues', [])
        tech_complexity = min(len(technical_cues) * 0.5, 3.0)
        
        # Cast size factor
        characters = scene.get('main_characters', [])
        cast_complexity = min(len(characters) * 0.3, 2.0)
        
        # Dialogue complexity
        dialogues = scene.get('dialogues', [])
        dialogue_complexity = min(len(dialogues) * 0.1, 1.5)
        
        # Location complexity
        location = scene.get('location', {})
        location_complexity = 0
        if location.get('type') == 'EXT':
            location_complexity += 0.5  # Exterior adds complexity
        
        # Time of day complexity
        time_of_day = scene.get('time', '').upper()
        time_complexity = 0
        if 'NIGHT' in time_of_day:
            time_complexity += 1.0
        elif any(term in time_of_day for term in ['DUSK', 'DAWN']):
            time_complexity += 0.7
        
        # Special requirements
        description = scene.get('description', '').lower()
        special_complexity = 0
        special_keywords = ['stunt', 'explosion', 'fire', 'water', 'blood', 'fight', 'car chase']
        for keyword in special_keywords:
            if keyword in description:
                special_complexity += 0.8
        
        total_score = (base_score + tech_complexity + cast_complexity + 
                      dialogue_complexity + location_complexity + 
                      time_complexity + special_complexity)
        
        return min(round(total_score, 1), 10.0)
    
    def _identify_complexity_factors(self, scene: Dict[str, Any]) -> List[str]:
        """Identify specific factors contributing to scene complexity."""
        factors = []
        
        # Technical factors
        technical_cues = scene.get('technical_cues', [])
        if len(technical_cues) > 3:
            factors.append(f"High technical requirements ({len(technical_cues)} technical cues)")
        
        # Cast factors
        characters = scene.get('main_characters', [])
        if len(characters) > 4:
            factors.append(f"Large cast ({len(characters)} characters)")
        
        # Dialogue factors
        dialogues = scene.get('dialogues', [])
        if len(dialogues) > 15:
            factors.append(f"Dialogue-heavy scene ({len(dialogues)} dialogue blocks)")
        
        # Location factors
        location = scene.get('location', {})
        if location.get('type') == 'EXT':
            factors.append("Exterior location")
        
        # Time factors
        time_of_day = scene.get('time', '').upper()
        if 'NIGHT' in time_of_day:
            factors.append("Night shooting")
        elif any(term in time_of_day for term in ['DUSK', 'DAWN']):
            factors.append("Magic hour timing")
        
        # Special requirements
        description = scene.get('description', '').lower()
        if 'stunt' in description:
            factors.append("Stunt coordination required")
        if any(term in description for term in ['explosion', 'fire']):
            factors.append("Pyrotechnics/SFX")
        if 'water' in description:
            factors.append("Water work")
        
        return factors
    
    def _determine_risk_level(self, complexity_score: float) -> str:
        """Determine risk level based on complexity score."""
        if complexity_score <= 3:
            return "Low"
        elif complexity_score <= 6:
            return "Medium"
        elif complexity_score <= 8:
            return "High"
        else:
            return "Critical"
    
    def _estimate_setup_time(self, complexity_score: float) -> str:
        """Estimate setup time based on complexity."""
        base_minutes = 30
        additional_minutes = (complexity_score - 3) * 15
        total_minutes = max(base_minutes + additional_minutes, 15)
        
        hours = int(total_minutes // 60)
        minutes = int(total_minutes % 60)
        
        if hours > 0:
            return f"{hours}h {minutes}m"
        else:
            return f"{minutes}m"
    
    def _calculate_crew_multiplier(self, complexity_score: float) -> float:
        """Calculate crew size multiplier based on complexity."""
        base_multiplier = 1.0
        complexity_multiplier = (complexity_score - 3) * 0.1
        return round(max(base_multiplier + complexity_multiplier, 1.0), 2)
    
    def _assess_risks(self, scenes: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Assess production risks across all scenes."""
        risk_assessment = {
            "overall_risk_level": "Medium",
            "risk_categories": {
                "technical": [],
                "safety": [],
                "weather": [],
                "budget": [],
                "schedule": []
            },
            "high_risk_scenes": [],
            "mitigation_strategies": []
        }
        
        high_risk_count = 0
        total_scenes = len(scenes)
        
        for scene in scenes:
            scene_number = scene.get('scene_number', '0')
            complexity_score = self._calculate_scene_complexity(scene)
            scene_risks = self._identify_scene_risks(scene)
            
            if complexity_score >= 7 or scene_risks:
                high_risk_count += 1
                risk_assessment["high_risk_scenes"].append({
                    "scene": scene_number,
                    "complexity": complexity_score,
                    "risks": scene_risks
                })
            
            # Categorize risks
            for risk in scene_risks:
                risk_type = risk.get('category', 'technical')
                if risk_type in risk_assessment["risk_categories"]:
                    risk_assessment["risk_categories"][risk_type].append({
                        "scene": scene_number,
                        "description": risk.get('description', ''),
                        "severity": risk.get('severity', 'Medium')
                    })
        
        # Determine overall risk level
        risk_percentage = (high_risk_count / total_scenes) * 100
        if risk_percentage > 30:
            risk_assessment["overall_risk_level"] = "High"
        elif risk_percentage > 15:
            risk_assessment["overall_risk_level"] = "Medium"
        else:
            risk_assessment["overall_risk_level"] = "Low"
        
        # Generate mitigation strategies
        risk_assessment["mitigation_strategies"] = self._generate_mitigation_strategies(
            risk_assessment["risk_categories"])
        
        return risk_assessment
    
    def _identify_scene_risks(self, scene: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Identify specific risks for a scene."""
        risks = []
        description = scene.get('description', '').lower()
        location = scene.get('location', {})
        time_of_day = scene.get('time', '').upper()
        
        # Safety risks
        if 'stunt' in description:
            risks.append({
                "category": "safety",
                "description": "Stunt work requires safety coordinator",
                "severity": "High"
            })
        
        if any(term in description for term in ['fire', 'explosion']):
            risks.append({
                "category": "safety",
                "description": "Pyrotechnics require fire marshal",
                "severity": "High"
            })
        
        if 'water' in description:
            risks.append({
                "category": "safety",
                "description": "Water safety protocols required",
                "severity": "Medium"
            })
        
        # Weather risks
        if location.get('type') == 'EXT':
            risks.append({
                "category": "weather",
                "description": "Exterior location weather dependent",
                "severity": "Medium"
            })
        
        # Technical risks
        technical_cues = scene.get('technical_cues', [])
        if len(technical_cues) > 5:
            risks.append({
                "category": "technical",
                "description": "Complex technical requirements",
                "severity": "Medium"
            })
        
        # Schedule risks
        if 'NIGHT' in time_of_day:
            risks.append({
                "category": "schedule",
                "description": "Night shoot affects crew scheduling",
                "severity": "Medium"
            })
        
        return risks
    
    def _generate_mitigation_strategies(self, risk_categories: Dict[str, List]) -> List[Dict[str, Any]]:
        """Generate mitigation strategies for identified risks."""
        strategies = []
        
        if risk_categories["safety"]:
            strategies.append({
                "category": "Safety",
                "strategy": "Hire certified safety coordinator and conduct safety briefings",
                "priority": "High"
            })
        
        if risk_categories["weather"]:
            strategies.append({
                "category": "Weather",
                "strategy": "Develop weather contingency plans and backup indoor locations",
                "priority": "Medium"
            })
        
        if risk_categories["technical"]:
            strategies.append({
                "category": "Technical",
                "strategy": "Conduct equipment tests and have backup technical solutions",
                "priority": "Medium"
            })
        
        return strategies
    
    def _analyze_scheduling_implications(self, scenes: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze scheduling implications and constraints."""
        scheduling = {
            "total_estimated_days": 0,
            "night_scenes": 0,
            "day_scenes": 0,
            "location_changes": 0,
            "scheduling_challenges": [],
            "recommendations": []
        }
        
        locations = set()
        night_scenes = 0
        
        for scene in scenes:
            location = scene.get('location', {}).get('place', 'Unknown')
            locations.add(location)
            
            if 'NIGHT' in scene.get('time', '').upper():
                night_scenes += 1
        
        scheduling["location_changes"] = len(locations)
        scheduling["night_scenes"] = night_scenes
        scheduling["day_scenes"] = len(scenes) - night_scenes
        
        # Calculate shooting days estimate
        total_eighths = sum(max(int(len(scene.get('description', '').split()) / 250 * 8), 1) 
                           for scene in scenes)
        scheduling["total_estimated_days"] = round(total_eighths / 60, 1)
        
        # Identify challenges
        if night_scenes > len(scenes) * 0.4:
            scheduling["scheduling_challenges"].append(
                "High percentage of night scenes may cause crew fatigue")
        
        if len(locations) > 10:
            scheduling["scheduling_challenges"].append(
                "Multiple locations increase transportation and setup time")
        
        # Generate recommendations
        if scheduling["total_estimated_days"] > 15:
            scheduling["recommendations"].append(
                "Consider second unit for efficiency on longer schedules")
        
        return scheduling
    
    def _analyze_budget_implications(self, scenes: List[Dict[str, Any]], 
                                   metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Analyze budget implications based on production requirements."""
        budget_implications = {
            "cost_drivers": [],
            "estimated_multipliers": {},
            "budget_risks": [],
            "cost_optimization_opportunities": []
        }
        
        # Analyze cost drivers
        night_scenes = sum(1 for scene in scenes if 'NIGHT' in scene.get('time', '').upper())
        if night_scenes > 0:
            budget_implications["cost_drivers"].append({
                "factor": "Night Premium",
                "scenes_affected": night_scenes,
                "cost_impact": "10-15% labor cost increase"
            })
        
        # Special equipment costs
        special_equipment = set()
        for scene in scenes:
            for cue in scene.get('technical_cues', []):
                if 'steadicam' in cue.lower():
                    special_equipment.add('Steadicam')
                if 'crane' in cue.lower():
                    special_equipment.add('Camera crane')
        
        if special_equipment:
            budget_implications["cost_drivers"].append({
                "factor": "Special Equipment",
                "equipment": list(special_equipment),
                "cost_impact": "Additional rental and operator costs"
            })
        
        return budget_implications
    
    def _analyze_safety_requirements(self, scenes: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze safety requirements across all scenes."""
        safety_analysis = {
            "safety_critical_scenes": [],
            "required_safety_personnel": set(),
            "safety_equipment_needed": set(),
            "insurance_considerations": []
        }
        
        for scene in scenes:
            scene_number = scene.get('scene_number', '0')
            description = scene.get('description', '').lower()
            safety_issues = []
            
            # Identify safety concerns
            if 'stunt' in description:
                safety_issues.append("Stunt coordination")
                safety_analysis["required_safety_personnel"].add("Stunt coordinator")
            
            if any(term in description for term in ['fire', 'explosion']):
                safety_issues.append("Pyrotechnics")
                safety_analysis["required_safety_personnel"].add("Fire marshal")
                safety_analysis["safety_equipment_needed"].add("Fire extinguishers")
            
            if 'water' in description:
                safety_issues.append("Water safety")
                safety_analysis["required_safety_personnel"].add("Water safety coordinator")
                safety_analysis["safety_equipment_needed"].add("Life vests")
            
            if safety_issues:
                safety_analysis["safety_critical_scenes"].append({
                    "scene": scene_number,
                    "concerns": safety_issues
                })
        
        # Convert sets to lists
        safety_analysis["required_safety_personnel"] = list(safety_analysis["required_safety_personnel"])
        safety_analysis["safety_equipment_needed"] = list(safety_analysis["safety_equipment_needed"])
        
        return safety_analysis
    
    def _assess_production_feasibility(self, scenes: List[Dict[str, Any]], 
                                     metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Assess overall production feasibility."""
        feasibility = {
            "overall_feasibility": "Feasible",
            "confidence_level": "High",
            "potential_blockers": [],
            "resource_requirements": {},
            "timeline_assessment": {}
        }
        
        # Calculate resource requirements
        total_complexity = sum(self._calculate_scene_complexity(scene) for scene in scenes)
        avg_complexity = total_complexity / len(scenes)
        
        if avg_complexity > 7:
            feasibility["potential_blockers"].append(
                "High average scene complexity may require extended timeline")
            feasibility["confidence_level"] = "Medium"
        
        # Assess critical scenes
        critical_scenes = [scene for scene in scenes 
                          if self._calculate_scene_complexity(scene) >= 8]
        if len(critical_scenes) > len(scenes) * 0.2:
            feasibility["potential_blockers"].append(
                "High percentage of critical complexity scenes")
            feasibility["overall_feasibility"] = "Challenging"
        
        return feasibility
    
    def _generate_recommendations(self, scenes: List[Dict[str, Any]], 
                                 complexity_analysis: Dict[str, Any],
                                 risk_assessment: Dict[str, Any]) -> List[Dict[str, str]]:
        """Generate production recommendations based on analysis."""
        recommendations = []
        
        # Complexity-based recommendations
        if complexity_analysis["average_complexity"] > 6:
            recommendations.append({
                "category": "Scheduling",
                "recommendation": "Allocate additional prep time for high-complexity scenes",
                "priority": "High"
            })
        
        if len(complexity_analysis["high_complexity_scenes"]) > 5:
            recommendations.append({
                "category": "Resources",
                "recommendation": "Consider hiring additional technical crew",
                "priority": "Medium"
            })
        
        # Risk-based recommendations
        if risk_assessment["overall_risk_level"] == "High":
            recommendations.append({
                "category": "Risk Management",
                "recommendation": "Implement comprehensive risk mitigation plan",
                "priority": "High"
            })
        
        return recommendations