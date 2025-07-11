#!/usr/bin/env python3
"""
Test multiple PDF extraction methods to solve the PDF issue
"""

import os
from datetime import datetime

def test_pypdf2():
    """Test PyPDF2 method (current failing method)."""
    print("🔧 Testing PyPDF2...")
    try:
        import PyPDF2
        pdf_path = "/Users/varunisrani/Desktop/mckays-app-template 3/BLACK_PANTHER.pdf"
        
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            print(f"   Pages: {len(pdf_reader.pages)}")
            
            # Test first few pages
            for i in range(min(3, len(pdf_reader.pages))):
                page = pdf_reader.pages[i]
                text = page.extract_text()
                print(f"   Page {i+1}: {len(text)} characters")
                if text.strip():
                    print(f"   Preview: {text[:100]}...")
                    return text
        
        print("   ❌ PyPDF2: No text found")
        return None
        
    except Exception as e:
        print(f"   ❌ PyPDF2 error: {e}")
        return None

def test_pdfplumber():
    """Test pdfplumber method."""
    print("🔧 Testing pdfplumber...")
    try:
        import pdfplumber
        pdf_path = "/Users/varunisrani/Desktop/mckays-app-template 3/BLACK_PANTHER.pdf"
        
        with pdfplumber.open(pdf_path) as pdf:
            print(f"   Pages: {len(pdf.pages)}")
            
            # Test first few pages
            for i in range(min(3, len(pdf.pages))):
                page = pdf.pages[i]
                text = page.extract_text()
                char_count = len(text) if text else 0
                print(f"   Page {i+1}: {char_count} characters")
                if text and text.strip():
                    print(f"   Preview: {text[:100]}...")
                    return text
        
        print("   ❌ pdfplumber: No text found")
        return None
        
    except Exception as e:
        print(f"   ❌ pdfplumber error: {e}")
        return None

def test_pymupdf():
    """Test PyMuPDF method."""
    print("🔧 Testing PyMuPDF (fitz)...")
    try:
        import fitz  # PyMuPDF
        pdf_path = "/Users/varunisrani/Desktop/mckays-app-template 3/BLACK_PANTHER.pdf"
        
        doc = fitz.open(pdf_path)
        print(f"   Pages: {doc.page_count}")
        
        # Test first few pages
        for i in range(min(3, doc.page_count)):
            page = doc[i]
            text = page.get_text()
            char_count = len(text) if text else 0
            print(f"   Page {i+1}: {char_count} characters")
            if text and text.strip():
                print(f"   Preview: {text[:100]}...")
                return text
        
        doc.close()
        print("   ❌ PyMuPDF: No text found")
        return None
        
    except Exception as e:
        print(f"   ❌ PyMuPDF error: {e}")
        return None

def test_pymupdf_ocr():
    """Test PyMuPDF with OCR for image-based PDFs."""
    print("🔧 Testing PyMuPDF with OCR...")
    try:
        import fitz  # PyMuPDF
        pdf_path = "/Users/varunisrani/Desktop/mckays-app-template 3/BLACK_PANTHER.pdf"
        
        doc = fitz.open(pdf_path)
        print(f"   Pages: {doc.page_count}")
        
        # Test first page with OCR
        page = doc[0]
        
        # Check if page has images (indication it might be scanned)
        image_list = page.get_images()
        print(f"   Page 1 has {len(image_list)} images")
        
        if image_list:
            print("   🖼️  PDF appears to be image-based (scanned)")
            
            # Try to get text blocks with coordinates
            text_dict = page.get_text("dict")
            blocks = text_dict.get("blocks", [])
            print(f"   Found {len(blocks)} text blocks")
            
            # Try extracting as image and using OCR (if available)
            try:
                pix = page.get_pixmap()
                img_data = pix.tobytes("png")
                print(f"   Extracted page as image: {len(img_data)} bytes")
                print("   ⚠️  Would need OCR library (pytesseract) for text extraction")
            except Exception as e:
                print(f"   Image extraction error: {e}")
        
        doc.close()
        return None
        
    except Exception as e:
        print(f"   ❌ PyMuPDF OCR error: {e}")
        return None

def test_pdf_info():
    """Get detailed PDF information."""
    print("🔧 Analyzing PDF structure...")
    try:
        import fitz
        pdf_path = "/Users/varunisrani/Desktop/mckays-app-template 3/BLACK_PANTHER.pdf"
        
        doc = fitz.open(pdf_path)
        metadata = doc.metadata
        
        print("📋 PDF Information:")
        print(f"   Title: {metadata.get('title', 'N/A')}")
        print(f"   Author: {metadata.get('author', 'N/A')}")
        print(f"   Creator: {metadata.get('creator', 'N/A')}")
        print(f"   Producer: {metadata.get('producer', 'N/A')}")
        print(f"   Encrypted: {doc.needs_pass}")
        print(f"   Page count: {doc.page_count}")
        
        # Check first page structure
        page = doc[0]
        text_dict = page.get_text("dict")
        
        print(f"   Page 1 fonts: {len(text_dict.get('fonts', []))}")
        print(f"   Page 1 blocks: {len(text_dict.get('blocks', []))}")
        
        # Check for forms/annotations
        widgets = page.widgets()
        print(f"   Page 1 widgets: {len(widgets)}")
        
        doc.close()
        
    except Exception as e:
        print(f"   ❌ PDF info error: {e}")

def create_working_pdf_extractor():
    """Create an improved PDF extractor function."""
    print("\n🚀 Creating improved PDF extractor...")
    
    extractor_code = '''
def extract_pdf_text_robust(pdf_path: str) -> str:
    """
    Robust PDF text extraction using multiple methods.
    """
    import os
    
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF not found: {pdf_path}")
    
    print(f"📄 Extracting text from {pdf_path}")
    
    # Method 1: Try PyMuPDF first (most robust)
    try:
        import fitz
        doc = fitz.open(pdf_path)
        print(f"   PyMuPDF: {doc.page_count} pages")
        
        all_text = []
        for page_num in range(doc.page_count):
            page = doc[page_num]
            text = page.get_text()
            if text and text.strip():
                all_text.append(f"=== PAGE {page_num + 1} ===\\n{text}\\n")
                print(f"   Page {page_num + 1}: {len(text)} characters")
            else:
                print(f"   Page {page_num + 1}: 0 characters (likely image-based)")
        
        doc.close()
        
        if all_text:
            full_text = "\\n".join(all_text)
            print(f"✅ PyMuPDF extracted {len(full_text)} characters total")
            return full_text
    
    except Exception as e:
        print(f"❌ PyMuPDF failed: {e}")
    
    # Method 2: Try pdfplumber
    try:
        import pdfplumber
        with pdfplumber.open(pdf_path) as pdf:
            print(f"   pdfplumber: {len(pdf.pages)} pages")
            
            all_text = []
            for page_num, page in enumerate(pdf.pages):
                text = page.extract_text()
                if text and text.strip():
                    all_text.append(f"=== PAGE {page_num + 1} ===\\n{text}\\n")
                    print(f"   Page {page_num + 1}: {len(text)} characters")
            
            if all_text:
                full_text = "\\n".join(all_text)
                print(f"✅ pdfplumber extracted {len(full_text)} characters total")
                return full_text
    
    except Exception as e:
        print(f"❌ pdfplumber failed: {e}")
    
    # Method 3: Try PyPDF2 as fallback
    try:
        import PyPDF2
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            print(f"   PyPDF2: {len(pdf_reader.pages)} pages")
            
            all_text = []
            for page_num, page in enumerate(pdf_reader.pages):
                text = page.extract_text()
                if text and text.strip():
                    all_text.append(f"=== PAGE {page_num + 1} ===\\n{text}\\n")
                    print(f"   Page {page_num + 1}: {len(text)} characters")
            
            if all_text:
                full_text = "\\n".join(all_text)
                print(f"✅ PyPDF2 extracted {len(full_text)} characters total")
                return full_text
    
    except Exception as e:
        print(f"❌ PyPDF2 failed: {e}")
    
    # If all methods fail
    print("❌ All PDF extraction methods failed")
    print("💡 This PDF might be:")
    print("   - Image-based/scanned (needs OCR)")
    print("   - Encrypted/password protected")
    print("   - Corrupted")
    print("   - Using unsupported encoding")
    
    return ""
'''
    
    with open("/Users/varunisrani/Desktop/mckays-app-template 3/sd1/improved_pdf_extractor.py", "w") as f:
        f.write(extractor_code)
    
    print("✅ Created improved_pdf_extractor.py")

def main():
    """Test all PDF extraction methods."""
    print("🎬 PDF EXTRACTION TESTING")
    print("=" * 60)
    print(f"Timestamp: {datetime.now().strftime('%Y%m%d_%H%M%S')}")
    print()
    
    # Test PDF info first
    test_pdf_info()
    print()
    
    # Test different extraction methods
    methods = [
        ("PyPDF2", test_pypdf2),
        ("pdfplumber", test_pdfplumber), 
        ("PyMuPDF", test_pymupdf),
        ("PyMuPDF OCR", test_pymupdf_ocr)
    ]
    
    working_text = None
    for name, method in methods:
        print(f"🧪 Testing {name}...")
        result = method()
        if result:
            working_text = result
            print(f"✅ {name} WORKS!")
            break
        print()
    
    if working_text:
        print("🎉 SUCCESS! Found working extraction method")
        print(f"📝 Extracted text length: {len(working_text)} characters")
        print(f"📄 Preview: {working_text[:200]}...")
    else:
        print("❌ ALL METHODS FAILED")
        print("💡 This appears to be an image-based/scanned PDF")
    
    # Create improved extractor
    create_working_pdf_extractor()

if __name__ == "__main__":
    main()