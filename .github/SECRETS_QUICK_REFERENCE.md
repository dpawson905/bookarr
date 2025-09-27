# GitHub Secrets Quick Reference

## Required Secrets for Docker Hub Publishing

Add these secrets in your GitHub repository settings:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `DOCKER_USERNAME` | `dpawson905` | Your Docker Hub username |
| `DOCKER_PASSWORD` | `dckr_pat_...` | Your Docker Hub access token |

## How to Add Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the exact name and value

## Creating Docker Hub Access Token

1. Go to [hub.docker.com](https://hub.docker.com)
2. Click your profile → **Account Settings** → **Security**
3. Click **New Access Token**
4. Set permissions to **Read, Write, Delete**
5. Copy the token (starts with `dckr_pat_`)

## Testing the Setup

After adding secrets, push to the `main` branch:

```bash
git add .
git commit -m "Test GitHub Actions"
git push origin main
```

Check the **Actions** tab to see the build progress.

## Troubleshooting

- **"Username and password required"**: Check that both secrets are set correctly
- **"Repository not found"**: Ensure `dpawson905/bookarr` exists on Docker Hub
- **"Permission denied"**: Verify the access token has Write permissions
