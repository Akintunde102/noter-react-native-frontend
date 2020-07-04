import {StyleSheet} from 'react-native';

const Styles = {
  textInput: {
    flex: 1,
    fontSize: 20,
    textAlignVertical: 'top',
    paddingTop: 0,
    paddingBottom: 0,
  },
  colorView: {
    flex: 0.2,
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'green',
  },
  absoluteButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  fullView: {flex: 1, marginVertical: 10},
};

export default StyleSheet.create(Styles);
