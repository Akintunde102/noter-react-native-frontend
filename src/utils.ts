import {ISaveJobParameters, ISaveJobs} from './types';
import storage from './localDb';

export const dateToUnix = (date: string) => {
  return new Date(date).getTime() / 1000;
};

export const now = () => {
  return Date.now();
};

export const deleteStaleJobs = async ({
  from,
  localID,
}: {
  from: number;
  localID: string;
}) => {
  let screenedJobs: ISaveJobParameters[] = [];
  const {jobs} = await storage.load({
    key: 'remoteSaveOperations',
    id: localID,
  });
  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    if (job.when > from) {
      screenedJobs.push(job);
    }
  }

  const screenedJobsdata: ISaveJobs = {
    expires: null,
    key: 'remoteSaveOperations',
    id: localID,
    data: {
      jobs: screenedJobs,
    },
  };

  // save Job In Queue
  await storage.save(screenedJobsdata);
  return screenedJobs;
};
