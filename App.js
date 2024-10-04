import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Start from './components/Start';
import Chat from './components/Chat';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";

const App = () => {
  const Stack = createNativeStackNavigator();
  const firebaseConfig = {
    apiKey: "AIzaSyDT_TPH49o3opmE86uS8JswIXPuybT7X98",
    authDomain: "devaichatapp-9a090.firebaseapp.com",
    projectId: "devaichatapp",
    storageBucket: "devaichatapp.appspot.com",
    messagingSenderId: "632161899693",
    appId: "1:632161899693:web:4acbb9f870156b4e016224",
    measurementId: "G-JFB5NDGVS5"
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
