import React, { useState } from 'react';
import { Dimensions, View, Text, TextInput, Image, TouchableOpacity, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const { width, height } = Dimensions.get('window');

const Login = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const lowercaseEmail = email.toLowerCase();

      const response = await axios.post(`https://jobjar.ai:3001/api/user-login`, { lowercaseEmail, password });
      const { token } = response.data;
      const id = response.data.id;
      console.log('response', response.data.id);

      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user_id', id);

      const jobId = await AsyncStorage.getItem('jobId');
      if (jobId) {
        await handleReferral(token, jobId);
      }

      setIsLoading(false);

      Alert.alert('Login Successful', 'You are now logged in.');

      navigation.navigate('MainTab');
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Login Failed', error.response?.data?.message || 'Failed to login, please check your credentials.');
    }
  };

  const handleReferral = async (token, jobId) => {
    try {
      await axios.post(`https://jobjar.ai:3001/api/referrals`, {
        jobId,
        referralId: await AsyncStorage.getItem('referralId'),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await AsyncStorage.removeItem('jobId');
      await AsyncStorage.removeItem('referralId');
    } catch (error) {
      console.error('Error handling referral:', error);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.contentContainer}
      >
        <View style={styles.logoContainer}>
          <Image source={require('./assets/whitelogo.png')} style={styles.logo} />
        </View>
        <Text style={styles.heading}>Welcome Back!</Text>
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.showButton} onPress={() => setShowPassword(!showPassword)}>
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} color="white" size={20} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.forgotButton}>
            <Text style={styles.forgotButtonText}>Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.buttonText}>Log In</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Don't have an account?{' '}
          <Text style={styles.signupLink} onPress={() => navigation.navigate('SignUp')}>
            Sign up
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: width * 0.05,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center', // Changed to center
    alignItems: 'center', // Added alignment
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: height * 0.03,
  },
  logo: {
    width: width * 0.8,
    height: height * 0.2,
    resizeMode: 'contain',
  },
  heading: {
    fontSize: width * 0.08,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: height * 0.02,
    marginTop: height * 0.02,
    textAlign: 'center',
  },
  form: {
    marginBottom: height * 0.03,
    width: '80%', // Added width constraint
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.04,
    color: 'white',
    fontSize: width * 0.04,
    marginBottom: height * 0.02,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  passwordInput: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.04,
    color: 'white',
    fontSize: width * 0.04,
  },
  showButton: {
    marginLeft: width * 0.03,
    paddingHorizontal: width * 0.03,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: height * 0.03,
  },
  forgotButtonText: {
    color: '#01bf02',
    fontSize: width * 0.04,
  },
  button: {
    backgroundColor: '#01bf02',
    paddingVertical: height * 0.02,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: width * 0.05,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginBottom: height * 0.1, // Reduced margin
  },
  footerText: {
    color: 'white',
    fontSize: width * 0.04,
    marginBottom: height * 0.05, // Reduced margin
  },
  signupLink: {
    color: '#01bf02',
    fontSize: width * 0.05,
    fontWeight: 'bold',
  },
});

export default Login;