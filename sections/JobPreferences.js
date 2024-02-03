import React, { useState, useEffect } from 'react';
import { Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';


const JobPreferences = ({ formData, setFormData }) => {
    const [earningsType, setEarningsType] = useState(formData.earningsType || '');

    useEffect(() => {

        setEarningsType(formData.earningsType || '');
    }, [formData.earningsType]);

    const handleInputChange = (name, value, clearCallback) => {
        // Check if value is a string and trim it
        let trimmedValue = typeof value === 'string' ? value.trim() : value;

        // If value is a string and it's empty, return early
        if (typeof trimmedValue === 'string' && !trimmedValue) return;

        // If the value is an object (for complex fields like preferredLocation), don't trim
        setFormData({
            ...formData,
            [name]: trimmedValue,
        });

        if (clearCallback) {
            clearCallback('');
        }
    };

    // Render the component
    return (
        <ScrollView style={styles.container}>

            {formData.preferredLocation && (
                <>
                    <Text style={styles.label}>Preferred City</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Preferred City"
                        value={formData.preferredLocation.preferredCity}
                        onChangeText={(value) => handleInputChange('preferredLocation', {
                            ...formData.preferredLocation,
                            preferredCity: value
                        })}
                    />
                    <Text style={styles.label}>Preferred State</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Preferred State"
                        value={formData.preferredLocation.preferredState}
                        onChangeText={(value) => handleInputChange('preferredLocation', {
                            ...formData.preferredLocation,
                            preferredState: value
                        })}
                    />
                </>
            )}
            {/* Earnings Type Selection */}
            <Text style={styles.label}>Desired Earnings Type</Text>
            <Picker
                selectedValue={earningsType}
                style={styles.picker}
                onValueChange={(itemValue) => setEarningsType(itemValue)}
            >
                <Picker.Item label="Select an option" value="" />
                <Picker.Item label="Hourly Rate" value="hourly" />
                <Picker.Item label="Salary" value="salary" />
            </Picker>

            {/* Dynamic Fields based on Earnings Type */}
            {earningsType === 'salary' && (
                <TextInput
                    style={styles.input}
                    placeholder="Desired Salary"
                    value={formData.desiredSalary}
                    onChangeText={(value) => handleInputChange('desiredSalary', value)}
                />
            )}
            {earningsType === 'hourly' && (
                <TextInput
                    style={styles.input}
                    placeholder="Desired Hourly Rate"
                    value={formData.desiredHourlyRate}
                    onChangeText={(value) => handleInputChange('desiredHourlyRate', value)}
                />
            )}

            {/* Employment Type Selection */}
            <Text style={styles.label}>Employment Type</Text>
            <Picker
                selectedValue={formData.employmentType}
                style={styles.picker}
                onValueChange={(itemValue) => handleInputChange('employmentType', itemValue)}
            >
                <Picker.Item label="Full-time" value="Full-time" />
                <Picker.Item label="Part-time" value="Part-time" />
                <Picker.Item label="Contract" value="Contract" />
            </Picker>


        </ScrollView>
    );
};

// Styles for your components
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#000',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#fff',
    },
    input: {
        borderWidth: 1,
        backgroundColor: '#fff',
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        color: '#000',
    },
    selectedItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        marginVertical: 5,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
    },
    removeButton: {
        color: '#ff0000',
    },
    suggestionsContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
    },
    suggestionItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    suggestionText: {
        color: '#000',
    },
    selectedText: {
        color: '#000',
    },
    picker: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 5,
        borderRadius: 8,
        marginBottom: 5,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    // Add styles for your text, inputs, pickers, buttons, etc.
});

export default JobPreferences;