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
    dashboard: ['Active Listings', 'New Leads', 'Closed Deals', 'Rental Revenue', 'Vacancy Rate'],
    crm: ['Buyers', 'Sellers', 'Tenants', 'Agents'],
    operations: ['Property Listings', 'Site Visits', 'Lease Management', 'Contracts', 'Maintenance Requests'],
    finance: ['Rent Collection', 'Commission Tracking', 'Property Expenses', 'Deposit Ledger'],
    reports: ['Occupancy Rate', 'Agent Performance', 'Property ROI', 'Lead Conversion'],
    kpis: ['Days on Market', 'Occupancy Rate', 'Commission Value', 'Lead Conversion Rate'],
    workflows: ['Lead → Site Visit → Offer → Contract → Payment → Handover'],
    actions: ['Schedule Visit', 'Mark Offer Sent', 'Track Lease', 'Record Commission', 'Log Maintenance'],
  },
  healthcare: {
    dashboard: ['Appointments Today', 'Patient Queue', 'Revenue', 'Emergency Alerts', 'Follow-ups Due'],
    crm: ['Patients', 'Doctors', 'Insurance Providers'],
    operations: ['Appointments', 'Medical Records', 'Prescriptions', 'Lab Reports', 'Treatments'],
    finance: ['Billing', 'Insurance Claims', 'Payments', 'Outstanding Dues'],
    reports: ['Patient History', 'Treatment Success', 'Revenue Trends', 'Claim Status'],
    kpis: ['Appointment Fill Rate', 'Average Wait Time', 'Claim Approval Rate', 'Revenue per Patient'],
    workflows: ['Intake → Consultation → Prescription → Lab → Treatment → Billing'],
    actions: ['Book Appointment', 'Update Record', 'Submit Claim', 'Mark Treatment', 'Send Follow-up'],
  },
  finance: {
    dashboard: ['Active Policies', 'Claims Pending', 'Revenue', 'Risk Alerts', 'Renewals Due'],
    crm: ['Clients', 'Agents', 'Investors'],
    operations: ['Policies', 'Claims', 'Loans', 'Risk Assessments'],
    finance: ['Premium Tracking', 'Commissions', 'Payment History', 'Payouts'],
    reports: ['Risk Analysis', 'Claim Trends', 'Client Lifetime Value', 'Renewal Forecast'],
    kpis: ['Claims Pending', 'Premium Collected', 'Commission Earned', 'Risk Score'],
    workflows: ['Lead → Risk Review → Policy Issued → Premium Collected → Renewal'],
    actions: ['Issue Policy', 'Approve Claim', 'Record Premium', 'Flag Risk', 'Renew Coverage'],
  },
  retail: {
    dashboard: ['Sales Today', 'Orders Pending', 'Inventory Alerts', 'Best Sellers', 'Refund Queue'],
    crm: ['Customers', 'Vendors', 'Affiliates'],
    operations: ['Orders', 'Inventory', 'Fulfillment', 'Returns', 'Coupons'],
    finance: ['Revenue', 'Refunds', 'Expenses', 'Discount Impact'],
    reports: ['Sales Analytics', 'Product Performance', 'Customer Retention', 'Stock Turnover'],
    kpis: ['Sales Today', 'Average Order Value', 'Stock Health', 'Repeat Purchase Rate'],
    workflows: ['Browse → Order → Pick/Pack → Ship → Return/Review'],
    actions: ['Create Coupon', 'Pack Order', 'Refund Payment', 'Restock Item', 'Flag Low Stock'],
  },
  education: {
    dashboard: ['Student Count', 'Active Courses', 'Attendance Rate', 'Upcoming Exams', 'Certificates Due'],
    crm: ['Students', 'Teachers', 'Parents'],
    operations: ['Courses', 'Attendance', 'Assignments', 'Exams', 'Certificates'],
    finance: ['Tuition Payments', 'Scholarships', 'Payroll', 'Dues'],
    reports: ['Student Performance', 'Completion Rate', 'Attendance Trends', 'Enrollment Growth'],
    kpis: ['Enrollment Count', 'Attendance Rate', 'Completion Rate', 'Exam Pass Rate'],
    workflows: ['Inquiry → Admission → Attendance → Exams → Certificate'],
    actions: ['Enroll Student', 'Mark Attendance', 'Assign Homework', 'Issue Certificate', 'Track Fees'],
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
  },
};

export function getIndustryBlueprint(industryId: string): IndustryBlueprint {
  return INDUSTRY_BLUEPRINTS[industryId] || INDUSTRY_BLUEPRINTS.sourcing;
}
