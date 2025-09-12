import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// iPhone 8 baseline: 667px height
const IPHONE_8_HEIGHT = 667;

export interface ResponsiveDimensions {
  photoHeight: number;
  photoWidth: number;
  buttonSize: 'small' | 'medium' | 'large';
  padding: number;
  fontSize: {
    small: number;
    medium: number;
    large: number;
  };
  spacing: {
    small: number;
    medium: number;
    large: number;
  };
}

export function getResponsiveDimensions(): ResponsiveDimensions {
  const heightRatio = screenHeight / IPHONE_8_HEIGHT;
  
  // Photo sizing - prioritize visibility
  let photoHeightRatio: number;
  let buttonSize: 'small' | 'medium' | 'large';
  let padding: number;
  
  if (screenHeight <= 700) { // iPhone 8 and smaller
    photoHeightRatio = 0.4; // 40% of screen height
    buttonSize = 'small';
    padding = 8;
  } else if (screenHeight <= 800) { // Medium phones
    photoHeightRatio = 0.45; // 45% of screen height
    buttonSize = 'medium';
    padding = 12;
  } else { // Large phones
    photoHeightRatio = 0.5; // 50% of screen height
    buttonSize = 'large';
    padding = 16;
  }
  
  const photoHeight = screenHeight * photoHeightRatio;
  const photoWidth = screenWidth - (padding * 2);
  
  return {
    photoHeight,
    photoWidth,
    buttonSize,
    padding,
    fontSize: {
      small: Math.max(12, 12 * heightRatio),
      medium: Math.max(14, 14 * heightRatio),
      large: Math.max(16, 16 * heightRatio),
    },
    spacing: {
      small: Math.max(4, 4 * heightRatio),
      medium: Math.max(8, 8 * heightRatio),
      large: Math.max(12, 12 * heightRatio),
    },
  };
}

export function shouldEnableScroll(contentHeight: number, keyboardHeight: number = 0): boolean {
  const availableHeight = screenHeight - keyboardHeight - 100; // 100px buffer
  return contentHeight > availableHeight;
}

export function getScrollOffset(isTyping: boolean, contentHeight: number, keyboardHeight: number = 0): number {
  if (!isTyping) return 0;
  
  const availableHeight = screenHeight - keyboardHeight - 100;
  const overflow = contentHeight - availableHeight;
  
  // Scroll just enough to show the input area
  return Math.max(0, overflow + 50); // 50px extra for comfortable viewing
}

export { screenWidth, screenHeight };
