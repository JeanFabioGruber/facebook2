import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LocationInput = ({ value, onChangeText, onGetCurrentLocation, isLoading }) => {
    return (
        <View style={styles.inputSection}>
            <View style={styles.locationHeader}>
                <Text style={styles.inputLabel}>Localização</Text>
                <TouchableOpacity 
                    onPress={onGetCurrentLocation}
                    style={styles.locationButton}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#1abc9c" />
                    ) : (
                        <Ionicons name="location" size={20} color="#1abc9c" />
                    )}
                </TouchableOpacity>
            </View>
            <TextInput
                style={styles.locationInput}
                placeholder="Adicione uma localização"
                value={value}
                onChangeText={onChangeText}
                maxLength={100}
            />
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
    locationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    locationButton: {
        padding: 5,
    },
    locationInput: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        color: '#2d3436',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
});

export default LocationInput;