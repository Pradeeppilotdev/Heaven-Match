# Fix Permission Error for Node.js

## Problem
You're getting this error:
```
Error: EPERM: operation not permitted, lstat 'C:\Users\Administrator\AppData'
```

This happens when Node.js tries to access the Administrator's AppData folder but doesn't have permission.

## Solutions

### Solution 1: Run PowerShell as Administrator (Quickest Fix)

1. **Close current PowerShell window**
2. **Right-click on PowerShell** in Start Menu
3. **Select "Run as Administrator"**
4. **Navigate to project:**
   ```powershell
   cd C:\Users\System6\Desktop\contact
   ```
5. **Start the server:**
   ```powershell
   npm.cmd start
   ```

### Solution 2: Use npx directly

Try running react-scripts directly with npx:

```powershell
cd C:\Users\System6\Desktop\contact
npx.cmd react-scripts start
```

### Solution 3: Set NODE_OPTIONS environment variable

In PowerShell, run:

```powershell
$env:NODE_OPTIONS="--no-warnings"
cd C:\Users\System6\Desktop\contact
npm.cmd start
```

### Solution 4: Clear npm cache and reinstall

```powershell
cd C:\Users\System6\Desktop\contact
npm.cmd cache clean --force
Remove-Item -Recurse -Force node_modules
npm.cmd install
npm.cmd start
```

### Solution 5: Use a different Node.js version or reinstall

If the above don't work, you may need to:
1. Uninstall Node.js completely
2. Reinstall Node.js from https://nodejs.org/
3. Make sure to install it for your user account, not Administrator
4. During installation, check "Add to PATH"

### Solution 6: Use Yarn instead of npm

If you have Yarn installed:

```powershell
cd C:\Users\System6\Desktop\contact
yarn install
yarn start
```

## Recommended: Try Solution 1 First

Running PowerShell as Administrator is usually the quickest fix for this permission issue.

