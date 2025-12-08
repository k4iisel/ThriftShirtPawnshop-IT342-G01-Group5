# ThriftShirt Pawnshop System Flow

## System Overview
ThriftShirt Pawnshop is a digital pawnshop management system that handles item pawning, loan management, and wallet transactions for both users and administrators.

---

## USER SIDE FLOW

### 1. Registration & Authentication
```
START → Register Account
  ↓
Enter: Username, Email, Password, Name, Address, Phone
  ↓
System validates and creates account
  ↓
Login with credentials
  ↓
Session token stored → Dashboard
```

### 2. Creating a Pawn Request
```
Dashboard → Create Pawn
  ↓
Fill Pawn Request Form:
  - Item Name
  - Description
  - Category
  - Requested Amount (₱)
  - Upload Photos (up to 3)
  ↓
Submit Request
  ↓
Status: PENDING (awaiting admin review)
  ↓
User receives notification
```

### 3. Pawn Request Journey

#### Status Flow:
```
PENDING → APPROVED → PAWNED → REDEEMED/FORFEITED
   ↓         ↓          ↓
REJECTED  (Admin)   (Admin validates & releases loan)
```

**Status Descriptions:**
- **PENDING**: Initial submission, awaiting admin review
- **APPROVED**: Admin approved item value and terms
- **REJECTED**: Admin rejected the request
- **PAWNED**: Loan released, money in wallet, loan active
- **REDEEMED**: User paid back loan + interest, item returned
- **FORFEITED**: User didn't pay within due date, item kept by pawnshop

### 4. Wallet Management

#### Cash In (Over-the-Counter)
```
Dashboard → Click "Cash In"
  ↓
Modal shows: "Proceed to counter with valid ID"
  ↓
User goes to physical counter
  ↓
Admin processes cash-in from admin portal
  ↓
Money added to user wallet
```

#### Cash Out (Over-the-Counter)
```
Dashboard → Click "Cash Out"
  ↓
Modal shows: "Proceed to counter with valid ID"
  ↓
User goes to physical counter
  ↓
Admin verifies balance and processes cash-out
  ↓
Money removed from wallet, given to user
```

### 5. Loan Management

#### Redeeming an Item
```
Pawn Status → View PAWNED item
  ↓
Check loan details (amount, interest, due date)
  ↓
Click "Redeem Item"
  ↓
System validates:
  - Wallet balance sufficient?
  - If YES: Process redemption
    ↓
    Deduct from wallet
    ↓
    Status → REDEEMED
    ↓
    Item returned to user
  - If NO: Show error message
```

#### Renewing a Loan
```
Pawn Status → View REDEEMED item
  ↓
Click "Renew Loan"
  ↓
Status changes to APPROVED
  ↓
Item goes back to admin validation queue
  ↓
Admin validates and releases loan again
  ↓
Status → PAWNED (new loan cycle begins)
```

### 6. Dashboard Features
- **Wallet Balance**: Real-time balance display
- **Active Pawns**: Count of currently pawned items
- **Due Soon**: Items with due date within 7 days
- **Recent Activity**: Last 10 transactions with status badges
- **Quick Actions**: Cash in/out, create pawn, view status

---

## ADMIN SIDE FLOW

### 1. Admin Authentication
```
START → Admin Login
  ↓
Enter admin credentials
  ↓
Separate admin session (cannot access user pages)
  ↓
Admin Dashboard
```

### 2. Pawn Request Review (Approve/Reject)
```
Admin Dashboard → Review Requests
  ↓
View all PENDING pawn requests
  ↓
For each request:
  - View item details
  - View photos
  - Check requested amount
  ↓
Decision:
  ├─ APPROVE → Set estimated value
  │            ↓
  │            Calculate loan terms:
  │            - Interest rate
  │            - Due date (30 days default)
  │            ↓
  │            Status → APPROVED
  │
  └─ REJECT → Provide reason
               ↓
               Status → REJECTED
               ↓
               User notified
```

### 3. Item Validation & Loan Release
```
Admin Dashboard → Item Validation
  ↓
View all APPROVED items (including renewals)
  ↓
Click "Validate & Release"
  ↓
System creates/updates loan:
  - Loan Amount (based on estimated value)
  - Interest Amount
  - Due Date
  - Status → PAWNED
  ↓
Money added to user wallet
  ↓
User can now use funds
```

**Or Reject:**
```
Click "Reject"
  ↓
Enter reason
  ↓
Status → REJECTED
  ↓
User notified
```

### 4. Loan Management

#### View Active Loans
```
Admin Dashboard → Pawn Management
  ↓
View all loans:
  - PAWNED (active)
  - REDEEMED
  - FORFEITED
  ↓
Filter and search capabilities
```

#### Process Payment (Manual Redemption)
```
Select PAWNED loan
  ↓
Click "Process Payment"
  ↓
System validates user wallet balance
  ↓
If sufficient:
  - Deduct loan + interest from wallet
  - Status → REDEEMED
  - Log transaction
```

#### Forfeit Loan
```
Select overdue PAWNED loan
  ↓
Click "Forfeit"
  ↓
Status → FORFEITED
  ↓
Item ownership transfers to pawnshop
  ↓
User loses item, no refund
```

### 5. User Management
```
Admin Dashboard → User Management
  ↓
View all registered users
  ↓
Actions available:
  - View user details
  - Check wallet balance
  - Ban/Unban user
  - View user's pawn history
```

### 6. Wallet Management (Admin)
```
Admin Dashboard → Wallet Management
  ↓
View all users with wallet balances
  ↓
For each user:
  ├─ Add Cash
  │    ↓
  │    Enter amount and reason
  │    ↓
  │    Money added to user wallet
  │    ↓
  │    Transaction logged
  │
  └─ Remove Cash
       ↓
       Enter amount and reason
       ↓
       Validate sufficient balance
       ↓
       Money removed from wallet
       ↓
       Transaction logged
```

### 7. Inventory Management
```
Admin Dashboard → Inventory
  ↓
View all items:
  - Active pawns
  - Forfeited items
  - Items by category
  ↓
Filter and export capabilities
```

### 8. Activity Logs
```
Admin Dashboard → Activity Logs
  ↓
View system-wide logs:
  - User registrations
  - Pawn requests
  - Loan transactions
  - Wallet transactions
  - Admin actions
  ↓
Search and filter by:
  - Date range
  - User
  - Action type
  - Status
```

---

## COMPLETE PAWN LIFECYCLE EXAMPLE

### Scenario: User pawns a laptop

**User Actions:**
```
1. User logs in → Dashboard
2. Clicks "Create Pawn" → Fills form:
   - Item: "Gaming Laptop"
   - Description: "ASUS ROG, i7, 16GB RAM"
   - Category: Electronics
   - Requested Amount: ₱15,000
   - Upload 3 photos
3. Submits → Status: PENDING
```

**Admin Actions (Phase 1 - Review):**
```
4. Admin views in "Review Requests"
5. Reviews photos and details
6. Decides to APPROVE
7. Sets estimated value: ₱12,000
8. Sets terms:
   - Interest: 10% (₱1,200)
   - Total repayment: ₱13,200
   - Due date: Jan 7, 2026 (30 days)
9. Status → APPROVED
```

**Admin Actions (Phase 2 - Validation):**
```
10. Item appears in "Item Validation"
11. Admin clicks "Validate & Release"
12. System creates loan:
    - Loan amount: ₱12,000
    - Interest: ₱1,200
    - Total due: ₱13,200
13. Status → PAWNED
14. User wallet increases by ₱12,000
```

**User Actions (Redemption Option 1):**
```
15. User wants item back before due date
16. Goes to Pawn Status
17. Clicks "Redeem Item"
18. System checks: Wallet = ₱12,000, needs ₱13,200
19. Shows error: "Insufficient funds"
20. User does cash-in at counter for ₱2,000
21. Admin adds ₱2,000 to user wallet
22. User clicks "Redeem Item" again
23. ₱13,200 deducted from wallet
24. Status → REDEEMED
25. User gets laptop back
```

**User Actions (Renewal Option 2):**
```
15. User redeemed item earlier
16. Wants to pawn again
17. Clicks "Renew Loan"
18. Status → APPROVED
19. Back to admin validation queue
20. Admin validates again → PAWNED
21. New loan cycle begins
```

**Admin Actions (Forfeiture Option 3):**
```
15. Due date passed (Jan 8, 2026)
16. User hasn't redeemed
17. Admin goes to Loan Management
18. Finds overdue loan
19. Clicks "Forfeit"
20. Status → FORFEITED
21. Pawnshop keeps laptop
22. User loses item
```

---

## KEY SYSTEM RULES

### Wallet Rules:
1. Wallet balance cannot go negative
2. All redemptions require sufficient wallet balance
3. Only admins can add/remove cash manually
4. All wallet transactions are logged

### Loan Rules:
1. Interest calculated on loan release (not request)
2. Due date is 30 days from validation
3. User must redeem before due date or item is forfeited
4. Penalties may apply for late payments (configurable)

### Status Rules:
1. Only one active loan per item
2. Renewed items must go through approval again
3. Rejected items cannot be resubmitted (must create new request)
4. Forfeited items cannot be redeemed

### Admin Access Rules:
1. Admins cannot access user pages while logged in as admin
2. Users cannot access admin pages
3. Separate authentication sessions
4. All admin actions are logged with timestamp and admin ID

---

## NOTIFICATION FLOW

### User Notifications:
- Pawn request approved/rejected
- Loan validated and money released
- Loan due soon (7 days before)
- Loan overdue
- Wallet transaction completed

### Admin Notifications:
- New pawn request submitted
- Item ready for validation
- Loan overdue (requires action)

---

## TECHNICAL FLOW

### Backend Architecture:
```
Controller Layer
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Database)
    ↓
Database (PostgreSQL)
```

### Frontend Architecture:
```
React Components
    ↓
API Service (axios/fetch)
    ↓
Backend REST API
    ↓
Response → Update UI
```

### Authentication Flow:
```
Login → JWT Token Generated
    ↓
Token stored in sessionStorage
    ↓
Every API request includes token in header
    ↓
Backend validates token
    ↓
If valid: Process request
If invalid: Return 401/403
```

---

## DATABASE RELATIONSHIPS

```
User (1) ─────< (Many) PawnRequest
    │
    └──────< (Many) TransactionLog
    │
    └──────< (Many) Loan

PawnRequest (1) ─────< (1) Loan

Loan (1) ─────< (Many) TransactionLog
```

---

## ERROR HANDLING

### Common User Errors:
- Insufficient wallet balance → Show current balance and required amount
- Invalid file upload → Show supported formats and size limits
- Network error → Retry option with error message
- Session expired → Redirect to login

### Common Admin Errors:
- Duplicate validation → Prevent processing same item twice
- Invalid amount → Validate numeric input
- Missing required fields → Highlight errors
- Permission denied → Check admin role

---

## SECURITY MEASURES

1. **Authentication**: JWT tokens with expiration
2. **Authorization**: Role-based access control (USER/ADMIN)
3. **Input Validation**: Backend validation for all inputs
4. **SQL Injection Protection**: Parameterized queries (JPA)
5. **XSS Protection**: Input sanitization
6. **CORS**: Configured for allowed origins only
7. **Password Security**: Hashed with bcrypt
8. **Session Management**: Separate user and admin sessions

---

## END-TO-END SYSTEM FLOW SUMMARY

```
USER SIDE:                          ADMIN SIDE:
Register/Login                      Admin Login
    ↓                                   ↓
Create Pawn Request              Review Requests
    ↓                                   ↓
Status: PENDING ──────────────→ Approve/Reject
    ↓                                   ↓
Status: APPROVED ─────────────→ Validate & Release
    ↓                                   ↓
Money in Wallet ←───────────── Loan Created
    ↓                                   
Use funds or Redeem                 Monitor Loans
    ↓                                   ↓
Redeem Item ──────────────────→ Process Payment
    ↓                              (or Forfeit)
Status: REDEEMED                       ↓
    ↓                              Update Status
Renew Loan (optional) ─────────→ Re-validate
    ↓
Cycle repeats
```

---

**System Version**: 1.0  
**Last Updated**: December 8, 2025  
**Tech Stack**: Spring Boot, React, PostgreSQL
