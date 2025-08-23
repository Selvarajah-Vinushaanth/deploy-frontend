"""
Lyric Generator Model
This module generates song lyrics based on a theme and style using Hugging Face models.
"""
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline

# Define the model for lyric generation
# We're using GPT-2 as an example, but you could use a more advanced model like T5, BART, or GPT-3
MODEL_NAME = "gpt2-medium"  # Larger model for better quality lyrics

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

def generate_lyrics(theme: str, style: str = "pop", length: int = 3, seed: str = "") -> str:
    """
    Generate song lyrics based on the given theme and style.
    
    Args:
        theme: The main theme or topic of the lyrics
        style: Music style/genre (pop, rock, rap, etc.)
        length: Number of verses to generate
        seed: Optional starting line or phrase for the lyrics
    
    Returns:
        Generated lyrics as a string
    """
    # Load model if not already loaded
    load_model()
    
    # Limit length to reasonable range
    length = max(1, min(5, length))
    
    # Create a prompt based on theme and style
    style_prompts = {
        "pop": f"Write a catchy pop song about {theme} with chorus:",
        "rock": f"Write a powerful rock song about {theme} with lyrics:",
        "rap": f"Write rap lyrics about {theme}:",
        "country": f"Write a country song about {theme} with lyrics:",
        "folk": f"Write a folk song that tells a story about {theme}:",
        "indie": f"Write indie song lyrics about {theme}:",
        "r&b": f"Write smooth R&B lyrics about {theme}:",
        "modern": f"Write modern song lyrics about {theme}:",
        "classical": f"Write classical style lyrics about {theme}:",
        "romantic": f"Write romantic lyrics about {theme}:",
        "philosophical": f"Write philosophical lyrics about {theme}:"
    }
    
    # Get the appropriate prompt or default to generic
    prompt = style_prompts.get(style.lower(), f"Write song lyrics about {theme}:")
    
    # Add seed text if provided
    if seed:
        prompt = f"{prompt}\n\n{seed}"
    
    try:
        # Generate the lyrics
        output = generator(
            prompt,
            max_length=200 + (length * 100),  # Scale length based on verses
            num_return_sequences=1,
            temperature=0.9,
            top_p=0.92,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id
        )
        
        # Extract and clean up the generated text
        generated_text = output[0]['generated_text']
        
        # Remove the original prompt and clean up
        lyrics = generated_text[len(prompt):].strip()
        
        # Format the lyrics nicely
        lyrics_lines = lyrics.split('\n')
        formatted_lyrics = []
        
        for line in lyrics_lines:
            # Skip empty lines at the beginning
            if not formatted_lyrics and not line.strip():
                continue
            formatted_lyrics.append(line)
        
        return '\n'.join(formatted_lyrics)
        
    except Exception as e:
        # Fallback lyrics in case of error
        return f"Song about {theme}\n\nVerse 1:\nWords fail to express\nThe feelings inside\nThis song is a mess\nBut at least I tried\n\nChorus:\nOh {theme}, oh {theme}\nYou're on my mind all the time\nOh {theme}, oh {theme}\nIn my heart you will shine"
