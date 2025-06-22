import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TagChip = ({ tag, onRemove }) => {
    return (
        <View style={styles.tagChip}>
            <Text style={styles.tagText}>#{tag}</Text>
            <TouchableOpacity onPress={() => onRemove(tag)} style={styles.tagRemoveButton}>
                <Ionicons name="close-circle" size={16} color="#e74c3c" />
            </TouchableOpacity>
        </View>
    );
};

const TagInput = ({ 
    tags = [], 
    tagInput = '', 
    onTagInputChange, 
    onAddTag, 
    onRemoveTag 
}) => {
    return (
        <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Tags</Text>
            <View style={styles.tagInputContainer}>
                <TextInput
                    style={styles.tagInput}
                    placeholder="Digite uma tag e pressione +"
                    value={tagInput}
                    onChangeText={onTagInputChange}
                    maxLength={30}
                    onSubmitEditing={onAddTag}
                />
                <TouchableOpacity 
                    onPress={onAddTag} 
                    style={styles.addTagButton}
                >
                    <Ionicons name="add" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
            
            <View style={styles.tagsContainer}>
                {tags.map((tag, idx) => (
                    <TagChip 
                        key={idx} 
                        tag={tag} 
                        onRemove={onRemoveTag} 
                    />
                ))}
            </View>
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
    tagInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tagInput: {
        flex: 1,
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
    addTagButton: {
        marginLeft: 8,
        backgroundColor: '#1abc9c',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    tagChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e0f7fa',
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginRight: 6,
        marginBottom: 6,
    },
    tagText: {
        color: '#00796b',
        fontWeight: 'bold',
    },
    tagRemoveButton: {
        marginLeft: 4,
    },
});

export default TagInput;