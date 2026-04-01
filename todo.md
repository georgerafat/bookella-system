# Bookella System - Project TODO

## Phase 1: Database & Core Setup
- [x] Create database schema with all 11 tables
- [x] Setup relationships and foreign keys
- [x] Create migration SQL and apply via webdev_execute_sql
- [x] Create database helper functions in server/db.ts

## Phase 2: Backend API - Core Procedures
- [x] Books procedures: list, create, update, delete, search with filters
- [x] Users procedures: list, create, update, get user details
- [x] Orders procedures: create, list, update status, calculate totals
- [x] OrderItems procedures: add items to order, remove items

## Phase 3: Backend API - Advanced Features
- [x] Borrowing procedures: create, list, update status, mark overdue
- [x] Payments procedures: record payment, calculate remaining debt
- [x] PromoCodes procedures: validate, apply discount, track usage
- [x] Bundles procedures: create, list, apply bundle to order
- [x] Suppliers procedures: list, create, get inventory needs

## Phase 4: Dashboard & Analytics
- [x] Dashboard layout with sidebar navigation
- [x] Daily/monthly revenue charts (books profit vs shipping profit)
- [x] Top selling books chart
- [x] Top customers by purchases
- [x] Inventory status overview
- [x] Pending orders summary
- [x] Overdue borrowings alert
- [x] Marketing source analytics (registration source breakdown)

## Phase 5: Orders Management UI
- [x] Orders list page with filters (status, governorate, date range)
- [ ] Create order form (multi-book selection, auto price calculation)
- [x] Order details page with items breakdown
- [x] Update order status (pending → processing → shipped → delivered)
- [ ] Apply promo codes and bundles to orders
- [x] Partial payment recording interface
- [ ] Shipping tracking and profit calculation display
- [x] Filter by governorate for batch delivery

## Phase 6: Books & Inventory Management
- [ ] Books list page with search and filters
- [ ] Add new book form with supplier selection
- [ ] Update book quantity and price
- [ ] Low stock alerts
- [ ] Supplier inventory needs page
- [ ] Book categories and series management

## Phase 7: Borrowing System
- [ ] Borrowing list page with status filters
- [ ] Create borrowing form
- [ ] Mark as returned
- [ ] Overdue borrowings list
- [ ] Automatic WhatsApp reminders (1-2 days before due date)
- [ ] WhatsApp notifications for overdue items

## Phase 8: Customers & Debt Management
- [ ] Customers list with search
- [ ] Customer profile page with order history
- [ ] Debt tracking and payment history
- [ ] Customer points display
- [ ] Registration source tracking
- [ ] Payment reminders

## Phase 9: Promo Codes & Bundles
- [ ] Create promo code form (percentage, fixed, bundle types)
- [ ] Promo codes list with usage tracking
- [ ] Create bundle form with item selection
- [ ] Bundle discounts and free items
- [ ] Automatic inventory deduction for bundle free items

## Phase 10: Suppliers Management
- [ ] Suppliers list page
- [ ] Add new supplier form
- [ ] Supplier inventory needs report
- [ ] Reorder points configuration

## Phase 11: Excel Data Import
- [ ] Parse Bookella_Data2.xlsx file
- [ ] Map columns to database fields
- [ ] Validate data before import
- [ ] Import Users, Books, Orders, Borrowing data
- [ ] Handle Arabic text correctly
- [ ] Display import progress and errors

## Phase 12: WhatsApp Integration
- [ ] Setup WhatsApp API integration (Twilio)
- [ ] Send borrowing return reminders (1-2 days before)
- [ ] Send overdue borrowing notifications
- [ ] Send payment reminders for partial payments
- [ ] Track notification status in database
- [ ] Create WhatsApp notification UI

## Phase 13: PDF Reports Generation
- [ ] Generate monthly profit reports with charts
- [ ] Export top selling books report
- [ ] Export top customers report
- [ ] Create financial summary reports
- [ ] Add date range filtering for reports
- [ ] Create downloadable PDF files

## Phase 14: Dynamic Promo Code & Bundle System
- [ ] Create promo code management interface
- [ ] Build bundle creation system
- [ ] Implement automatic discount calculation
- [ ] Auto-deduct bundle gifts from inventory
- [ ] Apply bundles to orders
- [ ] Track promo code usage statistics

## Phase 13: UI Polish & Testing
- [ ] RTL (Right-to-Left) layout verification
- [ ] Arabic font and text rendering
- [ ] Mobile responsiveness testing
- [ ] Dark mode support
- [ ] Performance optimization
- [ ] Error handling and validation
- [ ] Unit tests for critical functions
- [ ] Integration tests for workflows

## Phase 14: Deployment & Documentation
- [ ] Create checkpoint before deployment
- [ ] Deploy to production
- [ ] Setup monitoring and logging
- [ ] Create user documentation
- [ ] Create admin guide
- [ ] Setup backup strategy
