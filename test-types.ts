// Test file to verify types
import { useGenerationStore } from './src/stores/generationStore';

// Test that startGeneration returns GenerationResponse
const test = async () => {
  const { startGeneration } = useGenerationStore.getState();
  
  const result = await startGeneration({
    imageUri: 'test',
    mode: 'presets'
  });
  
  // This should work if types are correct
  console.log('Generation started in background');
};

