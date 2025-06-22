import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const DescriptionInput = ({ value, onChangeText, maxLength = 500 }) => {
    return (
        <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Descrição</Text>
            <TextInput
                style={styles.descriptionInput}
                placeholder="No que você está pensando?"
                value={value}
                onChangeText={onChangeText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={maxLength}
            />
            <Text style={styles.characterCount}>
                {value.length}/{maxLength}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    inputSection: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 8,
    },
    descriptionInput: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        color: '#2d3436',
        minHeight: 100,
        textAlignVertical: 'top',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    characterCount: {
        textAlign: 'right',
        marginTop: 5,
        fontSize: 12,
        color: '#636e72',
    },
});

export default DescriptionInput;