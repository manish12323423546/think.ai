"""
Individual Page Processing for Enhanced Accuracy
Processes each page separately with detailed analysis and tool-based processing
"""

import os
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional
import PyPDF2
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)

# Import the original agent
from src.script_ingestion.agents.eighths_calculator_agent import EighthsCalculatorAgent

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class IndividualPageProcessor:
    """
    Processes script pages individually with enhanced accuracy and detailed analysis
    """
    
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.original_agent = EighthsCalculatorAgent()
        self.processing_results = {
            "pdf_file": pdf_path,
            "processing_timestamp": datetime.now().isoformat(),
            "total_pages": 0,
            "pages_processed": [],
            "scenes_extracted": [],
            "aggregate_results": {},
            "processing_method": "individual_page_sequential"
        }
        logger.info(f"Individual page processor initialized for {pdf_path}")
    
    def process_single_page(self, page_number: int, page_text: str) -> Dict[str, Any]:
        """
        Process a single page with detailed analysis
        
        Args:
            page_number: Page number (1-indexed)
            page_text: Text content of the page
            
        Returns:
            Detailed page analysis results
        """
        logger.info(f"Processing page {page_number} individually")
        
        # Basic page statistics
        words = page_text.split()
        total_words = len(words)
        
        # Extract scenes from this specific page
        page_scenes = self._extract_scenes_from_page(page_text, page_number)
        
        # Divide page into 8 eighths with enhanced accuracy
        eighths_breakdown = self._create_accurate_eighths_breakdown(words, page_number)
        
        # Calculate complexity for this page
        page_complexity = self._calculate_page_complexity(page_text, page_scenes)
        
        # Estimate production metrics
        production_metrics = self._calculate_production_metrics(total_words, page_complexity)
        
        page_result = {
            "page_number": page_number,
            "word_count": total_words,
            "character_count": len(page_text),
            "line_count": len(page_text.split('\n')),
            "scenes_on_page": page_scenes,
            "eighths_breakdown": eighths_breakdown,
            "page_complexity": page_complexity,
            "production_metrics": production_metrics,
            "processing_time": datetime.now().isoformat()
        }
        
        logger.info(f"Page {page_number} processed: {total_words} words, {len(page_scenes)} scenes")
        return page_result
    
    def _extract_scenes_from_page(self, page_text: str, page_number: int) -> List[Dict[str, Any]]:
        """
        Extract scenes from a single page with enhanced accuracy
        """
        scenes = []
        lines = page_text.split('\n')
        current_scene = None
        
        for line_num, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue
                
            # Enhanced scene header detection
            scene_markers = ["INT.", "EXT.", "INT/EXT", "INTERIOR", "EXTERIOR"]
            if any(marker in line.upper() for marker in scene_markers):
                # Save previous scene if exists
                if current_scene:
                    scenes.append(current_scene)
                
                # Parse scene details with more accuracy
                scene_number = len(scenes) + 1
                location_type = self._determine_location_type(line)
                time_of_day = self._determine_time_of_day(line)
                location_name = self._extract_location_name(line)
                
                current_scene = {
                    "scene_number": f"{page_number}_{scene_number}",
                    "page_number": page_number,
                    "line_number": line_num + 1,
                    "scene_header": line,
                    "location_type": location_type,
                    "time_of_day": time_of_day,
                    "location_name": location_name,
                    "description": line,
                    "technical_cues": [],
                    "character_count": 0,
                    "dialogue_lines": 0,
                    "action_lines": 0
                }
            elif current_scene:
                # Add to current scene with detailed analysis
                current_scene["description"] += " " + line
                
                # Enhanced technical cue detection
                tech_cues = self._detect_technical_cues(line)
                current_scene["technical_cues"].extend(tech_cues)
                
                # Character and dialogue analysis
                if self._is_character_line(line):
                    current_scene["character_count"] += 1
                elif self._is_dialogue_line(line):
                    current_scene["dialogue_lines"] += 1
                elif self._is_action_line(line):
                    current_scene["action_lines"] += 1
        
        # Add final scene if exists
        if current_scene:
            scenes.append(current_scene)
        
        return scenes
    
    def _create_accurate_eighths_breakdown(self, words: List[str], page_number: int) -> List[Dict[str, Any]]:
        """
        Create accurate eighths breakdown with semantic awareness
        """
        total_words = len(words)
        if total_words == 0:
            return []
        
        # Calculate words per eighth with remainder handling
        base_words_per_eighth = total_words // 8
        remainder = total_words % 8
        
        eighths_breakdown = []
        current_word_index = 0
        
        for eighth_num in range(1, 9):
            # Distribute remainder across first few eighths
            words_in_eighth = base_words_per_eighth + (1 if eighth_num <= remainder else 0)
            
            # Extract words for this eighth
            eighth_words = words[current_word_index:current_word_index + words_in_eighth]
            eighth_content = ' '.join(eighth_words)
            
            # Analyze content type
            content_type = self._analyze_content_type(eighth_content)
            
            # Calculate detailed metrics
            eighth_result = {
                "eighth_number": eighth_num,
                "word_count": len(eighth_words),
                "character_count": len(eighth_content),
                "content_preview": eighth_content[:100] + "..." if len(eighth_content) > 100 else eighth_content,
                "content_type": content_type,
                "estimated_time_minutes": self._calculate_eighth_time(eighth_words, content_type),
                "complexity_score": self._calculate_eighth_complexity(eighth_content, content_type),
                "dialogue_density": self._calculate_dialogue_density(eighth_content),
                "action_density": self._calculate_action_density(eighth_content)
            }
            
            eighths_breakdown.append(eighth_result)
            current_word_index += words_in_eighth
        
        return eighths_breakdown
    
    def _calculate_page_complexity(self, page_text: str, scenes: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate overall page complexity with detailed factors
        """
        base_complexity = 1.0
        complexity_factors = []
        
        # Scene-based complexity
        if scenes:
            scene_complexity = 0.0
            for scene in scenes:
                if scene["location_type"] == "EXT":
                    scene_complexity += 0.2
                if scene["time_of_day"] in ["NIGHT", "DUSK", "DAWN"]:
                    scene_complexity += 0.3
                if len(scene["technical_cues"]) > 0:
                    scene_complexity += 0.1 * len(scene["technical_cues"])
            
            complexity_factors.append(f"scenes: +{scene_complexity:.1f}")
            base_complexity += scene_complexity
        
        # Text density complexity
        words_per_line = len(page_text.split()) / max(len(page_text.split('\n')), 1)
        if words_per_line > 15:
            density_factor = 0.1
            complexity_factors.append(f"high_density: +{density_factor}")
            base_complexity += density_factor
        
        # Special formatting complexity
        if "FADE IN:" in page_text or "FADE OUT:" in page_text:
            formatting_factor = 0.2
            complexity_factors.append(f"transitions: +{formatting_factor}")
            base_complexity += formatting_factor
        
        return {
            "total_complexity": min(base_complexity, 3.0),
            "factors_applied": complexity_factors,
            "scene_count": len(scenes),
            "base_complexity": 1.0
        }
    
    def _calculate_production_metrics(self, word_count: int, complexity: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate detailed production metrics for the page
        """
        # Base calculations
        estimated_eighths = (word_count / 250) * 8
        complexity_factor = complexity["total_complexity"]
        adjusted_eighths = estimated_eighths * complexity_factor
        
        # Time estimates
        base_shoot_time = adjusted_eighths * 0.15  # 15 minutes per eighth
        setup_time = base_shoot_time * 0.3
        wrap_time = base_shoot_time * 0.2
        total_time = base_shoot_time + setup_time + wrap_time
        
        return {
            "estimated_eighths": round(estimated_eighths, 2),
            "complexity_factor": complexity_factor,
            "adjusted_eighths": round(adjusted_eighths, 2),
            "base_shoot_time_hours": round(base_shoot_time, 2),
            "setup_time_hours": round(setup_time, 2),
            "wrap_time_hours": round(wrap_time, 2),
            "total_time_hours": round(total_time, 2),
            "crew_size_estimate": self._estimate_crew_size(complexity_factor),
            "equipment_complexity": self._estimate_equipment_needs(complexity_factor)
        }
    
    def _determine_location_type(self, line: str) -> str:
        """Determine location type with enhanced accuracy"""
        line_upper = line.upper()
        if "EXT." in line_upper or "EXTERIOR" in line_upper:
            return "EXT"
        elif "INT." in line_upper or "INTERIOR" in line_upper:
            return "INT"
        elif "INT/EXT" in line_upper:
            return "INT/EXT"
        return "UNKNOWN"
    
    def _determine_time_of_day(self, line: str) -> str:
        """Determine time of day with enhanced accuracy"""
        line_upper = line.upper()
        if "NIGHT" in line_upper:
            return "NIGHT"
        elif "DAY" in line_upper:
            return "DAY"
        elif "DUSK" in line_upper:
            return "DUSK"
        elif "DAWN" in line_upper:
            return "DAWN"
        elif "MORNING" in line_upper:
            return "MORNING"
        elif "EVENING" in line_upper:
            return "EVENING"
        return "DAY"  # Default
    
    def _extract_location_name(self, line: str) -> str:
        """Extract location name from scene header"""
        # Remove common markers
        cleaned = line.upper()
        for marker in ["INT.", "EXT.", "INTERIOR", "EXTERIOR", "DAY", "NIGHT", "DUSK", "DAWN"]:
            cleaned = cleaned.replace(marker, "")
        
        # Clean up and return
        location = cleaned.strip(" -.,")
        return location if location else "UNKNOWN"
    
    def _detect_technical_cues(self, line: str) -> List[str]:
        """Detect technical cues with enhanced accuracy"""
        cues = []
        line_upper = line.upper()
        
        technical_keywords = [
            "VFX", "SFX", "CRANE", "AERIAL", "DRONE", "STEADICAM",
            "HANDHELD", "DOLLY", "TRACKING", "ZOOM", "CLOSE-UP",
            "WIDE SHOT", "MEDIUM SHOT", "POV", "MONTAGE", "SPLIT SCREEN",
            "SLOW MOTION", "FAST MOTION", "FREEZE FRAME", "DISSOLVE",
            "FADE", "CUT TO", "SMASH CUT", "MATCH CUT", "EXPLOSION",
            "STUNT", "PRACTICAL EFFECTS", "GREEN SCREEN", "MOTION CAPTURE"
        ]
        
        for keyword in technical_keywords:
            if keyword in line_upper:
                cues.append(keyword)
        
        return cues
    
    def _is_character_line(self, line: str) -> bool:
        """Determine if line is a character name"""
        return (line.isupper() and 
                len(line.strip()) < 50 and 
                not any(tech in line for tech in ["INT.", "EXT.", "FADE"]))
    
    def _is_dialogue_line(self, line: str) -> bool:
        """Determine if line is dialogue"""
        return (not line.isupper() and 
                not line.startswith("(") and 
                len(line.strip()) > 0)
    
    def _is_action_line(self, line: str) -> bool:
        """Determine if line is action description"""
        return (not line.isupper() and 
                not self._is_dialogue_line(line) and 
                len(line.strip()) > 0)
    
    def _analyze_content_type(self, content: str) -> str:
        """Analyze the type of content in an eighth"""
        if not content.strip():
            return "empty"
        
        lines = content.split('\n')
        dialogue_count = sum(1 for line in lines if self._is_dialogue_line(line))
        action_count = sum(1 for line in lines if self._is_action_line(line))
        
        if dialogue_count > action_count:
            return "dialogue_heavy"
        elif action_count > dialogue_count:
            return "action_heavy"
        else:
            return "balanced"
    
    def _calculate_eighth_time(self, words: List[str], content_type: str) -> float:
        """Calculate time for an eighth based on content type"""
        base_time = (len(words) / 250) * 9  # 9 minutes per eighth
        
        # Adjust based on content type
        if content_type == "dialogue_heavy":
            return base_time * 1.2  # Dialogue takes longer
        elif content_type == "action_heavy":
            return base_time * 1.5  # Action takes much longer
        else:
            return base_time
    
    def _calculate_eighth_complexity(self, content: str, content_type: str) -> float:
        """Calculate complexity score for an eighth"""
        base_complexity = 1.0
        
        if content_type == "action_heavy":
            base_complexity += 0.3
        elif content_type == "dialogue_heavy":
            base_complexity += 0.1
        
        # Check for technical elements
        if any(cue in content.upper() for cue in ["VFX", "SFX", "STUNT", "EXPLOSION"]):
            base_complexity += 0.2
        
        return min(base_complexity, 3.0)
    
    def _calculate_dialogue_density(self, content: str) -> float:
        """Calculate dialogue density in content"""
        lines = content.split('\n')
        dialogue_lines = sum(1 for line in lines if self._is_dialogue_line(line))
        return dialogue_lines / max(len(lines), 1)
    
    def _calculate_action_density(self, content: str) -> float:
        """Calculate action density in content"""
        lines = content.split('\n')
        action_lines = sum(1 for line in lines if self._is_action_line(line))
        return action_lines / max(len(lines), 1)
    
    def _estimate_crew_size(self, complexity_factor: float) -> str:
        """Estimate crew size based on complexity"""
        if complexity_factor <= 1.2:
            return "small (10-15 people)"
        elif complexity_factor <= 1.8:
            return "medium (20-30 people)"
        else:
            return "large (35+ people)"
    
    def _estimate_equipment_needs(self, complexity_factor: float) -> str:
        """Estimate equipment needs based on complexity"""
        if complexity_factor <= 1.2:
            return "basic (standard camera, lighting)"
        elif complexity_factor <= 1.8:
            return "intermediate (specialty rigs, additional lighting)"
        else:
            return "advanced (cranes, specialized equipment, VFX)"
    
    def process_all_pages_individually(self) -> Dict[str, Any]:
        """
        Process all pages individually with enhanced accuracy
        """
        logger.info("Starting individual page processing")
        
        try:
            with open(self.pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                total_pages = len(pdf_reader.pages)
                self.processing_results["total_pages"] = total_pages
                
                logger.info(f"Processing {total_pages} pages individually")
                
                # Process each page individually
                for page_num in range(total_pages):
                    page = pdf_reader.pages[page_num]
                    page_text = page.extract_text()
                    
                    # Process this single page
                    page_result = self.process_single_page(page_num + 1, page_text)
                    self.processing_results["pages_processed"].append(page_result)
                    
                    # Collect scenes
                    for scene in page_result["scenes_on_page"]:
                        self.processing_results["scenes_extracted"].append(scene)
                
                # Calculate aggregate results
                self.processing_results["aggregate_results"] = self._calculate_aggregate_results()
                
                logger.info(f"Individual processing complete: {total_pages} pages, {len(self.processing_results['scenes_extracted'])} scenes")
                
        except Exception as e:
            logger.error(f"Error in individual page processing: {e}")
            raise
        
        return self.processing_results
    
    def _calculate_aggregate_results(self) -> Dict[str, Any]:
        """Calculate aggregate results from individual page processing"""
        pages = self.processing_results["pages_processed"]
        scenes = self.processing_results["scenes_extracted"]
        
        # Aggregate metrics
        total_words = sum(page["word_count"] for page in pages)
        total_eighths = sum(page["production_metrics"]["adjusted_eighths"] for page in pages)
        total_time = sum(page["production_metrics"]["total_time_hours"] for page in pages)
        
        # Complexity analysis
        complexity_distribution = {"simple": 0, "moderate": 0, "complex": 0}
        for page in pages:
            complexity = page["page_complexity"]["total_complexity"]
            if complexity <= 1.2:
                complexity_distribution["simple"] += 1
            elif complexity <= 1.8:
                complexity_distribution["moderate"] += 1
            else:
                complexity_distribution["complex"] += 1
        
        # Scene statistics
        scene_types = {}
        for scene in scenes:
            scene_type = f"{scene['location_type']}_{scene['time_of_day']}"
            scene_types[scene_type] = scene_types.get(scene_type, 0) + 1
        
        return {
            "total_pages": len(pages),
            "total_scenes": len(scenes),
            "total_words": total_words,
            "total_eighths": round(total_eighths, 2),
            "total_production_time_hours": round(total_time, 2),
            "estimated_shoot_days": round(total_eighths / 60, 1),
            "complexity_distribution": complexity_distribution,
            "scene_type_distribution": scene_types,
            "average_words_per_page": round(total_words / len(pages), 1),
            "average_eighths_per_page": round(total_eighths / len(pages), 2),
            "processing_accuracy": "individual_page_sequential"
        }
    
    def save_results(self, suffix: str = "individual") -> str:
        """Save processing results to file"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"individual_page_results_{suffix}_{timestamp}.json"
        
        with open(filename, 'w') as f:
            json.dump(self.processing_results, f, indent=2)
        
        logger.info(f"Individual page processing results saved to {filename}")
        return filename
    
    def generate_detailed_report(self) -> str:
        """Generate detailed report for individual page processing"""
        results = self.processing_results
        aggregate = results["aggregate_results"]
        
        report = []
        report.append("=" * 100)
        report.append("INDIVIDUAL PAGE PROCESSING REPORT")
        report.append("=" * 100)
        report.append(f"Processing Method: {results['processing_method']}")
        report.append(f"PDF File: {results['pdf_file']}")
        report.append(f"Processing Date: {results['processing_timestamp']}")
        report.append("")
        
        # Summary
        report.append("PROCESSING SUMMARY")
        report.append("-" * 50)
        report.append(f"Total Pages Processed: {aggregate['total_pages']}")
        report.append(f"Total Scenes Extracted: {aggregate['total_scenes']}")
        report.append(f"Total Words: {aggregate['total_words']:,}")
        report.append(f"Total Eighths: {aggregate['total_eighths']}")
        report.append(f"Estimated Shoot Days: {aggregate['estimated_shoot_days']}")
        report.append(f"Total Production Time: {aggregate['total_production_time_hours']} hours")
        report.append("")
        
        # Complexity Analysis
        report.append("COMPLEXITY ANALYSIS")
        report.append("-" * 50)
        for complexity_type, count in aggregate['complexity_distribution'].items():
            percentage = (count / aggregate['total_pages']) * 100
            report.append(f"{complexity_type.capitalize()} Pages: {count} ({percentage:.1f}%)")
        report.append("")
        
        # Scene Type Distribution
        report.append("SCENE TYPE DISTRIBUTION")
        report.append("-" * 50)
        for scene_type, count in aggregate['scene_type_distribution'].items():
            percentage = (count / aggregate['total_scenes']) * 100
            report.append(f"{scene_type}: {count} scenes ({percentage:.1f}%)")
        report.append("")
        
        # Sample Page Analysis (first 5 pages)
        report.append("SAMPLE PAGE ANALYSIS (First 5 Pages)")
        report.append("-" * 50)
        for page in results["pages_processed"][:5]:
            report.append(f"\nPage {page['page_number']}:")
            report.append(f"  Words: {page['word_count']}")
            report.append(f"  Scenes: {len(page['scenes_on_page'])}")
            report.append(f"  Eighths: {page['production_metrics']['adjusted_eighths']}")
            report.append(f"  Complexity: {page['page_complexity']['total_complexity']:.2f}")
            report.append(f"  Production Time: {page['production_metrics']['total_time_hours']:.2f} hours")
            
            # Show eighths breakdown
            if page['eighths_breakdown']:
                report.append(f"  Eighths Breakdown:")
                for eighth in page['eighths_breakdown'][:3]:  # First 3 eighths
                    report.append(f"    Eighth {eighth['eighth_number']}: {eighth['word_count']} words, {eighth['content_type']}")
        
        report.append("")
        report.append("=" * 100)
        report.append("END OF INDIVIDUAL PAGE PROCESSING REPORT")
        report.append("=" * 100)
        
        return "\n".join(report)


def main():
    """Main function for testing individual page processing"""
    # Path to BLACK_PANTHER.pdf
    pdf_path = "/Users/varunisrani/Desktop/mckays-app-template 3/BLACK_PANTHER.pdf"
    
    if not os.path.exists(pdf_path):
        print(f"ERROR: PDF file not found at {pdf_path}")
        return
    
    # Create processor
    processor = IndividualPageProcessor(pdf_path)
    
    # Process all pages individually
    results = processor.process_all_pages_individually()
    
    # Save results
    results_file = processor.save_results()
    
    # Generate and save report
    report = processor.generate_detailed_report()
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_file = f"individual_page_report_{timestamp}.txt"
    with open(report_file, 'w') as f:
        f.write(report)
    
    print(f"Individual page processing complete!")
    print(f"Results saved to: {results_file}")
    print(f"Report saved to: {report_file}")
    print(f"Total pages: {results['aggregate_results']['total_pages']}")
    print(f"Total scenes: {results['aggregate_results']['total_scenes']}")
    print(f"Total eighths: {results['aggregate_results']['total_eighths']}")


if __name__ == "__main__":
    main()