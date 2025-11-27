import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Alert, ActivityIndicator, ScrollView 
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Fontisto from 'react-native-vector-icons/Fontisto';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const DARK_BG = '#121212';
const CARD_BG = '#1E1E1E';
const LIGHT_TEXT = '#E0E0E0';
const SUCCESS_COLOR = '#4CAF50';
const DANGER_COLOR = '#E53935';
const BUTTON_ACTIVE = '#6200EE';

const API_URL = 'https://clipgrab.onrender.com/download-video'; // Your backend URL

export default function App() {
  const [videoLink, setVideoLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [format, setFormat] = useState<'mp4' | 'mp3'>('mp4');

  const handleDownload = async (platform: 'youtube' | 'instagram' | 'tiktok') => {
    if (!videoLink) {
      Alert.alert('Error', 'Paste a video link first');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoLink, platform, format }),
      });

      const data = await res.json();

      if (!data.success) {
        Alert.alert('Server Error', data.message);
      } else {
        Alert.alert(
          'Download Ready',
          `File: ${data.filename}\nUse the URL to download or stream!`
        );
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Connection Error', 'Cannot reach download server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>ClipGrab 🔥</Text>

      {/* Platform Icons */}
      <View style={styles.iconsRow}>
        <View style={styles.iconContainer}>
          <FontAwesome name="youtube" size={40} color="#FF0000" />
          <Text style={styles.iconText}>YouTube</Text>
        </View>
        <View style={styles.iconContainer}>
          <FontAwesome name="instagram" size={40} color="#E4405F" />
          <Text style={styles.iconText}>Instagram</Text>
        </View>
        <View style={styles.iconContainer}>
          <Fontisto name="tiktok" size={40} color={LIGHT_TEXT} />
          <Text style={styles.iconText}>TikTok</Text>
        </View>
      </View>

      {/* Input & Format Selector */}
      <View style={styles.card}>
        <TextInput
          placeholder="Paste video link here..."
          placeholderTextColor="#888"
          style={styles.input}
          value={videoLink}
          onChangeText={setVideoLink}
          editable={!isLoading}
        />

        {/* Format Selector */}
        <View style={styles.formatRow}>
          <TouchableOpacity
            style={[
              styles.formatButton,
              format === 'mp4' && { backgroundColor: BUTTON_ACTIVE },
            ]}
            onPress={() => setFormat('mp4')}
          >
            <Text style={styles.formatText}>MP4</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.formatButton,
              format === 'mp3' && { backgroundColor: BUTTON_ACTIVE },
            ]}
            onPress={() => setFormat('mp3')}
          >
            <Text style={styles.formatText}>MP3</Text>
          </TouchableOpacity>
        </View>

        {/* Download Buttons */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.downloadButton, { backgroundColor: '#FF0000' }]}
            onPress={() => handleDownload('youtube')}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.downloadText}>YouTube</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.downloadButton, { backgroundColor: DANGER_COLOR }]}
            onPress={() => handleDownload('instagram')}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.downloadText}>Instagram</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.downloadButton, { backgroundColor: LIGHT_TEXT }]}
            onPress={() => handleDownload('tiktok')}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={[styles.downloadText, { color: '#000' }]}>TikTok</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK_BG, padding: 20 },
  header: { fontSize: 32, fontWeight: '900', color: LIGHT_TEXT, marginBottom: 30, textAlign: 'center' },
  iconsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 30 },
  iconContainer: { alignItems: 'center' },
  iconText: { color: LIGHT_TEXT, marginTop: 5, fontWeight: '600' },
  card: { backgroundColor: CARD_BG, borderRadius: 12, padding: 20 },
  input: { backgroundColor: '#2A2A2A', color: LIGHT_TEXT, padding: 15, borderRadius: 10, marginBottom: 15 },
  formatRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  formatButton: { flex: 1, marginHorizontal: 5, padding: 12, borderRadius: 10, backgroundColor: '#555', alignItems: 'center' },
  formatText: { color: LIGHT_TEXT, fontWeight: 'bold' },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  downloadButton: { flex: 1, marginHorizontal: 5, padding: 15, borderRadius: 10, alignItems: 'center' },
  downloadText: { color: '#fff', fontWeight: 'bold' },
});
