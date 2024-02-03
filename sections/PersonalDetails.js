// PersonalDetails.js
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const PersonalDetails = ({ formData, setFormData }) => {

    const handleChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
        if (!formData) {
            return null;
        }
    };

    return (
        <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => handleChange('name', text)}
                placeholder="Full Name"
            />

            <Text style={styles.label}>Set Login Email</Text>
            <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                placeholder="Email"
                keyboardType="email-address"
            />

            <Text style={styles.label}>Set Password</Text>
            <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(text) => handleChange('password', text)}
                placeholder="Password"
                secureTextEntry // This is for hiding the password input
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
                style={styles.input}
                value={formData.phoneNumber}
                onChangeText={(text) => handleChange('phoneNumber', text)}
                placeholder="Phone Number"
                keyboardType="phone-pad"
            />

            <Text style={styles.label}>Street Address</Text>
            <TextInput
                style={styles.input}
                value={formData.streetAddress}
                onChangeText={(text) => handleChange('streetAddress', text)}
                placeholder="Street Address"
            />

            <Text style={styles.label}>City</Text>
            <TextInput
                style={styles.input}
                value={formData.locationCity}
                onChangeText={(text) => handleChange('locationCity', text)}
                placeholder="City"
            />

            <Text style={styles.label}>State</Text>
            <TextInput
                style={styles.input}
                value={formData.locationState}
                onChangeText={(text) => handleChange('locationState', text)}
                placeholder="State"
            />

            <Text style={styles.label}>Zip Code</Text>
            <TextInput
                style={styles.input}
                value={formData.zipCode ? formData.zipCode.toString() : ''}
                onChangeText={(text) => handleChange('zipCode', text)}
                placeholder="Zip Code"
                keyboardType="numeric"
            />

            <Text style={styles.label}>Country</Text>
            <TextInput
                style={styles.input}
                value={formData.locationCountry}
                onChangeText={(text) => handleChange('locationCountry', text)}
                placeholder="Country"
            />

        </View>
    );
};

// You can either include these styles here or import them from your main styles file
const styles = StyleSheet.create({
    formGroup: {
        marginTop: 10,
    },
    label: {
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    // Add any additional styles you need
});

export default PersonalDetails;
