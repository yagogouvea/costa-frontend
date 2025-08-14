export interface CNPJResponse {
  company?: {
    name: string;
    fantasy_name?: string;
    legal_nature?: string;
    cnae_main?: string;
    situation?: string;
    registration_date?: string;
  };
  address?: {
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
    zip?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
  };
} 