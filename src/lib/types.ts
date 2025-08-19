export type Person = {
  id: number;
  name: string;
  dob: string;
  age?: number;
  errors?: {
    name?: string;
    dob?: string;
  };
};
