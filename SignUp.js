import React, { useState } from 'react';
import { View, Image, TouchableOpacity, ScrollView, StyleSheet, Alert, Text, TextInput } from 'react-native';
import axios from 'axios';
import Logo from './assets/whitelogo.png';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheck, faEye, faEyeSlash, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

const SignUp = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRequirements, setPasswordRequirements] = useState({
        length: false,
        letter: false,
        number: false,
        specialChar: false,
    });
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [emailVerified, setEmailVerified] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordError, setPasswordError] = useState(false);

    const validateEmail = (email) => {
        const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        return re.test(String(email).toLowerCase());
    };

    const validatePassword = (password) => {
        const length = password.length >= 8;
        const letter = /[a-zA-Z]/.test(password);
        const number = /[0-9]/.test(password);
        const specialChar = /[@$!%*?&]/.test(password);

        setPasswordRequirements({
            length,
            letter,
            number,
            specialChar,
        });

        return length && letter && number && specialChar;
    };

    const handleSendVerificationEmail = async () => {
        setVerificationSent(true);
        try {
            const response = await axios.post(`http://localhost:3001/api/email`, { email });
            if (response.status === 200) {
                Alert.alert('Verification email sent', 'Please check your email for the verification code.');
            } else {
                throw new Error('Failed to send verification email.');
            }
        } catch (error) {
            Alert.alert('Error', error.toString());
        }
    };

    const handleVerifyEmail = async () => {
        try {
            const response = await axios.post(`http://localhost:3001/api/verify`, {
                email, code: verificationCode
            });
            if (response.data.message === "Email verification successful") {
                setEmailVerified(true);
                setVerificationSent(false);
                Alert.alert('Email verified successfully', 'You can now create your account.');
                setVerificationCode('');
            } else {
                throw new Error('Verification failed. Please try again.');
            }
        } catch (error) {
            Alert.alert('Verification error', error.response?.data?.message || error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);

        if (!isEmailValid) {
            setEmailError(true);
            return;
        }

        if (!isPasswordValid) {
            setPasswordError(true);
            return;
        }

        try {
            setIsLoading(true);

            const lowercaseEmail = email.toLowerCase();
            await axios.post(`http://localhost:3001/api/user-signup`, {
                lowercaseEmail, password, firstName, lastName,
            });

            Alert.alert('Account created successfully', 'You can now log in with your new account.');

            navigation.navigate('Login');
        } catch (error) {
            Alert.alert('An error occurred', error.response?.data?.error || error.message);
        }
        setIsLoading(false);
    };

    const userLogin = () => {
        navigation.navigate('Login');
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.logoContainer}>
                <Image source={Logo} style={styles.logo} />
            </View>
            <View style={styles.formContainer}>
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        placeholder="First Name"
                        placeholderTextColor="#888"
                        value={firstName}
                        onChangeText={setFirstName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Last Name"
                        placeholderTextColor="#888"
                        value={lastName}
                        onChangeText={setLastName}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.input, emailError && styles.inputError]}
                        placeholder="Email"
                        placeholderTextColor="#888"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            setEmailError(!validateEmail(text));
                        }}
                        editable={!emailVerified}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    {emailVerified ? (
                        <FontAwesomeIcon icon={faCheck} color="#01bf02" style={styles.inputIcon} />
                    ) : (
                        <TouchableOpacity onPress={handleSendVerificationEmail} style={styles.inputIcon}>
                            <FontAwesomeIcon icon={faPaperPlane} color="#01bf02" />
                        </TouchableOpacity>
                    )}
                </View>
                {verificationSent && (
                    <View style={styles.verificationContainer}>
                        <TextInput
                            style={styles.verificationInput}
                            placeholder="Verification Code"
                            placeholderTextColor="#888"
                            value={verificationCode}
                            onChangeText={setVerificationCode}
                            keyboardType="number-pad"
                        />
                        <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyEmail}>
                            <Text style={styles.verifyButtonText}>Verify</Text>
                        </TouchableOpacity>
                    </View>
                )}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.input, passwordError && styles.inputError]}
                        placeholder="Password"
                        placeholderTextColor="#888"
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            setPasswordError(!validatePassword(text));
                        }}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.inputIcon}>
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} color="white" />
                    </TouchableOpacity>
                </View>
                <View style={styles.requirementsContainer}>
                    <Text style={styles.requirementsHeader}>Password Requirements:</Text>
                    {Object.entries(passwordRequirements).map(([key, value]) => (
                        <View key={key} style={styles.requirementItem}>
                            <FontAwesomeIcon
                                icon={faCheck}
                                color={value ? '#01bf02' : '#888'}
                                style={styles.requirementIcon}
                            />
                            <Text style={[styles.requirementText, value && styles.requirementMet]}>
                                {key === 'length' && '8 Characters'}
                                {key === 'letter' && 'Text'}
                                {key === 'number' && '1+ Numbers'}
                                {key === 'specialChar' && 'Special Character'}
                            </Text>
                        </View>
                    ))}
                </View>
                {emailVerified && (
                    <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isLoading}>
                        <Text style={styles.buttonText}>{isLoading ? 'Creating Account...' : 'Create Account'}</Text>
                    </TouchableOpacity>
                )}
                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Already have an account?</Text>
                    <TouchableOpacity onPress={userLogin} style={styles.loginButton}>
                        <Text style={styles.loginButtonText}>Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    logo: {
        width: 300,
        height: 75,
        resizeMode: 'contain',
      },
    formContainer: {
        marginTop: 30,
        paddingHorizontal: 30,
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    input: {
        backgroundColor: '#333',
        borderRadius: 8,
        paddingVertical: 16,
        paddingHorizontal: 16,
        color: 'white',
        fontSize: 16,
        flex: 1,
        marginRight: 8,
    },
    inputError: {
        borderWidth: 1,
        borderColor: 'red',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    inputIcon: {
        marginLeft: 8,
    },
    requirementsContainer: {
        marginBottom: 30,
    },
    requirementsHeader: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 10,
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    requirementIcon: {
        marginRight: 8,
    },
    requirementText: {
        color: '#888',
        fontSize: 14,
    },
    requirementMet: {
        color: '#01bf02',
    },
    button: {
        backgroundColor: '#01bf02',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loginContainer: {
        marginTop: 60,
        alignItems: 'center',
    },
    loginText: {
        color: 'white',
        fontSize: 16,
    },
    loginButton: {
        marginTop: 10,
    },
    loginButtonText: {
        color: '#01bf02',
        fontSize: 18,
        fontWeight: 'bold',
    },
    verificationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    verificationInput: {
        backgroundColor: '#333',
        borderRadius: 8,
        paddingVertical: 16,
        paddingHorizontal: 16,
        color: 'white',
        fontSize: 16,
        flex: 1,
        marginRight: 8,
    },
    verifyButton: {
        backgroundColor: '#01bf02',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    verifyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SignUp;