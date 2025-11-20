# Quick sync script to copy code changes to Docker volume
# Run this after making code changes: .\sync-to-docker.ps1

Write-Host "Syncing backend code to Docker..." -ForegroundColor Cyan

# Create a temporary container to copy files
$containerName = "adjustflow_backend"
$tempContainer = "temp_sync_$(Get-Random)"

# Check if backend container exists
$exists = docker ps -a --filter "name=$containerName" --format "{{.Names}}"
if (-not $exists) {
    Write-Host "Backend container not found. Starting services..." -ForegroundColor Yellow
    docker-compose up -d backend
    Start-Sleep -Seconds 5
}

# Copy backend files
Write-Host "Copying backend files..." -ForegroundColor Green
docker run --rm -v "${PWD}\backend:/source" -v "adjustflow_backend_code:/target" alpine sh -c "cp -r /source/* /target/ 2>/dev/null || true"

Write-Host "Done! Restart backend with: docker-compose restart backend" -ForegroundColor Green

