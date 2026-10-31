export type ApartmentTracking = {
  contacted: boolean;
  visitAt: string;
  notes: string;
  removed: boolean;
};
export const emptyTracking: ApartmentTracking = {
  contacted: false, visitAt: "", notes: "", removed: false,
};
