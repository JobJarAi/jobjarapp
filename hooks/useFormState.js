// hooks/useFormState.js
import { useState, useEffect } from 'react';

const useFormState = (initialData) => {
    const [formData, setFormData] = useState({
        interestedIndustries: [],
        interestedJobTitles: [],
        ...initialData,
        skills: initialData && initialData.skills ? initialData.skills : [],
        // Initialize other fields similarly
    });

    useEffect(() => {
        setFormData(currentFormData => ({
            interestedIndustries: [],
            interestedJobTitles: [],
            ...currentFormData,
            ...initialData,
            skills: initialData && initialData.skills ? initialData.skills : [],
            // Initialize other fields similarly
        }));
    }, [initialData]);

    return { formData, setFormData };
};

export default useFormState;