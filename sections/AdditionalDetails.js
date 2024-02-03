// AdditionalDetails.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const AdditionalDetails = ({ formData, setFormData }) => {
    const [certifications, setCertifications] = useState(formData.certifications || []);
    const [industryExperience, setIndustryExperience] = useState(formData.industryExperience || []);
    const [licenses, setLicenses] = useState(formData.licenses || []);
    // Implement functions to handle changes in each section
    // Example for social profiles:
    const handleSocialProfileChange = (index, field, value) => {
        const updatedProfiles = formData.socialProfiles.map((profile, i) => {
            if (i === index) {
                return { ...profile, [field]: value };
            }
            return profile;
        });
        setFormData({ ...formData, socialProfiles: updatedProfiles });
    };

    const handleLanguagesChange = (index, value) => {
        const updatedLanguages = formData.languages.map((language, i) => {
            if (i === index) {
                return value;
            }
            return language;
        });
        setFormData({ ...formData, languages: updatedLanguages });
    };

    const handleCertificationChange = (index, field, value) => {
        const updatedCertifications = certifications.map((certification, i) => {
            if (i === index) {
                return { ...certification, [field]: value };
            }
            return certification;
        });
        setCertifications(updatedCertifications);
        setFormData({ ...formData, certifications: updatedCertifications });
    };    

    const addCertification = () => {
        setCertifications([...certifications, { name: '', year: '' }]);
    };

    // Function to add a new language
    const addLanguage = () => {
        setFormData((currentData) => ({
            ...currentData,
            languages: [...currentData.languages, '']
        }));
    };

    // Function to add a new social profile
    const addSocialProfile = () => {
        setFormData((currentData) => ({
            ...currentData,
            socialProfiles: [...currentData.socialProfiles, { platform: '', url: '' }]
        }));
    };

    const removeSocialProfile = index => {
        const updatedProfiles = formData.socialProfiles.filter((_, i) => i !== index);
        setFormData({ ...formData, socialProfiles: updatedProfiles });
    };

    // Function to remove a language
    const removeLanguage = index => {
        const updatedLanguages = formData.languages.filter((_, i) => i !== index);
        setFormData({ ...formData, languages: updatedLanguages });
    };

    const removeCertification = index => {
        const updatedCertifications = certifications.filter((_, i) => i !== index);
        setCertifications(updatedCertifications);
    };

    const handleLicenseChange = (index, value) => {
        const updatedLicenses = licenses.map((license, i) => {
            if (i === index) {
                return value;
            }
            return license;
        });
        setLicenses(updatedLicenses);
        setFormData({ ...formData, licenses: updatedLicenses });
    };    

    const addLicense = () => {
        setLicenses([...licenses, '']); // Adding an empty string for a new license
    };

    const removeLicense = index => {
        const updatedLicenses = licenses.filter((_, i) => i !== index);
        setLicenses(updatedLicenses);
    };

    const handleIndustryExperienceChange = (index, field, value) => {
        const updatedIndustryExperience = industryExperience.map((experience, i) => {
            if (i === index) {
                return { ...experience, [field]: value };
            }
            return experience;
        });
        setIndustryExperience(updatedIndustryExperience);
    };

    const addIndustryExperience = () => {
        setIndustryExperience([...industryExperience, { company: '', role: '', years: '' }]);
    };

    const removeIndustryExperience = index => {
        const updatedIndustryExperience = industryExperience.filter((_, i) => i !== index);
        setIndustryExperience(updatedIndustryExperience);
    };

    return (
        <ScrollView style={styles.container}>
            {/* Social Profiles Section */}
            <Text style={styles.label}>Social Profiles</Text>
            {formData.socialProfiles.map((profile, index) => (
                <View key={index} style={styles.profileItem}>
                    <TextInput
                        style={styles.input}
                        value={profile.platform}
                        onChangeText={(text) => handleSocialProfileChange(index, 'platform', text)}
                        placeholder="Platform"
                    />
                    <TextInput
                        style={styles.input}
                        value={profile.url}
                        onChangeText={(text) => handleSocialProfileChange(index, 'url', text)}
                        placeholder="URL"
                    />
                    <TouchableOpacity style={styles.removeButton} onPress={() => removeSocialProfile(index)} >
                        <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                </View>
            ))}

            <TouchableOpacity
                onPress={addSocialProfile}
                style={styles.button}>
                <Text style={styles.buttonText}>Add Social Profile</Text>
            </TouchableOpacity>

            {/* Languages Section */}
            <Text style={styles.label}>Languages</Text>
            {formData.languages.map((language, index) => (
                <View key={index} style={styles.profileItem}>
                    <TextInput
                        key={index}
                        style={styles.input}
                        value={language}
                        onChangeText={(text) => handleLanguagesChange(index, text)}
                        placeholder="Language"
                    />
                    <TouchableOpacity style={styles.removeButton} onPress={() => removeLanguage(index)} >
                        <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                </View>
            ))}
            <TouchableOpacity
                onPress={addLanguage}
                style={styles.button}>
                <Text style={styles.buttonText}>Add Language</Text>
            </TouchableOpacity>

            {/* Industry Experience Section */}
            <Text style={styles.label}>Industry Experience</Text>
            {industryExperience.map((experience, index) => (
                <View key={index} style={styles.profileItem}>
                    <TextInput
                        style={styles.input}
                        value={experience.industry}
                        onChangeText={(text) => handleIndustryExperienceChange(index, 'industry', text)}
                        placeholder="Industry"
                    />
                    <TextInput
                        style={styles.input}
                        value={experience.years}
                        onChangeText={(text) => handleIndustryExperienceChange(index, 'years', text)}
                        placeholder="Years"
                    />
                    <TouchableOpacity style={styles.removeButton} onPress={() => removeIndustryExperience(index)} >
                        <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                </View>
            ))}
            <TouchableOpacity onPress={addIndustryExperience} style={styles.button}>
                <Text style={styles.buttonText}>Add Industry Experience</Text>
            </TouchableOpacity>

            {/* Certifications Section */}
            <Text style={styles.label}>Certifications</Text>
            {certifications.map((certification, index) => (
                <View key={index} style={styles.skillItem}>
                    <TextInput
                        style={styles.input}
                        value={certification.name}
                        onChangeText={(text) => handleCertificationChange(index, 'name', text)}
                        placeholder="Certification Name"
                    />
                    <TextInput
                        style={styles.input}
                        value={certification.year}
                        onChangeText={(text) => handleCertificationChange(index, 'year', text)}
                        placeholder="Year"
                    />
                    <TouchableOpacity onPress={() => removeCertification(index)} style={styles.removeButton}>
                        <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                </View>
            ))}
            <TouchableOpacity onPress={addCertification} style={styles.button}>
                <Text style={styles.buttonText}>Add Certification</Text>
            </TouchableOpacity>

            {/* Licenses Section */}
            <Text style={styles.label}>Licenses</Text>
            {licenses.map((license, index) => (
                <View key={index} style={styles.profileItem}>
                    <TextInput
                        style={styles.input}
                        value={license}
                        onChangeText={(text) => handleLicenseChange(index, text)}
                        placeholder="License Type"
                    />
                    <TouchableOpacity style={styles.removeButton} onPress={() => removeLicense(index)} >
                        <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                </View>
            ))}
            <TouchableOpacity onPress={addLicense} style={styles.button}>
                <Text style={styles.buttonText}>Add License</Text>
            </TouchableOpacity>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    label: {
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
        marginLeft: 10,
        marginTop: 10,
    },
    input: {
        flex: 1,
        padding: 5,
        color: "#000",
        borderRadius: 8,
        fontSize: 16,
        marginRight: 10,
        backgroundColor: "#fff",
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
    skillItem: {
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
    profileItem: {
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
        padding: 8,
        backgroundColor: '#fff',
        borderRadius: 5,
    },
    removeButtonText: {
        color: '#000',
    },
    // Add any additional styles you need
});


export default AdditionalDetails;
