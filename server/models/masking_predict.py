"""
Masking Predict Model
This module predicts masked tokens in a sentence using Tamil-BERT fine-tuned model from Hugging Face.
"""
import torch
from typing import List
from transformers import AutoTokenizer, AutoModelForMaskedLM, pipeline
import re

# Define the model for masked token prediction
MODEL_NAME = "vimosh-v/tamil-bert-finetuned-v1"

# Initialize tokenizer and model (lazy loading - will load on first use)
tokenizer = None
model = None
fill_mask_pipeline = None

# Predefined suggestions for fallback
PREDEFINED_SUGGESTIONS = {
    "english": {
        "go": ["go", "walk", "run", "travel", "drive"],
        "read": ["read", "opened", "purchased", "borrowed", "wrote"],
        "eat": ["eat", "cook", "prepare", "buy", "order"],
        "study": ["study", "learn", "practice", "teach", "understand"]
    },
    "tamil": {
        "செல்": ["செல்கிறேன்", "போகிறேன்", "நடக்கிறேன்", "ஓடுகிறேன்", "பயணிக்கிறேன்"],
        "படி": ["படிக்கிறேன்", "கற்கிறேன்", "பயில்கிறேன்", "ஆராய்கிறேன்", "தேர்கிறேன்"],
        "சாப்பிடு": ["சாப்பிட்டார்", "உண்டார்", "ருசித்தார்", "விரும்பினார்", "தேர்ந்தெடுத்தார்"]
    }
}

def load_model():
    """Load the model and tokenizer if not already loaded"""
    global tokenizer, model, fill_mask_pipeline
    if tokenizer is None or model is None:
        try:
            tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
            model = AutoModelForMaskedLM.from_pretrained(MODEL_NAME)
            fill_mask_pipeline = pipeline('fill-mask', model=model, tokenizer=tokenizer)
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            # Fall back to simpler model if specific model fails
            try:
                tokenizer = AutoTokenizer.from_pretrained("bert-base-multilingual-cased")
                model = AutoModelForMaskedLM.from_pretrained("bert-base-multilingual-cased")
                fill_mask_pipeline = pipeline('fill-mask', model=model, tokenizer=tokenizer)
            except Exception as e2:
                print(f"Error loading fallback model: {str(e2)}")
                # No model loaded, will use predefined suggestions

def predict_masked_tokens(sentence: str, top_k: int = 5) -> List[str]:
    """
    Predict the most likely words to fill in the [mask] token in a sentence.
    
    Args:
        sentence: The input sentence with [mask] token
        top_k: Number of suggestions to return
    
    Returns:
        List of predicted words/tokens
    """
    # Return empty list if no mask token
    if "[mask]" not in sentence:
        return []
    
    # Limit top_k to reasonable range
    top_k = max(1, min(10, top_k))
    
    # Determine if the sentence is Tamil or English
    is_tamil = bool(re.search(r'[\u0B80-\u0BFF]', sentence))
    
    # Try to load model if not already loaded
    try:
        load_model()
    except Exception as e:
        print(f"Could not load model: {str(e)}")
        # Fall back to predefined suggestions based on context
    
    # Convert [mask] to model-specific mask token
    if fill_mask_pipeline is not None:
        try:
            mask_token = tokenizer.mask_token
            model_input = sentence.replace("[mask]", mask_token)
            
            # Get predictions from the model
            predictions = fill_mask_pipeline(model_input, top_k=top_k)
            
            # Extract the predicted tokens
            if isinstance(predictions[0], list):
                # Handle case where multiple masks return nested lists
                predicted_tokens = [pred['token_str'] for pred in predictions[0]]
            else:
                predicted_tokens = [pred['token_str'] for pred in predictions]
            
            return predicted_tokens
        except Exception as e:
            print(f"Error in prediction: {str(e)}")
            # Fall back to predefined suggestions
    
    # Fallback: Use predefined suggestions based on context
    if is_tamil:
        # Check for Tamil context words
        for key, suggestions in PREDEFINED_SUGGESTIONS["tamil"].items():
            if key in sentence:
                return suggestions[:top_k]
        # Default Tamil suggestions if no context match
        return PREDEFINED_SUGGESTIONS["tamil"]["செல்"][:top_k]
    else:
        # Check for English context words
        for key, suggestions in PREDEFINED_SUGGESTIONS["english"].items():
            if key in sentence:
                return suggestions[:top_k]
        # Default English suggestions if no context match
        return PREDEFINED_SUGGESTIONS["english"]["go"][:top_k]
