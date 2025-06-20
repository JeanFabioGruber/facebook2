import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Dimensions,
    Animated,
    TextInput // Adicionado para busca
} from 'react-native';
import { db, auth } from '../firebase';
import { collection, query, orderBy, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
    // Estado dos posts
    const [posts, setPosts] = useState([]);
    // Estado de loading
    const [loading, setLoading] = useState(true);
    // Estado de refresh
    const [refreshing, setRefreshing] = useState(false);
    // Estado do campo de busca
    const [search, setSearch] = useState('');
    const currentUser = auth.currentUser;    
    
    // Animação do header
    const scrollY = useRef(new Animated.Value(0)).current;
    const headerTranslateY = useRef(new Animated.Value(0)).current;
    const lastScrollY = useRef(0);

    useEffect(() => {
        loadPosts();
    }, []);

    // Formata a data do post
    const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
        return '';
    }
};

    // Carrega os posts do Firestore
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

            // Busca dados do usuário para cada post
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
                                comments: post.comments || 0 // Garante que o campo comments seja exibido
                            };
                        }
                        return {
                            ...post,
                            userName: 'Usuário',
                            userProfileImage: null,
                            likedBy: post.likedBy || [],
                            likes: post.likes || 0,
                            comments: post.comments || 0
                        };
                    } catch (error) {
                        console.error('Erro ao buscar dados do usuário:', error);
                        return {
                            ...post,
                            userName: 'Usuário',
                            userProfileImage: null,
                            likedBy: post.likedBy || [],
                            likes: post.likes || 0,
                            comments: post.comments || 0
                        };
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

    // Função para curtir/descurtir post
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
            loadPosts();
        }
    };

    // Atualiza lista ao puxar para baixo
    const onRefresh = async () => {
        setRefreshing(true);
        await loadPosts();
        setRefreshing(false);
    };

    // Animação do header ao rolar
    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        {
            useNativeDriver: false,
            listener: (event) => {
                const currentScrollY = event.nativeEvent.contentOffset.y;
                const diff = currentScrollY - lastScrollY.current;
                
                if (diff > 0 && currentScrollY > 50) {                   
                    Animated.timing(headerTranslateY, {
                        toValue: -80,
                        duration: 300,
                        useNativeDriver: true,
                    }).start();
                } else if (diff < 0) {                  
                    Animated.timing(headerTranslateY, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }).start();
                }
                
                lastScrollY.current = currentScrollY;
            },
        }
    );

    // Filtra posts conforme busca
    const filteredPosts = posts.filter(post =>
        post.description?.toLowerCase().includes(search.toLowerCase()) ||
        post.userName?.toLowerCase().includes(search.toLowerCase())
    );

    // Renderiza cada post
    const renderPost = ({ item }) => {
        const isLiked = item.likedBy?.includes(currentUser?.uid) || false;
        
        return (
            <View style={styles.postContainer}>
                {/* Header do post com foto e nome do usuário */}
                <View style={styles.postHeader}>
                    <TouchableOpacity 
                        style={styles.userInfo}
                        onPress={() => navigation.navigate('ProfileScreen', { userId: item.userId })}
                    >
                        {item.userProfileImage ? (
                            <Image 
                                source={{ uri: item.userProfileImage }} 
                                style={styles.userAvatar} 
                            />
                        ) : (
                            <View style={styles.placeholderAvatar}>
                                <Text style={styles.placeholderAvatarText}>
                                    {item.userName?.charAt(0)?.toUpperCase() || 'U'}
                                </Text>
                            </View>
                        )}
                        <View style={styles.userDetails}>
                            <Text style={styles.userName}>{item.userName}</Text>
                            <Text style={styles.postDate}>{formatDate(item.createdAt)}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Imagem do post */}
                {item.imageUrl && (
                    <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.postImage}
                        resizeMode="cover"
                    />
                )}

                {/* Conteúdo do post */}
                <View style={styles.postContent}>
                    <Text style={styles.postDescription}>{item.description}</Text>
                    
                    {item.location && (
                        <View style={styles.locationContainer}>
                            <Ionicons name="location-outline" size={14} color="#636e72" />
                            <Text style={styles.locationText}>{item.location}</Text>
                        </View>
                    )}
                </View>

                {/* Footer do post */}
                <View style={styles.postFooter}>
                    <TouchableOpacity 
                        style={styles.likeButton}
                        onPress={() => toggleLike(item.id)}
                    >
                        <Ionicons 
                            name={isLiked ? "heart" : "heart-outline"} 
                            size={24} 
                            color={isLiked ? "#e74c3c" : "#636e72"} 
                        />
                        <Text style={[
                            styles.likeCount,
                            isLiked && styles.likedText
                        ]}>
                            {item.likes || 0}
                        </Text>
                    </TouchableOpacity>
                    {/* Botão de comentário agora navega para CommentsScreen */}
                    <TouchableOpacity style={styles.commentButton} onPress={() => navigation.navigate('CommentsScreen', { postId: item.id })}>
                        <Ionicons name="chatbubble-outline" size={24} color="#636e72" />
                        <Text style={styles.commentCount}>{item.comments || 0}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading && posts.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <Animated.View style={[styles.header, { transform: [{ translateY: headerTranslateY }] }]}> 
                    <Text style={styles.headerTitle}>Feed</Text>
                    <View style={styles.headerButtons}>
                        <TouchableOpacity 
                            style={styles.headerButton}
                            onPress={() => navigation.navigate('AddPostScreen')}
                        >
                            <Ionicons name="add-circle-outline" size={28} color="#1abc9c" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.headerButton}
                            onPress={() => navigation.navigate('MinhaConta')}
                        >
                            <Ionicons name="person-circle-outline" size={28} color="#1abc9c" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
                <View style={[styles.loadingContainer, { paddingTop: 80 }]}> 
                    <ActivityIndicator size="large" color="#1abc9c" />
                    <Text style={styles.loadingText}>Carregando posts...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header animado */}
            <Animated.View style={[styles.header, { transform: [{ translateY: headerTranslateY }] }]}> 
                <Text style={styles.headerTitle}>Feed</Text>
                <View style={styles.headerButtons}>
                    <TouchableOpacity 
                        style={styles.headerButton}
                        onPress={() => navigation.navigate('AddPostScreen')}
                    >
                        <Ionicons name="add-circle-outline" size={28} color="#1abc9c" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.headerButton}
                        onPress={() => navigation.navigate('MinhaConta')}
                    >
                        <Ionicons name="person-circle-outline" size={28} color="#1abc9c" />
                    </TouchableOpacity>
                </View>
            </Animated.View>
            {/* Campo de busca com design mais integrado */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={20} color="#b2bec3" style={{ marginLeft: 10, marginRight: 6 }} />
                    <TextInput
                        placeholder="Buscar post..."
                        value={search}
                        onChangeText={setSearch}
                        style={styles.searchInput}
                        placeholderTextColor="#b2bec3"
                    />
                </View>
            </View>
            {/* Lista de posts filtrados */}
            <FlatList
                data={filteredPosts}
                renderItem={renderPost}
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
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="images-outline" size={48} color="#b2bec3" />
                        <Text style={styles.emptyText}>Nenhum post encontrado</Text>
                        <Text style={styles.emptySubText}>Seja o primeiro a compartilhar algo!</Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f6fa',
        paddingTop: 20,
    },
    header: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 1000,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1abc9c',
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerButton: {
        marginLeft: 15,
        padding: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#636e72',
    },
    contentContainer: {
        paddingBottom: 20,
    },
    emptyContentContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    postContainer: {
        backgroundColor: '#fff',
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: 'hidden',
    },
    postHeader: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        borderWidth: 2,
        borderColor: '#1abc9c',
    },
    placeholderAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1abc9c',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 2,
        borderColor: '#16a085',
    },
    placeholderAvatarText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 2,
    },
    postDate: {
        fontSize: 12,
        color: '#636e72',
    },
    postImage: {
        width: '100%',
        height: windowWidth > 400 ? 300 : 250,
    },
    postContent: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    postDescription: {
        fontSize: 16,
        color: '#2d3436',
        lineHeight: 22,
        marginBottom: 8,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    locationText: {
        fontSize: 14,
        color: '#636e72',
        marginLeft: 4,
    },
    postFooter: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
        paddingVertical: 5,
        paddingHorizontal: 8,
        borderRadius: 20,
    },
    likeCount: {
        fontSize: 14,
        color: '#636e72',
        marginLeft: 4,
        fontWeight: '600',
    },
    likedText: {
        color: '#e74c3c',
        fontWeight: 'bold',
    },
    commentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 8,
    },
    commentCount: {
        fontSize: 14,
        color: '#636e72',
        marginLeft: 4,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 18,
        color: '#b2bec3',
        textAlign: 'center',
        marginTop: 10,
        fontWeight: '600',
    },
    emptySubText: {
        fontSize: 14,
        color: '#b2bec3',
        textAlign: 'center',
        marginTop: 5,
    },
    // Campo de busca com design mais integrado
    searchContainer: {
        paddingHorizontal: 16,
        marginTop: 80,
        marginBottom: 8, // Reduzido para aproximar o campo de busca dos posts
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },
    searchInput: {
        flex: 1,
        paddingHorizontal: 0,
        paddingVertical: 8,
        fontSize: 16,
        color: '#2d3436',
        backgroundColor: 'transparent',
        borderWidth: 0,
    },
});