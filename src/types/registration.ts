export interface Registration {
  id: number;
  country: string;
  firstName: string;
  fatherName: string;
  lastName: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  gender: string;
  nationality: string;
  identityNumber: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  createdAt: string;
  status?: string;
}

export type RegistrationFormData = Omit<Registration, "id" | "createdAt" | "status">;
