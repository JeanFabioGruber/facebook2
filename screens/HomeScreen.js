import React, { useState, useEffect } from 'react';
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
    Dimensions
} from 'react-native';
import { db, auth } from '../firebase';
import { collection, query, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadPosts();
    }, []);

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) return 'Ontem';
            if (diffDays < 7) return `${diffDays} dias atrás`;
            return date.toLocaleDateString('pt-BR');
        } catch (error) {
            return '';
        }
    };

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

            // Buscar dados do usuário para cada post
            const postsWithUserData = await Promise.all(
                postsData.map(async (post) => {
                    try {
                        const userDoc = await getDoc(doc(db, 'users', post.userId));
                        if (userDoc.exists()) {
                            const userData = userDoc.data();
                            return {
                                ...post,
                                userName: userData.nome || 'Usuário',
                                userProfileImage: userData.profileImage || null
                            };
                        }
                        return {
                            ...post,
                            userName: 'Usuário',
                            userProfileImage: null
                        };
                    } catch (error) {
                        console.error('Erro ao buscar dados do usuário:', error);
                        return {
                            ...post,
                            userName: 'Usuário',
                            userProfileImage: null
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

    const onRefresh = async () => {
        setRefreshing(true);
        await loadPosts();
        setRefreshing(false);
    };

    const renderPost = ({ item }) => (
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
                <TouchableOpacity style={styles.likeButton}>
                    <Ionicons name="heart-outline" size={24} color="#636e72" />
                    <Text style={styles.likeCount}>{item.likes || 0}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.commentButton}>
                    <Ionicons name="chatbubble-outline" size={24} color="#636e72" />
                    <Text style={styles.commentCount}>{item.comments || 0}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Facebook</Text>
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
        </View>
    );

    if (loading && posts.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                {renderHeader()}
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1abc9c" />
                    <Text style={styles.loadingText}>Carregando posts...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            <FlatList
                data={posts}
                renderItem={renderPost}
                keyExtractor={item => item.id}
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
                        <Ionicons name="images-outline" size={48} color="#b2bec3" />
                        <Text style={styles.emptyText}>Nenhum post encontrado</Text>
                        <Text style={styles.emptySubText}>Seja o primeiro a compartilhar algo!</Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={posts.length === 0 ? styles.emptyContentContainer : styles.contentContainer}
            />
        </SafeAreaView>
    );
}

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f6fa',
    },
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
    },
    likeCount: {
        fontSize: 14,
        color: '#636e72',
        marginLeft: 4,
        fontWeight: '600',
    },
    commentButton: {
        flexDirection: 'row',
        alignItems: 'center',
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
});