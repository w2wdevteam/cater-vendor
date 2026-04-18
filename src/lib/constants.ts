export const ORDER_STATUSES = {
  new: 'New',
  rejected: 'Rejected',
  on_the_way: 'On the Way',
  arrived: 'Arrived',
  delivered: 'Delivered',
  not_delivered: 'Not Delivered',
} as const

export type OrderStatus = keyof typeof ORDER_STATUSES

export const REQUEST_STATUSES = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
} as const

export type RequestStatus = keyof typeof REQUEST_STATUSES

export const MENU_ITEM_STATUSES = {
  active: 'Active',
  inactive: 'Inactive',
} as const

export type MenuItemStatus = keyof typeof MENU_ITEM_STATUSES

export const CUTOFF_STATUSES = {
  open: 'Ordering Open',
  closed: 'Cutoff Passed',
} as const

export type CutoffStatus = keyof typeof CUTOFF_STATUSES

export const DIETARY_TAGS = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  halal: 'Halal',
  'gluten-free': 'Gluten-Free',
  'contains-nuts': 'Contains Nuts',
  'contains-dairy': 'Contains Dairy',
} as const

export type DietaryTag = keyof typeof DIETARY_TAGS

export const COMPANY_STATUSES = {
  active: 'Active',
  inactive: 'Inactive',
} as const

export type CompanyStatus = keyof typeof COMPANY_STATUSES
