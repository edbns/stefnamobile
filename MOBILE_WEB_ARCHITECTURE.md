# Stefna Mobile/Web Architecture Guide

## 🏗️ Overview

This document explains the **platform-aware architecture** implemented to prevent interference between the mobile app and website while sharing core functionality.

## 🎯 Architecture Principles

### **Shared vs Platform-Specific Features**

#### ✅ **Shared Features** (Both Platforms)
- **User Authentication** - JWT tokens with platform claims
- **Generation Pipeline** - All AI generation modes  
- **User Media** - Private galleries sync between platforms
- **Credits System** - Reserve, finalize, balance management
- **Invite Friends** - Referral system and bonuses
- **Delete Account** - Account deletion requests
- **User Profile** - Profile data and settings

#### 🚫 **Platform-Specific Features**
- **Web Only**: Public feed, `share_to_feed` setting, community features
- **Mobile Only**: Camera capture, local storage, offline mode

## 🔐 JWT Authentication System

### **Token Structure**
```javascript
{
  userId: "user-id-here",
  email: "user@example.com", 
  platform: "mobile" | "web",
  permissions: ["canManageFeed"] // Web only
}
```

### **Platform Permissions**
- **Mobile tokens**: `platform: "mobile"`, no special permissions
- **Web tokens**: `platform: "web"` + `canManageFeed` permission

## 🔄 API Contract Pattern

### **❌ Old Pattern (Problematic)**
```javascript
// Mobile sends userId in request
fetch('/api/getUserMedia?userId=123', {
  headers: { 'Authorization': 'Bearer token' }
});

// Backend expects userId parameter
const userId = url.searchParams.get('userId');
```

### **✅ New Pattern (Platform-Aware)**
```javascript
// Mobile sends only JWT token
fetch('/api/getUserMedia', {
  headers: { 'Authorization': 'Bearer token' }
});

// Backend extracts userId from JWT
const auth = requireAuth(event.headers.authorization);
const userId = auth.userId;
```

## 🛠️ Backend Function Updates

### **Updated Functions (JWT-based)**
- ✅ `getUserMedia.ts` - Extracts userId from JWT
- ✅ `delete-media.ts` - Extracts userId from JWT  
- ✅ `unified-generate-background.ts` - Already JWT-based

### **Functions That Need Updates**
If you add new functions that require user identification:

```javascript
import { requireAuth } from './_lib/auth';

export const handler: Handler = async (event) => {
  try {
    // Extract user info from JWT
    const auth = requireAuth(event.headers?.authorization);
    const userId = auth.userId;
    const platform = auth.platform;
    
    // Your function logic here
    console.log(`${platform} user ${userId} accessed function`);
    
  } catch (error) {
    // Handle auth errors
    if (error.statusCode === 401) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Authentication required' })
      };
    }
    throw error;
  }
};
```

## 📱 Mobile App Implementation

### **Service Layer Pattern**
```javascript
// ✅ Correct: Let backend extract userId from JWT
const response = await fetch(config.apiUrl('functionName'), {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  // No userId in body or query params
});

// ❌ Wrong: Don't send userId manually
const response = await fetch(config.apiUrl('functionName'), {
  method: 'POST',
  body: JSON.stringify({ userId: user.id }), // DON'T DO THIS
});
```

### **Configuration**
```javascript
// src/config/environment.ts
export const config = {
  // Mobile can write to shared features
  READ_ONLY: false, // Platform permissions enforced by backend
  
  // API calls use JWT-based authentication
  apiUrl: (fn: string) => `${API_BASE_URL}/.netlify/functions/${fn}`,
};
```

## 🚨 Common Pitfalls & Solutions

### **Problem 1: "userId parameter is required"**
**Cause**: Backend function expects userId parameter, mobile doesn't send it

**Solution**: Update backend function to use `requireAuth()`:
```javascript
// Before
const userId = url.searchParams.get('userId');
if (!userId) return error;

// After  
const auth = requireAuth(event.headers.authorization);
const userId = auth.userId;
```

### **Problem 2: READ_ONLY_MODE errors**
**Cause**: Blanket read-only mode blocking all writes

**Solution**: Remove READ_ONLY checks from shared features:
```javascript
// Before
if (config.READ_ONLY) {
  return { error: 'READ_ONLY_MODE' };
}

// After
// Let backend enforce platform permissions via JWT
```

### **Problem 3: Settings interference**
**Cause**: Mobile accidentally modifying web-only settings

**Solution**: Backend enforces platform permissions:
```javascript
// Backend checks platform permissions
if (updates.share_to_feed && !auth.permissions.includes('canManageFeed')) {
  return { error: 'Permission denied' };
}
```

## 🔄 Deployment Process

### **Mobile App Updates**
1. Make changes in `/Users/sennie/Desktop/stefnamobile`
2. Commit and push to `stefnamobile` repo
3. GitHub Actions automatically triggers EAS update
4. Users get updates on next app launch

### **Backend Updates**  
1. Make changes in `/Users/sennie/Desktop/Stefna-main/netlify/functions/`
2. Commit and push to `Stefna` repo
3. Netlify automatically deploys functions
4. Changes are live immediately

### **Coordinated Updates**
For changes that require both mobile and backend updates:
1. Update backend functions first (backward compatible)
2. Update mobile app to use new API contract
3. Test thoroughly before deploying mobile updates

## 📋 Testing Checklist

### **Before Deploying Mobile Changes**
- [ ] User media loads without "userId required" errors
- [ ] Generations work without READ_ONLY_MODE errors
- [ ] Image compression works without "unsupported action" errors
- [ ] Camera capture works or falls back gracefully
- [ ] Delete media works for both local and cloud
- [ ] Invite friends functionality works
- [ ] Credits system functions properly

### **Backend Function Testing**
```bash
# Test with mobile token (no special permissions)
curl -H "Authorization: Bearer mobile-token" /api/functionName

# Test with web token (has canManageFeed permission)  
curl -H "Authorization: Bearer web-token" /api/functionName
```

## 🆕 Adding New Features

### **Shared Feature (Both Platforms)**
1. Create backend function using `requireAuth()` pattern
2. Add mobile service function (no userId parameters)
3. Add web implementation with same API contract
4. Test on both platforms

### **Mobile-Only Feature**
1. Implement only in mobile app
2. No backend changes needed if using existing APIs
3. Use local storage, camera, etc.

### **Web-Only Feature**
1. Create backend function with permission checks:
```javascript
if (!auth.permissions.includes('canManageFeed')) {
  return { error: 'Web-only feature' };
}
```
2. Mobile app should not call this function

## 🔍 Debugging Guide

### **Mobile App Issues**
1. Check console for JWT authentication errors
2. Verify `config.READ_ONLY` is `false`
3. Ensure API calls don't include userId parameters
4. Check if backend functions are updated

### **Backend Issues**
1. Verify `requireAuth()` is imported and used
2. Check JWT token contains required claims
3. Ensure platform permissions are checked correctly
4. Test with both mobile and web tokens

## 📝 Migration Checklist

### **When Adding New Backend Functions**
- [ ] Import `requireAuth` from `./_lib/auth`
- [ ] Extract userId from JWT, don't expect it in request
- [ ] Add platform-aware logging
- [ ] Handle authentication errors properly
- [ ] Test with both mobile and web tokens

### **When Updating Mobile Services**
- [ ] Remove userId from request bodies/parameters
- [ ] Use JWT token in Authorization header only
- [ ] Remove READ_ONLY checks from shared features
- [ ] Update TypeScript interfaces if needed
- [ ] Test API calls work with new backend

## 🎉 Benefits of This Architecture

1. **✅ No More Interference** - Mobile and web can't break each other's functionality
2. **✅ Proper Separation** - Platform-specific features stay separate
3. **✅ Shared Data** - User media, credits, generations sync properly  
4. **✅ Scalable** - Easy to add new features without conflicts
5. **✅ Secure** - JWT-based authentication with platform permissions
6. **✅ Maintainable** - Clear patterns for future developers

---

## 🚀 Quick Reference

**Mobile API Call Pattern:**
```javascript
const response = await fetch(config.apiUrl('function-name'), {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Backend Function Pattern:**
```javascript
const auth = requireAuth(event.headers.authorization);
const userId = auth.userId;
```

**Remember**: Mobile and web share USER DATA but have different PERMISSIONS and UI patterns.

---

*Last updated: December 2024*
*Architecture implemented to resolve mobile/web interference issues*
