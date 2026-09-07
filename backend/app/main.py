"""
ROAMEO FastAPI Application — Main Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import profiles, sellers, products, destinations, travel_plans, budgets, shops, orders, notifications, search

app = FastAPI(
    title="ROAMEO API",
    description="Roam + Experience the Originals — Tourism Discovery & Marketplace API",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "ROAMEO API", "version": "1.0.0"}


# Register routes
app.include_router(profiles.router, prefix="/api", tags=["Profiles"])
app.include_router(sellers.router, prefix="/api", tags=["Sellers"])
app.include_router(products.router, prefix="/api", tags=["Products"])
app.include_router(destinations.router, prefix="/api", tags=["Destinations"])
app.include_router(travel_plans.router, prefix="/api", tags=["Travel Plans"])
app.include_router(budgets.router, prefix="/api", tags=["Budgets"])
app.include_router(shops.router, prefix="/api", tags=["Shops"])
app.include_router(orders.router, prefix="/api", tags=["Orders"])
app.include_router(notifications.router, prefix="/api", tags=["Notifications"])
app.include_router(search.router, prefix="/api", tags=["Search"])


# Mangum handler for Netlify serverless
try:
    from mangum import Mangum
    handler = Mangum(app)
except ImportError:
    pass
