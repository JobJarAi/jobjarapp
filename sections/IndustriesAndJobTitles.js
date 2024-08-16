import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Button } from 'react-native';
import { debounce } from 'lodash';
import axios from 'axios';


const IndustriesAndJobTitles = ({ formData, setFormData }) => {
    const [industryOptions, setIndustryOptions] = useState([]);
    const [jobTitleOptions, setJobTitleOptions] = useState([]);
    const [isIndustryLoading, setIsIndustryLoading] = useState(false);
    const [isJobTitleLoading, setIsJobTitleLoading] = useState(false);
    const [jobTitleSearch, setJobTitleSearch] = useState('');
    const [industrySearch, setIndustrySearch] = useState('');

    const API_BASE_URL = 'localhost:3001';

    const delayedJobTitleSearch = debounce(async (query) => {
        setIsJobTitleLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/jobtitles/search?query=${query}`);
            setJobTitleOptions(response.data.map(job => ({ label: job.title, value: job.title })));
        } catch (error) {
            console.error('Error searching job titles:', error);
        } finally {
            setIsJobTitleLoading(false);
        }
    }, 300);

    const delayedIndustrySearch = debounce(async (query) => {
        setIsIndustryLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/industries/search?query=${query}`);
            setIndustryOptions(response.data.map(ind => ({ label: ind.industry, value: ind.industry })));
        } catch (error) {
            console.error('Error searching industries:', error);
        } finally {
            setIsIndustryLoading(false);
        }
    }, 300);

    useEffect(() => {
        if (jobTitleSearch) {
            delayedJobTitleSearch(jobTitleSearch);
        }
        // Cleanup function
        return () => delayedJobTitleSearch.cancel();
    }, [jobTitleSearch]);

    useEffect(() => {
        if (industrySearch) {
            delayedIndustrySearch(industrySearch);
        }
        // Cleanup function
        return () => delayedIndustrySearch.cancel();
    }, [industrySearch]);

    const handleSelectIndustry = (selectedIndustry) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            interestedIndustries: prevFormData.interestedIndustries
                ? [...prevFormData.interestedIndustries, selectedIndustry]
                : [selectedIndustry],
            interestedJobTitles: prevFormData.interestedJobTitles || [],
        }));
        setIndustrySearch('');
        setIndustryOptions([]);
    };

    const handleSelectJobTitle = (selectedJobTitle) => {
        // If interestedJobTitles is undefined or doesn't include the selectedJobTitle, update it
        if (!formData.interestedJobTitles || !formData.interestedJobTitles.includes(selectedJobTitle)) {
            setFormData({
                ...formData,
                interestedIndustries: formData.interestedIndustries || [],
                interestedJobTitles: [...(formData.interestedJobTitles || []), selectedJobTitle],
            });
        }
        setJobTitleSearch('');
        setJobTitleOptions([]);
    };

    const handleAddCustomIndustryFromSearch = () => {
        if (industrySearch && !formData.interestedIndustries.includes(industrySearch)) {
            setFormData(prevFormData => ({
                ...prevFormData,
                interestedIndustries: [...(prevFormData.interestedIndustries || []), industrySearch]
            }));
            setIndustrySearch('');
            setIndustryOptions([]);
        }
    };

    const handleAddCustomJobTitleFromSearch = () => {
        if (jobTitleSearch && !formData.interestedJobTitles.includes(jobTitleSearch)) {
            setFormData(prevFormData => ({
                ...prevFormData,
                interestedJobTitles: [...(prevFormData.interestedJobTitles || []), jobTitleSearch]
            }));
            setJobTitleSearch('');
            setJobTitleOptions([]);
        }
    };

    const removeIndustry = (value) => {
        const filteredIndustries = formData.interestedIndustries.filter(industry => industry !== value);
        setFormData({ ...formData, interestedIndustries: filteredIndustries });
    };

    const removeJobTitle = (value) => {
        const filteredJobTitles = formData.interestedJobTitles.filter(jobTitle => jobTitle !== value);
        setFormData({ ...formData, interestedJobTitles: filteredJobTitles });
    };

    // Render the component
    return (
        <View style={styles.container}>
            {/* Interested Industries */}
            <Text style={styles.label}>Interested Industries</Text>
            <TextInput
                style={styles.input}
                placeholder="Search Industries"
                onChangeText={setIndustrySearch}
                value={industrySearch}
            />

            {isIndustryLoading && <ActivityIndicator />}
            {industryOptions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    {industryOptions.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.suggestionItem}
                            onPress={() => handleSelectIndustry(option.value)}
                        >
                            <Text style={styles.suggestionText}>{option.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
            <FlatList
                data={formData.interestedIndustries}
                renderItem={({ item }) => (
                    <View style={styles.selectedItem}>
                        <Text style={styles.selectedText}>{item}</Text>
                        <TouchableOpacity onPress={() => removeIndustry(item)}>
                            <Text style={styles.removeButton}>Remove</Text>
                        </TouchableOpacity>
                    </View>
                )}
                keyExtractor={(item, index) => `industry-${index}`}
            />
            {industryOptions.length === 0 && industrySearch && (
                <View>
                    <Text style={styles.noResultsText}>No results found for "{industrySearch}"</Text>
                    <Button title="Add Custom Industry" onPress={handleAddCustomIndustryFromSearch} />
                </View>
            )}

            {/* Interested Job Titles */}
            <Text style={styles.label}>Interested Job Titles</Text>
            <TextInput
                style={styles.input}
                placeholder="Search Job Titles"
                onChangeText={setJobTitleSearch}
                value={jobTitleSearch}
            />
            {isJobTitleLoading && <ActivityIndicator />}
            {jobTitleOptions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    {jobTitleOptions.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.suggestionItem}
                            onPress={() => handleSelectJobTitle(option.value)}
                        >
                            <Text style={styles.suggestionText}>{option.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
            <FlatList
                data={formData.interestedJobTitles}
                renderItem={({ item }) => (
                    <View style={styles.selectedItem}>
                        <Text style={styles.selectedText}>{item}</Text>
                        <TouchableOpacity onPress={() => removeJobTitle(item)}>
                            <Text style={styles.removeButton}>Remove</Text>
                        </TouchableOpacity>
                    </View>
                )}
                keyExtractor={(item, index) => `job-title-${index}`}
            />
            {jobTitleOptions.length === 0 && jobTitleSearch && (
                <View>
                    <Text style={styles.noResultsText}>No results found for "{jobTitleSearch}"</Text>
                    <Button title="Add Custom Job Title" onPress={handleAddCustomJobTitleFromSearch} />
                </View>
            )}
        </View>
    );
};

// Styles for your components
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#111111',
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
        marginBottom: 5,
        color: '#000',
    },
    selectedItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        marginVertical: 2,
        backgroundColor: '#01bf02',
        borderRadius: 5,
    },
    removeButton: {
        color: '#fff',
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
    noResultsText: {
        color: '#fff',
        // Add more styles as needed
    },
    // Add styles for your text, inputs, pickers, buttons, etc.
});

export default IndustriesAndJobTitles;