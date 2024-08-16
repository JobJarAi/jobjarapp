// TalentSignUp.js for React Native
import React, { useState, useEffect, useCallback } from 'react';
import { View, Image, TouchableOpacity, ScrollView, StyleSheet, Alert, Text, TextInput } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from './assets/whitelogo.png';
import DirectResumeUpload from './DirectResumeUpload';
import PersonalDetails from './sections/PersonalDetails';
import SkillsSection from './sections/SkillsSection';
import WorkHistorySection from './sections/WorkHistorySection';
import EducationSection from './sections/EducationSection';
import AdditionalDetails from './sections/AdditionalDetails';
import useFormState from './hooks/useFormState';
import JobPreferences from './sections/JobPreferences';
import IndustriesAndJobTitles from './sections/IndustriesAndJobTitles';

const TalentSignUp = ({ navigation }) => {
    const [currentSection, setCurrentSection] = useState(0);
    const [resumeData, setResumeData] = useState(null);
    const { formData, setFormData } = useFormState(resumeData);
    const [email, setEmail] = useState("");
    const [emailSent, setEmailSent] = useState(false);
    const [isEmailValid, setIsEmailValid] = useState(null);
    const [verificationToken, setVerificationToken] = useState('');
    const [isTokenVerified, setIsTokenVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const totalSections = 7;

    useEffect(() => {
        if (!formData.preferredLocation) {
            setFormData({
                ...formData,
                preferredLocation: {
                    preferredCity: '',
                    preferredState: ''
                }
            });
        }
    }, [formData, setFormData]);

    const goToNextSection = () => {
        if (currentSection < totalSections - 1) {
            console.log("Going to next section:", currentSection + 1);
            setCurrentSection(currentSection + 1);
        }
    };

    const goToPreviousSection = () => {
        if (currentSection > 0) {
            console.log("Going to previous section:", currentSection - 1);
            setCurrentSection(currentSection - 1);
        }
    };

    const validateEmail = (email) => {
        const isValid = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);
        setIsEmailValid(isValid);
        return isValid;
    };

    const handleEmailChange = (e) => {
        const emailValue = e.nativeEvent.text;
        setEmail(emailValue);
        validateEmail(emailValue);
    };

    const sendVerificationEmail = async () => {
        if (!isEmailValid) {
            console.log('Invalid email address.'); // Add this for debugging
            setError('Invalid email address.');
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(`localhost:3001/api/email`, { email });
            if (response.status === 200) {
                setEmailSent(true);
                setError(''); // Clear any previous errors
            } else {
                console.log('Failed to send verification email.'); // Add this for debugging
                setError('Failed to send verification email.');
            }
        } catch (error) {
            console.log('Error sending verification email.', error); // Add this for debugging
            setError('Error sending verification email.');
        } finally {
            setLoading(false);
        }
    };
    
    const verifyEmail = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`localhost:3001/api/verify`, { email, code: verificationToken });
            if (response.data.message === "Email verification successful") {
                setIsTokenVerified(true);
                setError(''); // Clear any previous errors
            } else {
                console.log('Verification failed.'); // Add this for debugging
                setError('Verification failed.');
            }
        } catch (error) {
            console.log('Error during verification.', error); // Add this for debugging
            setError('Error during verification.');
        } finally {
            setLoading(false);
        }
    };    

    const handleResumeUpload = useCallback((parsedData) => {
        setResumeData(parsedData);
        setFormData(parsedData);
    }, [setFormData]);

    const handleSubmit = async () => {
        if (resumeData) {
            const roleUrlSegment = 'jobseeker';
            try {
                const response = await axios.post(`localhost:3001/api/signup/${roleUrlSegment}`, formData);
                if (response.status === 200 || response.status === 201) {
                    await AsyncStorage.setItem('auth_token', response.data.token);
                    await AsyncStorage.setItem('user_role', response.data.role);
                    navigation.navigate('Login'); // Adjust to your home screen route
                } else {
                    // Handle other status codes
                    Alert.alert('Submission Error', `An error occurred: ${response.status}`);
                }
            } catch (error) {
                if (error.response && error.response.data === 'Email already exists') {
                    Alert.alert('Email Error', 'This email address is already in use. Please use a different email or log in.');
                } else {
                    console.error('Error submitting resume:', error.response ? error.response.data : error);
                    Alert.alert('Submission Error', error.response ? error.response.data : 'An error occurred during resume submission.');
                }
            }
        }
    };

    const userLogin = () => {
        navigation.navigate('Login');
    };

    return (
        <>
            {currentSection !== 6 ? (
                <ScrollView style={styles.container}>
                    <View style={styles.logoContainer}>
                        <Image source={Logo} style={styles.logo} />
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
                                {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
                            </>
                        ) : (
                            <>
                                {resumeData && (
                                    <>
                                        {currentSection === 0 && <PersonalDetails formData={formData} setFormData={setFormData} />}
                                        {currentSection === 1 && formData.skillLevels && (
                                            <SkillsSection
                                                initialSkills={formData.skillLevels}
                                                setSkills={(skills) => setFormData({ ...formData, skillLevels: skills })}
                                            />
                                        )}
                                        {currentSection === 2 && <WorkHistorySection formData={formData} setFormData={setFormData} />}
                                        {currentSection === 3 && <EducationSection formData={formData} setFormData={setFormData} />}
                                        {currentSection === 4 && <AdditionalDetails formData={formData} setFormData={setFormData} />}
                                        {currentSection === 5 && <JobPreferences formData={formData} setFormData={setFormData} />}
                                        <NavigationButtons currentSection={currentSection} totalSections={totalSections} goToPreviousSection={goToPreviousSection} goToNextSection={goToNextSection} handleSubmit={handleSubmit} />
                                    </>
                                )}
                                {!resumeData && (
                                    <DirectResumeUpload onUploadSuccess={handleResumeUpload} />
                                )}
                            </>
                        )}
                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Already have an account?</Text>
                            <TouchableOpacity onPress={userLogin} style={styles.loginButton}>
                                <Text style={styles.loginButtonText}>Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            ) : (
                <View style={styles.container}>
                    <View style={styles.logoContainer}>
                        <Image source={Logo} style={styles.logo} />
                    </View>
                    <View style={styles.formContainer}>
                        {resumeData && (
                            <>
                                <IndustriesAndJobTitles formData={formData} setFormData={setFormData} />
                                <NavigationButtons currentSection={currentSection} totalSections={totalSections} goToPreviousSection={goToPreviousSection} goToNextSection={goToNextSection} handleSubmit={handleSubmit} />
                            </>
                        )}
                    </View>
                </View>
            )}
        </>
    );
};

// NavigationButtons.js
const NavigationButtons = ({ currentSection, totalSections, goToPreviousSection, goToNextSection, handleSubmit }) => (
    <View style={styles.navigationButtons}>
        {currentSection > 0 && (
            <TouchableOpacity onPress={goToPreviousSection}>
                <Text style={styles.navigationText}>Previous</Text>
            </TouchableOpacity>
        )}

        {currentSection < totalSections - 1 && (
            <TouchableOpacity onPress={goToNextSection}>
                <Text style={styles.navigationText}>Next</Text>
            </TouchableOpacity>
        )}

        {currentSection === totalSections - 1 && (
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
        )}
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 30,
    },
    logo: {
        width: 300,
        height: 65,
        resizeMode: 'contain',
    },
    formContainer: {
        paddingHorizontal: 20,
    },
    resumeContainer: {
        paddingVertical: 30,
    },
    heading: {
        fontSize: 22,
        fontWeight: '600',
        color: '#333',
        marginVertical: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        marginTop: 50,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#01bf02',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 5,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    skillsContainer: {
        marginTop: 15,
        marginBottom: 15,
    },
    skillItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
    },
    skillLabel: {
        fontWeight: 'bold',
        color: '#fff'
    },
    skillLevel: {
        fontStyle: 'italic',
        color: '#fff'
    },
    workHistoryContainer: {
        marginTop: 15,
        marginBottom: 15,
    },
    jobItem: {
        marginBottom: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
    },
    jobTitle: {
        fontWeight: 'bold',
        color: '#fff',
    },
    jobDetails: {
        color: '#fff',
        fontStyle: 'italic',
    },
    navigationButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
    },
    navigationText: {
        fontSize: 16,
        color: '#01bf02',
        fontWeight: 'bold',
    },
    educationContainer: {
        marginTop: 15,
        marginBottom: 15,
    },
    educationItem: {
        marginBottom: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
    },
    errorMessage: {
        color: 'red',
        textAlign: 'center',
        fontSize: 16, // Ensure font size is adequate
        marginTop: 10,
        marginBottom: 20,
    },    
    educationInstitution: {
        fontWeight: 'bold',
        color: '#fff',
    },
    educationDetails: {
        color: '#fff',
        fontStyle: 'italic',
    },
    profileItem: {
        marginBottom: 10,
    },
    experienceItem: {
        marginBottom: 10,
    },
    certificationItem: {
        marginBottom: 10,
    },
    softwareItem: {
        marginBottom: 10,
    },
    trainingItem: {
        marginBottom: 10,
    },
    endorsementItem: {
        marginBottom: 10,
    },
    awardItem: {
        marginBottom: 10,
    },
    publicationItem: {
        marginBottom: 10,
    },
    itemText: {
        color: '#fff',
        marginBottom: 5,
    },
    label: {
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    box: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    formGroup: {
        marginTop: 10,
    },
    formContainer: {
        paddingHorizontal: 20,
        flex: 1,
    },
    loginContainer: {
        marginTop: 50,
        alignItems: 'center',
    },
    loginText: {
        color: '#fff',
        fontSize: 16,
    },
    loginButton: {
        marginTop: 10,
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default TalentSignUp;