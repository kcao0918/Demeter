"""
Advanced OCR utilities for medical document processing
Includes text processing, entity extraction, and result analysis
"""

import json
import re
from typing import List, Dict, Any, Tuple
from collections import Counter


class MedicalTextProcessor:
    """Process and analyze extracted medical text"""
    
    # Common medical entities and patterns
    MEDICAL_PATTERNS = {
        "patient_id": r"(Patient\s*ID|MRN|Medical\s*Record)[:=]?\s*([A-Z0-9\-]+)",
        "date": r"(\d{1,2}/\d{1,2}/\d{2,4}|\d{4}-\d{2}-\d{2})",
        "diagnosis": r"(Diagnosis|Assessment)[:=]?\s*([^\.]+\.?)",
        "medication": r"(Medication|Drug|Rx)[:=]?\s*([^,\n]+)",
        "dosage": r"(\d+\s*(?:mg|ml|g|mcg|IU|units?|tablet|capsule))",
        "lab_value": r"(\w+\s*[A-Z]*[:=]?\s*\d+\.?\d*\s*(?:mg|g|ml|dL|mmol|units?)?)",
        "phone": r"(\+?1?\s*\(?(\d{3})\)?[\s\-]?(\d{3})[\s\-]?(\d{4}))",
        "email": r"([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})"
    }
    
    @staticmethod
    def extract_medical_entities(text: str) -> Dict[str, List[str]]:
        """
        Extract medical entities from text using pattern matching
        
        Args:
            text: Raw OCR text
        
        Returns:
            Dictionary of extracted entities by type
        """
        entities = {}
        
        for entity_type, pattern in MedicalTextProcessor.MEDICAL_PATTERNS.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                if isinstance(matches[0], tuple):
                    # For grouped patterns, extract the second group
                    entities[entity_type] = list(set(match[1] if len(match) > 1 else match[0] for match in matches))
                else:
                    entities[entity_type] = list(set(matches))
        
        return entities
    
    @staticmethod
    def clean_text(text: str) -> str:
        """
        Clean OCR text by removing noise and normalizing whitespace
        
        Args:
            text: Raw OCR text
        
        Returns:
            Cleaned text
        """
        # Remove multiple spaces
        text = re.sub(r'\s+', ' ', text)
        # Remove leading/trailing whitespace per line
        text = '\n'.join(line.strip() for line in text.split('\n'))
        # Remove common OCR artifacts
        text = text.replace('|', 'l').replace('()0', 'O')
        
        return text.strip()
    
    @staticmethod
    def calculate_confidence_stats(text_blocks: List[Dict[str, Any]]) -> Dict[str, float]:
        """
        Calculate confidence statistics for OCR results
        
        Args:
            text_blocks: List of text blocks with confidence scores
        
        Returns:
            Dictionary with confidence statistics
        """
        if not text_blocks:
            return {
                "average_confidence": 0,
                "min_confidence": 0,
                "max_confidence": 0,
                "blocks_with_low_confidence": 0
            }
        
        confidences = [block.get("confidence", 0) for block in text_blocks]
        low_confidence_count = sum(1 for c in confidences if c < 0.8)
        
        return {
            "average_confidence": sum(confidences) / len(confidences),
            "min_confidence": min(confidences),
            "max_confidence": max(confidences),
            "blocks_with_low_confidence": low_confidence_count,
            "total_blocks": len(text_blocks)
        }
    
    @staticmethod
    def detect_language(text: str) -> Dict[str, Any]:
        """
        Detect potential language issues in OCR
        
        Args:
            text: Extracted text
        
        Returns:
            Dictionary with language detection info
        """
        # Simple heuristic: count non-ASCII characters
        non_ascii_count = sum(1 for c in text if ord(c) > 127)
        ascii_count = len([c for c in text if c.isalpha()])
        
        return {
            "non_ascii_percentage": (non_ascii_count / len(text) * 100) if text else 0,
            "likely_mixed_language": non_ascii_count > ascii_count * 0.1
        }


class MedicalOCRAnalyzer:
    """Analyze and visualize OCR processing results"""
    
    @staticmethod
    def generate_report(results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate comprehensive report from OCR results
        
        Args:
            results: List of OCR processing results
        
        Returns:
            Analysis report
        """
        successful = [r for r in results if not r["error"]]
        failed = [r for r in results if r["error"]]
        
        # Calculate statistics
        total_blocks = sum(r.get("total_blocks", 0) for r in successful)
        avg_confidence = 0
        
        # text_blocks is now just an array of words, no confidence scores
        all_confidences = []
        
        if all_confidences:
            avg_confidence = sum(all_confidences) / len(all_confidences)
        
        # Find most common entities
        all_entities = {}
        for result in successful:
            text = result.get("full_text", "")
            entities = MedicalTextProcessor.extract_medical_entities(text)
            for entity_type, values in entities.items():
                if entity_type not in all_entities:
                    all_entities[entity_type] = []
                all_entities[entity_type].extend(values)
        
        # Count entity frequencies
        entity_summary = {}
        for entity_type, values in all_entities.items():
            entity_summary[entity_type] = {
                "count": len(values),
                "unique_count": len(set(values)),
                "top_entries": Counter(values).most_common(5)
            }
        
        return {
            "summary": {
                "total_documents": len(results),
                "successful": len(successful),
                "failed": len(failed),
                "success_rate": (len(successful) / len(results) * 100) if results else 0
            },
            "text_metrics": {
                "total_text_blocks": total_blocks,
                "average_confidence": avg_confidence,
                "blocks_processed": len(all_confidences)
            },
            "entities_found": entity_summary,
            "failed_documents": [
                {"file": r["file_path"], "error": r["error"]}
                for r in failed
            ]
        }
    
    @staticmethod
    def export_report_to_json(report: Dict[str, Any], output_path: str = "ocr_report.json") -> None:
        """
        Export analysis report to JSON file
        
        Args:
            report: Analysis report dictionary
            output_path: Output file path
        """
        # Convert Counter objects to dicts for JSON serialization
        def convert_counters(obj):
            if isinstance(obj, dict):
                return {k: convert_counters(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_counters(item) for item in obj]
            elif isinstance(obj, Counter):
                return list(obj.items())
            else:
                return obj
        
        report_serializable = convert_counters(report)
        
        with open(output_path, 'w') as f:
            json.dump(report_serializable, f, indent=2)
        
        print(f"Report saved to {output_path}")


def process_and_analyze_ocr_results(ocr_results_path: str = "ocr_results.json") -> Dict[str, Any]:
    """
    Load OCR results and generate comprehensive analysis
    
    Args:
        ocr_results_path: Path to OCR results JSON file
    
    Returns:
        Comprehensive analysis report
    """
    with open(ocr_results_path, 'r') as f:
        results = json.load(f)
    
    # Generate analysis report
    analyzer = MedicalOCRAnalyzer()
    report = analyzer.generate_report(results)
    
    # Export report
    analyzer.export_report_to_json(report)
    
    # Print summary
    print("\n=== OCR Analysis Report ===")
    print(f"Total Documents: {report['summary']['total_documents']}")
    print(f"Successful: {report['summary']['successful']}")
    print(f"Failed: {report['summary']['failed']}")
    print(f"Success Rate: {report['summary']['success_rate']:.1f}%")
    print(f"\nAverage Confidence: {report['text_metrics']['average_confidence']:.2%}")
    print(f"Total Text Blocks: {report['text_metrics']['total_text_blocks']}")
    
    if report['entities_found']:
        print("\n=== Entities Found ===")
        for entity_type, stats in report['entities_found'].items():
            print(f"{entity_type}: {stats['count']} total ({stats['unique_count']} unique)")
    
    return report


if __name__ == "__main__":
    # Example usage
    report = process_and_analyze_ocr_results()
