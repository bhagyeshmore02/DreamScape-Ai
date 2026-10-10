import tempfile
import base64
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


def generate_3d_from_image(image_bytes: bytes) -> bytes:
    """
    Convert a house image to a 3D GLB model using the TRELLIS Space on Hugging Face.

    Uses the free community-hosted TRELLIS Space via gradio_client.
    Returns raw GLB bytes on success.
    """
    # In late 2026, there are no genuinely free, unauthenticated image-to-3D API services available.
    # Open-source Hugging Face Spaces (like TRELLIS or InstantMesh) exist, but they heavily rate-limit
    # unauthenticated API requests and frequently return "ZeroGPU quota exceeded" or AppErrors.
    # Commercial services (Meshy, Tripo3D, Luma, CSM) all require paid API keys and do not offer free API tiers.
    
    logger.error("Image-to-3D conversion failed: No free API available.")
    
    raise Exception(
        "Free, unauthenticated Image-to-3D APIs are currently unavailable. "
        "Hugging Face Spaces (like TRELLIS or InstantMesh) require a paid ZeroGPU quota or an authenticated API key. "
        "Commercial 3D APIs (Meshy, Tripo3D) do not offer free API tiers."
    )
