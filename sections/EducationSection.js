// EducationSection.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const EducationSection = ({ formData, setFormData }) => {
    const [institution, setInstitution] = useState('');
    const [degree, setDegree] = useState('');
    const [fieldOfStudy, setFieldOfStudy] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const addEducation = () => {
        if (institution && degree && fieldOfStudy && startDate && endDate) {
            const newEducation = [...formData.education, { institution, degree, fieldOfStudy, startDate, endDate }];
            setFormData({ ...formData, education: newEducation });
            setInstitution('');
            setDegree('');
            setFieldOfStudy('');
            setStartDate('');
            setEndDate('');
        }
    };

    const removeEducation = index => {
        const updatedEducation = [...formData.education];
        updatedEducation.splice(index, 1);
        setFormData({ ...formData, education: updatedEducation });
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.formGroup}>
                <Text style={styles.label}>Institution</Text>
                <TextInput
                    style={styles.input}
                    value={institution}
                    onChangeText={setInstitution}
                    placeholder="Institution Name"
                />

                <Text style={styles.label}>Degree</Text>
                <TextInput
                    style={styles.input}
                    value={degree}
                    onChangeText={setDegree}
                    placeholder="Degree"
                />

                <Text style={styles.label}>Field of Study</Text>
                <TextInput
                    style={styles.input}
                    value={fieldOfStudy}
                    onChangeText={setFieldOfStudy}
                    placeholder="Field of Study"
                />

                <Text style={styles.label}>Start Date</Text>
                <TextInput
                    style={styles.input}
                    value={startDate}
                    onChangeText={setStartDate}
                    placeholder="Start Date (e.g., 2018)"
                />

                <Text style={styles.label}>End Date</Text>
                <TextInput
                    style={styles.input}
                    value={endDate}
                    onChangeText={setEndDate}
                    placeholder="End Date (e.g., 2022) or 'Present'"
                />

                <TouchableOpacity onPress={addEducation} style={styles.button}>
                    <Text style={styles.buttonText}>Add Education</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.educationList}>
                {formData.education && formData.education.map((item, index) => (
                    <View key={index} style={styles.selectedItem}>
                        <View>
                            <Text style={styles.educationText}>{item.institution}</Text>
                            <Text style={styles.educationText}>{item.degree}, {item.fieldOfStudy}</Text>
                            <Text style={styles.educationText}>{item.startDate} - {item.endDate}</Text>
                        </View>
                        <TouchableOpacity style={styles.removeButton} onPress={() => removeEducation(index)}>
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
    educationList: {
        marginTop: 20,
    },
    educationItem: {
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#eee',
        marginBottom: 10,
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
    educationText: {
        color: '#ffffff',
        flex: 1,
        marginRight: 10,
        fontSize: 18,
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

export default EducationSection;
