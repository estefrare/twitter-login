import React, {useState, useEffect} from 'react';
import {View, Text, TouchableHighlight} from 'react-native';
import auth from '@react-native-firebase/auth';

import {NativeModules} from 'react-native';
const {RNTwitterSignIn} = NativeModules;

RNTwitterSignIn.init(
  'TWITTER_COMSUMER_KEY',
  'TWITTER_CONSUMER_SECRET',
)
  .then(() => console.log('Twitter SDK initialized'))
  .catch((error) => console.log(error));

async function onTwitterButtonPress() {
  console.log("entro")
  // Perform the login request
  const {authToken, authTokenSecret} = await RNTwitterSignIn.logIn();
  console.log({authToken, authTokenSecret})

  // Create a Twitter credential with the tokens
  const twitterCredential = auth.TwitterAuthProvider.credential(
    authToken,
    authTokenSecret,
  );
  console.log({twitterCredential})

  // Sign-in the user with the credential
  return auth().signInWithCredential(twitterCredential);
}

const App = () => {
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  // Handle user state changes
  function onAuthStateChanged(newUser: any) {
    setUser(newUser);
    if (initializing) {
      setInitializing(false);
    }
  }

  const login = () => {
    auth()
      .createUserWithEmailAndPassword(
        'jane.doe@example.com',
        'SuperSecretPassword!',
      )
      .then(() => {
        console.log('User account created & signed in!');
      })
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
          console.log('That email address is already in use!');
        }

        if (error.code === 'auth/invalid-email') {
          console.log('That email address is invalid!');
        }

        console.error(error);
      });
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (initializing) {
    return null;
  }

  if (!user) {
    return (
      <View>
        <TouchableHighlight onPress={login}>
          <Text>Login</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={() =>
            onTwitterButtonPress()
              .then(() => console.log('Signed in with Twitter!'))
              .catch(error => console.log(error))
          }>
          <Text>Twitter Sign-In</Text>
        </TouchableHighlight>
      </View>
    );
  }

  return (
    <View>
      <Text>Welcome {user.email}</Text>
    </View>
  );
};

export default App;
