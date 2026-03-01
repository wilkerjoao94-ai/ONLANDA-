export type Category = 'Carros' | 'Eletrônicos' | 'Casas' | 'Outros';

export interface Ad {
  id: string;
  title: string;
  price: number;
  category: Category;
  description: string;
  location: string;
  phone: string;
  imageUrl: string;
  createdAt: number;
  userId: string; // For simplicity in this demo, we'll use a hardcoded user ID or session
}

export interface AdFormData {
  title: string;
  price: string;
  category: Category;
  description: string;
  location: string;
  phone: string;
  image?: File;
}
