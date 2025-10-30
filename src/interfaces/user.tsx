export interface User {
  avatar: string;
  email: string;
  first_name: string;
  last_name: string;
  id: number;
}

export interface Products {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}
