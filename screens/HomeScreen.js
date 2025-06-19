import { useState, useEffect } from "react";
import { SafeAreaView, Text, StyleSheet, View, FlatList, Alert, TouchableOpacity, Image } from "react-native";
import { db } from '../firebase';
import { SecondaryButton } from "../components/Buttons";
import { collection, getDocs, query, orderBy, doc, updateDoc, increment, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Dimensions } from "react-native";
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

export default function HomeScreen() {
    const [posts, setPosts] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [likeLoading, setLikeLoading] = useState({});
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                loadPosts();
            }
        });

        return unsubscribe;
    }, []);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const postsQuery = query(
                collection(db, 'posts'),
                orderBy('createdAt', 'desc')
            );
            
            const snapshot = await getDocs(postsQuery);
            const postsData = [];
            
            for (const docSnap of snapshot.docs) {
                const postData = { id: docSnap.id, ...docSnap.data() };
                
                // Buscar dados do usuário que publicou
                if (postData.userId) {
                    const userDoc = await getDoc(doc(db, 'users', postData.userId));
                    if (userDoc.exists()) {
                        postData.author = userDoc.data();
                    }
                }
                
                postsData.push(postData);
            }
            
            setPosts(postsData);
        } catch (error) {
            console.error('Erro ao carregar posts:', error);
            Alert.alert('Erro', 'Não foi possível carregar as publicações');
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (postId) => {
        if (!user || likeLoading[postId]) return;

        setLikeLoading(prev => ({ ...prev, [postId]: true }));

        try {
            const postRef = doc(db, 'posts', postId);
            const postDoc = await getDoc(postRef);

            if (postDoc.exists()) {
                const postData = postDoc.data();
                const likedBy = postData.likedBy || [];
                let updatedLikedBy, likeChange;

                if (likedBy.includes(user.uid)) {
                    // Remover curtida
                    updatedLikedBy = likedBy.filter(uid => uid !== user.uid);
                    likeChange = -1;
                } else {
                    // Adicionar curtida
                    updatedLikedBy = [...likedBy, user.uid];
                    likeChange = 1;
                }

                await updateDoc(postRef, {
                    likes: increment(likeChange),
                    likedBy: updatedLikedBy
                });

                // Atualiza o post localmente sem recarregar tudo
                setPosts(prevPosts =>
                    prevPosts.map(post =>
                        post.id === postId
                            ? {
                                ...post,
                                likes: (post.likes || 0) + likeChange,
                                likedBy: updatedLikedBy
                            }
                            : post
                    )
                );
            }
        } catch (error) {
            console.error('Erro ao curtir post:', error);
            Alert.alert('Erro', 'Não foi possível curtir a publicação');
        } finally {
            setLikeLoading(prev => ({ ...prev, [postId]: false }));
        }
    };

    const openProfile = (userId) => {
        navigation.navigate('Profile', { userId });
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const renderPost = ({ item }) => {
        const isLiked = item.likedBy?.includes(user?.uid) || false;
        const isLoading = likeLoading[item.id];

        return (
            <View style={styles.postContainer}>
                <TouchableOpacity 
                    style={styles.profileHeader}
                    onPress={() => openProfile(item.userId)}
                >
                    <View style={styles.profileInfo}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {item.author?.nome?.charAt(0)?.toUpperCase() || 'U'}
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.authorName}>
                                {item.author?.nome || 'Usuário'}
                            </Text>
                            <Text style={styles.postDate}>
                                {formatDate(item.createdAt)}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {item.imageUrl && (
                    <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.postImage}
                        resizeMode="cover"
                    />
                )}

                <View style={styles.postContent}>
                    <Text style={styles.postDescription}>{item.description}</Text>
                    {item.location && (
                        <View style={styles.locationContainer}>
                            <Ionicons name="location-outline" size={16} color="#636e72" />
                            <Text style={styles.locationText}>{item.location}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.postActions}>
                    <TouchableOpacity
                        style={styles.likeButton}
                        onPress={() => handleLike(item.id)}
                        disabled={isLoading}
                    >
                        <Ionicons
                            name={isLiked ? "heart" : "heart-outline"}
                            size={24}
                            color={isLiked ? "#e74c3c" : "#636e72"}
                        />
                        {isLoading ? (
                            <Text style={[styles.likeCount, styles.likedText]}>...</Text>
                        ) : (
                            <Text style={[styles.likeCount, isLiked && styles.likedText]}>
                                {item.likes || 0}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text>Carregando publicações...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <RNSafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar backgroundColor="#f5f6fa" barStyle="dark-content" />
            <View style={styles.header}>
                <Text style={styles.title}>Feed</Text>
                <TouchableOpacity 
                    onPress={() => navigation.navigate('MinhaConta')}
                    style={styles.profileButton}
                >
                    <Ionicons name="person-circle-outline" size={32} color="#1abc9c" />
                </TouchableOpacity>
            </View>
            <FlatList
                data={posts}
                renderItem={renderPost}
                keyExtractor={item => item.id}
                refreshing={loading}
                onRefresh={loadPosts}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Nenhuma publicação encontrada</Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30, flexGrow: 1 }}
            />
        </RNSafeAreaView>
    );
}

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f5f6fa',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 0.07 * windowWidth,
        fontWeight: 'bold',
        color: '#1abc9c',
    },
    profileButton: {
        padding: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    postContainer: {
        backgroundColor: '#fff',
        marginVertical: 8,
        marginHorizontal: '4%',
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        minWidth: 0.9 * windowWidth,
        maxWidth: '92%',
    },
    profileHeader: {
        padding: 16,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#1abc9c',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    authorName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2d3436',
    },
    postDate: {
        fontSize: 12,
        color: '#636e72',
        marginTop: 2,
    },
    postImage: {
        width: '100%',
        height: windowWidth > 400 ? 300 : 200,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
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
        marginTop: 8,
    },
    locationText: {
        fontSize: 14,
        color: '#636e72',
        marginLeft: 4,
    },
    postActions: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    likeCount: {
        fontSize: 16,
        color: '#636e72',
        marginLeft: 8,
        fontWeight: '600',
    },
    likedText: {
        color: '#e74c3c',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 18,
        color: '#636e72',
        textAlign: 'center',
    },
    bottomButtons: {
        padding: 16,
        backgroundColor: '#fff',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
});