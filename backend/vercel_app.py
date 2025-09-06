"""
Vercel-compatible entry point for the FastAPI backend.
This file adapts the FastAPI app for serverless deployment on Vercel.
"""

from mangum import Mangum
from app import app

# Create the Mangum handler for Vercel
handler = Mangum(app, lifespan="off")

# Export for Vercel
def handler_func(event, context):
    return handler(event, context)
