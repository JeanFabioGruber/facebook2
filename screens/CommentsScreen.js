import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { db, auth } from '../firebase';
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function CommentsScreen({ route, navigation }) {
    const { postId } = route.params;
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const currentUser = auth.currentUser;
    const flatListRef = useRef(null);

    useEffect(() => {
        if (!postId) {
            console.error('postId não fornecido');
            return;
        }        
        loadComments();
    }, [postId]);
    
    const loadComments = async () => {
        try {
            const q = query(
                collection(db, 'comments'),
                where('postId', '==', postId)
            );            
            const snapshot = await getDocs(q);
            let commentsData = snapshot.docs.map(doc => {
                const data = doc.data();               
                return {
                    id: doc.id,
                    ...data
                };
            });
            commentsData.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
                return dateA - dateB;
            });
            setComments(commentsData);
            setLoading(false);            
            setTimeout(() => {
                if (flatListRef.current && commentsData.length > 0) {
                    flatListRef.current.scrollToEnd({ animated: true });
                }
            }, 100);
        } catch (error) {
            console.error('Erro ao carregar comentários:', error);
            setLoading(false);
        }
    };
    const handleSend = async () => {
        if (!comment.trim()) {
            console.log('Comentário vazio, não enviando');
            return;
        }

        if (!currentUser) {
            console.log('Usuário não autenticado, não enviando comentário');
            return;
        }
        if (sending) return;
        setSending(true);
        const commentText = comment.trim();
        try {
            console.log('Enviando comentário');            
            const commentData = {
                postId: postId,
                userId: currentUser.uid,
                userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Usuário',
                text: commentText,
                createdAt: serverTimestamp()
            };                     
            const localComment = {
                id: 'local_' + Date.now(),
                postId: postId,
                userId: currentUser.uid,
                userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Usuário',
                text: commentText,
                createdAt: new Date()
            };
            setComments(prevComments => [...prevComments, localComment]);
            setComment('');
            setTimeout(() => {
                if (flatListRef.current) {
                    flatListRef.current.scrollToEnd({ animated: true });
                }
            }, 100);
            const docRef = await addDoc(collection(db, 'comments'), commentData);
            console.log('Comentário salvo no Firestore com ID:', docRef.id);
            setComments(prevComments => 
                prevComments.map(c => 
                    c.id === localComment.id 
                        ? { ...c, id: docRef.id, createdAt: commentData.createdAt }
                        : c
                )
            );            
        } catch (error) {
            console.error('Erro ao enviar comentário:', error);
            setComments(prevComments => 
                prevComments.filter(c => c.id !== localComment.id)
            );
            setComment(commentText);
            console.log('Comentário local removido devido a erro');
        } finally {
            setSending(false);
        }
    };
    const handleRefresh = () => {
        setLoading(true);
        loadComments();
    };
    const renderItem = ({ item }) => {
        const isLocal = item.id.toString().startsWith('local_');        
        return (
            <View style={[styles.commentItem, isLocal && styles.localComment]}>
                <Ionicons name="person-circle-outline" size={28} color="#1abc9c" style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                    <View style={styles.commentHeader}>
                        <Text style={styles.commentUser}>{item.userName || 'Usuário'}</Text>
                        {isLocal && <Text style={styles.localIndicator}>•</Text>}
                    </View>
                    <Text style={styles.commentText}>{item.text || ''}</Text>
                    <Text style={styles.commentDate}>
                        {formatDate(item.createdAt)}
                    </Text>
                </View>
            </View>
        );
    };

    const formatDate = (timestamp) => {
    if (!timestamp || timestamp === 'temporario') return 'Agora mesmo';
    
    try {
        let date;        
        if (timestamp && typeof timestamp.toDate === 'function') {
            date = timestamp.toDate();
        } 
        else if (typeof timestamp === 'string') {
            date = new Date(timestamp);
        }
        else if (timestamp instanceof Date) {
            date = timestamp;
        }
        else if (typeof timestamp === 'number') {
            date = new Date(timestamp);
        }
        else {
            return 'Agora mesmo';
        }
        if (isNaN(date.getTime())) {
            return 'Agora mesmo';
        }        
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);        
        if (diffMins < 1) return 'Agora mesmo';
        if (diffMins < 60) return `${diffMins}min atrás`;
        
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Erro ao formatar data:', error, timestamp);
        return 'Agora mesmo';
    }
};

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#1abc9c" />
                </TouchableOpacity>
                <Text style={styles.title}>Comentários ({comments.length})</Text>
                <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
                    <Ionicons name="refresh" size={20} color="#1abc9c" />
                </TouchableOpacity>
            </View>            
            <FlatList
                ref={flatListRef}
                data={comments}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    loading ? (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Carregando comentários...</Text>
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Seja o primeiro a comentar!</Text>
                        </View>
                    )
                }
                refreshing={loading}
                onRefresh={handleRefresh}
                showsVerticalScrollIndicator={false}
                extraData={comments.length}
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
                        multiline
                        maxLength={500}
                        editable={!sending}
                    />
                    <TouchableOpacity 
                        onPress={handleSend} 
                        style={[styles.sendButton, (sending || !comment.trim()) && styles.sendButtonDisabled]}
                        disabled={sending || !comment.trim()}
                    >
                        {sending ? (
                            <Ionicons name="hourglass" size={22} color="#fff" />
                        ) : (
                            <Ionicons name="send" size={22} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>
                
                {sending && (
                    <View style={styles.sendingIndicator}>
                        <Text style={styles.sendingText}>Enviando comentário...</Text>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#fff' 
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 5,
    },
    refreshButton: {
        padding: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2d3436',
        flex: 1,
        textAlign: 'center',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexGrow: 1,
    },
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
    sendingIndicator: {
        alignItems: 'center',
        paddingVertical: 5,
    },
    sendingText: {
        color: '#1abc9c',
        fontSize: 12,
        fontStyle: 'italic',
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    loadingText: {
        color: '#636e72',
        fontSize: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        textAlign: 'center',
        color: '#b2bec3',
        fontSize: 16,
    },
});