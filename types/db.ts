export type Consignment = {
  id: string
  client_id: string
  driver_id: string | null
  pickup_location: string
  delivery_location: string
  item_description: string
  weight: number
  status: 'pending'|'assigned'|'picked_up'|'in_transit'|'delivered'|'cancelled'
  special_instructions?: string | null
  document_url?: string | null
  created_at: string
  updated_at: string
}

export type UserProfile = {
  id: string
  email: string
  full_name: string
  phone: string
  role: 'user'|'client'|'driver'|'admin'|'other_admin'
  is_active: boolean
  created_at: string
  profile_image?: string | null
}
