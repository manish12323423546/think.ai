
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
                all_text.append(f"=== PAGE {page_num + 1} ===\n{text}\n")
                print(f"   Page {page_num + 1}: {len(text)} characters")
            else:
                print(f"   Page {page_num + 1}: 0 characters (likely image-based)")
        
        doc.close()
        
        if all_text:
            full_text = "\n".join(all_text)
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
                    all_text.append(f"=== PAGE {page_num + 1} ===\n{text}\n")
                    print(f"   Page {page_num + 1}: {len(text)} characters")
            
            if all_text:
                full_text = "\n".join(all_text)
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
                    all_text.append(f"=== PAGE {page_num + 1} ===\n{text}\n")
                    print(f"   Page {page_num + 1}: {len(text)} characters")
            
            if all_text:
                full_text = "\n".join(all_text)
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
