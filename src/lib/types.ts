export type Person = {
  id: number;
  name: string;
  dob: string;
  age?: number;
  generation?: {
      name: string;
      nickname: string;
  },
  errors?: {
    name?: string;
    dob?: string;
  };
};
