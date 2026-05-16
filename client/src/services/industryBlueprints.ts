export interface IndustryBlueprint {
  dashboard: string[];
  crm: string[];
  operations: string[];
  finance: string[];
  reports: string[];
  kpis: string[];
  workflows: string[];
  actions: string[];
}

export const INDUSTRY_BLUEPRINTS: Record<string, IndustryBlueprint> = {
  sourcing: {
    dashboard: ['Active Orders', 'Pending Shipments', 'Supplier Response Rate', 'Monthly Profit', 'Delayed Orders'],
    crm: ['Clients', 'Buyers', 'Factories', 'Suppliers'],
    operations: ['RFQs', 'Orders', 'Product Sourcing', 'Quality Control', 'Shipping', 'Warehouse'],
    finance: ['Supplier Payments', 'Client Invoices', 'Profit Margins', 'Logistics Cost'],
    reports: ['Top Suppliers', 'Most Ordered Products', 'Shipping Delays', 'Profit Analytics'],
    kpis: ['Monthly Profit', 'Order Cycle Time', 'Supplier Response Time', 'On-time Delivery Rate'],
    workflows: ['RFQ → Quote → Sample → Production → QC → Shipping → Delivery'],
    actions: ['Send RFQ', 'Approve Sample', 'Mark Shipped', 'Record Payment', 'Flag Delay'],
  },
  real_estate: {
    dashboard: ['Active Listings', 'Closed Deals', 'Rental Revenue', 'Site Visits Today', 'Agent Performance'],
    crm: ['Properties', 'Leads', 'Clients', 'Agents'],
    operations: ['Site Visits', 'Contracts', 'Lease Management', 'Maintenance Requests', 'Property Listings'],
    finance: ['Payments', 'Deposits', 'Commission Tracking', 'Rent Collection'],
    reports: ['Occupancy Rate', 'Lead Conversion', 'Property ROI', 'Agent Performance'],
    kpis: ['Active Listings', 'Closed Deals', 'Rental Revenue', 'Site Visits Today', 'Agent Performance'],
    workflows: ['Lead → Site Visit → Offer → Contract → Payment → Handover'],
    actions: ['Schedule Site Visit', 'Send Property Details', 'Generate Contract', 'Record Payment', 'Notify Agent'],
  },
  healthcare: {
    dashboard: ['Today\'s Appointments', 'Patient Queue', 'Revenue', 'Emergency Cases', 'Follow-ups Due'],
    crm: ['Patients', 'Doctors', 'Insurance', 'Care Teams'],
    operations: ['Appointments', 'Medical Records', 'Prescriptions', 'Lab Results', 'Treatment Plans'],
    finance: ['Billing', 'Insurance Claims', 'Copays', 'Outstanding Balances'],
    reports: ['Patient History', 'Appointment Volume', 'Revenue Trends', 'Claim Status'],
    kpis: ['Appointment Fill Rate', 'Average Wait Time', 'Claim Approval Rate', 'Revenue per Patient'],
    workflows: ['Intake → Triage → Consultation → Prescription → Follow-up → Billing'],
    actions: ['Book Appointment', 'Update Medical Record', 'Submit Insurance Claim', 'Send Prescription Refill', 'Send Follow-up Reminder'],
  },
  finance: {
    dashboard: ['Active Policies', 'Claims Pending', 'Revenue', 'Risk Alerts', 'Renewals Due'],
    crm: ['Clients', 'Agents', 'Policy Holders'],
    operations: ['Policies', 'Claims', 'Loans', 'Risk Assessments'],
    finance: ['Payments', 'Premiums', 'Commissions', 'Payouts', 'Balances'],
    reports: ['Risk Analysis', 'Claim Trends', 'Client Lifetime Value', 'Renewal Forecast'],
    kpis: ['Active Policies', 'Claims Pending', 'Revenue', 'Risk Alerts'],
    workflows: ['Lead → Risk Review → Policy Issued → Premium Collected → Renewal'],
    actions: ['Create Policy', 'Open Claim', 'Record Payment', 'Run Risk Check', 'Send Renewal Reminder'],
  },
  retail: {
    dashboard: ['Sales Today', 'Inventory Alerts', 'Best Sellers', 'Refund Requests'],
    crm: ['Products', 'Orders', 'Customers', 'Vendors'],
    operations: ['Inventory', 'Returns', 'Coupons', 'Fulfillment', 'Warehousing'],
    finance: ['Payments', 'Refunds', 'Discounts', 'Revenue'],
    reports: ['Sales Analytics', 'Inventory Turnover', 'Refund Trends', 'Customer Segments'],
    kpis: ['Sales Today', 'Inventory Alerts', 'Best Sellers', 'Refund Requests'],
    workflows: ['Browse → Add to Cart → Checkout → Fulfillment → Delivery → Return/Review'],
    actions: ['Create Coupon', 'Pack Order', 'Refund Payment', 'Restock Item', 'Flag Low Stock'],
  },
  ecommerce: {
    dashboard: ['Sales Today', 'Inventory Alerts', 'Best Sellers', 'Refund Requests'],
    crm: ['Products', 'Orders', 'Customers', 'Vendors'],
    operations: ['Inventory', 'Returns', 'Coupons', 'Fulfillment', 'Warehousing'],
    finance: ['Payments', 'Refunds', 'Discounts', 'Revenue'],
    reports: ['Sales Analytics', 'Inventory Turnover', 'Refund Trends', 'Customer Segments'],
    kpis: ['Sales Today', 'Inventory Alerts', 'Best Sellers', 'Refund Requests'],
    workflows: ['Browse → Add to Cart → Checkout → Fulfillment → Delivery → Return/Review'],
    actions: ['Create Coupon', 'Pack Order', 'Refund Payment', 'Restock Item', 'Flag Low Stock'],
  },
  education: {
    dashboard: ['Student Count', 'Attendance Rate', 'Upcoming Exams', 'Revenue'],
    crm: ['Students', 'Teachers', 'Courses', 'Parents'],
    operations: ['Attendance', 'Exams', 'Assignments', 'Certificates', 'Class Schedules'],
    finance: ['Payments', 'Tuition Tracking', 'Scholarships', 'Dues'],
    reports: ['Performance', 'Enrollment Trends', 'Attendance Analytics', 'Revenue Trends'],
    kpis: ['Student Count', 'Attendance Rate', 'Upcoming Exams', 'Revenue'],
    workflows: ['Inquiry → Admission → Attendance → Exams → Certificate'],
    actions: ['Enroll Student', 'Mark Attendance', 'Send Exam Reminder', 'Generate Certificate', 'Track Fees'],
  },
  professional_services: {
    dashboard: ['Active Projects', 'Billable Hours', 'Pending Invoices', 'Meetings This Week', 'Client Health'],
    crm: ['Clients', 'Leads', 'Partners'],
    operations: ['Projects', 'Tasks', 'Meetings', 'Contracts', 'Time Tracking'],
    finance: ['Invoices', 'Retainers', 'Expenses', 'Collections'],
    reports: ['Profitability', 'Team Productivity', 'Client Value', 'Utilization Rate'],
    kpis: ['Billable Hours', 'Project Margin', 'Invoice Collection Rate', 'Utilization'],
    workflows: ['Lead → Proposal → Contract → Delivery → Invoice → Retainer'],
    actions: ['Create Proposal', 'Start Project', 'Log Hours', 'Send Invoice', 'Renew Retainer'],
  },
  manufacturing: {
    dashboard: ['Production Status', 'Inventory Levels', 'Delayed Shipments', 'Defect Alerts', 'Open Purchase Orders'],
    crm: ['Suppliers', 'Distributors', 'Buyers'],
    operations: ['Production Orders', 'Inventory', 'Warehouses', 'Procurement', 'Logistics'],
    finance: ['Raw Material Costs', 'Purchase Orders', 'Revenue', 'Production Cost'],
    reports: ['Production Efficiency', 'Defect Rate', 'Supply Chain Analytics', 'Stock Forecast'],
    kpis: ['Output per Shift', 'Defect Rate', 'Inventory Cover', 'Shipment Delay Rate'],
    workflows: ['Procure → Produce → QC → Pack → Ship → Deliver'],
    actions: ['Release Purchase Order', 'Start Production', 'Approve QC', 'Dispatch Shipment', 'Log Delay'],
  },
  fitness: {
    dashboard: ['Active Members', 'Class Attendance', 'Revenue', 'New Trials', 'Renewals Due'],
    crm: ['Members', 'Trainers', 'Leads'],
    operations: ['Memberships', 'Classes', 'Diet Plans', 'Workout Programs'],
    finance: ['Subscription Billing', 'Trainer Payments', 'Refunds', 'Late Fees'],
    reports: ['Retention Rate', 'Membership Growth', 'Attendance Trends', 'Revenue per Class'],
    kpis: ['Member Retention', 'Class Fill Rate', 'Trial-to-Member Rate', 'Monthly Recurring Revenue'],
    workflows: ['Trial → Join → Attend Classes → Renew Membership → Upgrade'],
    actions: ['Book Class', 'Renew Membership', 'Assign Trainer', 'Record Payment', 'Send Reminder'],
  },
  nonprofit: {
    dashboard: ['Donations This Month', 'Active Campaigns', 'Volunteer Activity', 'Grant Deadlines', 'Open Cases'],
    crm: ['Donors', 'Volunteers', 'Sponsors'],
    operations: ['Campaigns', 'Events', 'Grant Management', 'Volunteer Tasks'],
    finance: ['Donations', 'Fund Allocation', 'Expenses', 'Grant Spending'],
    reports: ['Donation Trends', 'Campaign Performance', 'Volunteer Engagement', 'Impact Summary'],
    kpis: ['Donation Growth', 'Volunteer Retention', 'Campaign Conversion', 'Funds Raised'],
    workflows: ['Supporter → Donation → Campaign Follow-up → Impact Report'],
    actions: ['Launch Campaign', 'Log Donation', 'Schedule Volunteer', 'Track Grant', 'Send Thank-you'],
  }
};

export function getIndustryBlueprint(industryId: string): IndustryBlueprint {
  return INDUSTRY_BLUEPRINTS[industryId] || INDUSTRY_BLUEPRINTS.sourcing;
}
