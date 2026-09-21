import { Colors } from '@/constants/theme';
import { BackendService } from '@/services/backend';
import { parseReceiptWithGemini } from '@/services/geminiOcr';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Camera as CameraIcon, Image as ImageIcon, ScanLine, Sparkles, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScannerModalScreen() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [scanStage, setScanStage] = useState('READY TO SCAN RECEIPT');
  const [scanProgress, setScanProgress] = useState(0);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const isNetworkError = (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error || '');
    return /unable to resolve host|no address associated with hostname|network request failed|network error|failed to fetch|connection refused|timed out|timeout|offline/i.test(message);
  };

  // Trigger camera on launch
  useEffect(() => {
    // Small delay to allow modal transition to complete smoothly
    const timer = setTimeout(() => {
      handleLaunchCamera();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const processImage = async (base64Data: string, imageUri?: string, mimeType?: string) => {
    const upload = await BackendService.reserveUpload();
    if (!upload.allowed) {
      Alert.alert(
        'Upload Limit Reached',
        'You have used all 3 receipt uploads for this account. Add expenses manually or continue with another account.',
        [
          { text: 'Enter Manually', onPress: () => router.replace('/(modal)/add-manual') },
          { text: 'Close', style: 'cancel' },
        ]
      );
      return;
    }
    setIsScanning(true);
    setScanProgress(18);
    if (imageUri) setPreviewUri(imageUri);
    setScanStage(`UPLOADING DOCUMENT... ${upload.remaining} UPLOADS LEFT`);
    try {
      setScanProgress(35);
      const parsed = await parseReceiptWithGemini(base64Data, undefined, imageUri, mimeType);

      if (!parsed.isValidReceipt || (parsed.lineItems.length === 0 && parsed.total === 0)) {
        setIsScanning(false);
        setScanStage('ALIGN RECEIPT WITHIN FRAME');
        Alert.alert(
          'Receipt Scan Failed',
          parsed.errorMessage || 'Could not detect legible receipt text or price totals in this photo. Please ensure the document is clear and well-lit.',
          [
            { text: 'Retake Photo', onPress: handleLaunchCamera },
            { text: 'Enter Manually', onPress: () => router.replace('/(modal)/add-manual') },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        return;
      }

      setScanProgress(88);
      setScanStage('PARSING LINE ITEMS & TAX...');
      setTimeout(() => {
        setScanProgress(100);
        setIsScanning(false);
        router.replace({
          pathname: '/(modal)/review',
          params: { data: JSON.stringify(parsed) },
        });
      }, 400);
    } catch (e) {
      console.warn('OCR error:', e);
      setIsScanning(false);
      setScanProgress(0);
      setScanStage('ALIGN RECEIPT WITHIN FRAME');
      const offline = isNetworkError(e);
      Alert.alert(
        offline ? 'No Internet Connection' : 'Receipt Scan Failed',
        offline
          ? 'An internet connection is required to upload and process this image. Check your Wi-Fi or mobile data, then try again.'
          : e instanceof Error ? e.message : 'Could not parse receipt from this image.',
        [
          { text: 'Retry Scan', onPress: () => (previewUri ? processImage(base64Data, imageUri, mimeType) : handleLaunchCamera()) },
          { text: 'Manual Entry', onPress: () => router.replace('/(modal)/add-manual') },
        ]
      );
    }
  };

  const handleLaunchCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Please allow camera permissions to capture receipts for automated line-item extraction.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => ImagePicker.requestCameraPermissionsAsync() },
          ]
        );
        return;
      }

      setScanStage('OPENING HIGH-RES CAMERA...');
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        base64: true,
        quality: 0.85,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets[0]?.base64) {
        setPreviewUri(result.assets[0].uri);
        await processImage(result.assets[0].base64, result.assets[0].uri, result.assets[0].mimeType);
      } else {
        setScanStage('ALIGN RECEIPT WITHIN FRAME');
      }
    } catch (e) {
      console.warn('Camera launch error:', e);
      setScanStage('ALIGN RECEIPT WITHIN FRAME');
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow photo library access to select receipt images.');
        return;
      }

      setScanStage('OPENING PHOTO GALLERY...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        base64: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets[0]?.base64) {
        setPreviewUri(result.assets[0].uri);
        await processImage(result.assets[0].base64, result.assets[0].uri, result.assets[0].mimeType);
      } else {
        setScanStage('ALIGN RECEIPT WITHIN FRAME');
      }
    } catch (e) {
      console.warn('ImagePicker error:', e);
      setScanStage('ALIGN RECEIPT WITHIN FRAME');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <X size={20} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.topBadge}>
          <Sparkles size={14} color={Colors.primaryLight} />
          <Text style={styles.topBadgeText}>VISION OCR ENGINE</Text>
        </View>

        <View style={{ width: 42 }} />
      </View>

      {/* Center Viewfinder Graphic & Status */}
      <View style={styles.centerContainer}>
        <View style={styles.focusBox}>
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />

          {/* Central Scanning Animation Icon */}
          <View style={styles.scanIconCenter}>
            {previewUri ? (
              <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="contain" />
            ) : isScanning ? (
              <ActivityIndicator size="large" color={Colors.primary} />
            ) : (
              <ScanLine size={48} color={Colors.primaryLight} />
            )}

            {isScanning && previewUri && (
              <View style={styles.scanOverlay}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.progressText}>{scanProgress}% COMPLETE</Text>
              </View>
            )}
          </View>

          {/* Live Scanning Status Pill */}
          <View style={styles.scanningPill}>
            <Text style={styles.scanningText}>{scanStage}</Text>
          </View>

        </View>

        <Text style={styles.guideTitle}>Optical Receipt Scanning</Text>
        <Text style={styles.guideSubtitle}>
          Position thermal paper or digital invoice clearly for real-time line-item and tax extraction.
        </Text>
      </View>

      {/* Bottom Action Controls */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.primaryActionBtn, isScanning && styles.btnDisabled]}
          activeOpacity={0.8}
          onPress={handleLaunchCamera}
          disabled={isScanning}
        >
          <CameraIcon size={20} color="#002111" />
          <Text style={styles.primaryActionText}>
            {isScanning ? 'PROCESSING RECEIPT...' : 'TAKE RECEIPT PHOTO'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryActionBtn, isScanning && styles.btnDisabled]}
          activeOpacity={0.8}
          onPress={handlePickImage}
          disabled={isScanning}
        >
          <ImageIcon size={18} color={Colors.textPrimary} />
          <Text style={styles.secondaryActionText}>CHOOSE FROM GALLERY</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  topBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(14, 19, 33, 0.9)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
  },
  topBadgeText: {
    color: Colors.primaryLight,
    fontFamily: 'Menlo',
    fontSize: 11,
    fontWeight: '700',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    gap: 16,
  },
  focusBox: {
    width: 280,
    height: 340,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    position: 'relative',
    marginBottom: 8,
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: Colors.primary,
  },
  tl: { top: -1, left: -1, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 16 },
  tr: { top: -1, right: -1, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 16 },
  bl: { bottom: -1, left: -1, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 16 },
  br: { bottom: -1, right: -1, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 16 },
  scanIconCenter: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 268,
    height: 328,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  scanOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(5, 10, 18, 0.48)',
  },
  progressText: {
    color: Colors.textPrimary,
    fontFamily: 'Menlo',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  scanningPill: {
    position: 'absolute',
    bottom: -22,
    backgroundColor: Colors.surfaceCard,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
  },
  scanningText: {
    color: Colors.primaryLight,
    fontFamily: 'Menlo',
    fontSize: 10,
    letterSpacing: 0.5,
    fontWeight: '700',
  },
  guideTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 18,
    textAlign: 'center',
  },
  guideSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    fontFamily: 'Menlo',
    lineHeight: 18,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 12,
  },
  primaryActionBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    elevation: 4,
  },
  primaryActionText: {
    color: '#002111',
    fontWeight: '700',
    fontFamily: 'Menlo',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  secondaryActionBtn: {
    backgroundColor: Colors.surfaceCard,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 8,
  },
  secondaryActionText: {
    color: Colors.textPrimary,
    fontWeight: '600',
    fontFamily: 'Menlo',
    fontSize: 12,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
