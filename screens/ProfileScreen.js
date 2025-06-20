import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Image, 
    FlatList, 
    TouchableOpacity, 
    SafeAreaView,
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    TouchableWithoutFeedback
} from 'react-native';
import { db, auth } from '../firebase';
import { doc, getDoc, collection, query, where, orderBy, getDocs, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ route, navigation }) {
    const { userId } = route.params || {};
    const [profileData, setProfileData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(true);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [showPostMenu, setShowPostMenu] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const currentUser = auth.currentUser;
    const isOwnProfile = currentUser?.uid === userId;

    useEffect(() => {        
        if (!userId) {
            Alert.alert('Erro', 'ID do usuário não encontrado');
            navigation.goBack();
            return;
        }
        
        loadProfileData();
        loadUserPosts();
    }, [userId]);

    const loadProfileData = async () => {
        if (!userId) return;
        
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                setProfileData(userDoc.data());
            } else {
                Alert.alert('Erro', 'Usuário não encontrado');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            Alert.alert('Erro', 'Não foi possível carregar o perfil');
        } finally {
            setLoading(false);
        }
    };

    const loadUserPosts = async () => {
        if (!userId) {
            setPostsLoading(false);
            return;
        }

        try {            
            const postsQuery = query(
                collection(db, 'posts'),
                where('userId', '==', userId)
            );
            
            const snapshot = await getDocs(postsQuery);
            let userPosts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                likedBy: doc.data().likedBy || [],
                likes: doc.data().likes || 0,
                comments: doc.data().comments || 0,
                isOwnPost: doc.data().userId === currentUser?.uid
            }));
            
            userPosts = userPosts.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
                return dateB - dateA;
            });
            
            setPosts(userPosts);
        } catch (error) {
            console.error('Erro ao carregar posts:', error);            
        } finally {
            setPostsLoading(false);
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
            loadUserPosts(); 
        }
    };

    const showPostOptions = (postId) => {
        setSelectedPostId(postId);
        setShowPostMenu(true);
    };

    const hidePostMenu = () => {
        setShowPostMenu(false);
        setSelectedPostId(null);
    };

    const handleDeletePost = async () => {
        if (!selectedPostId) return;
        
        Alert.alert(
            'Excluir publicação',
            'Tem certeza que deseja excluir esta publicação? Esta ação não pode ser desfeita.',
            [
                { text: 'Cancelar', style: 'cancel', onPress: hidePostMenu },
                { 
                    text: 'Excluir', 
                    style: 'destructive', 
                    onPress: async () => {
                        await deletePost();
                    } 
                }
            ]
        );
    };

    const deletePost = async () => {
        if (!selectedPostId || deleting) return;
        
        setDeleting(true);
        hidePostMenu();
        
        try {
            const commentsQuery = query(
                collection(db, 'comments'),
                where('postId', '==', selectedPostId)
            );
            
            const commentsSnapshot = await getDocs(commentsQuery);
            
            const deleteCommentPromises = commentsSnapshot.docs.map(commentDoc => 
                deleteDoc(doc(db, 'comments', commentDoc.id))
            );
            
            await Promise.all(deleteCommentPromises);

            await deleteDoc(doc(db, 'posts', selectedPostId));

            setPosts(prevPosts => prevPosts.filter(post => post.id !== selectedPostId));
            
        } catch (error) {
            console.error('Erro ao excluir post:', error);
            Alert.alert('Erro', 'Não foi possível excluir a publicação. Tente novamente.');
        } finally {
            setDeleting(false);
            setSelectedPostId(null);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleDateString('pt-BR');
        } catch (error) {
            return '';
        }
    };

    const renderPost = ({ item }) => {
        const isLiked = item.likedBy?.includes(currentUser?.uid) || false;
        
        return (
            <View style={styles.postContainer}>
                {/* Header do post com opções para próprios posts */}
                {isOwnProfile && (
                    <View style={styles.postHeader}>
                        <View style={styles.postHeaderDate}>
                            <Text style={styles.postDate}>{formatDate(item.createdAt)}</Text>
                        </View>
                        
                        {/* Botão de três pontos para opções */}
                        <TouchableOpacity 
                            style={styles.postOptionsButton}
                            onPress={() => showPostOptions(item.id)}
                        >
                            <Ionicons name="ellipsis-horizontal" size={24} color="#636e72" />
                        </TouchableOpacity>
                    </View>
                )}
                
                {item.imageUrl && (
                    <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.postImage}
                        resizeMode="cover"
                    />
                )}
                
                <View style={styles.postContent}>
                    <Text style={styles.postDescription}>{item.description || ''}</Text>
                    
                    {item.location && (
                        <View style={styles.locationContainer}>
                            <Ionicons name="location-outline" size={14} color="#636e72" />
                            <Text style={styles.locationText}>{item.location}</Text>
                        </View>
                    )}
                </View>
                
                {/* Post Footer with Like and Comment buttons - matching HomeScreen */}
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
                    
                    <TouchableOpacity 
                        style={styles.commentButton}
                        onPress={() => navigation.navigate('CommentsScreen', { postId: item.id })}
                    >
                        <Ionicons name="chatbubble-outline" size={24} color="#636e72" />
                        <Text style={styles.commentCount}>{item.comments || 0}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderHeader = () => (
        <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
                {profileData?.profileImage ? (
                    <Image 
                        source={{ uri: profileData.profileImage }} 
                        style={styles.profileImage} 
                    />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Text style={styles.placeholderText}>
                            {profileData?.nome?.charAt(0)?.toUpperCase() || 'U'}
                        </Text>
                    </View>
                )}
            </View>
            
            <Text style={styles.userName}>{profileData?.nome || 'Usuário'}</Text>
            
            {profileData?.bio && (
                <Text style={styles.userBio}>{profileData.bio}</Text>
            )}
            
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{posts.length}</Text>
                    <Text style={styles.statLabel}>Posts</Text>
                </View>
            </View>
            
            {posts.length > 0 && (
                <View style={styles.postsHeaderContainer}>
                    <Text style={styles.postsHeader}>Publicações</Text>
                </View>
            )}
        </View>
    );

    if (!userId) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1abc9c" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Perfil</Text>
                    <View style={styles.headerRight} />
                </View>
                <View style={styles.loadingContainer}>
                    <Text style={styles.errorText}>Erro: ID do usuário não encontrado</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1abc9c" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Perfil</Text>
                    <View style={styles.headerRight} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1abc9c" />
                    <Text style={styles.loadingText}>Carregando perfil...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1abc9c" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {isOwnProfile ? 'Meu Perfil' : profileData?.nome || 'Perfil'}
                </Text>
                <View style={styles.headerRight} />
            </View>

            <FlatList
                data={posts}
                renderItem={renderPost}
                keyExtractor={item => item.id}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={
                    postsLoading ? (
                        <View style={styles.postsLoadingContainer}>
                            <ActivityIndicator size="small" color="#1abc9c" />
                            <Text style={styles.loadingText}>Carregando posts...</Text>
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="images-outline" size={48} color="#b2bec3" />
                            <Text style={styles.emptyText}>
                                {isOwnProfile ? 'Você ainda não fez nenhuma publicação' : 'Nenhuma publicação encontrada'}
                            </Text>
                        </View>
                    )
                }
                refreshing={loading || postsLoading}
                onRefresh={() => {
                    if (userId) {
                        loadProfileData();
                        loadUserPosts();
                    }
                }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30 }}
            />
            
            {/* Modal para opções do post */}
            <Modal
                visible={showPostMenu}
                transparent={true}
                animationType="fade"
                onRequestClose={hidePostMenu}
            >
                <TouchableWithoutFeedback onPress={hidePostMenu}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Opções da publicação</Text>
                            
                            <TouchableOpacity
                                style={[styles.modalOption, styles.modalOptionDanger]}
                                onPress={handleDeletePost}
                            >
                                <Ionicons name="trash-outline" size={24} color="#e74c3c" />
                                <Text style={styles.modalOptionTextDanger}>Excluir publicação</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={hidePostMenu}
                            >
                                <Text style={styles.modalCancelText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

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

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f6fa',
        paddingTop: 30,
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
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2d3436',
    },
    headerRight: {
        width: 34,
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
    errorText: {
        fontSize: 16,
        color: '#e74c3c',
    },
    profileHeader: {
        backgroundColor: '#fff',
        paddingVertical: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImageContainer: {
        marginBottom: 15,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#1abc9c',
    },
    placeholderImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#1abc9c',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#16a085',
    },
    placeholderText: {
        fontSize: 40,
        color: '#fff',
        fontWeight: 'bold',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 8,
        textAlign: 'center',
    },
    userBio: {
        fontSize: 16,
        color: '#636e72',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2d3436',
    },
    statLabel: {
        fontSize: 14,
        color: '#636e72',
        marginTop: 2,
    },
    postsHeaderContainer: {
        width: '100%',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    postsHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2d3436',
        textAlign: 'center',
    },
    postContainer: {
        backgroundColor: '#fff',
        marginVertical: 8,
        marginHorizontal: 20,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: 'hidden',
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    postHeaderDate: {
        flex: 1,
    },
    postOptionsButton: {
        padding: 8,
    },
    postDate: {
        fontSize: 14,
        color: '#636e72',
    },
    postImage: {
        width: '100%',
        height: windowWidth > 400 ? 250 : 200,
    },
    postContent: {
        padding: 16,
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
        marginBottom: 12,
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
    postsLoadingContainer: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 50,
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#b2bec3',
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 22,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        width: '100%',
        maxWidth: 320,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 12,
        width: '100%',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    modalOptionDanger: {
        backgroundColor: '#fff',
        borderColor: '#e74c3c',
    },
    modalOptionTextDanger: {
        fontSize: 16,
        color: '#e74c3c',
        marginLeft: 12,
        fontWeight: '500',
    },
    modalCancelButton: {
        marginTop: 5,
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    modalCancelText: {
        fontSize: 16,
        color: '#636e72',
        fontWeight: '500',
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
    },
});