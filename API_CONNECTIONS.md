# Mobile App API Connections - Complete Guide

## ✅ What's Working Now

### **1. Authentication APIs** ✅ CONNECTED
- `request-otp` - Send login code
- `verify-otp` - Verify code and get JWT token
- `whoami` - Validate token
- `get-user-profile` - Get full user profile

**Flow:**
```
Auth → verify-otp → setAuth(token, user) → initialize() → whoami → get-user-profile
```

**Files:**
- `src/services/authService.ts` - API calls
- `src/stores/authStore.ts` - State management
- `app/auth.tsx` - Email screen
- `app/verify.tsx` - OTP screen

---

### **2. Credits API** ✅ CONNECTED
- `getQuota` - Get current balance (primary)
- `get-user-profile` - Fallback for balance
- `reserveCredits` - Reserve credits before generation
- `finalizeCredits` - Commit or refund after generation

**Flow:**
```
Login → initializeFromCache → refreshBalance → getQuota → Update UI
```

**Files:**
- `src/services/creditsService.ts` - API calls
- `src/stores/creditsStore.ts` - State management with reservation logic

**How to Test:**
- Check console logs: `📱 Credits loaded from getQuota`
- Look for balance in main screen header
- If not showing: Check Netlify logs for getQuota errors

---

### **3. Media/Gallery API** ✅ CONNECTED
- `getUserMedia` - Fetch all user's generated images
- `delete-media` - Delete an image

**Flow:**
```
Main Screen → loadUserMedia → getUserMedia → Transform & merge → Display grid
```

**Files:**
- `src/services/mediaService.ts` - API calls
- `src/stores/mediaStore.ts` - State management with local cache
- `app/main.tsx` - Gallery screen with useFocusEffect

**How to Test:**
- Check console logs: `🌐 [MediaStore] Fetching user media from server...`
- Look for media grid in main screen
- If not showing: Check Netlify logs for getUserMedia errors

---

### **4. Generation API** ✅ CONNECTED
- `unified-generate-background` - All generation modes

**Supported Modes:**
1. `custom-prompt` - Text-to-image
2. `edit-photo` - Edit with custom prompt
3. `unreal-reflection` - Unreal Reflection™ presets
4. `parallel-self` - Parallel Self™ presets

**Flow:**
```
Composer → GenerationService.generate() → Upload to Cloudinary → 
Call unified-generate-background → Poll for completion → Save to media
```

**Files:**
- `src/services/generationService.ts` - Main generation logic
- `src/services/cloudinaryService.ts` - Image uploads
- `app/composer.tsx` - UI that triggers generation
- `src/components/UnifiedComposer.tsx` - Composer UI

**API Call Format:**
```typescript
await fetch('https://stefna.xyz/.netlify/functions/unified-generate-background', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    mode: 'edit' | 'custom' | 'unreal_reflection' | 'parallel_self',
    prompt: enhancedPrompt,
    sourceAssetId: cloudinaryUrl,
    userId: userId,
    runId: runId,
    // Mode-specific parameters
    unrealReflectionPresetId?: presetId,
    parallelSelfPresetId?: presetId,
  })
})
```

---

## 🔧 Key Fixes Applied

### **Fix #1: Generation Service Import**
**Before (broken):**
```typescript
import { GenerationService } from '../src/services/generationService';
```

**After (fixed):**
```typescript
import GenerationService from '../src/services/generationService';
```

**Why:** The service exports a singleton instance as default export.

---

### **Fix #2: Generation Methods**
**Before (broken):**
```typescript
await GenerationService.generateCustom(prompt);
await GenerationService.generateEdit(image, prompt);
```

**After (fixed):**
```typescript
await GenerationService.generate({
  imageUri: selectedImage || '',
  mode: 'custom-prompt' | 'edit-photo' | 'unreal-reflection' | 'parallel-self',
  presetId: presetId,
  customPrompt: prompt,
});
```

**Why:** The service only has one unified `generate()` method.

---

### **Fix #3: Real-time Data Updates**
**Before (broken):**
```typescript
useEffect(() => {
  loadUserMedia();
  refreshBalance();
}, [user?.id]);
```

**After (fixed):**
```typescript
useFocusEffect(
  useCallback(() => {
    loadUserMedia();
    refreshBalance();
  }, [user?.id, loadUserMedia, refreshBalance])
);
```

**Why:** `useFocusEffect` reloads data every time the screen comes into focus, not just on mount.

---

## 🐛 Debugging Tips

### If Credits Not Showing:
1. Check console for: `📱 Credits loaded from getQuota`
2. Check Netlify logs for `getQuota` function
3. Verify token is valid with `whoami` endpoint
4. Check main screen header - should show "X credits"

### If Media Not Showing:
1. Check console for: `🌐 [MediaStore] Server response`
2. Check Netlify logs for `getUserMedia` function
3. Verify you have generated images in database
4. Pull down to refresh on main screen

### If Generation Not Working:
1. Check console for: `🚀 [Composer] Starting generation`
2. Check console for: `📤 [Mobile Generation] Calling unified function`
3. Check Netlify logs for `unified-generate-background`
4. Verify Cloudinary upload succeeded
5. Check if "Added to queue" alert shows

---

## 📱 Environment Configuration

**API Base URL:** `https://stefna.xyz`

All endpoints:
```typescript
config.apiUrl('request-otp')           → https://stefna.xyz/.netlify/functions/request-otp
config.apiUrl('verify-otp')            → https://stefna.xyz/.netlify/functions/verify-otp
config.apiUrl('getQuota')              → https://stefna.xyz/.netlify/functions/getQuota
config.apiUrl('getUserMedia')          → https://stefna.xyz/.netlify/functions/getUserMedia
config.apiUrl('unified-generate-background') → https://stefna.xyz/.netlify/functions/unified-generate-background
```

---

## 🚀 Expected Console Logs (When Working)

### On Login:
```
🔐 [Mobile Auth] Starting initialization...
🔐 [Mobile Auth] Token is valid
📋 [Mobile Auth] Fetching full user profile...
✅ [Mobile Auth] Session restored successfully
📱 Credits loaded from getQuota: 36
```

### On Main Screen Load:
```
📱 Main screen focused - loading data...
🌐 [MediaStore] Fetching user media from server...
🌐 [MediaStore] Server response: mediaCount=5
✅ Credits loaded from getQuota (currentBalance): 36
```

### On Generation:
```
🚀 [Composer] Starting generation: mode=edit-photo
📤 [Mobile Generation] Uploading image to Cloudinary...
✅ Image uploaded to Cloudinary
📤 [Mobile Generation] Calling unified function
✅ [Mobile Generation] Generation started: runId=mobile_1760...
🔄 [Mobile Generation] Polling for completion...
✅ [Mobile Generation] Generation completed
```

---

## Status:
- ✅ Auth API: **CONNECTED**
- ✅ Credits API: **CONNECTED**
- ✅ Media API: **CONNECTED**
- ✅ Generation API: **CONNECTED** (just fixed import)

All APIs are now properly connected! Check console logs to debug any remaining issues. 🎉

