/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AgridProvider, useAgrid } from '@agrid/agrid-react-native';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <AgridProvider
      apiKey="phc_SAPXxs1DyOGgIPDKRgtgoYu4RFeQ2uREBvvJOeMnotU"
      options={{
        host: 'https://us.i.posthog.com',
        captureAppLifecycleEvents: true,
      }}
    >
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AppContent />
      </SafeAreaProvider>
    </AgridProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [activeScreen, setActiveScreen] = useState<ScreenName>('HOME');
  const agrid = useAgrid();

  const navigationItems = useMemo(
    () => [
      { key: 'HOME', label: 'Home' },
      { key: 'SCREEN_A', label: 'Screen A' },
      { key: 'SCREEN_B', label: 'Screen B' },
    ],
    [],
  );

  // Automatically track screen views when the screen changes
  useEffect(() => {
    if (agrid) {
      agrid.screen(activeScreen);
    }
  }, [activeScreen, agrid]);

  const handleScreenChange = useCallback(
    (screenName: ScreenName) => {
      setActiveScreen(screenName);
    },
    [],
  );

  const handleShowDialog = useCallback(
    (title: string) => {
      Alert.alert(title, 'Nội dung minh họa cho hộp thoại');
      agrid?.capture('dialog_shown', { title });
    },
    [agrid],
  );

  const renderScreen = useCallback(() => {
    switch (activeScreen) {
      case 'SCREEN_A':
        return (
          <ScreenA
            onBackHome={() => handleScreenChange('HOME')}
            onShowDialog={() => handleShowDialog('Đây là Screen A')}
          />
        );
      case 'SCREEN_B':
        return (
          <ScreenB
            onBackHome={() => handleScreenChange('HOME')}
            onShowDialog={() => handleShowDialog('Đây là Screen B')}
          />
        );
      default:
        return (
          <HomeScreen
            onGoScreenA={() => handleScreenChange('SCREEN_A')}
            onGoScreenB={() => handleScreenChange('SCREEN_B')}
          />
        );
    }
  }, [activeScreen, handleShowDialog, handleScreenChange]);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: safeAreaInsets.top,
          paddingBottom: safeAreaInsets.bottom,
        },
      ]}>
      <View style={styles.navBar}>
        {navigationItems.map(item => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.navButton,
              activeScreen === item.key && styles.navButtonActive,
            ]}
            onPress={() => handleScreenChange(item.key as ScreenName)}>
            <Text
              style={[
                styles.navButtonText,
                activeScreen === item.key && styles.navButtonTextActive,
              ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.screenWrapper}>{renderScreen()}</View>
    </View>
  );
}

type ScreenName = 'HOME' | 'SCREEN_A' | 'SCREEN_B';

type HomeScreenProps = {
  onGoScreenA: () => void;
  onGoScreenB: () => void;
};

type DetailScreenProps = {
  onBackHome: () => void;
  onShowDialog: () => void;
};

function ScreenContainer({ children }: { children: React.ReactNode }) {
  return <View style={styles.screenContainer}>{children}</View>;
}

function PrimaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.primaryButton} onPress={onPress}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

function HomeScreen({ onGoScreenA, onGoScreenB }: HomeScreenProps) {
  return (
    <ScreenContainer>
      <Text style={styles.title}>Màn hình Home</Text>
      <PrimaryButton label="Đi đến Screen A" onPress={onGoScreenA} />
      <PrimaryButton label="Đi đến Screen B" onPress={onGoScreenB} />
    </ScreenContainer>
  );
}

function ScreenA({ onBackHome, onShowDialog }: DetailScreenProps) {
  return (
    <ScreenContainer>
      <Text style={styles.title}>Màn hình A</Text>
      <PrimaryButton label="Trở về Home" onPress={onBackHome} />
      <PrimaryButton label="Hiện dialog" onPress={onShowDialog} />
    </ScreenContainer>
  );
}

function ScreenB({ onBackHome, onShowDialog }: DetailScreenProps) {
  return (
    <ScreenContainer>
      <Text style={styles.title}>Màn hình B</Text>
      <PrimaryButton label="Trở về Home" onPress={onBackHome} />
      <PrimaryButton label="Hiện dialog" onPress={onShowDialog} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FA',
  },
  navBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D1D5DB',
  },
  navButton: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  navButtonActive: {
    backgroundColor: '#2563EB',
  },
  navButtonText: {
    color: '#1F2937',
    fontWeight: '600',
  },
  navButtonTextActive: {
    color: '#FFFFFF',
  },
  screenWrapper: {
    flex: 1,
    paddingHorizontal: 16,
  },
  screenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    marginTop: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default App;
