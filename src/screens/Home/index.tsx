import * as React from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import AddNote from '../../components/AddNote';
import storage from '../../localDb';
import {ILocalNote} from '../../types';
import Styles from './style';

function HomeScreen({navigation}) {
  const [notes, setNotes] = React.useState<Partial<ILocalNote[]>>([]);

  const getNotes = async () => {
    const ids = await storage.getIdsForKey('notes');
    const res = [];
    for (let i = ids.length - 1; i >= 0; i--) {
      const id = ids[i];
      const note = await storage.load({
        key: 'notes',
        id,
      });
      if (note.text.trim() !== '') {
        res.push({id, ...note});
      }
    }
    return res;
  };

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getNotes().then((res) => {
        setNotes(res);
      });
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={{flex: 1}}>
      {notes?.length > 0 ? (
        <ScrollView style={{flex: 1}}>
          {notes.map((note: ILocalNote | undefined, index) => (
            <TouchableOpacity
              key={index}
              style={Styles.note}
              onPress={() => {
                navigation.navigate('Editor', {
                  noteID: note.id,
                  isNewNote: false,
                });
              }}>
              <View style={Styles.noteContentView}>
                <Text style={Styles.noteText}>{note.text.substr(0, 50)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={Styles.noNotes}>
          <Text> No Note</Text>
        </View>
      )}
      <View style={{position: 'absolute', bottom: 20, right: 20}}>
        <AddNote />
      </View>
    </View>
  );
}

export default HomeScreen;
