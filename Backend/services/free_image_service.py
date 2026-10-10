import urllib.parse
import httpx
import logging

logger = logging.getLogger(__name__)

def generate_exterior_image_free(prompt: str) -> bytes:
    """Generate a photorealistic exterior render using Pollinations.ai (Free, no API key)."""
    
    encoded_prompt = urllib.parse.quote(prompt.strip())
    
    # Pollinations.ai provides free unauthenticated image generation using their URL structure
    url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&nologo=true"
    
    try:
        # Increase timeout because image generation can take a few seconds
        response = httpx.get(url, timeout=30.0)
        response.raise_for_status()
        
        # Make sure we got an image back, not a tiny error string
        if len(response.content) < 1000:
            raise ValueError(f"Received suspiciously small response: {len(response.content)} bytes")
            
        return response.content
    except Exception as e:
        logger.error(f"Free image provider failed: {str(e)}")
        raise e
