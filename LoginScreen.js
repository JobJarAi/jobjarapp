import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const Login = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`https://jobjar.ai:3001/api/login`, { email, password });
      const { token, refreshToken, role } = response.data;

      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('refresh_token', refreshToken);
      await AsyncStorage.setItem('user_role', role);

      // Navigate based on role
      if (role === 'jobseeker') {
        navigation.navigate("MainTab");
      } else if (role === 'recruiter') {
        navigation.navigate("Toolbox");
      } else if (role === 'employer') {
        navigation.navigate("JobListings");
      }
    } catch (error) {
      console.error("Login Error:", error.response);
      Alert.alert('Login Failed', error.response?.data?.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image source={require('./assets/whitelogo.png')} style={styles.logo} />
        </View>
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#cccccc" // Adjust placeholder text color
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]} // Make input flex
              placeholder="Password"
              placeholderTextColor="#cccccc" // Adjust placeholder text color
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.showButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.showButtonText}>Show</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.buttonStyle} onPress={handleLogin}>
        {isLoading && <ActivityIndicator size="large" color="#fff" />}
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotPassword}>Forgot password?</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 250, // Adjust the logo size to fit your design
    height: 120, // Adjust the logo size to fit your design
    resizeMode: 'contain',
  },
  form: {
    width: '90%',
    alignItems: 'flex-start',
    justifyContent: "flex-start",
  },
  input: {
    height: 50,
    borderColor: '#dcdcdc',
    borderWidth: 1,
    marginBottom: 10,
    justifyContent: "flex-start",
    paddingHorizontal: 15,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    width: 300, // Fixed width for the input field
    color: '#000', // Text color for better visibility
  },  
  passwordContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 350,
  },
  showButton: {
    marginLeft: 10,
  },
  showButtonText: {
    color: '#fff', // Set text color to white for visibility
    fontSize: 16,
  },
  buttonStyle: {
    marginTop: 20,
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  forgotPassword: {
    color: '#fff', // A nice blue color that matches the button
    marginTop: 20,
    textDecorationLine: 'underline', // Underline to indicate it's clickable
  },
});


export default Login;
