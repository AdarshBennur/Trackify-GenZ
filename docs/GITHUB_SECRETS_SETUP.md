# 🔐 GitHub Secrets Setup for Docker Hub Authentication

This guide explains how to set up GitHub Secrets for your CI/CD pipeline to authenticate with Docker Hub.

## 🎯 Required Secrets

You need to create the following secrets in your GitHub repository:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `DOCKER_USERNAME` | Your Docker Hub username | `adarshbennur` |
| `DOCKER_PASSWORD` | Your Docker Hub Personal Access Token | `dckr_pat_xyz...` |

## 📋 Step-by-Step Setup

### Step 1: Create Docker Hub Personal Access Token

1. **Login to Docker Hub**: Go to [hub.docker.com](https://hub.docker.com)
2. **Navigate to Account Settings**: Click your profile → Account Settings
3. **Go to Security**: Click "Security" in the left sidebar
4. **Create New Access Token**:
   - Click "New Access Token"
   - Description: `GitHub Actions CI/CD`
   - Access permissions: `Read, Write, Delete`
   - Click "Generate"
5. **Copy the Token**: Save it securely (you won't see it again!)

### Step 2: Add Secrets to GitHub Repository

1. **Go to Repository Settings**: Navigate to your repository on GitHub
2. **Access Secrets**: Go to Settings → Secrets and variables → Actions
3. **Add Repository Secrets**:

   **Secret 1: DOCKER_USERNAME**
   ```
   Name: DOCKER_USERNAME
   Value: adarshbennur
   ```

   **Secret 2: DOCKER_PASSWORD**
   ```
   Name: DOCKER_PASSWORD
   Value: [Your Docker Hub Personal Access Token]
   ```

### Step 3: Verify Your Docker Hub Repository

Ensure your Docker Hub repository exists:
- Repository name: `adarshbennur/trackify-genz`
- Should be public or you have push permissions

## 🏷️ Docker Image Naming Convention

With the updated workflow, your Docker images will be tagged as:

```
adarshbennur/trackify-genz-client:latest
adarshbennur/trackify-genz-client:[commit-sha]
adarshbennur/trackify-genz-server:latest
adarshbennur/trackify-genz-server:[commit-sha]
```

## 🔍 Troubleshooting

### Common Issues

**1. "denied: requested access to the resource is denied"**
- ✅ **Solution**: Verify Docker Hub repository exists and is accessible
- ✅ **Check**: Repository name matches `adarshbennur/trackify-genz`
- ✅ **Verify**: Your Docker Hub account has push permissions

**2. "no basic auth credentials"**
- ✅ **Solution**: Ensure GitHub Secrets are properly set
- ✅ **Check**: Secret names are exactly `DOCKER_USERNAME` and `DOCKER_PASSWORD`
- ✅ **Verify**: Use Personal Access Token, not your account password

**3. "unauthorized: authentication required"**
- ✅ **Solution**: Regenerate Docker Hub Personal Access Token
- ✅ **Check**: Token has Read, Write, Delete permissions
- ✅ **Update**: GitHub Secret with new token

### Verification Steps

1. **Check Secrets are Set**:
   - Go to GitHub → Repository → Settings → Secrets and variables → Actions
   - Verify both `DOCKER_USERNAME` and `DOCKER_PASSWORD` appear in the list

2. **Test Docker Hub Login Locally**:
   ```bash
   echo "YOUR_TOKEN" | docker login --username adarshbennur --password-stdin
   ```

3. **Verify Repository Access**:
   ```bash
   docker pull adarshbennur/trackify-genz-client:latest || echo "Repository ready for first push"
   ```

## 🚀 Testing the Pipeline

After setting up secrets:

1. **Push a commit** to trigger the workflow
2. **Check Actions tab** in your GitHub repository
3. **Verify Docker Hub** - images should appear in your repository

## 🔒 Security Best Practices

- ✅ **Use Personal Access Tokens**: Never use your Docker Hub password
- ✅ **Limit Token Scope**: Only grant necessary permissions
- ✅ **Rotate Tokens**: Regularly update access tokens
- ✅ **Monitor Usage**: Check Docker Hub for unexpected activity

## 🆘 Need Help?

If issues persist:
1. Check the [GitHub Actions logs](../../actions) for detailed error messages
2. Verify Docker Hub repository settings
3. Ensure secrets are correctly named and set
4. Try regenerating Docker Hub Personal Access Token

---

**🎉 Success Indicator**: When properly configured, you should see ✅ green checkmarks in your GitHub Actions workflow and new Docker images in your Docker Hub repository! 