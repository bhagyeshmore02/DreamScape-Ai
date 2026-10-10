import os
import httpx
from openai import OpenAI

def generate_exterior_image_openai(prompt: str) -> bytes:
    """Generate a photorealistic exterior render using OpenAI DALL-E 3."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY is missing from your .env file. Please add it to generate photorealistic exterior renders.")
        
    client = OpenAI(api_key=api_key)
    
    response = client.images.generate(
        model="gpt-image-2",
        prompt=prompt,
        size="1024x1024",
        quality="high",
        n=1,
    )
    
    image_url = response.data[0].url
    if not image_url:
        raise ValueError("No image URL returned by OpenAI.")
        
    # Download the image to return as bytes so it can be seamlessly base64 encoded
    img_response = httpx.get(image_url)
    img_response.raise_for_status()
    return img_response.content
