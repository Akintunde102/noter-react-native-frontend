import * as React from 'react';
import {View, TextInput, Dimensions, Input, Alert} from 'react-native';
import api from '../../server';
import {AxiosRequestConfig} from 'axios';
import storage from '../../localDb';
import {dateToUnix, now, deleteStaleJobs} from '../../utils';
import {
  ILocalNoteSave,
  ILocalNote,
  ISaveJobParameters,
  ISaveJobs,
} from '../../types';

function EditorScreen({navigation, route}: {isNewNote: boolean}) {
  const [note, setNote] = React.useState<string>('');
  const [localID, setLocalID] = React.useState<string>('');
  const [remoteID, setRemoteID] = React.useState<string>('');
  const [timeCreated, setTimeCreated] = React.useState<number | null>(null);

  const {noteID = null, isNewNote = true} = route?.params || {};
  React.useEffect(() => {
    const newNoteId = `note${now().toString()}`;
    (() => {
      console.log({isNewNote, noteID});
      if (isNewNote) {
        const data: ILocalNoteSave = {
          expires: null,
          key: 'notes',
          id: newNoteId,
          data: {
            text: '',
            timeCreated: now(),
            timeUpdated: 0,
            remoteID: '',
          },
        };

        //Create An Empty Note
        storage.save(data);

        // Initialise Dom with All Details
        setLocalID(newNoteId);
        setTimeCreated(now());
        return;
      }

      if (noteID) {
        //Otherwise, if not empty
        storage
          .load({
            key: 'notes',
            id: noteID,
          })
          .then((ret: ILocalNote) => {
            console.log('here');
            setNote(ret.text);
            setLocalID(noteID);
            setRemoteID(ret.remoteID);
            setTimeCreated(ret.timeCreated);
            console.log('New note loaded into DOM', ret);
          })
          .catch((err) => {
            // any exception including data not found
            // goes to catch()
            console.warn(err.message);
            switch (err.name) {
              case 'NotFoundError':
                console.log('Note not found');
                break;
              case 'ExpiredError':
                console.log('Note not expired');
                break;
            }
          });
        return;
      }
    })();
  }, []);

  const sendNote = async (
    value: string,
    timeMadeInUTC: number,
    timeUpdatedInUTC: number,
  ) => {
    const noteDe = await storage.load({
      key: 'notes',
      id: localID,
    });

    const {remoteID: remoteIDFromDb} = noteDe;

    let res = null;
    let _id = null;
    const resData = {
      localKey: localID,
      note: value,
      localUpdateTimeInUTC: timeUpdatedInUTC,
      localCreationTimeInUTC: timeMadeInUTC,
      ...(remoteIDFromDb !== '' ? {remoteKey: remoteIDFromDb} : {}),
    };

    try {
      res = await api.post('/notes', resData, {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
      } as AxiosRequestConfig);

      if (res.status === 200) {
        const {_id = null} = res.data;
        if (_id) {
          const data: ILocalNoteSave = {
            expires: null,
            key: 'notes',
            id: localID,
            data: {
              text: value,
              timeUpdated: timeUpdatedInUTC,
              timeCreated: timeMadeInUTC,
              remoteID: _id,
            },
          };
          //Overwrite to provide localKey
          await storage.save(data);
          setRemoteID(_id);
        }
      }
    } catch (err) {
      throw err;
    }

    return {data: res.data, status: res.status, remoteID: _id};
  };

  const saveJob = async ({
    jobParameters,
  }: {
    jobParameters: ISaveJobParameters;
  }) => {
    let oldJobs: ISaveJobParameters[] = [];
    try {
      //get Old Jobs
      ({jobs: oldJobs} = await storage.load({
        key: 'remoteSaveOperations',
        id: localID,
      }));
    } catch (err) {
      console.log(err.message);
      switch (err.name) {
        case 'NotFoundError':
          console.log('Initializing Jobs');
          //initialize first job
          await storage.save({
            expires: null,
            key: 'remoteSaveOperations',
            id: localID,
            data: {
              jobs: [],
            },
          });
          break;
        case 'ExpiredError':
          console.log('data is expired');
          break;
      }
    }

    const jobs: ISaveJobParameters[] = oldJobs.length > 0 ? [...oldJobs] : [];
    jobs.push({
      value: jobParameters.value,
      timeCreated: jobParameters.timeCreated,
      timeUpdated: jobParameters.timeUpdated,
      when: jobParameters.when,
    });

    const jobsdata: ISaveJobs = {
      expires: null,
      key: 'remoteSaveOperations',
      id: localID,
      data: {
        jobs,
      },
    };

    // save Job In Queue
    await storage.save(jobsdata);

    let state;
    // get SaveOperations State
    // load
    try {
      state = await storage.load({
        key: 'remoteSaveOperationsState',
        id: localID,
      });
    } catch (err) {
      console.log(err.message);
      switch (err.name) {
        case 'NotFoundError':
          console.log('Initializing State of Save Operations');
          state = await storage.save({
            expires: null,
            key: 'remoteSaveOperationsState',
            id: localID,
            data: {
              isRunning: false,
            },
          });
          break;
        case 'ExpiredError':
          console.log('data is expired');
          break;
      }
    }

    // trigger SaveNote
    if (!state?.isRunning) {
      triggerSaveOperations();
    }
  };

  const triggerSaveOperations = async (): Promise<Function | null> => {
    // Set Trigger State as isRunning
    await storage.save({
      expires: null,
      key: 'remoteSaveOperationsState',
      id: localID,
      data: {
        isRunning: true,
      },
    });

    // Pick Latest Update
    const {jobs} = await storage.load({
      key: 'remoteSaveOperations',
      id: localID,
    });

    if (jobs.length > 0) {
      const job: ISaveJobParameters = jobs[jobs.length - 1];
      const res = await sendNote(job.value, job.timeCreated, job.timeUpdated);
      if (res.status === 200) {
        await deleteStaleJobs({from: job.when, localID});
        return await triggerSaveOperations();
      }
    }

    // Set Trigger State as isRunning
    await storage.save({
      expires: null,
      key: 'remoteSaveOperationsState',
      id: localID,
      data: {
        isRunning: false,
      },
    });

    return null;
  };

  const onChangeContent = async (value: string) => {
    if (timeCreated) {
      const timeUpdated = now();
      const data: ILocalNoteSave = {
        data: {
          text: value,
          timeUpdated: now(),
          timeCreated,
          remoteID: remoteID,
        },
        id: localID,
        expires: null,
        key: 'notes',
      };

      //Save in Dom
      setNote(value);

      //Overwrite Localkey
      storage.save(data);

      console.log({
        value,
        timeCreated,
        timeUpdated,
        when: now(),
      });
      // Save
      saveJob({
        jobParameters: {
          value,
          timeCreated,
          timeUpdated,
          when: now(),
        },
      });
    }
  };

  return (
    <View style={{flex: 1, marginVertical: 10}}>
      <TextInput
        multiline={true}
        style={{
          flex: 1,
          fontSize: 20,
          textAlignVertical: 'top',
          paddingTop: 0,
          paddingBottom: 0,
        }}
        onChangeText={(text: string) => onChangeContent(text)}
        value={note}
        autoFocus={true}
        placeholder="Content"
      />
    </View>
  );
}

export default EditorScreen;
