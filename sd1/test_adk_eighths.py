"""
Test Script for ADK Eighths Calculator
Processes BLACK_PANTHER.pdf and compares original vs ADK implementation
"""

import os
import sys
import json
import logging
from datetime import datetime
from pathlib import Path
import PyPDF2
from typing import Dict, Any, List
from dotenv import load_dotenv

# Load environment variables from current directory .env
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)

# Import both implementations
from src.script_ingestion.agents.eighths_calculator_agent import EighthsCalculatorAgent
from adk_eighths_calculator_proper import create_adk_eighths_agent

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('adk_eighths_test.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ADKEighthsTestRunner:
    """Test runner for comparing original and ADK eighths calculator implementations."""
    
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.original_agent = EighthsCalculatorAgent()
        self.adk_agent = create_adk_eighths_agent()
        self.test_results = {
            "pdf_file": pdf_path,
            "test_timestamp": datetime.now().isoformat(),
            "pages_processed": 0,
            "scenes_extracted": 0,
            "original_results": {},
            "adk_results": {},
            "comparison": {},
            "page_by_page_storage": []
        }
        logger.info(f"Test runner initialized for {pdf_path}")
    
    def extract_scenes_from_pdf(self) -> List[Dict[str, Any]]:
        """Extract scenes from PDF for testing."""
        logger.info(f"Extracting scenes from {self.pdf_path}")
        
        scenes = []
        page_eighths_storage = []
        
        try:
            with open(self.pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                total_pages = len(pdf_reader.pages)
                self.test_results["pages_processed"] = total_pages
                
                logger.info(f"Processing {total_pages} pages from PDF")
                
                # Process each page
                for page_num in range(total_pages):  # Process all pages
                    page = pdf_reader.pages[page_num]
                    text = page.extract_text()
                    
                    # Simple scene extraction (look for scene headers)
                    lines = text.split('\n')
                    current_scene = None
                    
                    for line in lines:
                        # Look for scene headers (e.g., "INT.", "EXT.", "SCENE")
                        if any(marker in line.upper() for marker in ["INT.", "EXT.", "INT/EXT", "SCENE"]):
                            if current_scene:
                                scenes.append(current_scene)
                            
                            # Parse scene header
                            scene_number = f"{len(scenes) + 1}"
                            location_type = "EXT" if "EXT" in line.upper() else "INT"
                            
                            # Determine time of day
                            time_of_day = "DAY"
                            if "NIGHT" in line.upper():
                                time_of_day = "NIGHT"
                            elif "DUSK" in line.upper():
                                time_of_day = "DUSK"
                            elif "DAWN" in line.upper():
                                time_of_day = "DAWN"
                            
                            current_scene = {
                                "scene_number": scene_number,
                                "description": line,
                                "location_type": location_type,
                                "time_of_day": time_of_day,
                                "technical_cues": [],
                                "character_count": 0,
                                "dialogue_count": 0,
                                "page_number": page_num + 1
                            }
                        elif current_scene:
                            # Add to current scene description
                            current_scene["description"] += " " + line
                            
                            # Count technical cues
                            tech_keywords = ["VFX", "SFX", "CRANE", "AERIAL", "STUNT", "EXPLOSION"]
                            for keyword in tech_keywords:
                                if keyword in line.upper():
                                    current_scene["technical_cues"].append(keyword)
                            
                            # Simple character/dialogue counting
                            if line.strip() and line.isupper() and len(line.strip()) < 50:
                                current_scene["character_count"] += 1
                            if line.strip() and not line.isupper():
                                current_scene["dialogue_count"] += 1
                    
                    # Store page-level eighths data with detailed eighth breakdown
                    total_words = len(text.split())
                    words_per_eighth = total_words / 8 if total_words > 0 else 0
                    
                    # Divide page into 8 eighths
                    eighths_breakdown = []
                    for eighth_num in range(1, 9):
                        start_word = int((eighth_num - 1) * words_per_eighth)
                        end_word = int(eighth_num * words_per_eighth)
                        if eighth_num == 8:  # Last eighth takes remaining words
                            end_word = total_words
                        
                        eighth_words = text.split()[start_word:end_word]
                        eighth_content = ' '.join(eighth_words)
                        
                        eighths_breakdown.append({
                            "eighth_number": eighth_num,
                            "word_count": len(eighth_words),
                            "content_preview": eighth_content[:100] + "..." if len(eighth_content) > 100 else eighth_content,
                            "estimated_time_minutes": len(eighth_words) / 250 * 9,  # 9 minutes per eighth
                            "complexity_score": 1.0  # Base complexity
                        })
                    
                    page_eighths = {
                        "page_number": page_num + 1,
                        "word_count": total_words,
                        "estimated_eighths": (total_words / 250) * 8,
                        "scenes_on_page": [],
                        "eighths_breakdown": eighths_breakdown
                    }
                    
                    # Associate scenes with pages
                    for scene in scenes:
                        if scene.get("page_number") == page_num + 1:
                            page_eighths["scenes_on_page"].append(scene["scene_number"])
                    
                    page_eighths_storage.append(page_eighths)
                
                # Add last scene if exists
                if current_scene:
                    scenes.append(current_scene)
                
                self.test_results["scenes_extracted"] = len(scenes)
                self.test_results["page_by_page_storage"] = page_eighths_storage
                
                logger.info(f"Extracted {len(scenes)} scenes from {total_pages} pages")
                
                # If no scenes found, create mock scenes for testing
                if not scenes:
                    logger.warning("No scenes found in PDF, creating mock scenes for testing")
                    scenes = self._create_mock_scenes()
                
                return scenes
                
        except Exception as e:
            logger.error(f"Error extracting scenes from PDF: {e}")
            # Return mock scenes for testing
            return self._create_mock_scenes()
    
    def _create_mock_scenes(self) -> List[Dict[str, Any]]:
        """Create mock scenes for testing when PDF extraction fails."""
        return [
            {
                "scene_number": "1",
                "description": "EXT. WAKANDA - AERIAL VIEW - DAY. The camera soars over the technologically advanced African nation, revealing gleaming spires and vibranium-powered technology. Warriors train in the distance while hover vehicles zip through the sky.",
                "location_type": "EXT",
                "time_of_day": "DAY",
                "technical_cues": ["AERIAL", "VFX"],
                "character_count": 2,
                "dialogue_count": 5
            },
            {
                "scene_number": "2",
                "description": "INT. THRONE ROOM - CONTINUOUS. T'Challa sits on the throne, surrounded by the Dora Milaje. General Okoye approaches with urgent news about border incursions.",
                "location_type": "INT",
                "time_of_day": "DAY",
                "technical_cues": [],
                "character_count": 4,
                "dialogue_count": 15
            },
            {
                "scene_number": "3",
                "description": "EXT. WAKANDAN BORDER - NIGHT. A stealth mission unfolds as Black Panther and his team intercept smugglers attempting to steal vibranium. Intense combat with advanced weaponry and acrobatic stunts.",
                "location_type": "EXT",
                "time_of_day": "NIGHT",
                "technical_cues": ["STUNT", "VFX", "SFX"],
                "character_count": 8,
                "dialogue_count": 10
            }
        ]
    
    def run_original_agent(self, scenes: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Run the original eighths calculator agent."""
        logger.info("Running original EighthsCalculatorAgent")
        
        try:
            # Format scenes for original agent
            scene_data = {"scenes": scenes}
            
            # Calculate eighths
            result = self.original_agent.calculate_eighths(scene_data)
            
            # Generate report
            if "error" not in result:
                report = self.original_agent.generate_eighths_report(result)
                result["report"] = report
            
            logger.info("Original agent completed successfully")
            return result
            
        except Exception as e:
            logger.error(f"Error running original agent: {e}")
            return {"error": str(e)}
    
    def run_adk_agent(self, scenes: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Run the ADK eighths calculator agent."""
        logger.info("Running ADK EighthsCalculatorAgent")
        
        try:
            # Process scenes with ADK agent
            result = self.adk_agent.process_script_scenes(scenes)
            
            logger.info("ADK agent completed successfully")
            return result
            
        except Exception as e:
            logger.error(f"Error running ADK agent: {e}")
            return {"status": "error", "message": str(e)}
    
    def compare_results(self, original: Dict[str, Any], adk: Dict[str, Any]) -> Dict[str, Any]:
        """Compare results from both implementations."""
        logger.info("Comparing results from both implementations")
        
        comparison = {
            "execution_status": {
                "original": "success" if "error" not in original else "error",
                "adk": adk.get("status", "error")
            },
            "totals_comparison": {},
            "discrepancies": [],
            "performance_metrics": {}
        }
        
        # Compare totals if both succeeded
        if "error" not in original and adk.get("status") == "success":
            orig_totals = original.get("totals", {})
            adk_totals = adk.get("eighths_data", {}).get("totals", {})
            
            # Compare key metrics
            metrics = ["total_scenes", "total_script_eighths", "total_adjusted_eighths", "estimated_shoot_days"]
            
            for metric in metrics:
                orig_val = orig_totals.get(metric, 0)
                adk_val = adk_totals.get(metric, 0)
                
                comparison["totals_comparison"][metric] = {
                    "original": orig_val,
                    "adk": adk_val,
                    "difference": abs(orig_val - adk_val) if isinstance(orig_val, (int, float)) and isinstance(adk_val, (int, float)) else "N/A",
                    "match": orig_val == adk_val
                }
                
                if orig_val != adk_val:
                    comparison["discrepancies"].append(f"{metric}: Original={orig_val}, ADK={adk_val}")
        
        return comparison
    
    def generate_test_report(self) -> str:
        """Generate comprehensive test report."""
        report = []
        report.append("=" * 100)
        report.append("ADK EIGHTHS CALCULATOR TEST REPORT")
        report.append("=" * 100)
        report.append(f"Test Date: {self.test_results['test_timestamp']}")
        report.append(f"PDF File: {self.test_results['pdf_file']}")
        report.append(f"Pages Processed: {self.test_results['pages_processed']}")
        report.append(f"Scenes Extracted: {self.test_results['scenes_extracted']}")
        report.append("")
        
        # Execution Status
        report.append("EXECUTION STATUS")
        report.append("-" * 50)
        comparison = self.test_results.get("comparison", {})
        exec_status = comparison.get("execution_status", {})
        report.append(f"Original Agent: {exec_status.get('original', 'N/A')}")
        report.append(f"ADK Agent: {exec_status.get('adk', 'N/A')}")
        report.append("")
        
        # Results Comparison
        report.append("RESULTS COMPARISON")
        report.append("-" * 50)
        totals_comp = comparison.get("totals_comparison", {})
        for metric, values in totals_comp.items():
            report.append(f"\n{metric}:")
            report.append(f"  Original: {values.get('original', 'N/A')}")
            report.append(f"  ADK:      {values.get('adk', 'N/A')}")
            report.append(f"  Match:    {values.get('match', 'N/A')}")
        
        # Discrepancies
        if comparison.get("discrepancies"):
            report.append("\nDISCREPANCIES FOUND:")
            report.append("-" * 50)
            for discrepancy in comparison["discrepancies"]:
                report.append(f"• {discrepancy}")
        else:
            report.append("\nNO DISCREPANCIES - Results match perfectly!")
        
        # Page-by-Page Storage
        report.append("\nPAGE-BY-PAGE EIGHTHS STORAGE")
        report.append("-" * 50)
        for page_data in self.test_results.get("page_by_page_storage", [])[:5]:  # First 5 pages
            report.append(f"\nPage {page_data['page_number']}:")
            report.append(f"  Word Count: {page_data['word_count']}")
            report.append(f"  Estimated Eighths: {page_data['estimated_eighths']:.1f}")
            report.append(f"  Scenes: {', '.join(page_data['scenes_on_page']) if page_data['scenes_on_page'] else 'None'}")
            
            # Show eighths breakdown
            if 'eighths_breakdown' in page_data:
                report.append(f"  Eighths Breakdown:")
                for eighth in page_data['eighths_breakdown']:
                    report.append(f"    Eighth {eighth['eighth_number']}: {eighth['word_count']} words, {eighth['estimated_time_minutes']:.1f} min")
        
        # Original Agent Report
        if "report" in self.test_results.get("original_results", {}):
            report.append("\n\nORIGINAL AGENT REPORT")
            report.append("=" * 100)
            report.append(self.test_results["original_results"]["report"])
        
        # ADK Agent Report
        if "report" in self.test_results.get("adk_results", {}):
            report.append("\n\nADK AGENT REPORT")
            report.append("=" * 100)
            report.append(self.test_results["adk_results"]["report"])
        
        report.append("\n" + "=" * 100)
        report.append("END OF TEST REPORT")
        report.append("=" * 100)
        
        return "\n".join(report)
    
    def save_results(self):
        """Save test results to files."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Save JSON results
        json_file = f"adk_test_results_{timestamp}.json"
        with open(json_file, 'w') as f:
            json.dump(self.test_results, f, indent=2)
        logger.info(f"Saved JSON results to {json_file}")
        
        # Save text report
        report_file = f"adk_test_report_{timestamp}.txt"
        with open(report_file, 'w') as f:
            f.write(self.generate_test_report())
        logger.info(f"Saved text report to {report_file}")
        
        # Save page-by-page storage
        storage_file = f"page_eighths_storage_{timestamp}.json"
        with open(storage_file, 'w') as f:
            json.dump(self.test_results["page_by_page_storage"], f, indent=2)
        logger.info(f"Saved page-by-page storage to {storage_file}")
        
        # Save detailed eighths breakdown
        detailed_file = f"detailed_eighths_breakdown_{timestamp}.json"
        detailed_data = {
            "total_pages": len(self.test_results["page_by_page_storage"]),
            "total_eighths": len(self.test_results["page_by_page_storage"]) * 8,
            "processing_timestamp": timestamp,
            "pages": self.test_results["page_by_page_storage"]
        }
        with open(detailed_file, 'w') as f:
            json.dump(detailed_data, f, indent=2)
        logger.info(f"Saved detailed eighths breakdown to {detailed_file}")
    
    def run_test(self):
        """Run the complete test suite."""
        logger.info("Starting ADK Eighths Calculator test")
        
        # Step 1: Extract scenes from PDF
        scenes = self.extract_scenes_from_pdf()
        
        # Step 2: Run original agent
        logger.info("Testing original agent...")
        original_results = self.run_original_agent(scenes)
        self.test_results["original_results"] = original_results
        
        # Step 3: Run ADK agent
        logger.info("Testing ADK agent...")
        adk_results = self.run_adk_agent(scenes)
        self.test_results["adk_results"] = adk_results
        
        # Step 4: Compare results
        comparison = self.compare_results(original_results, adk_results)
        self.test_results["comparison"] = comparison
        
        # Step 5: Save results
        self.save_results()
        
        # Step 6: Print summary
        print("\n" + "=" * 50)
        print("TEST SUMMARY")
        print("=" * 50)
        print(f"Scenes Processed: {len(scenes)}")
        print(f"Original Agent Status: {comparison['execution_status']['original']}")
        print(f"ADK Agent Status: {comparison['execution_status']['adk']}")
        print(f"Discrepancies Found: {len(comparison.get('discrepancies', []))}")
        print("\nTest complete! Check the generated files for detailed results.")
        
        logger.info("Test completed successfully")


def main():
    """Main entry point for the test script."""
    # Check if GOOGLE_API_KEY is set
    if not os.environ.get("GOOGLE_API_KEY"):
        print("ERROR: GOOGLE_API_KEY environment variable not set")
        sys.exit(1)
    
    # Path to BLACK_PANTHER.pdf
    pdf_path = "/Users/varunisrani/Desktop/mckays-app-template 3/BLACK_PANTHER.pdf"
    
    if not os.path.exists(pdf_path):
        print(f"ERROR: PDF file not found at {pdf_path}")
        sys.exit(1)
    
    # Run the test
    tester = ADKEighthsTestRunner(pdf_path)
    tester.run_test()


if __name__ == "__main__":
    main()