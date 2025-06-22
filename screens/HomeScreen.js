import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Animated,
    Text
} from 'react-native';
import { db, auth } from '../firebase';
import { collection, query, orderBy, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove, deleteDoc, where } from 'firebase/firestore';

// Componentes
import HomeHeader from '../components/home/HomeHeader';
import SearchBar from '../components/home/SearchBar';
import EmptyPostsList from '../components/home/EmptyPostsList';
import PostItem from '../components/post/PostItem';
import PostOptionsModal from '../components/post/PostOptionsModal';
import LoadingOverlay from '../components/LoadingOverlay';
import LoadingView from '../components/shared/LoadingView';

// Utilitários
import { formatDate } from '../components/utils/formatHelpers';
import { setupScrollAnimation } from '../components/utils/animationHelpers';

export default function HomeScreen({ navigation }) {
    // Estados
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);    
    const [search, setSearch] = useState('');
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [showPostMenu, setShowPostMenu] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showAddPostLoading, setShowAddPostLoading] = useState(false);
    
    // Referências e valores de animação
    const scrollY = useRef(new Animated.Value(0)).current;
    const headerTranslateY = useRef(new Animated.Value(0)).current;
    const lastScrollY = useRef(0);
    const currentUser = auth.currentUser;
    
    // Setup do manipulador de scroll para animação do header
    const handleScroll = setupScrollAnimation(scrollY, headerTranslateY, lastScrollY);

    // Efeito para carregar os posts iniciais
    useEffect(() => {
        loadPosts();
    }, []);

    // Funções
    const loadPosts = async () => {
        setLoading(true);
        try {
            const postsQuery = query(
                collection(db, 'posts'),
                orderBy('createdAt', 'desc')
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

            setPosts(postsWithUserData);
        } catch (error) {
            console.error('Erro ao carregar posts:', error);
            Alert.alert('Erro', 'Não foi possível carregar os posts');
        } finally {
            setLoading(false);
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
            
            // Atualiza o estado localmente primeiro para melhor UX
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
            
            // Atualiza no Firebase
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
            loadPosts(); // Recarrega os posts em caso de erro
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadPosts();
        setRefreshing(false);
    };

    const showPostOptions = (postId) => {
        setSelectedPostId(postId);
        setShowPostMenu(true);
    };

    const hidePostMenu = () => {
        setShowPostMenu(false);
        setSelectedPostId(null);
    };

    const handleDeleteConfirmation = () => {
        if (!selectedPostId) return;
        
        Alert.alert(
            'Excluir publicação',
            'Tem certeza que deseja excluir esta publicação? Esta ação não pode ser desfeita.',
            [
                { text: 'Cancelar', style: 'cancel', onPress: hidePostMenu },
                { 
                    text: 'Excluir', 
                    style: 'destructive', 
                    onPress: deletePost 
                }
            ]
        );
    };

    const deletePost = async () => {
        if (!selectedPostId || deleting) return;
        
        setDeleting(true);
        hidePostMenu();
        
        try {
            // Excluir comentários relacionados
            const commentsQuery = query(
                collection(db, 'comments'),
                where('postId', '==', selectedPostId)
            );
            
            const commentsSnapshot = await getDocs(commentsQuery);
            
            const deleteCommentPromises = commentsSnapshot.docs.map(commentDoc => 
                deleteDoc(doc(db, 'comments', commentDoc.id))
            );
            
            await Promise.all(deleteCommentPromises);
            
            // Excluir o post
            await deleteDoc(doc(db, 'posts', selectedPostId));

            // Atualizar estado
            setPosts(prevPosts => prevPosts.filter(post => post.id !== selectedPostId));
            
        } catch (error) {
            console.error('Erro ao excluir post:', error);
            Alert.alert('Erro', 'Não foi possível excluir a publicação. Tente novamente.');
        } finally {
            setDeleting(false);
            setSelectedPostId(null);
        }
    };

    // Filtra posts com base na busca
    const filteredPosts = posts.filter(post =>
        post.description?.toLowerCase().includes(search.toLowerCase()) ||
        post.userName?.toLowerCase().includes(search.toLowerCase())
    );

    // Navegação fluida para AddPostScreen
    const goToAddPostScreen = () => {
        setShowAddPostLoading(true);
        setTimeout(() => {
            setShowAddPostLoading(false);
            navigation.navigate('AddPostScreen');
        }, 400);
    };

    // Rendering condicional para tela de carregamento
    if (loading && posts.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <HomeHeader 
                    headerTranslateY={headerTranslateY}
                    onAddPost={goToAddPostScreen}
                    onProfile={() => navigation.navigate('MinhaConta')}
                />
                <LoadingView message="Carregando posts..." />
            </SafeAreaView>
        );
    }

    // UI principal
    return (
        <SafeAreaView style={styles.container}>
            {/* Overlay de carregamento durante a navegação */}
            <LoadingOverlay visible={showAddPostLoading} text="Abrindo publicação..." />
            
            {/* Header animado */}
            <HomeHeader 
                headerTranslateY={headerTranslateY}
                onAddPost={goToAddPostScreen}
                onProfile={() => navigation.navigate('MinhaConta')}
            />
            
            {/* Barra de pesquisa */}
            <SearchBar 
                value={search}
                onChangeText={setSearch}
            />
            
            {/* Lista de posts */}
            <FlatList
                data={filteredPosts}
                renderItem={({ item }) => (
                    <PostItem
                        item={item}
                        currentUser={currentUser}
                        navigation={navigation}
                        onLike={toggleLike}
                        onShowOptions={showPostOptions}
                        formatDate={formatDate}
                    />
                )}
                keyExtractor={item => item.id}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={[
                    filteredPosts.length === 0 ? styles.emptyContentContainer : styles.contentContainer,
                ]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#1abc9c']}
                        tintColor="#1abc9c"
                        progressViewOffset={80}
                    />
                }
                ListEmptyComponent={<EmptyPostsList />}
                showsVerticalScrollIndicator={false}
            />

            {/* Modal de opções do post */}
            <PostOptionsModal 
                isVisible={showPostMenu}
                onClose={hidePostMenu}
                onDelete={handleDeleteConfirmation}
            />

            {/* Overlay de carregamento durante exclusão */}
            {deleting && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingOverlayText}>Excluindo publicação...</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f6fa',
        paddingTop: 20,
    },
    contentContainer: {
        paddingBottom: 20,
    },
    emptyContentContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
    },
    loadingOverlayText: {
        color: '#fff',
        fontSize: 16,
        marginTop: 12,
        fontWeight: '500',
    }
});