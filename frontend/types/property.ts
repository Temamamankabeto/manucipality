export interface PropertyCategory {
  id: number;
  name: string;
  description?: string | null;
  is_active: boolean;
}

export interface Property {
  id: number;
  property_category_id: number;
  property_number: string;
  title: string;
  property_type: string;
  address?: string | null;
  status: string;
  category?: PropertyCategory;
}

export interface CitizenProperty {
  id: number;
  citizen_id: number;
  property_id: number;
  ownership_type: string;
  citizen?: {
    id: number;
    full_name: string;
  };
  property?: Property;
}
