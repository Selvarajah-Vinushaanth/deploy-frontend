"""
Metaphor Creator Model
This module generates creative metaphors based on a given topic and style using Hugging Face models.
"""
import torch
from typing import List
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline

# Define the model for text generation
# We're using GPT-2 as an example, but you could use a more advanced model like T5, BART, or GPT-3
MODEL_NAME = "gpt2"  # You can use more advanced models like "gpt2-large" or "EleutherAI/gpt-neo-1.3B"

# Initialize tokenizer and model (lazy loading - will load on first use)
tokenizer = None
model = None
generator = None

def load_model():
    """Load the model and tokenizer if not already loaded"""
    global tokenizer, model, generator
    if tokenizer is None or model is None:
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        model = AutoModelForCausalLM.from_pretrained(MODEL_NAME)
        generator = pipeline('text-generation', model=model, tokenizer=tokenizer)

def generate_metaphor(topic: str, style: str = "general", count: int = 3, target: str = None) -> List[str]:
    """
    Generate creative metaphors based on the given topic and style using a Hugging Face model.
    
    Args:
        topic: The subject of the metaphor
        style: Style category (general, romantic, nature)
        count: Number of metaphors to generate
        target: Optional target domain to relate the metaphor to
    
    Returns:
        List of generated metaphors
    """
    # Load model if not already loaded
    load_model()
    
    # Limit count to reasonable range
    count = max(1, min(5, count))
    
    # Create prompts based on style and whether target is provided
    prompts = []
    for _ in range(count):
        if target:
            if style == "romantic":
                prompt = f"Create a positive metaphor comparing {topic} to {target}. {topic} is like"
            elif style == "dark":
                prompt = f"Create a negative metaphor comparing {topic} to {target}. {topic} is like"
            else:  # general
                prompt = f"Create a metaphor comparing {topic} to {target}. {topic} is"
        else:
            if style == "romantic":
                prompt = f"Create a romantic metaphor about {topic}. {topic} is like"
            elif style == "nature":
                prompt = f"Create a nature-inspired metaphor about {topic}. {topic} is like"
            else:  # general
                prompt = f"Create a metaphor for {topic}. {topic} is"
        
        prompts.append(prompt)
    
    # Generate metaphors
    metaphors = []
    for prompt in prompts:
        try:
            # Generate text with the model
            output = generator(
                prompt,
                max_length=50,
                num_return_sequences=1,
                temperature=0.9,
                top_p=0.9,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )
            
            # Extract and clean up the generated text
            generated_text = output[0]['generated_text']
            
            # Remove the original prompt
            metaphor = generated_text[len(prompt):].strip()
            
            # Clean up: remove incomplete sentences, limit to 1-2 sentences
            metaphor = metaphor.split('.')[0] + '.'
            
            metaphors.append(prompt + " " + metaphor)
            
        except Exception as e:
            # Fallback in case of error
            metaphors.append(f"{topic} is like a mystery waiting to be explored.")
    
    return metaphors
