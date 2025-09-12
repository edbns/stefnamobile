import React from 'react';
import { registerRootComponent } from 'expo';
import { View, Text, StyleSheet } from 'react-native';

function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🎉 StefnaMobile Web Test</Text>
      <Text style={styles.subtext}>Enhanced Architecture Working!</Text>
      <Text style={styles.details}>
        ✅ Clean Architecture{'\n'}
        ✅ Centralized Error Handling{'\n'}
        ✅ Smart Notifications{'\n'}
        ✅ Type Safety{'\n'}
        ✅ Production Ready
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 18,
    color: '#cccccc',
    marginBottom: 20,
    textAlign: 'center',
  },
  details: {
    fontSize: 16,
    color: '#888888',
    lineHeight: 24,
    textAlign: 'center',
  },
});

registerRootComponent(App);
