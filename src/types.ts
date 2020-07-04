export interface ILocalNote {
  text: string;
  timeCreated: number;
  timeUpdated: number;
  remoteID: string;
  color: string;
}

export interface ILocalNoteSave {
  key: 'notes';
  id: string;
  data: ILocalNote;
  expires: null;
}

export interface ISaveJobParameters {
  value: string;
  timeCreated: number;
  timeUpdated: number;
  when: number;
}

export interface ISaveJobs {
  expires: null;
  key: 'remoteSaveOperations';
  id: string;
  data: {
    jobs: ISaveJobParameters[];
  };
}
