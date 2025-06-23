import React, { useState, useEffect } from 'react';
import { 
    SafeAreaView, 
    FlatList, 
    Text, 
    View, 
    ActivityIndicator, 
    StyleSheet, 
    RefreshControl 
} from 'react-native';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, arrayUnion, arrayRemove, updateDoc } from 'firebase/firestore';
import PostItem from '../components/post/PostItem';
import { formatDate } from '../components/utils/dateFormatter';
import TagPostsHeader from '../components/tags/TagPostsHeader';
import LoadingView from '../components/LoadingOverlay';

export default function TagPostsScreen({ route, navigation }) {
    const { tag } = route.params;
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const currentUser = auth.currentUser;

    useEffect(() => {
        loadTagPosts();
    }, [tag]);

    const loadTagPosts = async () => {
        try {
            setLoading(true);
            const postsQuery = query(
                collection(db, 'posts'),
                where('tags', 'array-contains', tag)
            );
            
            const snapshot = await getDocs(postsQuery);
            let postsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            const postsWithUserData = await Promise.all(
                postsData.map(async (post) => {
                    try {
                        const userDoc = await getDoc(doc(db, 'users', post.userId));
                        if (userDoc.exists()) {
                            const userData = userDoc.data();
                            return {
                                ...post,
                                userName: userData.nome || 'Usuário',
                                userProfileImage: userData.profileImage || null,                               
                                likedBy: post.likedBy || [],
                                likes: post.likes || 0,
                                comments: post.comments || 0,
                                isOwnPost: post.userId === currentUser?.uid
                            };
                        }
                        return getDefaultPostData(post);
                    } catch (error) {
                        console.error('Erro ao buscar dados do usuário:', error);
                        return getDefaultPostData(post);
                    }
                })
            );
            
            const sortedPosts = postsWithUserData.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
                return dateB - dateA;
            });
            
            setPosts(sortedPosts);
        } catch (error) {
            console.error('Erro ao carregar posts por tag:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const toggleLike = async (postId) => {
    if (!currentUser) {
        Alert.alert('Erro', 'Você precisa estar logado para curtir posts');
        return;
    }

    try {
        const postRef = doc(db, 'posts', postId);
        const postDoc = await getDoc(postRef);
        
        if (!postDoc.exists()) {
            Alert.alert('Erro', 'Post não encontrado');
            return;
        }

        const postData = postDoc.data();
        const likedBy = postData.likedBy || [];
        const isLiked = likedBy.includes(currentUser.uid);
        
        setPosts(prevPosts => 
            prevPosts.map(post => {
                if (post.id === postId) {
                    const newLikedBy = isLiked 
                        ? post.likedBy.filter(id => id !== currentUser.uid)
                        : [...post.likedBy, currentUser.uid];
                    
                    return {
                        ...post,
                        likedBy: newLikedBy,
                        likes: newLikedBy.length
                    };
                }
                return post;
            })
        );

        if (isLiked) {
            await updateDoc(postRef, {
                likedBy: arrayRemove(currentUser.uid),
                likes: Math.max(0, (postData.likes || 0) - 1)
            });
        } else {
            await updateDoc(postRef, {
                likedBy: arrayUnion(currentUser.uid),
                likes: (postData.likes || 0) + 1
            });
        }
    } catch (error) {
        console.error('Erro ao curtir post:', error);
        Alert.alert('Erro', 'Não foi possível curtir o post');
        loadTagPosts();
    }
};

    const getDefaultPostData = (post) => ({
        ...post,
        userName: 'Usuário',
        userProfileImage: null,
        likedBy: post.likedBy || [],
        likes: post.likes || 0,
        comments: post.comments || 0,
        isOwnPost: post.userId === currentUser?.uid
    });

    const onRefresh = () => {
        setRefreshing(true);
        loadTagPosts();
    };

    if (loading && posts.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <TagPostsHeader tag={tag} onGoBack={() => navigation.goBack()} />
                <LoadingView message="Carregando posts..." />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <TagPostsHeader tag={tag} onGoBack={() => navigation.goBack()} />

            {/* Lista de posts */}
            <FlatList
                data={posts}
                renderItem={({ item }) => (
                    <PostItem
                        item={item}
                        currentUser={currentUser}
                        navigation={navigation}
                        onLike={toggleLike}
                        onShowOptions={() => {}}
                        formatDate={formatDate}
                    />
                )}
                keyExtractor={item => item.id}
                contentContainerStyle={
                    posts.length === 0 ? styles.emptyContentContainer : styles.contentContainer
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#1abc9c']}
                        tintColor="#1abc9c"
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            Nenhuma publicação encontrada com a tag #{tag}
                        </Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f6fa',
    },
    contentContainer: {
        paddingBottom: 20,
    },
    emptyContentContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingBottom: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#b2bec3',
        textAlign: 'center',
    }
});