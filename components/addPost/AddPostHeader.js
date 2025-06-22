import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AddPostHeader = ({ onBack, onPublish, loading, style }) => {
    return (
        <View style={[styles.header, style]}>
            <TouchableOpacity 
                onPress={onBack} 
                style={styles.headerButton}
            >
                <Ionicons name="arrow-back" size={24} color="#1abc9c" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Nova Publicação</Text>
            <TouchableOpacity 
                onPress={onPublish}
                style={[styles.headerButton, styles.publishButton]}
                disabled={loading}
            >
                <Text style={styles.publishButtonText}>
                    {loading ? 'Publicando...' : 'Publicar'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2d3436',
    },
    publishButton: {
        backgroundColor: '#1abc9c',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    publishButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default AddPostHeader;