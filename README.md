# StefnaMobile 📱

A complete mobile app for AI-powered image generation, built with React Native and Expo. This is the mobile companion to the Stefna web platform, featuring the same generation modes and user experience.

## 🚀 Features

### 🔐 Authentication
- Email + OTP authentication (same as website)
- Persistent sessions with auto-login
- Secure token-based API integration

### 📸 Image Generation
- **Camera Integration**: Take photos or upload from gallery
- **25 Rotating Presets**: Weekly changing styles from the website
- **Custom Mode**: Create with your own prompts
- **Edit Mode**: Transform existing images

### 💾 Storage & Sync
- **Local Storage**: App-internal file management
- **Photos App Integration**: Auto-save generated images
- **Cloud Sync**: Seamless sync with web account
- **Offline Support**: Queue generations when offline

### 🎨 User Experience
- **Clean UI**: Black/white theme matching the website
- **Native Performance**: Optimized for mobile devices
- **Offline-First**: Works without internet connection
- **Cross-Platform**: iOS and Android ready

## 🏗️ Architecture

### Tech Stack
- **Expo SDK 53**: Latest stable with new architecture
- **React Native**: Cross-platform mobile development
- **TypeScript**: Full type safety throughout
- **Expo Router**: File-based navigation
- **Zustand**: Lightweight state management

### Project Structure
```
src/
├── components/     # Reusable UI components
│   ├── CameraPicker.tsx
│   ├── GenerationModes.tsx
│   ├── RotatingPresets.tsx
│   └── MediaGallery.tsx
├── services/       # API and storage services
│   ├── authService.ts
│   ├── generationService.ts
│   └── storageService.ts
├── stores/         # State management
│   ├── authStore.ts
│   └── generationStore.ts
├── config/         # Environment configuration
│   └── environment.ts
└── types/          # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator (or physical device)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/edbns/stefnamobile.git
   cd stefnamobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```typescript
   // src/config/environment.ts
   const ENV = {
     production: {
       API_BASE_URL: 'https://your-netlify-site.netlify.app/.netlify/functions',
     },
   };
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app

## 🔧 Configuration

### API Integration
Update the API base URL in `src/config/environment.ts` to point to your Netlify Functions:

```typescript
API_BASE_URL: 'https://your-production-site.netlify.app/.netlify/functions'
```

### Permissions
The app requires the following permissions:
- **Camera**: For taking photos
- **Photo Library**: For uploading images and saving results
- **Storage**: For local file management

## 📱 App Flow

1. **Splash Screen**: App logo and loading
2. **Authentication**: Email → OTP → Login
3. **Main Screen**: Camera picker + generation modes
4. **Generation**: Select mode → Generate → View result
5. **Profile**: Gallery, stats, settings

## 🎯 Key Features

### Generation Modes
- **Presets**: 25 rotating styles, 5 per week
- **Custom**: User-defined prompts
- **Edit**: Transform existing images

### Storage System
- **Local**: App directory for generated images
- **Photos**: Automatic saving to device gallery
- **Cloud**: Sync with web account
- **Cleanup**: Auto-removal of old files

### Offline Support
- Queue generations when offline
- Process when connection restored
- Local storage for all media

## 🔒 Security

- Secure token storage with AsyncStorage
- HTTPS-only API communication
- No sensitive data in logs
- Clean session management

## 📊 Performance

- Optimized image handling
- Efficient state management
- Background processing
- Memory-conscious storage

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npm start --clear
   ```

2. **Permission errors**
   - Reset app permissions in device settings
   - Reinstall the app

3. **Build errors**
   ```bash
   npx expo install --fix
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built as a mobile companion to the Stefna web platform
- Uses Expo for cross-platform development
- Integrates with existing Netlify Functions backend

---

**Ready for production deployment!** 🚀
