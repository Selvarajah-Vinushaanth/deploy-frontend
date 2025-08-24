import time
from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.utils.helpers import logger


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """Middleware for catching and handling exceptions."""

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            response.headers["X-Process-Time"] = str(process_time)
            return response
            
        except Exception as e:
            logger.exception(f"Unhandled error: {str(e)}")
            
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": "Internal server error occurred."}
            )


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging requests and responses."""

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Log request
        logger.info(f"Request: {request.method} {request.url.path}")
        
        response = await call_next(request)
        
        # Log response
        process_time = time.time() - start_time
        logger.info(
            f"Response: {request.method} {request.url.path} "
            f"- Status: {response.status_code} - Time: {process_time:.3f}s"
        )
        
        return response
