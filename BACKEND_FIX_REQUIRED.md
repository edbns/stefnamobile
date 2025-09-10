# 🚨 CRITICAL BACKEND FIX REQUIRED

## Issue: Backend Returning 202 with text/plain Instead of JSON

### Problem Description
The mobile app is receiving `text/plain` responses with status `202` from the `unified-generate-background` function, causing JSON parsing errors.

**Error Log:**
```
❌ [Mobile Generation] Non-JSON response: {"contentType":"text/plain","status":202,"responsePreview":""}
```

### Root Cause
The backend function is returning:
```javascript
// ❌ WRONG - This causes JSON.parse() to fail
return {
  statusCode: 202,
  headers: { "Content-Type": "text/plain" },
  body: "" // Empty string crashes JSON.parse()
}
```

### Required Fix

**Update the `unified-generate-background` function to always return valid JSON:**

```javascript
// ✅ CORRECT - Always return valid JSON
return {
  statusCode: 202,
  headers: { 
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  },
  body: JSON.stringify({
    status: "processing",
    jobId: backgroundJobId,
    runId: backgroundJobId,
    estimatedTime: 45,
    message: "Generation started successfully"
  })
}
```

### Additional Backend Functions to Check

Please also verify these functions return proper JSON:

1. **`pollStatus`** - Should return JSON with job status
2. **`getMediaByRunId`** - Should return JSON with media data
3. **Any other function returning 202 status**

### Expected Response Format

**For 202 Accepted (Processing Started):**
```json
{
  "status": "processing",
  "jobId": "mobile_1757499373012_awa08wrqf",
  "runId": "mobile_1757499373012_awa08wrqf",
  "estimatedTime": 45,
  "message": "Generation started successfully"
}
```

**For 200 Success (Job Complete):**
```json
{
  "success": true,
  "status": "completed",
  "media": {
    "url": "https://cloudinary.com/image.jpg",
    "id": "media_id"
  },
  "jobId": "mobile_1757499373012_awa08wrqf"
}
```

**For 400/500 Error:**
```json
{
  "success": false,
  "error": "Error message",
  "jobId": "mobile_1757499373012_awa08wrqf"
}
```

### Testing Checklist

- [ ] All functions return `Content-Type: application/json`
- [ ] 202 responses include valid JSON body
- [ ] Empty responses are handled gracefully
- [ ] Error responses include proper error messages
- [ ] CORS headers are included for mobile requests

### Priority: HIGH 🔴

This is blocking mobile app functionality and causing generation failures.

---

**Contact:** Mobile Development Team  
**Date:** $(date)  
**Issue ID:** BACKEND_202_JSON_FIX
