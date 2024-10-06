// ForgotPassword.js for React Native
import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [emailSent, setEmailSent] = useState(false);
    const [isEmailValid, setIsEmailValid] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [verificationToken, setVerificationToken] = useState('');
    const [isTokenVerified, setIsTokenVerified] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigation = useNavigation();

    const validateEmail = (email) => {
        const isValid = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);
        setIsEmailValid(isValid);
        return isValid;
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleEmailChange = (e) => {
        const emailValue = e.nativeEvent.text;
        setEmail(emailValue);
        validateEmail(emailValue);
    };

    const sendVerificationEmail = async () => {
        if (!isEmailValid) {
            setError('Invalid email address.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`http://localhost:3001/api/email`, {
                email: email
            });

            if (response.status === 200) {
                setEmailSent(true);
            } else {
                setError('Failed to send verification email.');
            }
        } catch (error) {
            setError('Error sending verification email.');
        } finally {
            setLoading(false);
        }
    };

    const verifyEmail = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`http://localhost:3001/api/verify`, {
                email: email,
                code: verificationToken
            });

            if (response.data.message === "Email verification successful") {
                setIsTokenVerified(true);
            } else {
                setError('Verification failed.');
            }
        } catch (error) {
            setError('Error during verification.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.put(`http://localhost:3001/api/reset-password`, {
                email: email,
                newPassword: newPassword
            });

            if (response.status === 200) {
                // Navigate to the login screen upon successful password reset
                navigation.navigate('Login');
            } else {
                setError('Error resetting password.');
            }
        } catch (error) {
            setError('Error resetting password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.logoContainer}>
                <Image source={require('../assets/whitelogo.png')} style={styles.logo} />
            </View>

            <View style={styles.formContainer}>
                {!isTokenVerified ? (
                    <>
                        <TextInput
                            style={[styles.input, isEmailValid === false ? styles.inputError : isEmailValid ? styles.inputSuccess : null]}
                            onChange={handleEmailChange}
                            value={email}
                            placeholder="Enter email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            style={styles.button}
                            onPress={sendVerificationEmail}
                            disabled={loading || !isEmailValid}
                        >
                            <Text style={styles.buttonText}>Send Verification Email</Text>
                        </TouchableOpacity>

                        {emailSent && (
                            <>
                                <TextInput
                                    style={styles.input}
                                    onChangeText={setVerificationToken}
                                    value={verificationToken}
                                    placeholder="Enter verification code"
                                />
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={verifyEmail}
                                    disabled={loading}
                                >
                                    <Text style={styles.buttonText}>Verify</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        {/* Password reset form */}
                        <TextInput
                            style={styles.input}
                            onChangeText={setNewPassword}
                            value={newPassword}
                            placeholder="Enter new password"
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={togglePasswordVisibility}>
                            <Text>{showPassword ? "Hide" : "Show"}</Text>
                        </TouchableOpacity>
                        <TextInput
                            style={styles.input}
                            onChangeText={setConfirmPassword}
                            value={confirmPassword}
                            placeholder="Confirm new password"
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleResetPassword}
                            disabled={loading || newPassword !== confirmPassword || newPassword === ''}
                        >
                            <Text style={styles.buttonText}>Reset Password</Text>
                        </TouchableOpacity>

                        {/* Error messages */}
                        {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
                        {newPassword !== confirmPassword && newPassword !== '' ? (
                            <Text style={styles.errorMessage}>Passwords do not match</Text>
                        ) : null}
                    </>
                )}
                {/* Navigation to login screen */}
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.loginLink}>Remember your password? Login here</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000', // Match the login screen's background color
        padding: 20,
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
      },
    logo: {
        width: 250, // Adjust the logo size to fit your design
        height: 120, // Adjust the logo size to fit your design
        resizeMode: 'contain',
    },
    formContainer: {
        marginTop: 50, // Adjust spacing to match login screen layout
    },
    input: {
        height: 50, // Match the login screen's input field height
        margin: 12,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#fff', // Assuming the login screen has white borders
        padding: 10,
        borderRadius: 5, // Match the login screen's input field border-radius
        color: '#fff', // Input text color
    },
    button: {
        alignItems: "center",
        backgroundColor: "#01bf02", // Match the login screen's button color
        padding: 10, // Match the login screen's button padding
        borderRadius: 5,
        marginTop: 10, // Add some top margin to match layout
    },
    buttonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
      },
    loginLink: {
        color: '#ffffff', // Match the login screen's link color
        textAlign: 'center',
        marginTop: 30,
        fontSize: 20,
    },
    inputError: {
        borderColor: 'red',
    },
    inputSuccess: {
        borderColor: 'green',
    },
    errorMessage: {
        color: 'red',
        textAlign: 'center',
        marginTop: 10,
    },
    // If there are other styles on the login screen that you want to match,
    // such as font sizes or specific colors, add them here.
});


export default ForgotPassword;
