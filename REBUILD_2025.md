# Stefna Mobile - Fresh Rebuild (2025)

## 🎨 Complete Redesign

The Stefna Mobile app has been completely rebuilt from scratch to match the mobile website's clean, minimal design and user experience.

---

## ✨ What's New

### **Light Theme Design**
- Background: `#FAFAFA` (light grey, almost white)
- Surface: `#FFFFFF` (pure white cards)
- Text: Black (`#000000`) and grey tones
- Buttons: Black primary, light grey secondary
- **No more dark theme**

### **Unified Color System**
All screens now use a consistent color palette defined in:
- `src/constants/colors.ts`

### **Simplified Navigation**
```
Welcome → Auth → Verify → Main Gallery
                              ↓
                          Composer
                              ↓
                         Media Viewer
```

---

## 📱 Screen Structure

### **Core Screens** (All Rebuilt)

1. **Welcome** (`app/welcome.tsx`)
   - Hero section with logo
   - 4 feature cards
   - Clean CTA button
   - Light theme

2. **Auth** (`app/auth.tsx`)
   - Email input with validation
   - Compact, clean design
   - Light grey background
   - Icons from lucide-react-native

3. **Verify** (`app/verify.tsx`)
   - 6-digit OTP input
   - Auto-submit on complete
   - Resend timer
   - Back to email option

4. **Main Gallery** (`app/main.tsx`)
   - Simple 3-column grid (no spacing)
   - Floating action button (+ icon)
   - Header: logo, credits, profile, logout
   - Pull-to-refresh
   - Active generation placeholders

5. **Composer** (`app/composer.tsx`)
   - Uses `UnifiedComposer` component
   - Native camera/gallery picker
   - Smart media sizing
   - Bottom-anchored buttons
   - Keyboard-aware layout

6. **Media Viewer** (`app/media-viewer.tsx`)
   - Full-screen image display
   - Save, share, delete actions
   - Black background
   - Simple, clean UI

7. **Profile** (`app/profile.tsx`)
   - User info card
   - Organized menu sections
   - Account, support, legal links
   - Sign out with confirmation

---

## 🎯 Active Generation Modes

Only **4 modes** are currently active:

1. **Custom** - Text-to-image generation
2. **Edit (Studio)** - Image-to-image with prompt
3. **Parallel Self™** - Alternate reality versions
4. **Unreal Reflection™** - Mirror dimension transformations

### **Hidden/Removed Modes:**
- ❌ Ghibli Reaction
- ❌ Cyber Siren (Neo Tokyo Glitch)
- ❌ Old rotating presets
- ❌ Story Time

Configuration: `src/constants/activeModes.ts`

---

## 🧩 Key Components

### **UnifiedComposer** (`src/components/UnifiedComposer.tsx`)
The heart of the generation experience:
- Matches mobile website logic
- Dynamic media sizing (100px → 200px based on mode/keyboard)
- "Your Prompt" vs "Get These Looks" toggle
- Bottom-anchored prompt box
- Combined presets (Unreal Reflection + Parallel Self)
- Keyboard-aware positioning

### **Color System** (`src/constants/colors.ts`)
```typescript
COLORS = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  text: '#000000',
  textSecondary: '#666666',
  border: '#E0E0E0',
  buttonPrimary: '#000000',
  buttonPrimaryText: '#FFFFFF',
  ...
}
```

---

## 🗑️ What Was Removed

### **Deleted Screens:**
- `app/camera.tsx` - Using native camera instead
- `app/generate-custom.tsx` - Replaced by composer
- `app/generate-studio.tsx` - Replaced by composer
- All other `generate-*.tsx` files

### **Deleted Components:**
- `BaseGenerationScreen.tsx` - Old base
- `GenerationModes.tsx` - Old mode selection
- `ProcessingScreen.tsx` - Simplified flow

### **Deleted Presets:**
- `ghibliReact.ts` - Inactive
- `neoTokyoGlitch.ts` - Inactive

### **Kept:**
- `parallelSelf.ts` ✅
- `unrealReflection.ts` ✅

---

## 🎨 Design Principles

### **Simple & Clean**
- No unnecessary animations
- Minimal margins
- Full-screen layouts
- No emojis (except in docs)

### **Consistent**
- Same color system everywhere
- Same spacing (defined in `SPACING` constants)
- Same border radius (defined in `BORDER_RADIUS`)
- Same font sizes (defined in `FONT_SIZES`)

### **Mobile-First**
- Touch-friendly hit areas (min 44px)
- Keyboard-aware inputs
- Pull-to-refresh
- Native camera/gallery integration

---

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```

3. **Run on device:**
   - Press `i` for iOS
   - Press `a` for Android
   - Scan QR with Expo Go

---

## 🔧 Configuration

### **API Base URL**
Update in `src/config/environment.ts`:
```typescript
API_BASE_URL: 'https://stefna.xyz/.netlify/functions'
```

### **Active Modes**
Update in `src/constants/activeModes.ts`:
```typescript
export const ACTIVE_MODES = {
  custom: true,
  edit: true,
  parallel_self: true,
  unreal_reflection: true,
  // ... set to false to hide
}
```

---

## 📊 File Structure

```
stefnamobile/
├── app/                    # Screens (Expo Router)
│   ├── index.tsx          # Entry point (redirect logic)
│   ├── welcome.tsx        # Onboarding
│   ├── auth.tsx           # Email login
│   ├── verify.tsx         # OTP verification
│   ├── main.tsx           # Gallery grid
│   ├── composer.tsx       # Generation screen
│   ├── media-viewer.tsx   # Full-screen viewer
│   ├── profile.tsx        # User profile
│   ├── help-center.tsx    # FAQ
│   ├── terms.tsx          # Legal
│   ├── privacy.tsx        # Legal
│   ├── cookies.tsx        # Legal
│   └── community-guidelines.tsx
│
├── src/
│   ├── components/
│   │   └── UnifiedComposer.tsx  # Main composer UI
│   ├── constants/
│   │   ├── colors.ts            # Color system
│   │   └── activeModes.ts       # Mode configuration
│   ├── services/          # API & storage services
│   ├── stores/            # Zustand state management
│   ├── presets/
│   │   ├── parallelSelf.ts      # Active preset
│   │   └── unrealReflection.ts  # Active preset
│   └── types/             # TypeScript definitions
│
└── assets/                # Images & fonts
```

---

## 🐛 Known Issues

None currently! This is a fresh start. 🎉

---

## 📝 Next Steps

1. Test on real devices (iPhone & Android)
2. Fine-tune responsive behavior
3. Add smooth transitions
4. Optimize image loading
5. Add haptic feedback
6. Performance monitoring

---

## 🎯 Deployment

The app auto-deploys to Expo when pushing to:
```
https://github.com/edbns/stefnamobile.git
```

Branch: `main`

---

## 📱 Version

**v1.0.3** - Fresh rebuild matching mobile website

Last updated: January 2025

