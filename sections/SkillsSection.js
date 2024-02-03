// SkillsSection.js
import { Picker } from '@react-native-picker/picker';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const SkillsSection = ({ initialSkills = [], setSkills }) => {
    const [skills, updateSkills] = useState(initialSkills);
    const [skill, setSkill] = useState('');
    const [level, setLevel] = useState('');

    useEffect(() => {
        updateSkills(initialSkills);
    }, [initialSkills]);

    const addSkill = () => {
        if (skill && level) {
            const newSkills = [...skills, { skill, level }];
            updateSkills(newSkills);
            setSkills(newSkills);
            setSkill('');
            setLevel('');
        }
    };

    const removeSkill = index => {
        const newSkills = skills.filter((_, idx) => idx !== index);
        updateSkills(newSkills);
        setSkills(newSkills);
    };

    return (
        <View style={styles.container}>
            <View style={styles.formGroup}>
                <Text style={styles.label}>Skill</Text>
                <TextInput
                    style={styles.input}
                    value={skill}
                    onChangeText={setSkill}
                    placeholder="Skill name"
                />

                <Text style={styles.label}>Skill Level</Text>
                <Picker
                    selectedValue={level}
                    style={styles.picker}
                    onValueChange={(itemValue, itemIndex) => setLevel(itemValue)}
                >
                    <Picker.Item label="Select proficiency" value="" />
                    <Picker.Item label="No Experience" value="no_experience" />
                    <Picker.Item label="Learning" value="learning" />
                    <Picker.Item label="Competent" value="competent" />
                    <Picker.Item label="Proficient" value="proficient" />
                    <Picker.Item label="Authority" value="authority" />
                </Picker>

                <TouchableOpacity onPress={addSkill} style={styles.button}>
                    <Text style={styles.buttonText}>Add Skill</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.skillsList}>
                {skills.map((item, index) => (
                    <View key={index} style={styles.skillItem}>
                        <Text style={styles.skillText}>{item.skill} - {item.level}</Text>
                        <TouchableOpacity onPress={() => removeSkill(index)} style={styles.removeButton}>
                            <Text style={styles.removeButtonText}>Remove</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>

        </View>
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
    skillsList: {
        marginTop: 10,
    },
    skillItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center', // Ensure items are centered vertically
        paddingVertical: 2,
        borderColor: '#fff',
        borderWidth: 1,
        paddingHorizontal: 5, // Add some horizontal padding
        marginVertical: 4, // Add some space between the skill items
        backgroundColor: '#000000',
        borderRadius: 5,
    },
    skillText: {
        color: '#ffffff',
        flex: 1, // Take up as much space as possible
        marginRight: 10, // Add some space before the remove button
        fontSize: 18,
    },
    removeButton: {
        padding: 8,
        backgroundColor: '#fff',
        borderRadius: 5,
    },
    removeButtonText: {
        color: '#000',
    },
    picker: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 5,
        borderRadius: 8,
        marginBottom: 15,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    // Add any additional styles you need
});

export default SkillsSection;
