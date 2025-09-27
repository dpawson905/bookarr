# Docker Hub Authentication Setup for GitHub Actions

This guide explains how to set up GitHub Actions to automatically build and push Docker images to Docker Hub.

## Prerequisites

1. **Docker Hub Account**: You need a Docker Hub account
2. **Docker Hub Repository**: Create a repository named `bookarr` under your account
3. **GitHub Repository**: This repository must be on GitHub (not just local)

## Step 1: Create Docker Hub Access Token

1. **Login to Docker Hub**: Go to [hub.docker.com](https://hub.docker.com)
2. **Go to Account Settings**: Click on your profile → Account Settings
3. **Security Tab**: Click on "Security" in the left sidebar
4. **New Access Token**: Click "New Access Token"
5. **Configure Token**:
   - **Access Token Description**: `GitHub Actions - Bookarr`
   - **Access Permissions**: `Read, Write, Delete` (or at least `Read, Write`)
6. **Generate Token**: Click "Generate" and **copy the token immediately** (you won't see it again!)

## Step 2: Add Secrets to GitHub Repository

1. **Go to Your Repository**: Navigate to your GitHub repository
2. **Settings Tab**: Click on "Settings" (top right of repository)
3. **Secrets and Variables**: In the left sidebar, click "Secrets and variables" → "Actions"
4. **New Repository Secret**: Click "New repository secret"
5. **Add Two Secrets**:

   **Secret 1: DOCKER_USERNAME**
   - **Name**: `DOCKER_USERNAME`
   - **Secret**: Your Docker Hub username (e.g., `dpawson905`)

   **Secret 2: DOCKER_PASSWORD**
   - **Name**: `DOCKER_PASSWORD`
   - **Secret**: The access token you generated in Step 1

## Step 3: Verify Setup

1. **Push to Main Branch**: Push any commit to the `main` branch
2. **Check Actions Tab**: Go to the "Actions" tab in your repository
3. **Monitor Workflow**: You should see "Build and Push Docker Image" workflow running
4. **Check Docker Hub**: After completion, verify the image appears in your Docker Hub repository

## Step 4: Test Different Triggers

The workflow triggers on:
- **Push to main branch**: Creates `latest` and `develop` tags
- **Push to develop branch**: Creates `develop` tag
- **Git tags (v*)**: Creates version tags (e.g., `v1.0.0`, `v1.0`, `v1`)

### Creating a Release

To create a new release:

```bash
# Create and push a tag
git tag v1.0.0
git push origin v1.0.0
```

This will automatically:
- Build the Docker image
- Push `dpawson905/bookarr:v1.0.0`
- Push `dpawson905/bookarr:latest` (if on main branch)

## Troubleshooting

### Common Issues

1. **"Username and password required"**
   - Verify `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets are set
   - Check that the Docker Hub access token has correct permissions

2. **"Repository not found"**
   - Ensure the repository `dpawson905/bookarr` exists on Docker Hub
   - Verify the username in the workflow matches your Docker Hub username

3. **"Permission denied"**
   - Check that the access token has `Write` permissions
   - Verify the token hasn't expired

4. **Workflow not triggering**
   - Ensure you're pushing to the correct branch (`main` or `develop`)
   - Check that the workflow file is in `.github/workflows/`

### Manual Push (Alternative)

If you prefer to push manually instead of using GitHub Actions:

```bash
# Login to Docker Hub
docker login

# Build and push
./scripts/docker-push.sh v1.0.0
```

## Security Notes

- **Never commit secrets**: The access token should only be stored in GitHub Secrets
- **Use least privilege**: Only give the access token the minimum required permissions
- **Rotate tokens**: Regularly rotate your Docker Hub access tokens
- **Monitor usage**: Check Docker Hub for unexpected activity

## Available Docker Hub Tags

After setup, these tags will be automatically created:

- `dpawson905/bookarr:latest` - Latest from main branch
- `dpawson905/bookarr:develop` - Latest from develop branch  
- `dpawson905/bookarr:v1.0.0` - Specific version tags
- `dpawson905/bookarr:v1.0` - Major.minor version
- `dpawson905/bookarr:v1` - Major version only
