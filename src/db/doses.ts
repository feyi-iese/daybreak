import { db, type Dose } from './db';

export const addDose = (dose: Omit<Dose, 'id'>) => db.doses.add(dose);

export const updateDose = (id: number, dose: Omit<Dose, 'id'>) => db.doses.put({ ...dose, id });

export const deleteDose = (id: number) => db.doses.delete(id);

export const listDoses = () => db.doses.orderBy('at').toArray();

export const getDosesForRange = (start: number, end: number) =>
  db.doses.where('at').between(start, end, true, true).toArray();
