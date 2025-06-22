import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CommentItem = ({ comment, isLocal = false, formatDate }) => {
    return (
        <View style={[styles.commentItem, isLocal && styles.localComment]}>
            <Ionicons 
                name="person-circle-outline" 
                size={28} 
                color="#1abc9c" 
                style={{ marginRight: 8 }} 
            />
            <View style={{ flex: 1 }}>
                <View style={styles.commentHeader}>
                    <Text style={styles.commentUser}>
                        {comment.userName || 'Usuário'}
                    </Text>
                    {isLocal && <Text style={styles.localIndicator}>•</Text>}
                </View>
                <Text style={styles.commentText}>{comment.text || ''}</Text>
                <Text style={styles.commentDate}>
                    {formatDate(comment.createdAt)}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    commentItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#1abc9c',
    },
    localComment: {
        backgroundColor: '#e8f5e8',
        borderLeftColor: '#27ae60',
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    commentUser: {
        fontWeight: 'bold',
        color: '#16a085',
        fontSize: 14,
    },
    localIndicator: {
        color: '#27ae60',
        fontSize: 12,
        marginLeft: 5,
        fontWeight: 'bold',
    },
    commentText: {
        color: '#2d3436',
        fontSize: 15,
        lineHeight: 20,
        marginBottom: 4,
    },
    commentDate: {
        fontSize: 12,
        color: '#636e72',
    },
});

export default CommentItem;