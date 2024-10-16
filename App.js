import { LogBox, Alert, StyleSheet, Text, View } from 'react-native';
import Start from './components/Start';
import Chat from './components/Chat';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initializeApp } from 'firebase/app';
import { disableNetwork, enableNetwork, getFirestore } from "firebase/firestore";
import {FIRESTORE_API_KEY,FIRESTORE_AUTH_DOMAIN,FIRESTORE_PROJECT_ID,FIRESTORE_STORAGE_BUCKET,FIRESTORE_MESSAGING_SENDER_ID,FIRESTORE_APP_ID,FIRESTORE_MEASUREMENT_ID} from '@env';
import { useNetInfo } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import {getStorage} from "firebase/storage";


LogBox.ignoreLogs(["AsyncStorage has been extracted from"]);


const App = () => {
  const firebaseConfig = {
    
    apiKey: FIRESTORE_API_KEY,
    authDomain: FIRESTORE_AUTH_DOMAIN,
    projectId: FIRESTORE_PROJECT_ID,
    storageBucket: FIRESTORE_STORAGE_BUCKET,
    messagingSenderId: FIRESTORE_MESSAGING_SENDER_ID,
    appId: FIRESTORE_APP_ID,
    measurementId: FIRESTORE_MEASUREMENT_ID
    
  };
  const app = initializeApp(firebaseConfig)
  const storage = getStorage(app);
  const db = getFirestore(app)
  const connectionStatus = useNetInfo();  
  useEffect(()=>{
    if (connectionStatus.isConnected === false){Alert.alert("Connection lost!");
        disableNetwork(db);
    }else if (connectionStatus.isConnected === true){
        enableNetwork(db);
    }
  },[connectionStatus.isConnected])
  
  console.log("Connection Status is Connected:", connectionStatus.isConnected)
  console.log('Is Internet Reachable:', connectionStatus.isInternetReachable)

  
  const Stack = createNativeStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start" >

        <Stack.Screen name="Start" component={Start}  />
        <Stack.Screen name="Chat"options={{ title: 'ChatApp' }}>
        {props => <Chat isConnected = {connectionStatus.isConnected} db={db} storage = {storage}{...props} />}
        </Stack.Screen>

      </Stack.Navigator>
    </NavigationContainer>
    
  );
}

export default App;
