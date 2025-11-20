"""
Celery application configuration for AdjustFlow
"""
from celery import Celery
from app.core.config import settings

# Create Celery instance
celery_app = Celery(
    "adjustflow",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[]  # Tasks will be added here as they're created
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
)

# Optional: Add periodic tasks here when needed
# celery_app.conf.beat_schedule = {
#     'example-task': {
#         'task': 'app.tasks.example_task',
#         'schedule': 3600.0,  # Run every hour
#     },
# }

