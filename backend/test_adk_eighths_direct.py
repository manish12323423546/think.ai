#!/usr/bin/env python3
"""
Direct test of ADK Eighths Calculator Agent
Tests the agent directly with PDF input to isolate issues
"""

import PyPDF2
import io
import sys
import os
from datetime import datetime

# Add the src directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from script_ingestion.agents.adk_eighths_calculator_proper import create_adk_eighths_agent

def extract_pdf_text(pdf_path: str) -> str:
    """Extract text from PDF file."""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            print(f"📄 PDF has {len(pdf_reader.pages)} pages")
            
            text_content = []
            for page_num, page in enumerate(pdf_reader.pages, 1):
                page_text = page.extract_text()
                char_count = len(page_text)
                print(f"   Page {page_num}: {char_count} characters")
                if char_count > 0:
                    text_content.append(f"=== PAGE {page_num} ===\n{page_text}\n")
                
                # Show first few pages in detail for debugging
                if page_num <= 5 and char_count > 0:
                    print(f"   Page {page_num} content preview: {page_text[:100]}...")
            
            full_text = '\n'.join(text_content)
            print(f"📝 Total extracted text: {len(full_text)} characters")
            return full_text
            
    except Exception as e:
        print(f"❌ Error extracting PDF: {e}")
        return ""

def test_adk_eighths_direct():
    """Test ADK Eighths Calculator directly with PDF."""
    print("🎬 DIRECT ADK EIGHTHS CALCULATOR TEST")
    print("=" * 80)
    print(f"Timestamp: {datetime.now().strftime('%Y%m%d_%H%M%S')}")
    print()
    
    # Step 1: Extract PDF text
    pdf_path = "/Users/varunisrani/Desktop/mckays-app-template 3/BLACK_PANTHER.pdf"
    print(f"📄 Extracting text from {pdf_path}...")
    
    script_text = extract_pdf_text(pdf_path)
    
    if not script_text or len(script_text) < 100:
        print("⚠️  PDF extraction resulted in minimal text. Creating test data...")
        script_text = """
=== PAGE 1 ===
INT. WAKANDA PALACE - THRONE ROOM - DAY

T'CHALLA sits on the throne, wearing the Black Panther suit. SHURI approaches with new technology.

SHURI
Brother, I've completed the new vibranium gauntlets.

T'CHALLA
Show me.

=== PAGE 2 ===
EXT. WAKANDA BORDER - FOREST - NIGHT

BORDER TRIBE WARRIORS patrol the perimeter. Suddenly, ERIK KILLMONGER emerges from the shadows.

KILLMONGER
I'm here to challenge for the throne.

OKOYE
Who dares challenge the king?

=== PAGE 3 ===
INT. WAKANDA PALACE - LABORATORY - DAY

SHURI works on new Black Panther technology. Multiple holographic displays show vibranium analysis.

SHURI
The new suit will absorb kinetic energy more efficiently.

She demonstrates the technology on a test dummy.
"""
        print(f"📝 Using test script: {len(script_text)} characters")
    
    print()
    
    # Step 2: Initialize ADK Eighths Calculator
    print("🔧 Initializing ADK Eighths Calculator Agent...")
    try:
        agent = create_adk_eighths_agent()
        print("✅ Agent initialized successfully")
    except Exception as e:
        print(f"❌ Agent initialization failed: {e}")
        return False
    
    print()
    
    # Step 3: Process script with page-by-page analysis
    print("🚀 Testing process_full_script() method...")
    print(f"   Script length: {len(script_text)} characters")
    print(f"   Estimated pages: {len(script_text.split('=== PAGE')) - 1}")
    print()
    
    try:
        # Prepare script data
        script_data = {
            "full_text": script_text,
            "estimated_pages": len(script_text) / 250,  # Rough estimate
            "source": "direct_test"
        }
        
        # Process with ADK agent
        result = agent.process_full_script(script_data)
        
        print("📊 ADK PROCESSING RESULT:")
        print("-" * 40)
        print(f"Status: {result.get('status', 'unknown')}")
        print(f"Message: {result.get('message', 'No message')}")
        print(f"Processing time: {result.get('processing_time', 0):.1f} seconds")
        print(f"Scenes processed: {result.get('scenes_processed', 0)}")
        print(f"Script length: {result.get('script_length', 0)} characters")
        print(f"Estimated pages: {result.get('estimated_pages', 0):.1f}")
        print()
        
        # Show eighths data
        if 'eighths_data' in result:
            eighths_data = result['eighths_data']
            print("🎯 EIGHTHS CALCULATION DETAILS:")
            print("-" * 40)
            if 'totals' in eighths_data:
                totals = eighths_data['totals']
                print(f"Total scenes: {totals.get('total_scenes', 0)}")
                print(f"Total script eighths: {totals.get('total_script_eighths', 0)}")
                print(f"Total adjusted eighths: {totals.get('total_adjusted_eighths', 0)}")
                print(f"Estimated shoot days: {totals.get('estimated_shoot_days', 0)}")
                print(f"Total production hours: {totals.get('total_production_hours', 0)}")
            
            print()
            print("📋 SCENE-BY-SCENE BREAKDOWN:")
            print("-" * 40)
            if 'scene_calculations' in eighths_data:
                for i, scene_calc in enumerate(eighths_data['scene_calculations'][:5]):  # Show first 5
                    scene = scene_calc['scene']
                    print(f"Scene {scene['scene_number']}:")
                    print(f"  • Page count: {scene.get('page_count', 0):.2f}")
                    print(f"  • Base eighths: {scene.get('base_eighths', 0):.1f}")
                    print(f"  • Adjusted eighths: {scene.get('adjusted_eighths', 0):.1f}")
                    print(f"  • Estimated hours: {scene.get('total_hours', 0):.1f}")
                    if 'eighths_on_page' in scene:
                        print(f"  • Eighths on page: {scene['eighths_on_page']}")
                    if 'page_number' in scene:
                        print(f"  • Page number: {scene['page_number']}")
                    print()
        
        # Show report if available
        if 'report' in result and result['report']:
            print("📄 GENERATED REPORT:")
            print("-" * 40)
            print(result['report'][:500] + "..." if len(result['report']) > 500 else result['report'])
        
        print()
        print("✅ Direct ADK test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error during ADK processing: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_adk_eighths_direct()