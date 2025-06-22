import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CommentInput = ({ value, onChangeText, onSend, sending }) => {
    return (
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder="Digite um comentário..."
                placeholderTextColor="#b2bec3"
                multiline
                maxLength={500}
                editable={!sending}
            />
            <TouchableOpacity 
                onPress={onSend} 
                style={[
                    styles.sendButton, 
                    (sending || !value.trim()) && styles.sendButtonDisabled
                ]}
                disabled={sending || !value.trim()}
            >
                {sending ? (
                    <Ionicons name="hourglass" size={22} color="#fff" />
                ) : (
                    <Ionicons name="send" size={22} color="#fff" />
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        borderTopWidth: 1,
        borderColor: '#eee',
        padding: 10,
        backgroundColor: '#fff',
        gap: 10,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 16,
        color: '#2d3436',
        backgroundColor: '#f5f6fa',
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: '#1abc9c',
        borderRadius: 20,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 40,
        minHeight: 40,
    },
    sendButtonDisabled: {
        backgroundColor: '#b2bec3',
    },
});

export default CommentInput;