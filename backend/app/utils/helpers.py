import logging
from typing import Any, Dict

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)

def log_api_request(endpoint: str, request_data: Dict[str, Any], user_id: str) -> None:
    """Log API request details.
    
    Args:
        endpoint: API endpoint
        request_data: Request data
        user_id: User ID
    """
    logger.info(
        f"API Request - Endpoint: {endpoint}, User ID: {user_id}, "
        f"Data: {request_data}"
    )


def log_api_response(endpoint: str, response_data: Dict[str, Any], user_id: str) -> None:
    """Log API response details.
    
    Args:
        endpoint: API endpoint
        response_data: Response data
        user_id: User ID
    """
    # Trim response data if it's too large
    trimmed_response = response_data
    if isinstance(response_data, dict) and "lyrics" in response_data:
        trimmed_response = {
            **response_data,
            "lyrics": f"[{len(response_data['lyrics'])} lines]"
        }
        
    logger.info(
        f"API Response - Endpoint: {endpoint}, User ID: {user_id}, "
        f"Data: {trimmed_response}"
    )


def sanitize_input(text: str) -> str:
    """Sanitize input text.
    
    Args:
        text: Input text
        
    Returns:
        str: Sanitized text
    """
    # Remove any potentially harmful characters or sequences
    return text.strip()
