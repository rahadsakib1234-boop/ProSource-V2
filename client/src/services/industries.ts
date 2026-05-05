import { IndustryProfile } from '../types';

export const INDUSTRY_PROFILES: IndustryProfile[] = [
  {
    id: 'sourcing',
    name: 'General Sourcing',
    description: 'Perfect for sourcing agents, trading businesses, and procurement specialists.',
    icon: '📦',
    defaultModules: ['Dashboard', 'Clients', 'Products', 'Leads', 'Invoices', 'Currency'],
    terminology: {
      clients: 'Clients',
      products: 'Products',
      leads: 'Sourcing Leads',
      invoices: 'Invoices',
    },
    customFields: {
      products: [
        { id: 'supplier', label: 'Supplier Name', type: 'text', placeholder: 'Enter supplier name' },
        { id: 'link', label: 'Product Link', type: 'text', placeholder: 'https://...' },
        { id: 'tracking', label: 'Tracking Number', type: 'text' },
      ],
      leads: [
        { id: 'source', label: 'Lead Source', type: 'select', options: ['Website', 'Referral', 'Social Media', 'Other'] },
        { id: 'country', label: 'Target Country', type: 'text' },
      ]
    }
  },
  {
    id: 'real_estate',
    name: 'Real Estate',
    description: 'Manage property listings, buyer inquiries, and transaction pipelines.',
    icon: '🏠',
    defaultModules: ['Dashboard', 'Clients', 'Products', 'Leads', 'Invoices'],
    terminology: {
      clients: 'Buyers & Sellers',
      products: 'Properties',
      leads: 'Property Inquiries',
      invoices: 'Commission Invoices',
    },
    customFields: {
      products: [
        { id: 'address', label: 'Property Address', type: 'text', required: true },
        { id: 'sqft', label: 'Square Footage', type: 'number' },
        { id: 'type', label: 'Property Type', type: 'select', options: ['Residential', 'Commercial', 'Land', 'Industrial'] },
      ],
      clients: [
        { id: 'budget', label: 'Maximum Budget', type: 'currency' },
        { id: 'pref_location', label: 'Preferred Location', type: 'text' },
      ]
    }
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Life Sciences',
    description: 'HIPAA-compliant security, patient coordination, and care management.',
    icon: '🏥',
    defaultModules: ['Dashboard', 'Clients', 'Leads', 'Invoices'],
    terminology: {
      clients: 'Patients',
      products: 'Care Plans',
      leads: 'Patient Referrals',
      invoices: 'Medical Bills',
    },
    customFields: {
      clients: [
        { id: 'insurance', label: 'Insurance Provider', type: 'text' },
        { id: 'dob', label: 'Date of Birth', type: 'date' },
      ]
    }
  },
  {
    id: 'finance',
    name: 'Finance & Insurance',
    description: 'Portfolio tracking, policy management, and regulatory compliance.',
    icon: '💰',
    defaultModules: ['Dashboard', 'Clients', 'Leads', 'Invoices'],
    terminology: {
      clients: 'Policy Holders',
      products: 'Financial Products',
      leads: 'Policy Leads',
      invoices: 'Premium Invoices',
    },
    customFields: {
      clients: [
        { id: 'risk_score', label: 'Risk Assessment Score', type: 'number' },
        { id: 'policy_type', label: 'Policy Type', type: 'select', options: ['Life', 'Health', 'Auto', 'Home'] },
      ]
    }
  },
  {
    id: 'retail',
    name: 'Retail & E-commerce',
    description: 'Omnichannel experiences, inventory sync, and customer purchase history.',
    icon: '🛒',
    defaultModules: ['Dashboard', 'Clients', 'Products', 'Invoices'],
    terminology: {
      clients: 'Customers',
      products: 'Catalog Items',
      leads: 'Abandoned Carts',
      invoices: 'Sales Receipts',
    },
    customFields: {
      products: [
        { id: 'sku', label: 'SKU Number', type: 'text' },
        { id: 'stock_level', label: 'Current Stock', type: 'number' },
      ]
    }
  },
  {
    id: 'education',
    name: 'Education & Training',
    description: 'Student lifecycle management from prospect to alumni and enrollment.',
    icon: '🎓',
    defaultModules: ['Dashboard', 'Clients', 'Leads', 'Invoices'],
    terminology: {
      clients: 'Students',
      products: 'Courses',
      leads: 'Applications',
      invoices: 'Tuition Fees',
    },
    customFields: {
      leads: [
        { id: 'major', label: 'Intended Major', type: 'text' },
        { id: 'term', label: 'Enrollment Term', type: 'select', options: ['Spring', 'Summer', 'Fall', 'Winter'] },
      ]
    }
  },
  {
    id: 'professional_services',
    name: 'Professional Services',
    description: 'Project-based billing, time tracking, and matter management.',
    icon: '⚖️',
    defaultModules: ['Dashboard', 'Clients', 'Leads', 'Invoices'],
    terminology: {
      clients: 'Clients',
      products: 'Service Packages',
      leads: 'Proposals',
      invoices: 'Retainer Invoices',
    },
    customFields: {
      leads: [
        { id: 'est_hours', label: 'Estimated Project Hours', type: 'number' },
        { id: 'service_type', label: 'Service Category', type: 'select', options: ['Legal', 'Consulting', 'Design', 'Marketing'] },
      ]
    }
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing & Distribution',
    description: 'Supply chain visibility, B2B order processes, and inventory tracking.',
    icon: '🏭',
    defaultModules: ['Dashboard', 'Clients', 'Products', 'Invoices'],
    terminology: {
      clients: 'Distributors',
      products: 'Inventory Items',
      leads: 'Purchase Orders',
      invoices: 'Sales Orders',
    },
    customFields: {
      products: [
        { id: 'batch_no', label: 'Batch/Lot Number', type: 'text' },
        { id: 'material_cost', label: 'Raw Material Cost', type: 'currency' },
      ]
    }
  },
  {
    id: 'fitness',
    name: 'Fitness & Wellness',
    description: 'Memberships, class scheduling, and high-frequency engagement.',
    icon: '🧘',
    defaultModules: ['Dashboard', 'Clients', 'Leads', 'Invoices'],
    terminology: {
      clients: 'Members',
      products: 'Membership Plans',
      leads: 'Trial Inquiries',
      invoices: 'Membership Dues',
    },
    customFields: {
      clients: [
        { id: 'goal', label: 'Fitness Goal', type: 'text' },
        { id: 'plan', label: 'Current Plan', type: 'select', options: ['Basic', 'Premium', 'Elite'] },
      ]
    }
  },
  {
    id: 'nonprofit',
    name: 'Nonprofits',
    description: 'Donor management, fundraising campaigns, and impact reporting.',
    icon: '🤝',
    defaultModules: ['Dashboard', 'Clients', 'Leads'],
    terminology: {
      clients: 'Donors',
      products: 'Programs',
      leads: 'Fundraising Leads',
      invoices: 'Donation Receipts',
    },
    customFields: {
      clients: [
        { id: 'total_donated', label: 'Lifetime Donation', type: 'currency' },
        { id: 'volunteer', label: 'Is Volunteer?', type: 'select', options: ['Yes', 'No'] },
      ]
    }
  }
];

export function getIndustryProfile(id: string): IndustryProfile | undefined {
  return INDUSTRY_PROFILES.find(p => p.id === id);
}
