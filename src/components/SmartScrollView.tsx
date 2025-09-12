import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, Dimensions, Keyboard } from 'react-native';
import { shouldEnableScroll, getScrollOffset } from '../utils/responsiveDimensions';

interface SmartScrollViewProps {
  children: React.ReactNode;
  isTyping?: boolean;
  isGenerating?: boolean;
  onContentSizeChange?: (width: number, height: number) => void;
  style?: any;
}

export default function SmartScrollView({ 
  children, 
  isTyping = false, 
  isGenerating = false,
  onContentSizeChange,
  style 
}: SmartScrollViewProps) {
  const [contentHeight, setContentHeight] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Listen to keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Determine if scrolling should be enabled
  useEffect(() => {
    const needsScroll = shouldEnableScroll(contentHeight, keyboardHeight);
    const shouldScroll = needsScroll && isTyping && !isGenerating;
    
    setScrollEnabled(shouldScroll);
    
    // Auto-scroll when typing starts
    if (shouldScroll && isTyping) {
      const scrollOffset = getScrollOffset(isTyping, contentHeight, keyboardHeight);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: scrollOffset,
          animated: true,
        });
      }, 100); // Small delay for smooth animation
    }
    
    // Return to top when generation starts
    if (isGenerating) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: 0,
          animated: true,
        });
      }, 100);
    }
  }, [contentHeight, keyboardHeight, isTyping, isGenerating]);

  const handleContentSizeChange = (width: number, height: number) => {
    setContentHeight(height);
    onContentSizeChange?.(width, height);
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      scrollEnabled={scrollEnabled}
      onContentSizeChange={handleContentSizeChange}
      showsVerticalScrollIndicator={scrollEnabled}
      keyboardShouldPersistTaps="handled"
      style={style}
    >
      {children}
    </ScrollView>
  );
}
