import React, { useContext, useEffect, useState } from "react";
import { 
  View,
  TouchableOpacity, 
  FlatList, 
  TextInput, 
  Dimensions,
  StyleSheet,
  ScrollView,
  RefreshControl
} from "react-native";
import SafeImage from "../components/SafeImage";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { Block, Text } from "../components/ui";
import useTheme from "../hooks/useTheme";
import { getUserAlbum } from "../services/userAlbumService";
import { navigateToPhotoDetail } from "../utils/navigationHelper";

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { colors, sizes } = useTheme();
  const [randomPhotos, setRandomPhotos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, [user?.uid]);

  const loadPhotos = async () => {
    try {
      if (!user?.uid) return;
      const album = await getUserAlbum(user.uid);
      const shuffled = [...album.photos].sort(() => 0.5 - Math.random());
      setRandomPhotos(shuffled.slice(0, 8));
    } catch (error) {
      console.error("Error loading photos:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPhotos();
    setRefreshing(false);
  };

  const quickActions = [
    { icon: "people", label: "Gia đình", color: "#ff9500", onPress: () => navigation.navigate('FamilyRequest') },
    { icon: "images", label: "Album", color: "#5ac8fa", onPress: () => navigation.navigate('Album') },
    { icon: "heart", label: "Yêu thích", color: "#ff3b30", onPress: () => navigation.navigate('FavoritePhotos') },
    { icon: "map", label: "Bản đồ", color: "#34c759", onPress: () => navigation.navigate('Map') },
  ];

  const recentPhotos = randomPhotos.slice(6, 12);

  // Group photos by tags and create albums
  const albums = React.useMemo(() => {
    const tagMap = new Map();
    
    randomPhotos.forEach(photo => {
      const labels = photo.aiAnalysis?.labels || [];
      labels.forEach(label => {
        if (!tagMap.has(label)) {
          tagMap.set(label, []);
        }
        tagMap.get(label).push(photo);
      });
    });

    // Convert to array and take top 6 tags with most photos
    return Array.from(tagMap.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 6)
      .map(([tag, photos]) => {
        // Pick random photo from this tag's photos
        const randomPhoto = photos[Math.floor(Math.random() * photos.length)];
        return {
          id: tag,
          title: tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase(),
          tag: tag,
          image: randomPhoto.cloudinaryUrl,
          count: photos.length,
        };
      });
  }, [randomPhotos]);

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#54b6f8']}
            tintColor="#54b6f8"
          />
        }>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Trang chủ</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <TouchableOpacity 
          style={styles.searchContainer}
          onPress={() => navigation.navigate('SearchPhotos')}>
          <Ionicons name="search" size={20} color="#999" />
          <Text style={styles.searchPlaceholder}>Tìm kiếm ảnh...</Text>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              onPress={action.onPress}
              style={styles.actionItem}>
              <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={styles.actionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Albums */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tất cả Album</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Album')}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.albumGrid}>
            {albums.map((album, index) => (
              <View key={album.id} style={styles.albumWrapper}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('AlbumByTag', { tag: album.tag })}
                  style={styles.albumCard}>
                  <SafeImage source={{ uri: album.image }} style={styles.albumImage} />
                </TouchableOpacity>
                <View style={styles.albumInfo}>
                  <Text style={styles.albumTitle} numberOfLines={1}>{album.title}</Text>
                
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Photos */}
        {recentPhotos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ảnh gần đây</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Album')}>
                <Text style={styles.seeAll}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photosScroll}>
              {recentPhotos.map((photo) => (
                <TouchableOpacity
                  key={photo.id}
                  onPress={() => navigateToPhotoDetail(navigation, photo, user)}
                  style={styles.photoCard}>
                  <SafeImage source={{ uri: photo.cloudinaryUrl }} style={styles.photoImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#54b6f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#999',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionItem: {
    alignItems: 'center',
    width: 70,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  seeAll: {
    fontSize: 14,
    color: '#54b6f8',
    fontWeight: '600',
  },
  albumGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  albumWrapper: {
    width: CARD_WIDTH,
    marginBottom: 20,
  },
  albumCard: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 8,
  },
  albumImage: {
    width: '100%',
    height: '100%',
  },
  albumInfo: {
    paddingHorizontal: 4,
  },
  albumTitle: {
    color: '#000',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  albumCount: {
    color: '#666',
    fontSize: 12,
    fontWeight: '400',
  },
  photosScroll: {
    paddingRight: 20,
  },
  photoCard: {
    width: 140,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
});
