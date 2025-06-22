import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CustomTextInput } from '../CustomInputs';

const InfoField = ({ 
    label, 
    value, 
    onChangeText, 
    keyboardType, 
    multiline = false, 
    isEditing = false, 
    editable = true 
}) => (
    <View style={styles.infoItem}>
        <Text style={styles.label}>{label}</Text>
        {isEditing && editable ? (
            <CustomTextInput
                placeholder={`Digite seu ${label.toLowerCase()}`}
                value={value}
                setValue={onChangeText}
                keyboardType={keyboardType}
                multiline={multiline}
            />
        ) : (
            <Text style={styles.value}>
                {value || (label === 'Bio' ? 'Nenhuma bio adicionada' : '-')}
            </Text>
        )}
    </View>
);

const styles = StyleSheet.create({
    infoItem: { 
        marginBottom: 20 
    },
    label: { 
        fontSize: 16, 
        color: '#636e72', 
        marginBottom: 8, 
        fontWeight: '600' 
    },
    value: { 
        fontSize: 18, 
        color: '#2d3436', 
        fontWeight: '500' 
    },
});

export default InfoField;