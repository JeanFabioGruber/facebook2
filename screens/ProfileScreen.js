import React, { useState, useEffect } from 'react';
import { 
    View, 
    StyleSheet, 
    FlatList, 
    SafeAreaView,
    ActivityIndicator,
    Alert,
    Text,
} from 'react-native';
import { db, auth } from '../firebase';
import { doc, getDoc, collection, query, where, orderBy, getDocs, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import ProfileHeaderBar from '../components/profile/ProfileHeaderBar';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfilePost from '../components/profile/ProfilePost';
import ProfilePostsList from '../components/profile/ProfilePostsList';
import ProfileImageModal from '../components/profile/ProfileImageModal';
import ProfilePostModal from '../components/profile/ProfilePostModal';
import LoadingDeletionOverlay from '../components/profile/LoadingDeletionOverlay';
import { formatDate } from '../components/profile/ProfileUtils';

export default function ProfileScreen({ route, navigation }) {
    const { userId } = route.params || {};
    const [profileData, setProfileData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(true);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [showPostMenu, setShowPostMenu] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [zoomVisible, setZoomVisible] = useState(false);
    const [zoomPostImage, setZoomPostImage] = useState(null);
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

    const goToComments = (postId) => {
        navigation.navigate('CommentsScreen', { postId });
    };

    const renderHeader = () => (
        <ProfileHeader 
            profileData={profileData} 
            postsCount={posts.length}
            onImagePress={() => setZoomVisible(true)}
        />
    );

    const renderPost = ({ item }) => {
        const isLiked = item.likedBy?.includes(currentUser?.uid) || false;
        
        return (
            <ProfilePost 
                post={item}
                isOwnProfile={isOwnProfile}
                isLiked={isLiked}
                onToggleLike={toggleLike}
                onShowOptions={showPostOptions}
                onImagePress={setZoomPostImage}
                onCommentPress={goToComments}
                formatDate={formatDate}
            />
        );
    };

    if (!userId) {
        return (
            <SafeAreaView style={styles.container}>
                <ProfileHeaderBar 
                    title="Perfil" 
                    onGoBack={() => navigation.goBack()} 
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#e74c3c" />
                    <Text style={styles.errorText}>Erro: ID do usuário não encontrado</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ProfileHeaderBar 
                    title="Perfil" 
                    onGoBack={() => navigation.goBack()} 
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1abc9c" />
                    <Text style={styles.loadingText}>Carregando perfil...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Barra de navegação do topo */}
            <ProfileHeaderBar 
                title={isOwnProfile ? 'Meu Perfil' : (profileData?.nome || 'Perfil')} 
                onGoBack={() => navigation.goBack()}
            />

            {/* Lista de posts */}
            <FlatList
                data={posts}
                renderItem={renderPost}
                keyExtractor={item => item.id}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={
                    <ProfilePostsList 
                        loading={postsLoading} 
                        isOwnProfile={isOwnProfile} 
                    />
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
            
            {/* Modal de opções do post */}
            <ProfilePostModal 
                isVisible={showPostMenu}
                onClose={hidePostMenu}
                onDelete={handleDeletePost}
            />

            {/* Overlay de carregamento durante exclusão */}
            <LoadingDeletionOverlay visible={deleting} />

            {/* Modal para zoom da foto de perfil */}
            <ProfileImageModal 
                visible={zoomVisible} 
                imageUri={profileData?.profileImage}
                onClose={() => setZoomVisible(false)}
            />
            
            {/* Modal para zoom da foto do post */}
            <ProfileImageModal 
                visible={!!zoomPostImage} 
                imageUri={zoomPostImage}
                onClose={() => setZoomPostImage(null)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f6fa',
        paddingTop: 30,
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
        marginTop: 10,
    },
});