import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const ConnectModal = ({ onClose, onSubmit }) => {
    const [reason, setReason] = useState('');
    const [comment, setComment] = useState('');
    const reasons = ['network', 'collaborate', 'get industry insights', 'get career guidance'];

    const handleSubmit = () => {
        onSubmit({ reason, comment });
        onClose();
    };

    return (
        <Modal visible={true} onRequestClose={onClose} animationType="slide">
            <View style={styles.modalContent}>
                <Text style={styles.modalHeader}>Connect with User</Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
                <View style={styles.modalBody}>
                    <Picker
                        selectedValue={reason}
                        onValueChange={(itemValue) => setReason(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Select a reason..." value="" />
                        {reasons.map((r) => (
                            <Picker.Item key={r} label={r} value={r} />
                        ))}
                    </Picker>
                    <TextInput
                        placeholder="Additional Comment (optional)"
                        value={comment}
                        onChangeText={(text) => setComment(text)}
                        style={styles.textInput}
                        multiline
                    />
                </View>
                <View style={styles.modalFooter}>
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitButtonText}>Submit Connection Request</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContent: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20,
    },
    modalHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
    },
    closeButtonText: {
        fontSize: 16,
        color: 'blue',
    },
    modalBody: {
        marginVertical: 20,
    },
    picker: {
        marginBottom: 20,
    },
    textInput: {
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        height: 100,
        textAlignVertical: 'top',
    },
    modalFooter: {
        alignItems: 'center',
    },
    submitButton: {
        backgroundColor: 'blue',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ConnectModal;