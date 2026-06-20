import { db, type VitalLog } from './db';

export const addVital = (vital: Omit<VitalLog, 'id'>) => db.vitals.add(vital);

export const updateVital = (id: number, vital: Omit<VitalLog, 'id'>) =>
  db.vitals.put({ ...vital, id });

export const deleteVital = (id: number) => db.vitals.delete(id);

export const listVitals = () => db.vitals.orderBy('at').toArray();

export const getVitalsForRange = (start: number, end: number) =>
  db.vitals.where('at').between(start, end, true, true).toArray();
