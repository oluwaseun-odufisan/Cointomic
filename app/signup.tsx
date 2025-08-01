import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import { useSignUp, useOAuth } from '@clerk/clerk-expo';
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
    FlatList,
    TouchableWithoutFeedback,
    Keyboard,
    Alert,
    ActivityIndicator,
    Image,
} from 'react-native';
import { googleOAuth, appleOAuth } from '@/app/lib/auth';
import { icons } from '@/constants/icons';

const countryCodes = [
    { name: 'Nigeria', code: '+234' },
    { name: 'United States', code: '+1' },
    { name: 'United Kingdom', code: '+44' },
    { name: 'India', code: '+91' },
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

enum SignUpType {
    Phone,
    Email,
    Google,
    Apple,
}

const Signup = () => {
    const [countryCode, setCountryCode] = useState('+234');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [inputType, setInputType] = useState<SignUpType>(SignUpType.Phone);
    const keyboardVerticalOffset = Platform.OS === 'ios' ? 80 : 0;
    const router = useRouter();
    const { signUp, isLoaded } = useSignUp();
    const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: 'oauth_google' });
    const { startOAuthFlow: startAppleOAuth } = useOAuth({ strategy: 'oauth_apple' });

    const onSignup = async (type: SignUpType) => {
        if (!isLoaded) {
            Alert.alert('Error', 'Authentication service is not ready. Please try again.');
            return;
        }

        setLoading(true);

        try {
            if (type === SignUpType.Phone) {
                const fullPhoneNumber = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;
                if (!fullPhoneNumber.match(/^\+\d{10,15}$/)) {
                    Alert.alert('Error', 'Please enter a valid phone number (10-15 digits).');
                    return;
                }

                const { supportedFirstFactors } = await signUp!.create({
                    phoneNumber: fullPhoneNumber,
                });

                const phoneFactor = supportedFirstFactors.find((factor: any) =>
                    ['phone_code', 'sms'].includes(factor.strategy)
                );

                if (!phoneFactor) {
                    throw new Error('Phone verification is not supported.');
                }

                const { phoneNumberId } = phoneFactor;

                await signUp!.prepareFirstFactor({
                    strategy: phoneFactor.strategy,
                    phoneNumberId,
                });

                router.push({ pathname: '/verify/[phone]', params: { phone: fullPhoneNumber } });
            } else if (type === SignUpType.Email) {
                if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                    Alert.alert('Error', 'Please enter a valid email address.');
                    return;
                }

                const { supportedFirstFactors } = await signUp!.create({
                    emailAddress: email,
                });

                const emailFactor = supportedFirstFactors.find((factor: any) =>
                    factor.strategy === 'email_code'
                );

                if (!emailFactor) {
                    throw new Error('Email verification is not supported.');
                }

                const { emailAddressId } = emailFactor;

                await signUp!.prepareFirstFactor({
                    strategy: 'email_code',
                    emailAddressId,
                });

                router.push({ pathname: '/verify/[email]', params: { email } });
            } else if (type === SignUpType.Google) {
                const result = await googleOAuth(startGoogleOAuth);
                if (result.success) {
                    setTimeout(() => {
                        router.replace('/(authenticated)/(tabs)/home');
                    }, 100);
                } else {
                    Alert.alert('Error', result.message);
                }
            } else if (type === SignUpType.Apple) {
                const result = await appleOAuth(startAppleOAuth);
                if (result.success) {
                    setTimeout(() => {
                        router.replace('/(authenticated)/(tabs)/home');
                    }, 100);
                } else {
                    Alert.alert('Error', result.message);
                }
            }
        } catch (error: any) {
            console.error('Error signing up:', JSON.stringify(error, null, 2));
            let errorMessage = 'Failed to sign up. Please try again.';
            if (error.clerkError && error.errors) {
                errorMessage = error.errors[0]?.longMessage || errorMessage;
            } else if (error.message.includes('Network request failed')) {
                errorMessage = 'Network error. Please check your connection and try again.';
            } else if (error.message.includes('not supported')) {
                errorMessage = 'This sign-up method is not enabled. Please contact support.';
            }
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSwitchInput = () => {
        setInputType(inputType === SignUpType.Phone ? SignUpType.Email : SignUpType.Phone);
        setPhoneNumber('');
        setEmail('');
        setShowCountryDropdown(false);
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
                    <Text style={styles.header}>Join Cointomic</Text>
                    <Text style={styles.subHeader}>Create an account to get started</Text>

                    <View style={styles.inputSection}>
                        {inputType === SignUpType.Phone && (
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
                                    style={styles.input}
                                    placeholder="Phone Number"
                                    placeholderTextColor={Colors.gray}
                                    keyboardType="numeric"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                />
                            </View>
                        )}

                        {showCountryDropdown && inputType === SignUpType.Phone && (
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

                        {inputType === SignUpType.Email && (
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email Address"
                                    placeholderTextColor={Colors.gray}
                                    keyboardType="email-address"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                />
                            </View>
                        )}
                    </View>

                    <View style={styles.buttonSection}>
                        <TouchableOpacity
                            style={[
                                defaultStyles.pillButton,
                                (inputType === SignUpType.Phone ? phoneNumber : email) ? styles.enabled : styles.disabled,
                                styles.actionButton,
                            ]}
                            onPress={() => onSignup(inputType)}
                            disabled={inputType === SignUpType.Phone ? !phoneNumber || loading : !email || loading}>
                            <Text style={defaultStyles.buttonText}>
                                {inputType === SignUpType.Phone ? 'Sign Up with Phone' : 'Sign Up with Email'}
                            </Text>
                            {loading && <ActivityIndicator size="small" color="#fff" style={styles.buttonLoader} />}
                        </TouchableOpacity>

                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or sign up with</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={handleSwitchInput}
                            disabled={loading}>
                            <Ionicons
                                name={inputType === SignUpType.Phone ? 'mail' : 'call'}
                                size={24}
                                color={Colors.dark}
                            />
                            <Text style={styles.socialButtonText}>
                                {inputType === SignUpType.Phone ? 'Continue with Email' : 'Continue with Phone'}
                            </Text>
                            {loading && <ActivityIndicator size="small" color={Colors.dark} style={styles.buttonLoader} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => onSignup(SignUpType.Google)}
                            disabled={loading}>
                            <Image source={icons.google} style={styles.socialIcon} />
                            <Text style={styles.socialButtonText}>Continue with Google</Text>
                            {loading && <ActivityIndicator size="small" color={Colors.dark} style={styles.buttonLoader} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => onSignup(SignUpType.Apple)}
                            disabled={loading}>
                            <Ionicons name="logo-apple" size={24} color={Colors.dark} />
                            <Text style={styles.socialButtonText}>Continue with Apple</Text>
                            {loading && <ActivityIndicator size="small" color={Colors.dark} style={styles.buttonLoader} />}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <Link href="/login" replace asChild>
                            <TouchableOpacity>
                                <Text style={defaultStyles.textLink}>Log In</Text>
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
        marginBottom: 12,
        textAlign: 'center',
    },
    subHeader: {
        fontSize: 16,
        color: Colors.gray,
        marginBottom: 32,
        textAlign: 'center',
    },
    inputSection: {
        width: '100%',
        marginBottom: 24,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 16,
    },
    countryCodeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.lightGray,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 16,
        marginRight: 12,
        borderWidth: 1,
        borderColor: Colors.gray,
        minWidth: 80,
    },
    countryCodeText: {
        fontSize: 16,
        color: Colors.dark,
        marginRight: 8,
    },
    input: {
        flex: 1,
        backgroundColor: Colors.lightGray,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: Colors.dark,
        borderWidth: 1,
        borderColor: Colors.gray,
        minHeight: 56,
    },
    dropdownContainer: {
        width: '100%',
        maxHeight: 200,
        backgroundColor: Colors.lightGray,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.gray,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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
    buttonSection: {
        width: '100%',
        marginBottom: 24,
    },
    actionButton: {
        width: '100%',
        marginBottom: 16,
        paddingVertical: 16,
        borderRadius: 12,
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
        marginVertical: 20,
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
        fontWeight: '500',
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        backgroundColor: Colors.lightGray,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.gray,
    },
    socialButtonText: {
        fontSize: 16,
        color: Colors.dark,
        marginLeft: 12,
        fontWeight: '500',
    },
    socialIcon: {
        width: 24,
        height: 24,
    },
    buttonLoader: {
        marginLeft: 8,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
    },
    footerText: {
        fontSize: 16,
        color: Colors.gray,
    },
});

export default Signup;