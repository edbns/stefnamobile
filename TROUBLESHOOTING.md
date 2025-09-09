# Stefna Mobile App - Troubleshooting Guide

## 🚨 Common Errors & Solutions

### **Error: "userId parameter is required"**
**Symptom**: Media gallery won't load, API returns 400 error

**Root Cause**: Backend function expects userId parameter but mobile app doesn't send it

**Solution**:
1. Update backend function to use JWT authentication:
```javascript
// Add to backend function
import { requireAuth } from './_lib/auth';
const auth = requireAuth(event.headers.authorization);
const userId = auth.userId;
```

2. Remove userId from mobile API calls:
```javascript
// Remove userId from request
const response = await fetch(config.apiUrl('functionName'), {
  headers: { 'Authorization': `Bearer ${token}` }
  // Don't include userId in body or params
});
```

---

### **Error: "READ_ONLY_MODE"**
**Symptom**: Generations fail, credits can't be reserved

**Root Cause**: Blanket read-only mode blocking all write operations

**Solution**:
```javascript
// In src/config/environment.ts
export const config = {
  READ_ONLY: false, // Change from true to false
};

// Remove READ_ONLY checks from services
// Before:
if (config.READ_ONLY) return { error: 'READ_ONLY_MODE' };
// After: Remove this check entirely
```

---

### **Error: "Unsupported action type: compress"**
**Symptom**: Image generation fails during compression step

**Root Cause**: Invalid action in ImageManipulator.manipulateAsync

**Solution**:
```javascript
// In generationService.ts
const compressedImage = await ImageManipulator.manipulateAsync(
  imageUri,
  [
    { resize: { width: 1024, height: 1024 } }
    // Remove: { compress: 0.8 } - this is invalid
  ],
  { 
    compress: 0.8, // Compression goes in options, not actions
    format: ImageManipulator.SaveFormat.JPEG 
  }
);
```

---

### **Error: "Image could not be captured"**
**Symptom**: Camera fails to take photos

**Root Cause**: CameraView API issues or permissions

**Solution**: The app now has automatic fallback:
1. First tries CameraView.takePictureAsync()
2. If that fails, automatically falls back to ImagePicker.launchCameraAsync()
3. Check camera permissions in device settings if both fail

---

### **Error: App updates not reflecting**
**Symptom**: Code changes don't appear in the app

**Root Cause**: Changes not deployed or cached

**Solution**:
1. Check if changes are committed and pushed to GitHub
2. Verify GitHub Actions ran successfully
3. Wait for EAS update to complete (check EAS dashboard)
4. Force close and reopen the app
5. Check `app.config.ts` has correct `checkAutomatically: 'ON_LOAD'`

---

## 🔧 Quick Fixes

### **Reset App State**
```javascript
// Clear all stored data (nuclear option)
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.clear();
```

### **Force Update Check**
The app automatically checks for updates on launch. If you need to force it:
1. Close app completely
2. Reopen app
3. Updates are applied automatically if available

### **Check Configuration**
```javascript
// Verify correct settings in src/config/environment.ts
export const config = {
  READ_ONLY: false, // Should be false
  API_BASE_URL: 'https://stefna.netlify.app', // Or stefna.xyz for production
};
```

---

## 🐛 Debugging Steps

### **1. Check Console Logs**
Look for these patterns:
- ✅ `"🔐 [getUserMedia] Authenticated request"` - Auth working
- ❌ `"❌ UPDATE CHECK COMPLETELY FAILED"` - Update system broken
- ❌ `"userId parameter is required"` - Backend needs updating

### **2. Verify API Endpoints**
```javascript
// Check if backend functions are deployed
console.log(config.apiUrl('getUserMedia')); 
// Should show: https://stefna.netlify.app/.netlify/functions/getUserMedia
```

### **3. Test Authentication**
```javascript
// Check if user is properly authenticated
const { user, token } = useAuthStore.getState();
console.log('User:', user);
console.log('Token exists:', !!token);
```

---

## 🔄 Development Workflow

### **Making Changes**
1. **Mobile changes**: Edit files in `/stefnamobile`
2. **Backend changes**: Edit files in `/Stefna-main/netlify/functions/`
3. **Commit and push** to respective repositories
4. **GitHub Actions** handle deployment automatically

### **Testing Changes**
1. **Backend**: Changes are live immediately after push
2. **Mobile**: Wait for EAS update, then restart app
3. **Check logs** for any errors during update process

---

## 📞 When All Else Fails

### **Complete Reset Process**
1. Delete and reinstall the app
2. Clear all local storage
3. Re-authenticate with email/OTP
4. Test basic functionality (login, media, generation)

### **Check System Status**
- **Backend**: Visit https://stefna.netlify.app (should load)
- **Functions**: Check Netlify dashboard for function errors
- **Mobile**: Check EAS dashboard for build/update status

---

## 🎯 Prevention Tips

1. **Always test locally** before pushing to production
2. **Update backend first**, then mobile app for breaking changes
3. **Use the architecture patterns** documented in MOBILE_WEB_ARCHITECTURE.md
4. **Don't mix userId parameters** - let JWT handle authentication
5. **Keep READ_ONLY: false** for mobile app functionality

---

*This guide covers the most common issues. For architecture details, see MOBILE_WEB_ARCHITECTURE.md*
