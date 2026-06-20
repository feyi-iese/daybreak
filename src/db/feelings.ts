import { db, type FeelingLog } from './db';

export const addFeeling = (feeling: Omit<FeelingLog, 'id'>) => db.feelings.add(feeling);

export const updateFeeling = (id: number, feeling: Omit<FeelingLog, 'id'>) =>
  db.feelings.put({ ...feeling, id });

export const deleteFeeling = (id: number) => db.feelings.delete(id);

export const listFeelings = () => db.feelings.orderBy('at').toArray();

export const getFeelingsForRange = (start: number, end: number) =>
  db.feelings.where('at').between(start, end, true, true).toArray();
