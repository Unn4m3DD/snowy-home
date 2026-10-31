export type ApartmentTracking = {
  approved: boolean;
  contacted: boolean;
  visitAt: string;
  notes: string;
  removed: boolean;
};
export const emptyTracking: ApartmentTracking = {
  approved: false, contacted: false, visitAt: "", notes: "", removed: false,
};
