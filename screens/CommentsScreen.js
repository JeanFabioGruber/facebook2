import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { db, auth } from '../firebase';
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function CommentsScreen({ route }) {
    // Recebe o postId via navegação
    const { postId } = route.params;
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const currentUser = auth.currentUser;

    useEffect(() => {
        fetchComments();
    }, []);

    // Busca comentários do post
    const fetchComments = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, 'comments'),
                where('postId', '==', postId),
                orderBy('createdAt', 'asc')
            );
            const snapshot = await getDocs(q);
            setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            // Pode adicionar um Alert aqui se quiser
        } finally {
            setLoading(false);
        }
    };

    // Envia novo comentário e atualiza contagem no post
    const handleSend = async () => {
        if (!comment.trim()) return;
        try {
            await addDoc(collection(db, 'comments'), {
                postId,
                userId: currentUser.uid,
                userName: currentUser.displayName || 'Usuário',
                text: comment,
                createdAt: serverTimestamp()
            });
            // Atualiza o campo comments do post
            const postRef = db.collection ? db.collection('posts').doc(postId) : null;
            // Firestore modular
            if (!postRef) {
                const { doc, updateDoc, increment } = await import('firebase/firestore');
                const postDocRef = doc(db, 'posts', postId);
                await updateDoc(postDocRef, { comments: (window.increment || (await import('firebase/firestore')).increment)(1) });
            } else {
                // Compat API
                await postRef.update({ comments: window.firebase.firestore.FieldValue.increment(1) });
            }
            setComment('');
            fetchComments();
        } catch (error) {
            // Pode adicionar um Alert aqui se quiser
        }
    };

    // Renderiza cada comentário
    const renderItem = ({ item }) => (
        <View style={styles.commentItem}>
            <Ionicons name="person-circle-outline" size={28} color="#1abc9c" style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
                <Text style={styles.commentUser}>{item.userName || item.userId}</Text>
                <Text style={styles.commentText}>{item.text}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Comentários</Text>
            <FlatList
                data={comments}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={!loading && (
                    <Text style={styles.emptyText}>Seja o primeiro a comentar!</Text>
                )}
            />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={80}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={comment}
                        onChangeText={setComment}
                        placeholder="Digite um comentário..."
                        placeholderTextColor="#b2bec3"
                    />
                    <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                        <Ionicons name="send" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1abc9c',
        textAlign: 'center',
        marginVertical: 18,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 10,
    },
    commentItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#f5f6fa',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    commentUser: {
        fontWeight: 'bold',
        color: '#16a085',
        marginBottom: 2,
    },
    commentText: {
        color: '#2d3436',
        fontSize: 15,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#eee',
        padding: 10,
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        fontSize: 16,
        color: '#2d3436',
        backgroundColor: '#f5f6fa',
    },
    sendButton: {
        backgroundColor: '#1abc9c',
        borderRadius: 20,
        padding: 10,
        marginLeft: 8,
    },
    emptyText: {
        textAlign: 'center',
        color: '#b2bec3',
        marginTop: 30,
        fontSize: 16,
    },
});
