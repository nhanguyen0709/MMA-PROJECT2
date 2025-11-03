// src/navigation/MainNavigator.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useNotifications } from "../context/NotificationContext";
import HomeScreen from "../screens/HomeScreen";
import NotificationScreen from "../screens/NotificationScreen";
import CameraScreen from "../screens/CameraScreen";
import TimelineScreen from "../screens/TimelineScreen";
import DetailScreen from "../screens/DetailScreen";
import MapScreen from "../screens/MapScreen";
import LocationAlbumScreen from "../screens/Gallery/LocationAlbumScreen";
import AlbumScreen from "../screens/AlbumScreen";
import PhotoDetailScreen from "../screens/Gallery/PhotoDetailScreen";
import MyPhotoDetailScreen from "../screens/Gallery/MyPhotoDetailScreen";
import OtherPhotoDetailScreen from "../screens/Gallery/OtherPhotoDetailScreen";
import AlbumByTagScreen from "../screens/AlbumByTagScreen";
import FavoritePhotosScreen from "../screens/FavoritePhotosScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import UnifiedFriendsScreen from "../screens/UnifiedFriendsScreen";
import FriendProfileScreen from "../screens/FriendProfileScreen";
import FriendAlbumScreen from "../screens/FriendAlbumScreen";
import MigratePhotosScreen from "../screens/MigratePhotosScreen";
import FamilyRequestScreen from "../screens/FamilyRequestScreen";
import FamilyPhotosScreen from "../screens/FamilyPhotosScreen";
import TestNotificationScreen from "../screens/TestNotificationScreen";
import SearchPhotosScreen from "../screens/SearchPhotosScreen";
import SearchUsersScreen from "../screens/SearchUsersScreen";
import ChatListScreen from "../screens/Chat/ChatListScreen";
import ChatScreen from "../screens/Chat/ChatScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
      <Stack.Screen name="SearchPhotos" component={SearchPhotosScreen} />
      <Stack.Screen name="Map" component={MapScreen} />
      <Stack.Screen name="LocationAlbum" component={LocationAlbumScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Album" component={AlbumScreen} />
      <Stack.Screen name="AlbumByTag" component={AlbumByTagScreen} />
      <Stack.Screen name="FavoritePhotos" component={FavoritePhotosScreen} />
      <Stack.Screen name="FamilyRequest" component={FamilyRequestScreen} />
      <Stack.Screen name="FamilyPhotos" component={FamilyPhotosScreen} />
      <Stack.Screen name="MyPhotoDetail" component={MyPhotoDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OtherPhotoDetail" component={OtherPhotoDetailScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function TimelineStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TimelineList" component={TimelineScreen} />
      <Stack.Screen name="MyPhotoDetail" component={MyPhotoDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OtherPhotoDetail" component={OtherPhotoDetailScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function FriendsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="UnifiedFriends" component={UnifiedFriendsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SearchUsers" component={SearchUsersScreen} options={{ headerShown: false }} />
      <Stack.Screen 
        name="FriendProfile" 
        component={FriendProfileScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen name="FriendAlbum" component={FriendAlbumScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ChatList" component={ChatListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ChatDetail" component={ChatScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MyPhotoDetail" component={MyPhotoDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OtherPhotoDetail" component={OtherPhotoDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="FamilyRequest" component={FamilyRequestScreen} options={{ headerShown: false }} />
      <Stack.Screen name="FamilyPhotos" component={FamilyPhotosScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size, focused }) => {
          let icon;
          if (route.name === "Timeline") icon = "time-outline";
          else if (route.name === "Home") icon = "home-outline";
          else if (route.name === "Camera") {
            // Special camera button in center
            return (
              <View style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: '#54b6f8',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: -25,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 8,
              }}>
                <Ionicons name="add" size={32} color="#fff" />
              </View>
            );
          }
          else if (route.name === "Friends") icon = "people-outline";
          else if (route.name === "Profile") icon = "person-outline";
          else icon = "ellipse-outline";
          
          if (focused && icon) {
            icon = icon.replace('-outline', '');
          }
          
          return <Ionicons name={icon} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#54b6f8',
        tabBarInactiveTintColor: '#95a5a6',
        tabBarStyle: {
          height: 75,
          paddingBottom: 12,
          paddingTop: 8,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -2,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarShowLabel: true,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{ tabBarLabel: "Trang chủ" }}
      />
      <Tab.Screen 
        name="Timeline" 
        component={TimelineStack} 
        options={{ 
          headerShown: false,
          tabBarLabel: "Timeline"
        }} 
      />
      <Tab.Screen 
        name="Camera" 
        options={{ 
          tabBarLabel: "",
          tabBarStyle: { display: 'none' }
        }}
      >
        {() => (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CameraMain" component={CameraScreen} />
            <Stack.Screen name="MyPhotoDetail" component={MyPhotoDetailScreen} />
            <Stack.Screen name="OtherPhotoDetail" component={OtherPhotoDetailScreen} />
          </Stack.Navigator>
        )}
      </Tab.Screen>
      <Tab.Screen 
        name="Friends" 
        component={FriendsStack} 
        options={{ 
          headerShown: false,
          tabBarLabel: "Friends"
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        options={{ tabBarLabel: "Me", headerShown: false }}
      >
        {() => (
          <Stack.Navigator>
            <Stack.Screen name="ProfileHome" component={ProfileScreen} options={{ title: "" }} />
            <Stack.Screen name="MigratePhotos" component={MigratePhotosScreen} options={{ headerShown: false }} />
            <Stack.Screen name="TestNotification" component={TestNotificationScreen} options={{ headerShown: false }} />
          </Stack.Navigator>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
