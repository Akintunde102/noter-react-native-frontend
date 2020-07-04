import * as React from 'react';
import {View, Text} from 'react-native';
import NoteTaker from '../components/AddNote';

function HomeScreen() {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Home Screen</Text>
      <View style={{position: 'absolute', bottom: 20, right: 20}}>
        <NoteTaker />
      </View>
    </View>
  );
}

export default HomeScreen;
