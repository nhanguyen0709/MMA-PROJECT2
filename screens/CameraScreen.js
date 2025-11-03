import React, { useEffect, useState, useRef, useContext } from "react";
import { View, TextInput, Image, Button, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import * as FileSystem from "expo-file-system/legacy";
import { savePhotoToCloudinary } from "../services/cloudinaryPhotoService";
import { navigateToPhotoDetail } from "../utils/navigationHelper";
import { addPhotoToUserAlbum } from "../services/userAlbumService";
import { notifyFriendsAboutNewPhoto } from "../services/notificationService";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function CameraScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { theme } = useTheme();
  const [photo, setPhoto] = useState(null);
  const [note, setNote] = useState("");
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState("off");
  const [zoom, setZoom] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [notifyFriends, setNotifyFriends] = useState(true); // Checkbox state
  const cameraRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    (async () => {
      await Location.requestForegroundPermissionsAsync();
    })();
    return () => { mountedRef.current = false; };
  }, []);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>Cần quyền truy cập camera</Text>
        <Button onPress={requestPermission} title="Cấp quyền" />
      </View>
    );
  }

  const takePhoto = async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    try {
      if (cameraRef.current) {
        const shot = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
          skipProcessing: false,
        });

        const loc = await Location.getCurrentPositionAsync({});
        const fileName = `photo_${Date.now()}.jpg`;
        const targetUri = `${FileSystem.cacheDirectory}${fileName}`;

        await FileSystem.writeAsStringAsync(targetUri, shot.base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const fileInfo = await FileSystem.getInfoAsync(targetUri);
        if (!mountedRef.current) return; // component unmounted, abort state updates
        if (fileInfo.exists) {
          setPhoto({ uri: targetUri, fileName, width: shot.width, height: shot.height });
          setCoords(loc.coords);
        } else {
          throw new Error("Failed to create local file");
        }
      }
    } catch (error) {
      console.error("Camera error:", error);
      alert("Lỗi chụp ảnh: " + (error?.message || String(error)));
    } finally {
      if (mountedRef.current) setIsCapturing(false);
    }
  };

  const onSave = async () => {
    if (!photo || !coords) return alert("Chụp ảnh trước đã 😅");
    setLoading(true);

    try {
      const isSelfie = facing === "front";
      const created = await savePhotoToCloudinary({ uri: photo.uri, coords, note, labels: [], isSelfie, source: "camera" }, user.uid);

      // Sync to Firebase userAlbum
      console.log("💾 Syncing photo to Firebase...");
      console.log("📸 Photo data:", {
        id: created.id,
        uri: created.uri,
        cloudinaryUrl: created.cloudinaryUrl,
        localUri: created.localUri
      });
      
      const cloudinaryUrl = created.uri || created.cloudinaryUrl;
      
      // Ensure we have a valid Cloudinary URL - if not, throw error
      if (!cloudinaryUrl || cloudinaryUrl.startsWith('file://')) {
        throw new Error("Không thể upload ảnh lên Cloudinary. Vui lòng kiểm tra kết nối internet và thử lại.");
      }

      // Sync to Firebase with valid Cloudinary URL
      await addPhotoToUserAlbum(user.uid, {
        id: created.id,
        cloudinaryUrl: cloudinaryUrl,
        publicId: created.cloudinary?.publicId || created.publicId,
        caption: note,
        tags: created.labels || [],
        location: coords ? {
          latitude: coords.latitude,
          longitude: coords.longitude,
          address: null
        } : null,
        aiAnalysis: {
          labels: created.labels || [],
          categoryPrimary: created.categoryPrimary,
          categorySecondary: created.categorySecondary
        }
      });
      console.log("✅ Photo synced to Firebase with URL:", cloudinaryUrl);

      // Notify friends if checkbox is checked
      if (notifyFriends) {
        try {
          console.log("📢 Notifying friends about new photo...");
          await notifyFriendsAboutNewPhoto(
            user.uid, 
            user.displayName || user.email,
            {
              id: created.id,
              cloudinaryUrl: created.uri,
              caption: note,
              note: note
            }
          );
          console.log("✅ Friends notified!");
        } catch (notifyError) {
          console.error("⚠️ Failed to notify friends:", notifyError);
          // Don't block the flow if notification fails
        }
      }

      // Don't delete local file immediately - let it be cleaned up by system
      // This prevents "file not found" errors when viewing the photo
      // FileSystem cache will be cleaned automatically by OS

      if (!mountedRef.current) return;
      setLoading(false);
      setPhoto(null);
      setNote("");
      setNotifyFriends(true); // Reset checkbox
      
      // Navigate to PhotoDetail with proper cloudinaryUrl
      navigateToPhotoDetail(navigation, {
          id: created.id,
          cloudinaryUrl: created.uri || created.cloudinaryUrl,
          userId: user.uid,
          publicId: created.cloudinary?.publicId || created.publicId,
          caption: note,
          tags: created.labels || [],
          location: coords ? {
            latitude: coords.latitude,
            longitude: coords.longitude,
            address: null
          } : null,
          aiAnalysis: {
            labels: created.labels || [],
            categoryPrimary: created.categoryPrimary,
            categorySecondary: created.categorySecondary
          },
          createdAt: new Date().toISOString()
        }, user);
    } catch (error) {
      if (mountedRef.current) setLoading(false);
      console.error("Save error:", error);
      alert("Lỗi lưu ảnh: " + (error?.message || String(error)));
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      {!photo ? (
        <View style={{ flex: 1 }}>
          <CameraView style={styles.camera} facing={facing} ref={cameraRef} zoom={zoom} enableZoomGesture onPinchGestureEnd={({ nativeEvent }) => {
            const next = Math.max(0, Math.min(1, zoom + (nativeEvent.scale > 1 ? 0.1 : -0.1)));
            setZoom(Number(next.toFixed(2)));
          }} flash={flash} />

          {showGrid && (
            <View pointerEvents="none" style={styles.gridOverlay}>
              <View style={styles.gridRow} />
              <View style={styles.gridRow} />
            </View>
          )}

          <View style={styles.navTopRight}>
            <TouchableOpacity style={styles.navButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.controlsTop}>
            <TouchableOpacity style={styles.topButton} onPress={() => setFacing((cur) => (cur === "back" ? "front" : "back"))} disabled={isCapturing}>
              <Ionicons name="camera-reverse" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.controlsCenter}>
            <TouchableOpacity style={styles.topButton} onPress={() => setFlash((f) => (f === "off" ? "on" : f === "on" ? "auto" : "off"))} disabled={isCapturing}>
              <Ionicons name={flash === 'off' ? 'flash-outline' : flash === 'on' ? 'flash' : 'flash'} size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.shutter, isCapturing && { opacity: 0.6 }]} onPress={takePhoto} disabled={isCapturing} />
          </View>
        </View>
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photo.uri }} style={styles.previewImage} />
          
          <View style={styles.previewHeader}>
            <TouchableOpacity 
              style={styles.previewButton}
              onPress={() => setPhoto(null)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.previewActions}>
            <TextInput
              style={styles.captionInput}
              placeholder="Thêm chú thích..."
              placeholderTextColor="#999"
              value={note}
              onChangeText={setNote}
              multiline
            />
            
            <TouchableOpacity 
              style={styles.notifyToggle}
              onPress={() => setNotifyFriends(!notifyFriends)}>
              <Ionicons 
                name={notifyFriends ? "notifications" : "notifications-off"} 
                size={20} 
                color={notifyFriends ? "#54b6f8" : "#999"} 
              />
              <Text style={[styles.notifyText, notifyFriends && styles.notifyTextActive]}>
                Thông báo bạn bè
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={onSave}
              disabled={loading}>
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.saveButtonText}>
                {loading ? "Đang lưu..." : "Lưu ảnh"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", alignItems: "center" },
  camera: { flex: 1 },
  gridOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "column",
    justifyContent: "space-evenly",
  },
  gridRow: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginHorizontal: 16,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    paddingVertical: 16,
    alignItems: "center",
  },
  navTopRight: {
    position: "absolute",
    top: 40,
    right: 16,
  },
  navButton: {
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  controlsTop: {
    position: "absolute",
    top: 40,
    left: 16,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  controlsCenter: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  topButton: {
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  shutter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.8)",
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  previewButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  captionInput: {
    fontSize: 16,
    color: '#000',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 16,
    minHeight: 50,
  },
  notifyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  notifyText: {
    fontSize: 15,
    color: '#999',
    fontWeight: '500',
  },
  notifyTextActive: {
    color: '#54b6f8',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#54b6f8',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
