# Bhumi Business Suite

# BHUMI BUSINESS SOLUTIONS
## Premium Enterprise CRM & Business Management System

Build a modern, premium, enterprise-grade CRM and Business Management System for Bhumi Business Solutions.

The application must combine sophisticated UI design, professional financial management workflows, and highly functional CRM features.

The visual quality should match modern premium SaaS applications and professional enterprise accounting platforms.

The priority is to create an elegant, minimal, highly organized, and functionality-focused application.

---

# 1. STRICT BRAND COLOR SYSTEM – NON-NEGOTIABLE

The entire application's visual identity must use ONLY TWO COLORS:

**PRIMARY WHITE:**
#FFFFFF

**PRIMARY NAVY BLUE:**
#0B1F44

**STRICT TEXT COLOR:**
#000000

These are the only permitted colors throughout the application.

### Strict Color Rules

- Main page backgrounds: #FFFFFF
- Sidebar backgrounds: #FFFFFF or #0B1F44
- Header backgrounds: #FFFFFF
- Primary buttons: #0B1F44
- Secondary buttons: #FFFFFF with #0B1F44 borders
- Active navigation: #0B1F44 background or navy indicator
- Input backgrounds: #FFFFFF
- Card backgrounds: #FFFFFF
- Borders: #0B1F44
- Table headers: #FFFFFF or #0B1F44
- Modal backgrounds: #FFFFFF
- Dashboard visual elements: Navy blue and white only.
- Charts: Navy blue and white only.
- Icons: Navy blue or black.

### MOST IMPORTANT: TEXT COLOR

**EVERY TEXT ELEMENT MUST ALWAYS BE PURE BLACK (#000000).**

This requirement applies without exception to:

- All page titles.
- All headings.
- Sidebar labels.
- Navigation text.
- Buttons.
- Table headings.
- Table content.
- Input labels.
- Input values.
- Placeholder text.
- Dropdown options.
- Notifications.
- Status labels.
- Dashboard statistics.
- Login page.
- Employee pages.
- Reports.
- Quotation documents.
- Tax invoice documents.
- Printable documents.

Never use white text on navy backgrounds.

Never use navy text.

Never use grey text.

Never use colored text.

For navy buttons, use a white button background with a navy border and black text if needed to preserve the text rule. Navy-filled components must still have black text, and their contrast must remain readable.

### STRICTLY PROHIBITED COLORS

Do not use:
- Gold
- Orange
- Yellow
- Green
- Red
- Purple
- Pink
- Grey
- Cyan
- Any other accent colors.

Do not introduce additional shades as separate brand colors.

Use only solid white and solid navy blue for the interface, with black typography.

---

# 2. PREMIUM MODERN UI DESIGN DIRECTION

Create an elegant, sophisticated, minimal, premium SaaS interface.

The design should feel like a professionally developed enterprise CRM rather than a generic admin dashboard.

### Visual Characteristics

- Modern minimalist design.
- Premium SaaS dashboard aesthetics.
- Clean white surfaces.
- Strong navy blue visual identity.
- Spacious layouts.
- Excellent visual hierarchy.
- Consistent typography.
- Balanced whitespace.
- Elegant data tables.
- Well-designed forms.
- Refined navigation.
- Consistent 8–12px corner radius.
- Subtle shadows using neutral black transparency.
- Thin, clean borders using permitted colors.
- Sophisticated modal designs.
- Carefully aligned components.
- Beautiful responsive layouts.

### Avoid

- Outdated dashboard designs.
- Excessively rounded cards.
- Oversized headings.
- Unnecessary decorative graphics.
- Excessive gradients.
- Colorful charts.
- Colorful status badges.
- Excessive animations.
- Crowded layouts.
- Unnecessary blank spaces.
- Generic template-like UI.

### Typography

Use a clean, professional sans-serif system font stack.

Typography should be:
- Highly readable.
- Consistent.
- Professional.
- Well-spaced.
- Properly sized.

All typography must use #000000.

Use font weight and size to establish hierarchy instead of introducing additional colors.

---

# 3. PREMIUM APPLICATION LAYOUT

### Sidebar

Create a sophisticated collapsible sidebar.

Use:
- White background.
- Navy blue active navigation indicators.
- Black navigation text.
- Navy blue icons.
- Official company logo at the top.

Navigation:

1. Dashboard
2. Lead Management
   - All Leads
   - Visit Management
   - Call Management
3. Quotation
4. Tax Invoice
5. Expense
6. Employee
7. Employee Salary
8. Task Management
9. Attendance
10. Sales Report
11. Expense Report
12. Settings

The sidebar should have a premium minimal appearance with consistent spacing and clear navigation hierarchy.

### Header

Create a clean top navigation bar with:
- Current page title.
- Breadcrumbs.
- Global search.
- Notifications.
- Current date.
- User profile.
- Role indicator.
- Profile dropdown.
- Logout.

Maintain a consistent white and navy appearance.

### Dashboard Layout

Use an elegant grid layout with:
- Premium statistic cards.
- Clearly organized information sections.
- Minimalist tables.
- Navy and white charts.
- Professional activity feeds.
- Consistent card spacing.

All dashboard components must look visually connected.

---

# 4. COMPANY INFORMATION

Company Name: Bhumi Business Solutions

Email: support@bhumibusiness.com

Business Description:

Bhumi Business Solutions operates in financial consultancy and corporate compliance, providing accounting, taxation, auditing, GST compliance, CA-backed advisory, bookkeeping, payroll management, corporate filings, and virtual CFO solutions for startups, MSMEs, and commercial enterprises.

Use the attached official Bhumi Business Solutions logo exactly as provided.

Do not recreate, recolor, crop, stretch, or modify the logo.

Preserve its original navy blue and golden-orange logo artwork. The logo is an explicitly approved brand asset; its original colors must remain unchanged even though the application interface itself uses only white and navy.

---

# 5. TECHNOLOGY REQUIREMENTS

Use ONLY:

- React
- Vite
- Tailwind CSS
- JavaScript
- React Hooks
- Native browser APIs

Do not use:
- Next.js
- TypeScript
- Bootstrap
- Material UI
- Shadcn UI
- External component libraries
- External icon libraries
- Firebase
- Supabase
- Any database
- Any backend
- Any external APIs
- Any additional technology or library

Use inline SVG and CSS for icons and custom UI elements.

Use mock data stored in JavaScript objects and arrays.

Use React state and localStorage for frontend-only data persistence.

---

# 6. DEVELOPMENT ORDER – STRICTLY FOLLOW

Develop the application in the following sequence:

**PHASE 1 – COMPLETE UI DESIGN**

First create the entire premium CRM interface, including:
- Sidebar.
- Header.
- Dashboard.
- All module pages.
- All forms.
- All tables.
- All modals.
- All responsive layouts.
- All navigation.
- All filters and search interfaces.
- All empty states.

Every module must have its complete UI.

Use mock data to preview the complete application without login restrictions during initial UI development.

**PHASE 2 – LOGIN SYSTEM**

After completing the entire UI, implement Admin and Employee login and permissions.

**PHASE 3 – TAX INVOICE MODULE**

After completing authentication, implement the full Tax Invoice workflow.

**PHASE 4 – REMAINING FUNCTIONALITY**

Implement all remaining CRUD operations, calculations, reporting, and integrations between frontend modules.

Do not change this development order.

---

# 7. FUNCTIONAL MODULES

Build all the following modules with complete functionality and the same premium design language.

### A. Dashboard

Display:
- Total Leads.
- New Leads.
- Converted Leads.
- Pending Quotations.
- Total Quotations.
- Total Tax Invoices.
- Total Revenue.
- Pending Payments.
- Total Expenses.
- Total Employees.

Additional sections:
- Recent Leads.
- Recent Visits.
- Recent Calls.
- Recent Quotations.
- Recent Invoices.
- Pending Tasks.
- Upcoming Tasks.
- Employee Attendance.
- Monthly Sales.
- Monthly Expenses.

Use navy-and-white CSS/SVG charts only.

### B. Lead Management

Fields:
- Lead ID.
- Client Name.
- Contact Person.
- Mobile.
- Alternate Mobile.
- Email.
- Address.
- GSTIN.
- PAN.
- Business Type.
- Required Services.
- Lead Source.
- Assigned Employee.
- Lead Date.
- Follow-up Date.
- Expected Value.
- Status.
- Remarks.

Statuses:
- New.
- Contacted.
- Follow-up.
- Interested.
- Quotation Sent.
- Converted.
- Lost.

Functionalities:
- Add, edit, delete and view leads.
- Search and filter.
- Assign employees.
- Follow-up history.
- Visit history.
- Call history.
- Create quotation.
- Update status.

### C. Visit Management

Fields:
- Lead.
- Client Name.
- Contact Person.
- Visit Date.
- Visit Time.
- Employee.
- Location.
- Purpose.
- Description.
- Discussion Notes.
- Next Follow-up.
- Status.

Support scheduling, editing, deleting, completing and filtering visits.

### D. Call Management

Fields:
- Lead.
- Client Name.
- Contact Number.
- Call Date.
- Call Time.
- Employee.
- Incoming/Outgoing.
- Purpose.
- Discussion.
- Outcome.
- Follow-up Date.
- Remarks.

Support call history, editing, deleting and filtering.

### E. Quotation Module

Create a professional quotation management system.

Quotation listing:
- Quotation Number.
- Date.
- Client.
- Contact Number.
- Lead Reference.
- Subtotal.
- GST.
- Grand Total.
- Validity.
- Status.

Quotation form:
- Client information.
- Quotation number.
- Quotation date.
- Validity date.
- Prepared by.
- Subject.
- Notes.
- Multiple service line items.

Service items:
- Service Name.
- Description.
- SAC Code.
- Quantity.
- Rate.
- Discount.
- GST Rate.
- Tax Amount.
- Total.

Predefined services:
- GST Registration.
- GST Return Filing.
- Income Tax Return Filing.
- Accounting and Bookkeeping.
- Tax Audit.
- Statutory Audit.
- Payroll Management.
- Company Incorporation.
- ROC Compliance.
- TDS Return Filing.
- Virtual CFO Services.
- Other Consultancy Services.

Implement:
- Automatic calculations.
- CGST.
- SGST.
- IGST.
- Discounts.
- Grand Total.
- Amount in Words.
- Save Draft.
- Edit.
- Delete.
- Print.
- PDF via browser print.
- Convert Quotation to Tax Invoice.

Quotation statuses:
Draft, Sent, Accepted, Rejected, Expired, Converted.

**Quotation Print Design:**

Create a premium A4 quotation document with the original company logo, company details, client details, quotation number, service table, GST breakup, total, terms, and signature.

White background, navy borders, and strictly black text.

### F. Tax Invoice Module

This module must be implemented with particular attention to its workflow.

**STEP 1: PROJECT LISTING**

When opening Tax Invoice, show Projects first.

Display:
- Project ID.
- Project Name.
- Client Name.
- Contact Person.
- Mobile.
- Email.
- GSTIN.
- PAN.
- Address.
- Assigned Employee.
- Invoice Count.
- Total Invoiced.
- Total Paid.
- Outstanding.
- Project Status.

Allow creating, editing, viewing, deleting, searching, and filtering projects.

**STEP 2: PROJECT DETAILS**

Clicking a project opens its details page.

Display project information followed by an invoice listing for that project.

Provide a prominent Create New Invoice action.

**STEP 3: MULTIPLE INVOICES**

One project must support unlimited independent invoices.

Example:

ABC Private Limited:
- Invoice 001 – GST Registration – ₹5,000.
- Invoice 002 – Monthly Accounting – ₹10,000.
- Invoice 003 – GST Return Filing – ₹3,000.
- Invoice 004 – Annual Compliance – ₹15,000.

Each invoice must have a unique number and independent data.

Creating a new invoice must never overwrite existing invoices.

**STEP 4: INVOICE CREATION**

Client and project details should automatically populate.

Invoice fields:
- Invoice Number.
- Invoice Date.
- Due Date.
- Place of Supply.
- State.
- State Code.
- Reverse Charge.
- Reference Number.
- Created By.

Multiple invoice items:
- Service Name.
- Description.
- SAC Code.
- Quantity.
- Unit.
- Rate.
- Discount.
- Taxable Amount.
- GST Rate.
- CGST.
- SGST.
- IGST.
- Line Total.

GST rates:
0%, 5%, 12%, 18%, 28%, Custom.

Implement correct configurable tax calculations, with CGST/SGST for intra-state and IGST for inter-state transactions.

**STEP 5: PAYMENT TRACKING**

Support:
- Multiple partial payments.
- Full payments.
- Payment Date.
- Payment Mode.
- Transaction Reference.
- Payment Notes.

Payment modes:
Cash, Bank Transfer, UPI, Cheque, Other.

Statuses:
Unpaid, Partially Paid, Paid, Overdue.

Automatically calculate:
- Total Invoice Amount.
- Amount Received.
- Outstanding Balance.

Prevent payments exceeding the outstanding balance.

**STEP 6: INVOICE ACTIONS**

- Create.
- Edit.
- Delete.
- View.
- Print.
- Download PDF through browser print.
- Duplicate.
- Add Payment.
- View Payment History.
- Update Status.

**STEP 7: TAX INVOICE DOCUMENT**

Create a professional A4 GST tax invoice.

Include:
- Original company logo.
- Company information.
- Client information.
- Invoice number.
- Invoice date.
- Due date.
- Place of Supply.
- Item description.
- SAC code.
- Quantity.
- Rate.
- Taxable amount.
- CGST.
- SGST.
- IGST.
- Grand Total.
- Amount in Words.
- Amount Received.
- Balance Due.
- Bank Details.
- Payment Terms.
- Notes.
- Authorized Signature.

Strictly black text with white background and navy borders.

Hide application navigation and controls during printing.

Ensure correct A4 print formatting and avoid unnecessary page breaks.

### G. Expense Management

Fields:
- Expense ID.
- Title.
- Category.
- Description.
- Date.
- Amount.
- GST.
- Vendor.
- Bill Number.
- Payment Mode.
- Added By.
- Approved By.
- Status.

Categories:
Office Rent, Electricity, Internet, Salary, Travel, Stationery, Software, Marketing, Professional Fees, Miscellaneous.

Support CRUD, search, filters, approval/rejection, and CSV export.

### H. Employee Management

Fields:
- Employee ID.
- Name.
- Profile Image.
- Mobile.
- Email.
- Address.
- Date of Birth.
- Joining Date.
- Designation.
- Department.
- Salary.
- Employment Type.
- Role.
- Username.
- Demo Password.
- Status.

Support employee profiles, CRUD, search, filters, activation and deactivation.

### I. Employee Salary

Fields:
- Employee.
- Salary Month.
- Basic Salary.
- HRA.
- Allowances.
- Incentives.
- Bonus.
- Deductions.
- Advance Recovery.
- Net Salary.
- Payment Date.
- Payment Mode.
- Payment Status.

Support monthly salary generation, duplicate prevention, salary history, salary slips, and printing.

### J. Task Management

Fields:
- Task ID.
- Title.
- Description.
- Related Lead/Client.
- Assigned Employee.
- Created By.
- Priority.
- Start Date.
- Due Date.
- Status.
- Completion Notes.

Priority: Low, Medium, High, Urgent.

Status: Pending, In Progress, Completed, On Hold, Cancelled.

Support assignment, editing, deletion, tracking, and filtering.

### K. Attendance

Fields:
- Employee.
- Date.
- Check-in.
- Check-out.
- Working Hours.
- Attendance Status.
- Remarks.

Support employee check-in, check-out, admin manual entry, history, monthly reports, and employee-wise filtering.

### L. Sales Report

Display:
- Total Invoiced.
- Amount Received.
- Outstanding.
- Paid Invoices.
- Unpaid Invoices.
- Partially Paid Invoices.

Reports:
- Daily.
- Weekly.
- Monthly.
- Yearly.
- Client-wise.
- Project-wise.
- Employee-wise.
- Service-wise.
- Payment Collection.

Include date filters, charts, tables, CSV export, and printing.

Only actual invoice records should count as invoiced sales.

### M. Expense Report

Display:
- Total Expenses.
- Approved Expenses.
- Pending Expenses.
- Rejected Expenses.
- Monthly Expenses.
- Yearly Expenses.

Reports:
- Daily.
- Monthly.
- Yearly.
- Category-wise.
- Employee-wise.
- Vendor-wise.
- Payment Mode-wise.

Include filters, charts, tables, CSV export, and printing.

---

# 8. ADMIN AND EMPLOYEE LOGIN SYSTEM

Implement after the entire UI has been created.

Login fields:
- Username / Email.
- Password.
- Show/Hide Password.
- Remember Me.
- Login.

Demo credentials:

Admin:
admin / admin123

Employee:
employee / emp123

**ADMIN ACCESS:**
Full access to all modules, records, reports, employee management, salary management, and settings.

**EMPLOYEE ACCESS:**
Restricted access to assigned leads, own visits, calls, tasks, attendance, salary slips, and permitted quotation/project operations.

Employees must not access restricted company-wide reports, other employee salary details, or admin-only functions.

Use frontend-only authentication and localStorage.

This is demonstration authentication, not production-grade security.

---

# 9. MOCK DATA

Populate with realistic Indian business mock data:

- 15+ Leads.
- 10+ Projects.
- 15+ Quotations.
- 20+ Invoices.
- Multiple invoices per project.
- 15+ Expenses.
- 8+ Employees.
- 10+ Tasks.
- Attendance records.
- Salary records.
- Payment records.

Use INR formatting and DD-MM-YYYY dates.

Ensure all calculations and linked records remain consistent.

---

# 10. APPLICATION SETTINGS

Admin settings:

Company Profile:
- Company Name.
- Logo.
- Email.
- Phone.
- Address.
- GSTIN.
- PAN.
- State.
- State Code.

Invoice Settings:
- Invoice Prefix.
- Starting Number.
- Payment Terms.
- GST Defaults.
- Bank Details.
- Invoice Notes.

Quotation Settings:
- Quotation Prefix.
- Starting Number.
- Default Validity.
- Terms and Conditions.

Keep unprovided company details configurable. Never invent actual tax or banking information.

Store settings locally.

---

# 11. FINAL QUALITY CONTROL

Before completion, verify:

- All modules have premium UI.
- Entire application follows only white and navy blue.
- Every text element is strictly black.
- Official logo remains unchanged.
- All pages are responsive.
- All buttons work.
- CRUD operations work.
- Search and filters work.
- Login works.
- Role permissions work.
- Project-first invoice workflow works.
- Multiple invoices per project work.
- GST calculations are correct.
- Partial payments work.
- Quotation conversion works.
- Salary calculations work.
- Attendance calculations work.
- Sales and expense reports use actual mock records.
- Printing works properly.
- No broken buttons or placeholder pages.
- No console errors.

# 12. FINAL DEVELOPMENT INSTRUCTION

Follow this exact sequence without changing the order:

1. Complete the entire modern premium UI design for all modules.
2. Implement Admin and Employee login.
3. Fully implement Tax Invoice with Project-first and Multiple-Invoice functionality.
4. Implement all remaining modules.
5. Test the complete application.

**FINAL DESIGN EXPECTATION:**

The finished Bhumi Business Solutions CRM should look like a premium, modern, enterprise-grade financial management platform.

It must be visually sophisticated, extremely clean, professional, and easy to operate.

The design must remain consistent across every page.

Remember:

ONLY WHITE (#FFFFFF) AND NAVY BLUE (#0B1F44) FOR THE UI.

STRICTLY BLACK (#000000) FOR EVERY TEXT ELEMENT.

No additional UI colors.

No additional libraries.

No backend.

No database.

React + Vite + Tailwind CSS + JavaScript only.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c34e69e9-8d24-4f06-848e-e082dd9aa189).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
