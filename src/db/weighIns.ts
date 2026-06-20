import { db, type WeighIn } from './db';

export const addWeighIn = (weighIn: Omit<WeighIn, 'id'>) => db.weighIns.add(weighIn);

export const updateWeighIn = (id: number, weighIn: Omit<WeighIn, 'id'>) =>
  db.weighIns.put({ ...weighIn, id });

export const deleteWeighIn = (id: number) => db.weighIns.delete(id);

export const listWeighIns = () => db.weighIns.orderBy('at').toArray();

export const getWeighInsForRange = (start: number, end: number) =>
  db.weighIns.where('at').between(start, end, true, true).toArray();
