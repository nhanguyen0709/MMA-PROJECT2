import React, { useState, useEffect, useContext, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from "react-native";
import SafeImage from "../components/SafeImage";
import MapView, { Marker } from "react-native-maps";
import { getAllPhotos } from "../services/cloudinaryPhotoService";
import { getPhotosByLabel } from "../services/cloudinaryPhotoService";
import { AuthContext } from "../context/AuthContext";

// Simple geo bucketing by rounding lat/lng to ~100m cells
function makeClusterKey(coords) {
  if (!coords || typeof coords.latitude !== "number" || typeof coords.longitude !== "number") {
    return null;
  }
  const lat = Math.round(coords.latitude * 1000) / 1000; // ~111m
  const lng = Math.round(coords.longitude * 1000) / 1000; // ~85-111m depending latitude
  return `${lat.toFixed(3)},${lng.toFixed(3)}`;
}

function computeCentroid(items) {
  if (!items || !items.length) return null;
  let sumLat = 0;
  let sumLng = 0;
  let count = 0;
  for (const p of items) {
    if (p?.coords?.latitude != null && p?.coords?.longitude != null) {
      sumLat += p.coords.latitude;
      sumLng += p.coords.longitude;
      count++;
    }
  }
  if (!count) return null;
  return { latitude: sumLat / count, longitude: sumLng / count };
}

export default function MapScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const [photos, setPhotos] = useState([]);
  const labelFilter = (route?.params?.label || "").toString().trim();

  useEffect(() => {
    const fetchPhotos = async () => {
      if (!user) return;
      try {
        const data = await getAllPhotos(user.uid);
        console.log("📍 MapScreen photos:", data?.length || 0);
        setPhotos(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("❌ MapScreen fetch error:", e);
        setPhotos([]);
      }
    };
    fetchPhotos();
  }, [user]);

  const clusters = useMemo(() => {
    console.log("🗺️ Processing photos for map:", photos.length);
    
    // Apply optional album/label filter
    const base = labelFilter
      ? getPhotosByLabel(photos, labelFilter)
      : photos;

    console.log("🔍 Filtered photos:", base.length);

    const map = new Map();
    for (const p of base) {
      // Check both coords and location properties
      const coords = p?.coords || p?.location;
      console.log("📍 Photo coords:", { id: p?.id, coords });
      
      const key = makeClusterKey(coords);
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(p);
    }
    
    const result = [];
    for (const [key, items] of map.entries()) {
      const centroid = computeCentroid(items);
      if (!centroid) continue;
      result.push({ key, items, centroid });
    }
    
    console.log("📌 Map clusters:", result.length);
    return result;
  }, [photos, labelFilter]);

  return (
    <MapView style={{ flex: 1 }}>
      {clusters.map((c) => {
        const sample = c.items[Math.floor(Math.random() * c.items.length)] || c.items[0];
        const imageUri = sample?.cloudinaryUrl || sample?.uri || sample?.localUri;
        return (
          <Marker
            key={c.key}
            coordinate={c.centroid}
            onPress={() => {
              console.log("📍 Navigating to LocationAlbum:", { clusterKey: c.key, photosCount: c.items.length });
              navigation.navigate("LocationAlbum", { clusterKey: c.key, photos: c.items });
            }}
          >
            <View style={styles.thumbMarker}>
              {!!imageUri && (
                <Image source={{ uri: imageUri }} style={styles.thumbImage} />
              )}
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{c.items.length}</Text>
              </View>
            </View>
          </Marker>
        );
      })}
    </MapView>
  );
}


const styles = StyleSheet.create({
  thumbMarker: {
    width: 54,
    height: 54,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#ffffff",
    backgroundColor: "#eaeaea",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  countBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#1f6feb",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  countText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
});


