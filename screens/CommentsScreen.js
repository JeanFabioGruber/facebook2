import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    FlatList, 
    StyleSheet, 
    SafeAreaView, 
    KeyboardAvoidingView, 
    Platform 
} from 'react-native';
import { db, auth } from '../firebase';
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs, 
    serverTimestamp, 
    doc, 
    getDoc, 
    updateDoc 
} from 'firebase/firestore';
import CommentHeader from '../components/comments/CommentHeader';
import CommentItem from '../components/comments/CommentItem';
import CommentInput from '../components/comments/CommentInput';
import EmptyCommentsList from '../components/comments/EmptyCommentsList';
import SendingIndicator from '../components/comments/SendingIndicator';
import { formatDate } from '../components/utils/dateFormatter';

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
            
            const postRef = doc(db, 'posts', postId);
            const postDoc = await getDoc(postRef);
            
            if (postDoc.exists()) {
                const currentComments = postDoc.data().comments || 0;
                await updateDoc(postRef, {
                    comments: currentComments + 1
                });
                console.log('Contador de comentários atualizado no post');
            }
            
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
            <CommentItem 
                comment={item}
                isLocal={isLocal}
                formatDate={formatDate}
            />
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Cabeçalho */}
            <CommentHeader 
                onBack={() => navigation.goBack()}
                commentsCount={comments.length}
            />
            
            {/* Lista de comentários */}
            <FlatList
                ref={flatListRef}
                data={comments}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <EmptyCommentsList loading={loading} />
                }
                refreshing={loading}
                onRefresh={handleRefresh}
                showsVerticalScrollIndicator={false}
                extraData={comments.length}
            />
            
            {/* Seção de entrada de comentário com adaptação para teclado */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={80}
            >
                <CommentInput 
                    value={comment}
                    onChangeText={setComment}
                    onSend={handleSend}
                    sending={sending}
                />
                
                <SendingIndicator visible={sending} />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#fff' 
    },
    listContent: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexGrow: 1,
    }
});