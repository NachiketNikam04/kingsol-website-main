export interface HealthCheckResponse {
  status: string;
  timestamp: string;
}

export interface SolarComponent {
  id: string;
  name: string;
  category: 'Panels' | 'Inverters' | 'Batteries' | 'Mounting' | 'Accessories';
  wattage?: number;
  efficiency?: number;
  pricePerUnit: number;
  minOrderQuantity: number;
  inStock: boolean;
  specifications: Record<string, string>;
}
