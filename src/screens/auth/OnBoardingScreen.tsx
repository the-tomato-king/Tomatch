// src/screens/auth/OnboardingScreen.tsx
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  useWindowDimensions 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ViewToken } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

type OnboardingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  image: string;
}

const onboardingData: OnboardingItem[] = [
    {
      id: '1',
      title: 'Welcome to Scalor!',
      description: 'Track, compare and save with smart grocery price tracking',
      image: 'https://via.placeholder.com/300',
    },
    {
      id: '2',
      title: 'Quick Price Tracking 📷',
      description: 'Snap photos of price tags to automatically record prices using AI technology',
      image: require('../../../assets/WechatIMG134.jpg'),
    },
    {
      id: '3',
      title: 'Smart Comparisons 🆚',
      description: 'Compare prices across different stores with automatic unit conversions',
      image: 'https://via.placeholder.com/300',
    },
    {
      id: '4',
      title: 'Shopping Lists 🛒',
      description: 'Create and manage your grocery lists in one place',
      image: 'https://via.placeholder.com/300',
    }
  ]

const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width } = useWindowDimensions();
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const { markOnboardingComplete } = useAuth();

  const viewConfigRef = { viewAreaCoveragePercentThreshold: 50 };
  
  const onViewableItemsChanged = useRef((info: { viewableItems: ViewToken[] }) => {
    if (info.viewableItems.length > 0 && info.viewableItems[0].index !== null) {
      setCurrentIndex(info.viewableItems[0].index!);
    }
  }).current;

  const goToLogin = async () => {
    // Mark onboarding as complete when user navigates to login
    await markOnboardingComplete();
    navigation.navigate('Login');
  };

  const goToSignup = async () => {
    // Mark onboarding as complete when user navigates to signup
    await markOnboardingComplete();
    navigation.navigate('Signup');
  };

  const skipOnboarding = async () => {
    // Mark onboarding as complete when user skips
    await markOnboardingComplete();
    navigation.navigate('Login');
  };

  const nextSlide = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const renderItem = ({ item }: { item: OnboardingItem }) => {
    return (
      <View style={[styles.slide, { width }]}>
        <View style={styles.imageContainer}>
          <Image
            source={typeof item.image === 'string' ? { uri: item.image } : item.image}
            style={styles.image}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfigRef}
      />

      <View style={styles.indicatorContainer}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              currentIndex === index ? styles.activeIndicator : null,
            ]}
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        {currentIndex < onboardingData.length - 1 ? (
          <>
            <TouchableOpacity style={styles.skipButton} onPress={skipOnboarding}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextButton} onPress={nextSlide}>
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.loginButton} onPress={goToLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.signupButton} onPress={goToSignup}>
              <Text style={styles.signupButtonText}>Signup</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    flex: 0.6,
    justifyContent: 'center',
  },
  image: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
  },
  textContainer: {
    flex: 0.4,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    paddingHorizontal: 20,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  indicator: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
  activeIndicator: {
    backgroundColor: '#4285F4',
    width: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  skipButton: {
    padding: 12,
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
  },
  loginButton: {
    marginHorizontal: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#4285F4',
    borderRadius: 24,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#4285F4',
    fontSize: 16,
  },
  signupButton: {
    marginHorizontal: 8,
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  signupButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default OnboardingScreen;