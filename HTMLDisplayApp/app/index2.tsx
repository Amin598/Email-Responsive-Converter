import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { useState, useMemo } from 'react';
import { WebView } from 'react-native-webview';
import { htmlContent } from '../backend/htmlstorage/htmlstorage';
import { optimizeHtml } from '../backend/optimizer/optimizer';

export default function Page2() {
  const [showWindow, setShowWindow] = useState(false);

  const optimizedHtml = useMemo(() => {
    return optimizeHtml(htmlContent);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Link href="/" asChild>
        <TouchableOpacity style={{ position: 'absolute', top: 50, left: 20, backgroundColor: 'white', padding: 10 }}>
          <Text style={{ color: 'black' }}>←</Text>
        </TouchableOpacity>
      </Link>
      <Text style={{ fontSize: 24 }}>Page 2</Text>
      <TouchableOpacity
        style={{ marginTop: 20, backgroundColor: 'white', padding: 15, borderWidth: 1 }}
        onPress={() => setShowWindow(true)}
      >
        <Text style={{ color: 'black' }}>Middle Button</Text>
      </TouchableOpacity>

      {showWindow && (
        <View style={{ position: 'absolute', top: 80, left: 30, right: 30, bottom: 80, backgroundColor: 'white', borderWidth: 2, borderColor: 'gray' }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 10, right: 10, zIndex: 1, backgroundColor: 'white', padding: 10, borderWidth: 1 }}
            onPress={() => setShowWindow(false)}
          >
            <Text style={{ color: 'black' }}>X</Text>
          </TouchableOpacity>
          <WebView
            source={{ html: optimizedHtml }}
            style={{ flex: 1 }}
            scalesPageToFit={true}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
}