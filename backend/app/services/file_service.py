import os
import aiofiles
from pathlib import Path
from typing import Optional
import shutil
from app.core.config import settings

class FileService:
    """Service for handling file operations."""
    
    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.upload_dir.mkdir(exist_ok=True)
    
    async def save_uploaded_file(self, content: bytes, filename: str) -> str:
        """
        Save uploaded file content to disk.
        
        Args:
            content: File content as bytes
            filename: Name for the saved file
            
        Returns:
            Full path to the saved file
        """
        file_path = self.upload_dir / filename
        
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(content)
        
        return str(file_path)
    
    async def delete_file(self, file_path: str) -> bool:
        """
        Delete a file from disk.
        
        Args:
            file_path: Path to the file to delete
            
        Returns:
            True if file was deleted, False otherwise
        """
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception:
            return False
    
    def get_file_path(self, filename: str) -> str:
        """Get full path for a filename."""
        return str(self.upload_dir / filename)
    
    def file_exists(self, filename: str) -> bool:
        """Check if a file exists."""
        return (self.upload_dir / filename).exists()
    
    async def move_file(self, source_path: str, destination_path: str) -> bool:
        """Move a file from source to destination."""
        try:
            shutil.move(source_path, destination_path)
            return True
        except Exception:
            return False