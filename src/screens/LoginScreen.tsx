/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  SafeAreaView 
} from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { TertiaryButton } from '../components/TertiaryButton';
import { useAuth } from '../contexts/AuthContext';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../services/apis/auth.api';
import { setCredentials } from '../features/auth/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setCurrentPickup } from '../features/pickSlice';
import Toast from '../components/toast';
import { getMessaging, getToken } from '@react-native-firebase/messaging';
import { FormInput } from '../components/input.component';
import { useTheme } from '../contexts/themeContext';
import { COUNTRIES } from '../utils/countryCodes';
import { PhoneInput } from '../components/phoneinput';
import { subscribeToTopic } from '../utils/subscribeUnsubscribe';
import { useBusiness } from '../contexts/BusinessContext';

export default function LoginScreen({ navigation }: any) {
  const [phone_number, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [FCM_token, setFCM_token] = useState('');
  const { setUser } = useAuth();
  const { updateBusiness } = useBusiness();
  const [msg, setMsg] = useState({ msg: '', state: '' });
  const dispatch = useDispatch();
  const [loginUser, { isLoading: loading }] = useLoginMutation();
  const { colors } = useTheme();
  const [country, setCountry] = useState(COUNTRIES[0]); // default

  const handleLogin = async () => {
    try {
      setMsg({ msg: '', state: '' });

      if (!phone_number || !password) {
        setMsg({ msg: 'Both fields are required', state: 'error' });
        return;
      }

      const data = await loginUser({
        phone_number,
        password,
        FCM_token,
      }).unwrap();

      if (data.ok) {
        dispatch(setCredentials({ ...data }));
        if (data.user?.business) {
          updateBusiness(data.user.business);
        }

        await AsyncStorage.setItem('accessToken', data.token);
        await AsyncStorage.setItem('userId', data.user._id);
        dispatch(setCurrentPickup(data.user.pickup || null));

        if (data.exp) {
          await AsyncStorage.setItem('tokenExpiry', data.exp.toString());
          const pickup = data?.user?.pickup;
          const business = data?.user?.business;
          await subscribeToTopic(`pickup_${pickup._id}_attendants`);
          await subscribeToTopic(`business_${business._id}_crew`);
          if (data.user.role === 'superuser') {
            await subscribeToTopic(`superuser`);
          }
          if (data.user.role === 'supersales') {
            await subscribeToTopic(`supersales`);
          }
          if (data.user.role === 'admin') {
            await subscribeToTopic(`business_${business._id}_admin`);
          }

          setUser(data.user);
        }
        setMsg({ msg: 'Login successful! Redirecting...', state: 'success' });
      } else {
        setMsg({ msg: 'Login failed, please try again', state: 'error' });
      }
    } catch (err: any) {
      console.log(err);
      setMsg({
        msg: err.message || err.data?.message || 'Error occurred, try again ',
        state: 'error',
      });
    }
  };

  useEffect(() => {
    async function getFcmToken() {
      try {
        const messagingInstance = getMessaging();
        const token = await getToken(messagingInstance);
        setFCM_token(token);
      } catch (err) {
        console.log('FCM Token generation skipped:', err);
      }
    }
    getFcmToken();
  }, []);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const expiry = await AsyncStorage.getItem('tokenExpiry');
        if (token && expiry && Date.now() > Number(expiry) * 1000) {
          await AsyncStorage.clear();
        }
      } catch (err) {
        console.log('Auth check failed:', err);
      }
    };
    checkLogin();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Branding Zone */}
          <View style={styles.headerContainer}>
            <View style={[styles.iconCircle, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Icon name="truck-fast" size={42} color={colors.primary} />
            </View>
            
            <Text style={[styles.brandText, { color: colors.secondary }]}>
              ParcelMtaani
            </Text>
            <Text style={[styles.taglineText, { color: colors.subText }]}>
              Secure Parcel Management Hub
            </Text>
          </View>

          {/* Form Interactive Card Container */}
          <View
            style={[
              styles.formCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                shadowColor: colors.shadow || '#000',
              },
            ]}
          >
            <Text style={[styles.welcomeText, { color: colors.text }]}>
              Welcome Back
            </Text>
            <Text style={[styles.instructionText, { color: colors.subText }]}>
              Sign in with your registered phone details to manage active workflows.
            </Text>

            {/* Structured Input Fields Layout */}
            <View style={{ marginBottom: 16 }}>
              <PhoneInput
                label="Phone Number"
                value={phone_number}
                country={country}
                onChangeCountry={setCountry}
                onChange={full => setPhoneNumber(full)}
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <FormInput
                label="Password"
                placeholder="••••••••"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <PrimaryButton 
              title="Sign In" 
              onPress={handleLogin} 
              loading={loading} 
            />

            <View style={styles.forgotPasswordContainer}>
              <TertiaryButton
                title="Forgot Password?"
                onPress={() => navigation.navigate('forgot password')}
                color={colors.primary}
              />
            </View>
          </View>

          {/* Clean Corporate Footer Section */}
          <View style={styles.footerContainer}>
            <Text style={{ color: colors.subText, fontSize: 14 }}>
              Don’t have an account?{' '}
              {/* Changed to colors.secondary to lock in a premium layout symmetry */}
              <Text 
                onPress={() => navigation.navigate('register')}
                style={{ color: colors.secondary, fontWeight: '700' }}
              >
                Sign Up
              </Text>
            </Text>
          </View>
          
        </ScrollView>
      </KeyboardAvoidingView>
      
      {msg.msg && <Toast setMsg={setMsg} msg={msg.msg} state={msg.state} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  brandText: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  taglineText: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  formCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    width: '100%',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  instructionText: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 24,
    lineHeight: 18,
  },
  forgotPasswordContainer: {
    marginTop: 18,
    alignItems: 'center',
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
});