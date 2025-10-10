import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { X, Plus, ArrowUp, Wand2 } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/colors';
import { UNREAL_REFLECTION_PRESETS } from '../presets/unrealReflection';
import { PARALLEL_SELF_PRESETS } from '../presets/parallelSelf';

interface UnifiedComposerProps {
  selectedImage: string | null;
  onClearImage: () => void;
  onUploadPress: () => void;
  onGenerate: (mode: 'custom' | 'edit', prompt: string, presetId?: string) => void;
  isGenerating?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function UnifiedComposer({
  selectedImage,
  onClearImage,
  onUploadPress,
  onGenerate,
  isGenerating = false,
}: UnifiedComposerProps) {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'edit' | 'combined-presets'>('edit');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Keyboard visibility detection
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Smart media height based on mode and keyboard
  const getMediaHeight = () => {
    if (isKeyboardVisible) return 100; // Small when keyboard open
    if (mode === 'combined-presets') return 140; // Medium for presets
    return 200; // Large for "Your Prompt" mode
  };

  // Smart button position
  const getButtonPosition = () => {
    if (mode === 'combined-presets') return 230; // Higher for presets
    return SCREEN_HEIGHT - 260; // Bottom-anchored for "Your Prompt"
  };

  const handleEnhance = async () => {
    // TODO: Integrate with magic wand service
    setIsEnhancing(true);
    setTimeout(() => setIsEnhancing(false), 1000);
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    onGenerate(mode === 'edit' ? 'edit' : 'custom', prompt);
  };

  // Combined presets (Unreal Reflection + Parallel Self)
  const combinedPresets = [
    ...UNREAL_REFLECTION_PRESETS.map(p => ({ ...p, type: 'unreal' as const })),
    ...PARALLEL_SELF_PRESETS.map(p => ({ ...p, type: 'parallel' as const })),
  ];

  return (
    <View style={styles.container}>
      {/* Media Preview (if image uploaded) */}
      {selectedImage && (
        <View style={[styles.mediaContainer, { top: 72, height: getMediaHeight() }]}>
          <Image
            source={{ uri: selectedImage }}
            style={styles.mediaImage}
            resizeMode="contain"
          />
          
          {/* Close button - top right */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClearImage}
            activeOpacity={0.8}
          >
            <X size={14} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      )}

      {/* Action Buttons */}
      {selectedImage && (
        <View style={[
          styles.actionButtons,
          mode === 'combined-presets' 
            ? { top: getButtonPosition() } 
            : { bottom: 195 }
        ]}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === 'edit' && styles.modeButtonActive
            ]}
            onPress={() => setMode('edit')}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.modeButtonText,
              mode === 'edit' && styles.modeButtonTextActive
            ]}>
              Your Prompt
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === 'combined-presets' && styles.modeButtonActive
            ]}
            onPress={() => setMode('combined-presets')}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.modeButtonText,
              mode === 'combined-presets' && styles.modeButtonTextActive
            ]}>
              Get These Looks
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Combined Presets Grid (when "Get These Looks" is active) */}
      {selectedImage && mode === 'combined-presets' && (
        <ScrollView
          style={styles.presetsContainer}
          contentContainerStyle={styles.presetsContent}
          showsVerticalScrollIndicator={false}
        >
          {combinedPresets.map((preset) => (
            <TouchableOpacity
              key={preset.id}
              style={styles.presetCard}
              onPress={() => {
                // TODO: Trigger generation with preset
                onGenerate('edit', preset.prompt, preset.id);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.presetLabel}>{preset.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Prompt Box - Always at bottom */}
      <View style={styles.promptContainer}>
        {/* OR Divider (when no image) */}
        {!selectedImage && (
          <Text style={styles.orText}>
            Generate from text   -OR- Upload a photo to edit
          </Text>
        )}

        {/* Prompt Input */}
        <View style={styles.promptBox}>
          <TextInput
            style={styles.promptInput}
            value={prompt}
            onChangeText={setPrompt}
            placeholder={selectedImage ? "Describe your edit..." : "Describe your image..."}
            placeholderTextColor={COLORS.placeholder}
            multiline
            editable={!isGenerating}
            maxLength={3000}
          />

          {/* Upload Button (when no image) */}
          {!selectedImage && (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={onUploadPress}
              activeOpacity={0.8}
            >
              <Plus size={18} color={COLORS.text} />
            </TouchableOpacity>
          )}

          {/* Character Count */}
          <Text style={styles.charCount}>{prompt.length}/3000</Text>
        </View>

        {/* Action Buttons Below Prompt */}
        <View style={styles.promptActions}>
          {/* Enhance Button */}
          <TouchableOpacity
            style={[styles.enhanceButton, (!prompt.trim() || isGenerating) && styles.enhanceButtonDisabled]}
            onPress={handleEnhance}
            disabled={!prompt.trim() || isGenerating}
            activeOpacity={0.8}
          >
            {isEnhancing ? (
              <ActivityIndicator size="small" color={COLORS.buttonPrimaryText} />
            ) : (
              <>
                <Wand2 size={14} color={COLORS.buttonPrimaryText} />
                <Text style={styles.enhanceButtonText}>Enhance</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Generate Button */}
          <TouchableOpacity
            style={[
              styles.generateButton,
              (!prompt.trim() || isGenerating || (mode === 'edit' && !selectedImage)) && styles.generateButtonDisabled
            ]}
            onPress={handleGenerate}
            disabled={!prompt.trim() || isGenerating || (mode === 'edit' && !selectedImage)}
            activeOpacity={0.8}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color={COLORS.text} />
            ) : (
              <>
                <ArrowUp size={14} color={COLORS.text} />
                <Text style={styles.generateButtonText}>Generate</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mediaContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    zIndex: 10,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: -8,
    right: SPACING.lg - 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  actionButtons: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    zIndex: 15,
  },
  modeButton: {
    flex: 1,
    backgroundColor: COLORS.buttonSecondary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: COLORS.buttonPrimary,
  },
  modeButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: COLORS.buttonPrimaryText,
  },
  presetsContainer: {
    position: 'absolute',
    top: 280,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(250, 250, 250, 0.98)',
    zIndex: 14,
  },
  presetsContent: {
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  presetCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  promptContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    zIndex: 20,
  },
  orText: {
    textAlign: 'center',
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    marginBottom: SPACING.sm,
  },
  promptBox: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    minHeight: 110,
    position: 'relative',
  },
  promptInput: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    minHeight: 90,
    paddingBottom: 24,
  },
  uploadButton: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  charCount: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.md,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
  },
  promptActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  enhanceButton: {
    flex: 1,
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  enhanceButtonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
  },
  enhanceButtonText: {
    color: COLORS.buttonPrimaryText,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  generateButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  generateButtonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
    borderColor: COLORS.buttonDisabled,
  },
  generateButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
});

