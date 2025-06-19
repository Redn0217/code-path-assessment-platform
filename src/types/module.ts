// Shared Module type definition to prevent interface conflicts
export interface Module {
  id: string;
  name: string;
  description: string;
  domain_id: string;
  icon: string;
  color: string;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at?: string;
  created_by?: string;
}

// Domain type definition
export interface Domain {
  id: string;
  name: string;
  description?: string;
  domain_key: string;
  icon: string;
  color: string;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at?: string;
  created_by?: string;
}

// Form data types
export interface ModuleFormData {
  name: string;
  description: string;
  domain_id: string;
  icon: string;
  color: string;
  is_active: boolean;
  order_index: number;
}

export interface DomainFormData {
  name: string;
  description: string;
  domain_key: string;
  icon: string;
  color: string;
  is_active: boolean;
  order_index: number;
}
