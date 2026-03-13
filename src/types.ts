export interface Supplier {
  id: number;
  name: string;
  rnc: string;
  phone: string;
  address: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  unit_price: number;
  created_at: string;
}

export interface BankTransaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  created_at: string;
}

export interface DashboardStats {
  balance: number;
  income: number;
  expense: number;
  inventoryValue: number;
}
