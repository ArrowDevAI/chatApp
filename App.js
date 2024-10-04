import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Start from './components/Start';
import Chat from './components/Chat';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";
import {FIRESTORE_API_KEY,FIRESTORE_AUTH_DOMAIN,FIRESTORE_PROJECT_ID,FIRESTORE_STORAGE_BUCKET,FIRESTORE_MESSAGING_SENDER_ID,FIRESTORE_APP_ID,FIRESTORE_MEASUREMENT_ID} from '@env';

const App = () => {
  const Stack = createNativeStackNavigator();
  const firebaseConfig = {
    apiKey: process.env.FIRESTORE_API_KEY,
    authDomain: process.env.FIRESTORE_AUTH_DOMAIN,
    projectId: process.env.FIRESTORE_PROJECT_ID,
    storageBucket: process.env.FIRESTORE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIRESTORE_MESSAGING_SENDER_ID,
    appId: process.env.FIRESTORE_APP_ID,
    measurementId: process.env.FIRESTORE_MEASUREMENT_ID
  };
  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start" >

        <Stack.Screen name="Start" component={Start}  />
        <Stack.Screen name="Chat"options={{ title: 'ChatApp' }}>
        {props => <Chat db={db} {...props} />}
        </Stack.Screen>

      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
