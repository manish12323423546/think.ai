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

class BreakdownSpecialistAgent:
    """
    ✅ BreakdownSpecialistAgent (AD WORKFLOW)
    
    Specialized agent for Assistant Director workflow and scene breakdown.
    Responsibilities:
    - DAY/NIGHT/DUSK classification
    - Scene breakdown cards generation
    - Time of day analysis and cost implications
    """
    
    def __init__(self):
        self.client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY"))
        self.model_config = get_model_config()
        self.instructions = """You are a Scene Breakdown Specialist Agent for film production.
        Your expertise:
        1. Classify scenes by time of day (DAY/NIGHT/DUSK/DAWN)
        2. Generate professional scene breakdown cards
        3. Calculate day/night ratios and cost implications
        4. Provide AD-ready scheduling information"""
        logger.info("BreakdownSpecialistAgent initialized")
    
    def analyze_scene_breakdown(self, scene_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive scene breakdown analysis."""
        logger.info("Starting scene breakdown analysis")
        
        if not scene_data or not isinstance(scene_data, dict):
            logger.error("Invalid scene data received")
            return {"error": "Invalid scene data format"}
        
        scenes = scene_data.get('scenes', [])
        logger.info(f"Processing breakdown for {len(scenes)} scenes")
        
        # Analyze time of day distribution
        time_breakdown = self._analyze_time_of_day(scenes)
        
        # Generate scene breakdown cards
        breakdown_cards = self._generate_breakdown_cards(scenes)
        
        # Calculate scheduling implications
        scheduling_analysis = self._analyze_scheduling_implications(scenes, time_breakdown)
        
        result = {
            "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "time_of_day_breakdown": time_breakdown,
            "scene_breakdown_cards": breakdown_cards,
            "scheduling_analysis": scheduling_analysis,
            "ad_notes": self._generate_ad_notes(scenes, time_breakdown)
        }
        
        logger.info(f"Generated breakdown analysis for {len(scenes)} scenes")
        return result
    
    def _analyze_time_of_day(self, scenes: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze time of day distribution across scenes."""
        time_categories = {
            "DAY": {"scenes": [], "total_eighths": 0, "percentage": 0},
            "NIGHT": {"scenes": [], "total_eighths": 0, "percentage": 0},
            "DUSK": {"scenes": [], "total_eighths": 0, "percentage": 0},
            "DAWN": {"scenes": [], "total_eighths": 0, "percentage": 0},
            "MORNING": {"scenes": [], "total_eighths": 0, "percentage": 0},
            "EVENING": {"scenes": [], "total_eighths": 0, "percentage": 0}
        }
        
        total_eighths = 0
        
        for scene in scenes:
            scene_number = int(scene.get('scene_number', 0))
            time_of_day = scene.get('time', 'DAY').upper()
            
            # Classify time of day
            category = self._classify_time_of_day(time_of_day)
            
            # Calculate eighths for this scene
            page_count = self._estimate_page_count(scene)
            eighths = max(int(page_count * 8), 1)
            
            if category in time_categories:
                time_categories[category]['scenes'].append(scene_number)
                time_categories[category]['total_eighths'] += eighths
                total_eighths += eighths
        
        # Calculate percentages
        for category in time_categories:
            if total_eighths > 0:
                time_categories[category]['percentage'] = round(
                    (time_categories[category]['total_eighths'] / total_eighths) * 100, 1
                )
        
        # Generate summary ratios
        day_night_ratio = self._generate_ratio_string(time_categories)
        
        # Calculate cost implications
        night_percentage = (time_categories['NIGHT']['percentage'] + 
                          time_categories['EVENING']['percentage'])
        night_premium = round((night_percentage / 100) * 0.12 * 100000, 0)
        
        return {
            **time_categories,
            "day_night_ratio": day_night_ratio,
            "night_premium_cost_impact": f"${night_premium:,.0f}",
            "total_scenes": len(scenes),
            "total_eighths": total_eighths
        }
    
    def _classify_time_of_day(self, time_string: str) -> str:
        """Classify time of day from scene timing."""
        time_upper = time_string.upper()
        
        if any(term in time_upper for term in ['NIGHT', 'MIDNIGHT']):
            return 'NIGHT'
        elif any(term in time_upper for term in ['DUSK', 'SUNSET', 'TWILIGHT']):
            return 'DUSK'
        elif any(term in time_upper for term in ['DAWN', 'SUNRISE']):
            return 'DAWN'
        elif any(term in time_upper for term in ['MORNING', 'AM']):
            return 'MORNING'
        elif any(term in time_upper for term in ['EVENING', 'LATE DAY']):
            return 'EVENING'
        else:
            return 'DAY'
    
    def _generate_breakdown_cards(self, scenes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate professional scene breakdown cards for AD use."""
        breakdown_cards = []
        
        for scene in scenes:
            scene_number = scene.get('scene_number', '0')
            
            # Essential breakdown elements
            card = {
                "scene_number": scene_number,
                "location": self._format_location(scene.get('location', {})),
                "time_of_day": self._classify_time_of_day(scene.get('time', 'DAY')),
                "page_count": self._estimate_page_count(scene),
                "eighths": max(int(self._estimate_page_count(scene) * 8), 1),
                "cast": self._extract_cast_breakdown(scene),
                "extras": self._estimate_extras_needed(scene),
                "vehicles": self._extract_vehicles(scene),
                "props": self._extract_props_breakdown(scene),
                "wardrobe": self._analyze_wardrobe_needs(scene),
                "makeup_hair": self._analyze_makeup_needs(scene),
                "special_equipment": self._extract_special_equipment(scene),
                "weather": self._analyze_weather_requirements(scene),
                "sound": self._analyze_sound_requirements(scene),
                "vfx_notes": self._extract_vfx_notes(scene),
                "safety_notes": self._identify_safety_concerns(scene),
                "ad_notes": self._generate_scene_ad_notes(scene)
            }
            
            breakdown_cards.append(card)
        
        return breakdown_cards
    
    def _estimate_page_count(self, scene: Dict[str, Any]) -> float:
        """Estimate page count for a scene."""
        description = scene.get('description', '')
        dialogue_text = ' '.join([d.get('text', '') for d in scene.get('dialogues', [])])
        word_count = len(description.split()) + len(dialogue_text.split())
        return max(word_count / 250, 0.125)  # Minimum 1/8 page
    
    def _format_location(self, location: Dict[str, Any]) -> str:
        """Format location for breakdown card."""
        int_ext = location.get('type', 'INT')
        place = location.get('place', 'UNKNOWN')
        return f"{int_ext}. {place}"
    
    def _extract_cast_breakdown(self, scene: Dict[str, Any]) -> Dict[str, Any]:
        """Extract cast information with speaking/non-speaking classification."""
        speaking_cast = []
        non_speaking_cast = []
        
        # Get speaking characters from dialogues
        dialogues = scene.get('dialogues', [])
        speaking_characters = set([d.get('character', '') for d in dialogues if d.get('character')])
        
        # Get all mentioned characters
        all_characters = scene.get('main_characters', [])
        
        for character in all_characters:
            if character in speaking_characters:
                speaking_cast.append(character)
            else:
                non_speaking_cast.append(character)
        
        return {
            "speaking": speaking_cast,
            "non_speaking": non_speaking_cast,
            "total_cast": len(all_characters)
        }
    
    def _estimate_extras_needed(self, scene: Dict[str, Any]) -> Dict[str, Any]:
        """Estimate background extras needed."""
        description = scene.get('description', '').lower()
        location = scene.get('location', {}).get('place', '').lower()
        
        # Basic heuristics for extras estimation
        extras_count = 0
        extras_type = []
        
        if any(term in description for term in ['crowd', 'busy', 'packed']):
            extras_count = 20
            extras_type.append('crowd')
        elif any(term in description for term in ['restaurant', 'cafe', 'bar']):
            extras_count = 8
            extras_type.append('diners/patrons')
        elif any(term in description for term in ['office', 'workplace']):
            extras_count = 5
            extras_type.append('office workers')
        elif any(term in description for term in ['street', 'sidewalk']):
            extras_count = 10
            extras_type.append('pedestrians')
        
        return {
            "count": extras_count,
            "types": extras_type,
            "notes": "Estimated based on scene description"
        }
    
    def _extract_vehicles(self, scene: Dict[str, Any]) -> List[str]:
        """Extract vehicle requirements from scene."""
        description = scene.get('description', '').lower()
        vehicles = []
        
        vehicle_keywords = ['car', 'truck', 'motorcycle', 'bike', 'van', 'bus', 'taxi']
        for keyword in vehicle_keywords:
            if keyword in description:
                vehicles.append(keyword.title())
        
        return vehicles
    
    def _extract_props_breakdown(self, scene: Dict[str, Any]) -> Dict[str, List[str]]:
        """Extract props breakdown by category."""
        description = scene.get('description', '').lower()
        
        props = {
            "hand_props": [],
            "set_decoration": [],
            "picture_vehicles": [],
            "special_props": []
        }
        
        # Basic prop identification (this would be enhanced with more sophisticated parsing)
        common_hand_props = ['phone', 'bag', 'keys', 'wallet', 'briefcase', 'cup', 'glass']
        for prop in common_hand_props:
            if prop in description:
                props["hand_props"].append(prop.title())
        
        return props
    
    def _analyze_wardrobe_needs(self, scene: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze wardrobe requirements."""
        # Basic wardrobe analysis
        return {
            "changes_needed": False,
            "special_requirements": [],
            "notes": "Standard wardrobe continuity"
        }
    
    def _analyze_makeup_needs(self, scene: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze makeup and hair requirements."""
        return {
            "special_fx": False,
            "continuity_notes": [],
            "touch_up_required": True
        }
    
    def _extract_special_equipment(self, scene: Dict[str, Any]) -> List[str]:
        """Extract special equipment needs."""
        technical_cues = scene.get('technical_cues', [])
        equipment = []
        
        for cue in technical_cues:
            cue_lower = cue.lower()
            if 'steadicam' in cue_lower:
                equipment.append('Steadicam')
            elif 'crane' in cue_lower:
                equipment.append('Camera crane')
            elif 'drone' in cue_lower:
                equipment.append('Drone')
        
        return equipment
    
    def _analyze_weather_requirements(self, scene: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze weather and atmospheric requirements."""
        description = scene.get('description', '').lower()
        
        weather = {
            "conditions": [],
            "effects_needed": [],
            "backup_plan": False
        }
        
        if 'rain' in description:
            weather["effects_needed"].append('Rain effects')
            weather["backup_plan"] = True
        
        return weather
    
    def _analyze_sound_requirements(self, scene: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze sound recording requirements."""
        dialogues = scene.get('dialogues', [])
        
        return {
            "dialogue_scenes": len(dialogues) > 0,
            "playback_needed": False,
            "special_audio": [],
            "notes": "Standard dialogue recording"
        }
    
    def _extract_vfx_notes(self, scene: Dict[str, Any]) -> List[str]:
        """Extract VFX requirements."""
        return []  # Basic implementation
    
    def _identify_safety_concerns(self, scene: Dict[str, Any]) -> List[str]:
        """Identify potential safety concerns."""
        description = scene.get('description', '').lower()
        safety_notes = []
        
        if any(term in description for term in ['stunt', 'fight', 'action']):
            safety_notes.append('Stunt coordination required')
        if any(term in description for term in ['water', 'pool', 'lake']):
            safety_notes.append('Water safety protocols')
        if any(term in description for term in ['fire', 'explosion']):
            safety_notes.append('Fire safety marshal required')
        
        return safety_notes
    
    def _generate_scene_ad_notes(self, scene: Dict[str, Any]) -> List[str]:
        """Generate specific AD notes for the scene."""
        notes = []
        
        # Time of day considerations
        time_of_day = self._classify_time_of_day(scene.get('time', 'DAY'))
        if time_of_day == 'NIGHT':
            notes.append('Night premium rates apply')
        elif time_of_day in ['DUSK', 'DAWN']:
            notes.append('Magic hour timing critical')
        
        # Cast considerations
        cast_count = len(scene.get('main_characters', []))
        if cast_count > 5:
            notes.append('Large cast - extended makeup time')
        
        return notes
    
    def _analyze_scheduling_implications(self, scenes: List[Dict[str, Any]], 
                                       time_breakdown: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze scheduling implications for the AD."""
        
        # Group scenes by location for efficiency
        location_groups = {}
        for scene in scenes:
            location = scene.get('location', {}).get('place', 'UNKNOWN')
            if location not in location_groups:
                location_groups[location] = []
            location_groups[location].append(scene.get('scene_number'))
        
        # Identify potential scheduling challenges
        challenges = []
        if time_breakdown['NIGHT']['percentage'] > 40:
            challenges.append('High night shooting percentage - crew fatigue consideration')
        if len(location_groups) > 10:
            challenges.append('Multiple locations - transportation logistics complex')
        
        return {
            "location_groups": location_groups,
            "total_locations": len(location_groups),
            "scheduling_challenges": challenges,
            "recommended_units": 1 if len(scenes) < 50 else 2
        }
    
    def _generate_ratio_string(self, time_categories: Dict[str, Any]) -> str:
        """Generate day/night ratio string."""
        ratio_parts = []
        for cat in ['DAY', 'NIGHT', 'DUSK', 'DAWN', 'MORNING', 'EVENING']:
            if time_categories[cat]['percentage'] > 0:
                ratio_parts.append(f"{time_categories[cat]['percentage']}% {cat.title()}")
        
        return " / ".join(ratio_parts) if ratio_parts else "100% Day"
    
    def _generate_ad_notes(self, scenes: List[Dict[str, Any]], 
                          time_breakdown: Dict[str, Any]) -> List[str]:
        """Generate overall AD notes for the production."""
        notes = []
        
        total_scenes = len(scenes)
        night_scenes = len(time_breakdown['NIGHT']['scenes'])
        
        if night_scenes > total_scenes * 0.3:
            notes.append(f'Heavy night schedule: {night_scenes} night scenes ({night_scenes/total_scenes*100:.1f}%)')
        
        if time_breakdown['total_eighths'] > 480:  # More than 8 days
            notes.append('Long shoot schedule - consider 2nd unit')
        
        return notes