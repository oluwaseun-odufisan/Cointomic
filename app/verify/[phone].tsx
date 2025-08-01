import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import { useSignIn, useSignUp } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { fetchAPI } from '@/app/lib/fetch';

const VerifyPhone = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { phone, signin } = useLocalSearchParams<{ phone: string; signin?: string }>();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const router = useRouter();
  const keyboardVerticalOffset = Platform.OS === 'ios' ? 80 : 0;

  const onVerify = async () => {
    if (!signUpLoaded || !signInLoaded) {
      Alert.alert('Error', 'Authentication service is not ready. Please try again.');
      return;
    }

    setLoading(true);

    try {
      if (signin === 'true') {
        const { createdSessionId } = await signIn!.attemptFirstFactor({
          strategy: 'phone_code',
          code,
        });

        if (createdSessionId) {
          await signIn!.setActive({ session: createdSessionId });
          router.replace('/(authenticated)/(tabs)/home');
        } else {
          throw new Error('Failed to sign in. Invalid code.');
        }
      } else {
        const { createdSessionId, createdUserId } = await signUp!.attemptPhoneNumberVerification({
          code,
        });

        if (createdSessionId && createdUserId) {
          await signUp!.setActive({ session: createdSessionId });

          const name = `${signUp!.firstName || 'User'} ${signUp!.lastName || ''}`.trim();
          await fetchAPI('/api/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              email: signUp!.emailAddress || 'unknown@example.com',
              clerkId: createdUserId,
            }),
          });

          router.replace('/(authenticated)/(tabs)/home');
        } else {
          throw new Error('Failed to sign up. Invalid code.');
        }
      }
    } catch (error: any) {
      console.error('Verification error:', JSON.stringify(error, null, 2));
      let errorMessage = 'Invalid verification code. Please try again.';
      if (error.clerkError && error.errors) {
        errorMessage = error.errors[0]?.longMessage || errorMessage;
      } else if (error.message.includes('Network request failed')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior="padding"
        keyboardVerticalOffset={keyboardVerticalOffset}>
        <View style={styles.innerContainer}>
          <Text style={styles.header}>Verify Your Phone</Text>
          <Text style={styles.subHeader}>Enter the code sent to {phone}</Text>

          <TextInput
            style={styles.input}
            placeholder="Verification Code"
            placeholderTextColor={Colors.gray}
            keyboardType="numeric"
            value={code}
            onChangeText={setCode}
          />

          <TouchableOpacity
            style={[
              defaultStyles.pillButton,
              code ? styles.enabled : styles.disabled,
              styles.verifyButton,
            ]}
            onPress={onVerify}
            disabled={!code || loading}>
            <Text style={defaultStyles.buttonText}>Verify</Text>
            {loading && <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 8 }} />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  header: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 16,
    color: Colors.gray,
    marginBottom: 32,
  },
  input: {
    width: '100%',
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.dark,
    marginBottom: 24,
  },
  verifyButton: {
    width: '100%',
    marginBottom: 24,
  },
  enabled: {
    backgroundColor: Colors.primary,
  },
  disabled: {
    backgroundColor: Colors.primaryMuted,
  },
});

export default VerifyPhone;