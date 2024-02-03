// WorkHistorySection.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const WorkHistorySection = ({ formData, setFormData }) => {
    const [jobTitle, setJobTitle] = useState('');
    const [company, setCompany] = useState('');
    const [dates, setDates] = useState('');

    const addWorkHistory = () => {
        if (jobTitle && company && dates) {
            const newWorkHistory = [...formData.workHistory, { jobTitle, company, dates }];
            setFormData({ ...formData, workHistory: newWorkHistory });
            setJobTitle('');
            setCompany('');
            setDates('');
        }
    };

    const removeWorkHistory = (index) => {
        const newWorkHistory = [...formData.workHistory];
        newWorkHistory.splice(index, 1);
        setFormData({ ...formData, workHistory: newWorkHistory });
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.formGroup}>
                <Text style={styles.label}>Job Title</Text>
                <TextInput
                    style={styles.input}
                    value={jobTitle}
                    onChangeText={setJobTitle}
                    placeholder="Job Title"
                />

                <Text style={styles.label}>Company</Text>
                <TextInput
                    style={styles.input}
                    value={company}
                    onChangeText={setCompany}
                    placeholder="Company Name"
                />

                <Text style={styles.label}>Dates</Text>
                <TextInput
                    style={styles.input}
                    value={dates}
                    onChangeText={setDates}
                    placeholder="e.g., 2021-05 to 2023-04"
                />

                <TouchableOpacity onPress={addWorkHistory} style={styles.button}>
                    <Text style={styles.buttonText}>Add Work History</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.workHistoryList}>
                {formData.workHistory && formData.workHistory.map((item, index) => (
                    <View key={index} style={styles.selectedItem}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.workHistoryText}>{item.jobTitle}</Text>
                            <Text style={styles.workHistoryText}>at {item.company}</Text>
                            <Text style={styles.workHistoryText}>{item.dates}</Text>
                        </View>
                        <TouchableOpacity style={styles.removeButton} onPress={() => removeWorkHistory(index)}>
                            <Text style={styles.removeButton}>Remove</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
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
    button: {
        backgroundColor: '#01bf02',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    workHistoryList: {
        marginTop: 20,
    },
    workHistoryItem: {
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#eee',
        marginBottom: 10,
    },
    workHistoryText: {
        color: '#ffffff',
        flex: 1,
        marginRight: 10,
        fontSize: 18,
    },
    selectedItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 2,
        borderColor: '#fff',
        borderWidth: 1,
        paddingHorizontal: 5,
        marginVertical: 4,
        backgroundColor: '#000000',
        borderRadius: 5,
    },
    removeButton: {
        padding: 4,
        backgroundColor: '#fff',
        borderRadius: 5,
    },
    removeButtonText: {
        color: '#000',
    },
    // Add any additional styles you need
});

export default WorkHistorySection;
