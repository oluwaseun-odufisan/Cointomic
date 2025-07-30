import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import { useSignUp } from '@clerk/clerk-expo';
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

const Signup = () => {
    const [countryCode, setCountryCode] = useState('+234');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const keyboardVerticalOffset = Platform.OS === 'ios' ? 80 : 0;
    const router = useRouter();
    const { signUp, isLoaded } = useSignUp();

    const onSignup = async () => {
        if (!isLoaded) {
            Alert.alert('Error', 'Authentication service is not ready. Please try again.');
            return;
        }

        // Ensure phone number is in E.164 format (e.g., +2341234567890)
        const fullPhoneNumber = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;

        // Validate phone number format
        if (!fullPhoneNumber.match(/^\+\d{10,15}$/)) {
            Alert.alert('Error', 'Please enter a valid phone number (10-15 digits).');
            return;
        }

        try {
            // Create sign-up with phone number
            const { supportedFirstFactors } = await signUp!.create({
                identifier: fullPhoneNumber,
            });

            // Find supported phone verification strategy
            const phoneFactor = supportedFirstFactors.find((factor: any) =>
                ['phone_code', 'sms'].includes(factor.strategy)
            );

            if (!phoneFactor) {
                throw new Error('Phone verification is not supported for this account.');
            }

            const { phoneNumberId } = phoneFactor;

            // Prepare phone number verification with the supported strategy
            await signUp!.prepareFirstFactor({
                strategy: phoneFactor.strategy,
                phoneNumberId,
            });

            router.push({ pathname: '/verify/[phone]', params: { phone: fullPhoneNumber } });
        } catch (error: any) {
            console.error('Error signing up:', JSON.stringify(error, null, 2));
            let errorMessage = 'Failed to sign up. Please try again.';
            if (error.clerkError && error.errors) {
                errorMessage = error.errors[0]?.longMessage || errorMessage;
            } else if (error.message.includes('Network request failed')) {
                errorMessage = 'Network error. Please check your connection and try again.';
            } else if (error.message.includes('Phone verification is not supported')) {
                errorMessage = 'Phone verification is not enabled. Please contact support.';
            }
            Alert.alert('Error', errorMessage);
        }
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

                    {/* Sign Up Button */}
                    <TouchableOpacity
                        style={[
                            defaultStyles.pillButton,
                            phoneNumber ? styles.enabled : styles.disabled,
                            styles.signupButton,
                        ]}
                        onPress={onSignup}
                        disabled={!phoneNumber}>
                        <Text style={defaultStyles.buttonText}>Sign Up</Text>
                    </TouchableOpacity>

                    {/* Login Link */}
                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Already have an account? </Text>
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
    signupButton: {
        width: '100%',
        marginBottom: 24,
    },
    enabled: {
        backgroundColor: Colors.primary,
    },
    disabled: {
        backgroundColor: Colors.primaryMuted,
    },
    loginContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
    },
    loginText: {
        fontSize: 16,
        color: Colors.gray,
    },
});

export default Signup;