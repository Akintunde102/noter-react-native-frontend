import * as React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';

function AddNote() {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <TouchableOpacity onPress={() => console.log('Add note')}>
        <Icon name="pluscircle" size={30} color="#900" />
      </TouchableOpacity>
    </View>
  );
}

export default AddNote;
