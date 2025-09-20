import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

export default function Page2() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Link href="/" asChild>
        <TouchableOpacity style={{ position: 'absolute', top: 50, left: 20, backgroundColor: 'white', padding: 10 }}>
          <Text style={{ color: 'black' }}>←</Text>
        </TouchableOpacity>
      </Link>
      <Text style={{ fontSize: 24 }}>Page 2</Text>
    </View>
  );
}