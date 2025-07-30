import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import { isClerkAPIResponseError, useSignIn } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    FlatList,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';

// Comprehensive country code list, prioritizing Nigeria
const countryCodes = [
    { name: 'Nigeria', code: '+234' },
    { name: 'United States', code: '+1' },
    { name: 'United Kingdom', code: '+44' },
    { name: 'India', code: '+91' },
    { name: 'Canada', code: '+1' },
    { name: 'Australia', code: '+61' },
    { name: 'Brazil', code: '+55' },
    { name: 'China', code: '+86' },
    { name: 'France', code: '+33' },
    { name: 'Germany', code: '+49' },
    { name: 'Japan', code: '+81' },
    { name: 'South Africa', code: '+27' },
    { name: 'Kenya', code: '+254' },
    { name: 'Ghana', code: '+233' },
    { name: 'Egypt', code: '+20' },
    { name: 'Mexico', code: '+52' },
    { name: 'Russia', code: '+7' },
    { name: 'South Korea', code: '+82' },
];

enum SignInType {
    Phone,
    Email,
    Google,
    Apple,
}

const Login = () => {
    const [countryCode, setCountryCode] = useState('+234');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const keyboardVerticalOffset = Platform.OS === 'ios' ? 80 : 0;
    const router = useRouter();
    const { signIn, isLoaded } = useSignIn();

    const onSignIn = async (type: SignInType) => {
        if (!isLoaded) {
            Alert.alert('Error', 'Authentication service is not ready. Please try again.');
            return;
        }

        if (type === SignInType.Phone) {
            // Ensure phone number is in E.164 format (e.g., +2341234567890)
            const fullPhoneNumber = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;

            // Validate phone number format
            if (!fullPhoneNumber.match(/^\+\d{10,15}$/)) {
                Alert.alert('Error', 'Please enter a valid phone number (10-15 digits).');
                return;
            }

            try {
                const { supportedFirstFactors } = await signIn!.create({
                    identifier: fullPhoneNumber,
                });

                const phoneFactor = supportedFirstFactors.find((factor: any) =>
                    ['phone_code', 'sms'].includes(factor.strategy)
                );

                if (!phoneFactor) {
                    throw new Error('Phone verification is not supported for this account.');
                }

                const { phoneNumberId } = phoneFactor;

                await signIn!.prepareFirstFactor({
                    strategy: phoneFactor.strategy,
                    phoneNumberId,
                });

                router.push({
                    pathname: '/verify/[phone]',
                    params: { phone: fullPhoneNumber, signin: 'true' },
                });
            } catch (err: any) {
                console.error('Error signing in:', JSON.stringify(err, null, 2));
                let errorMessage = 'Failed to sign in. Please try again.';
                if (isClerkAPIResponseError(err)) {
                    errorMessage = err.errors[0]?.longMessage || errorMessage;
                } else if (err.message.includes('Network request failed')) {
                    errorMessage = 'Network error. Please check your connection and try again.';
                } else if (err.message.includes('Phone verification is not supported')) {
                    errorMessage = 'Phone verification is not enabled. Please contact support.';
                }
                Alert.alert('Error', errorMessage);
            }
        }
        // TODO: Implement Email, Google, and Apple sign-in flows
    };

    const renderCountryItem = ({ item }: { item: { name: string; code: string } }) => (
        <TouchableOpacity
            style={styles.countryItem}
            onPress={() => {
                setCountryCode(item.code);
                setShowCountryDropdown(false);
            }}>
            <Text style={styles.countryText}>{`${item.name} (${item.code})`}</Text>
        </TouchableOpacity>
    );

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior="padding"
                keyboardVerticalOffset={keyboardVerticalOffset}>
                <View style={styles.innerContainer}>
                    <Text style={styles.header}>Welcome to Cointomic</Text>
                    <Text style={styles.subHeader}>Sign in to continue</Text>

                    {/* Phone Number Input with Country Code Dropdown */}
                    <View style={styles.inputContainer}>
                        <TouchableOpacity
                            style={styles.countryCodeButton}
                            onPress={() => setShowCountryDropdown(!showCountryDropdown)}>
                            <Text style={styles.countryCodeText}>{countryCode}</Text>
                            <Ionicons
                                name={showCountryDropdown ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color={Colors.gray}
                            />
                        </TouchableOpacity>
                        <TextInput
                            style={styles.phoneInput}
                            placeholder="Phone Number"
                            placeholderTextColor={Colors.gray}
                            keyboardType="numeric"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                        />
                    </View>

                    {showCountryDropdown && (
                        <View style={styles.dropdownContainer}>
                            <FlatList
                                data={countryCodes}
                                renderItem={renderCountryItem}
                                keyExtractor={(item) => item.code}
                                style={styles.dropdown}
                                showsVerticalScrollIndicator={true}
                            />
                        </View>
                    )}

                    {/* Continue Button */}
                    <TouchableOpacity
                        style={[
                            defaultStyles.pillButton,
                            phoneNumber ? styles.enabled : styles.disabled,
                            styles.continueButton,
                        ]}
                        onPress={() => onSignIn(SignInType.Phone)}
                        disabled={!phoneNumber}>
                        <Text style={defaultStyles.buttonText}>Continue with Phone</Text>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or sign in with</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Social Login Buttons */}
                    <TouchableOpacity
                        style={styles.socialButton}
                        onPress={() => onSignIn(SignInType.Email)}>
                        <Ionicons name="mail" size={24} color={Colors.dark} />
                        <Text style={styles.socialButtonText}>Continue with Email</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.socialButton}
                        onPress={() => onSignIn(SignInType.Google)}>
                        <Ionicons name="logo-google" size={24} color={Colors.dark} />
                        <Text style={styles.socialButtonText}>Continue with Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.socialButton}
                        onPress={() => onSignIn(SignInType.Apple)}>
                        <Ionicons name="logo-apple" size={24} color={Colors.dark} />
                        <Text style={styles.socialButtonText}>Continue with Apple</Text>
                    </TouchableOpacity>

                    {/* Sign Up Link */}
                    <View style={styles.signupContainer}>
                        <Text style={styles.signupText}>Don't have an account? </Text>
                        <Link href="/signup" replace asChild>
                            <TouchableOpacity>
                                <Text style={defaultStyles.textLink}>Sign Up</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 24,
    },
    countryCodeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.lightGray,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginRight: 12,
    },
    countryCodeText: {
        fontSize: 16,
        color: Colors.dark,
        marginRight: 8,
    },
    phoneInput: {
        flex: 1,
        backgroundColor: Colors.lightGray,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: Colors.dark,
    },
    dropdownContainer: {
        width: '100%',
        maxHeight: 200,
        backgroundColor: Colors.lightGray,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: Colors.gray,
    },
    dropdown: {
        width: '100%',
    },
    countryItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray,
    },
    countryText: {
        fontSize: 16,
        color: Colors.dark,
    },
    continueButton: {
        width: '100%',
        marginBottom: 24,
    },
    enabled: {
        backgroundColor: Colors.primary,
    },
    disabled: {
        backgroundColor: Colors.primaryMuted,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.gray,
    },
    dividerText: {
        color: Colors.gray,
        fontSize: 14,
        marginHorizontal: 16,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        backgroundColor: Colors.lightGray,
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
    },
    socialButtonText: {
        fontSize: 16,
        color: Colors.dark,
        marginLeft: 16,
        fontWeight: '500',
    },
    signupContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
    },
    signupText: {
        fontSize: 16,
        color: Colors.gray,
    },
});

export default Login;