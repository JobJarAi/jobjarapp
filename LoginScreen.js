import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

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

      const response = await axios.post(`http://localhost:3001/api/user-login`, { lowercaseEmail, password });
      const { token } = response.data;

      await AsyncStorage.setItem('auth_token', token);

      // Handle referrals here if needed
      const jobId = await AsyncStorage.getItem('jobId');
      if (jobId) {
        await handleReferral(token, jobId);
      }

      setIsLoading(false);

      Alert.alert('Login Successful', 'You are now logged in.');

      navigation.navigate('MainTab'); // Navigate to the main tab regardless of role
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Login Failed', error.response?.data?.message || 'Failed to login, please check your credentials.');
    }
  };

  const handleReferral = async (token, jobId) => {
    try {
      await axios.post(`http://localhost:3001/api/referrals`, {
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.logoContainer}>
        <Image source={require('./assets/whitelogo.png')} style={styles.logo} />
        <Text style={styles.heading}>Login</Text>
      </View>
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
            style={[styles.input, { flex: 1 }]}
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.showButton} onPress={() => setShowPassword(!showPassword)}>
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} color="white" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.buttonText}>Log In</Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Don't have an account?{' '}
          <Text style={styles.signupLink} onPress={() => navigation.navigate('SignUp')}>
            Sign up
          </Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
  },
  form: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: 'white',
    fontSize: 16,
    marginBottom: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  showButton: {
    marginLeft: 10,
  },
  button: {
    backgroundColor: '#01bf02',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: 'white',
    fontSize: 16,
  },
  signupLink: {
    color: '#01bf02',
    fontWeight: 'bold',
  },
});

export default Login;