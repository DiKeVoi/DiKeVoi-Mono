from fastapi import FastAPI

from app.api.routes import (
    auth,
    health,
    notification,
    report,
    ride_posts,
    rides,
    user_rating,
    vehicle,
)
from app.core.config import settings

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(ride_posts.router)
app.include_router(rides.router)
app.include_router(notification.router)
app.include_router(report.router)
app.include_router(vehicle.router)
app.include_router(user_rating.router)
