# ThriftShirt Pawnshop System Flow

## System Overview
ThriftShirt Pawnshop is a digital pawnshop management system specializing in shirts and clothing items. The system handles shirt pawning, loan management, wallet transactions, and thrift resale for both users and administrators. Items not redeemed are automatically moved to the thrift store inventory for resale.

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
  - Item Name (e.g., "Supreme Box Logo Tee", "Nike Vintage Shirt")
  - Description (brand, size, color, condition, material)
  - Category (T-Shirt, Polo, Button-Up, Hoodie, etc.)
  - Requested Amount (₱)
  - Upload Photos (up to 3 - front, back, tags/labels)
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
- **APPROVED**: Admin approved shirt value and terms
- **REJECTED**: Admin rejected the request (poor condition, fake brand, etc.)
- **PAWNED**: Loan released, money in wallet, loan active, shirt stored in pawnshop
- **REDEEMED**: User paid back loan + interest, shirt returned to user
- **FORFEITED**: User didn't pay within due date, shirt moved to thrift store for resale

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

#### Redeeming a Shirt
```
Pawn Status → View PAWNED shirt
  ↓
Check loan details (amount, interest, due date)
  ↓
User brings payment to pawnshop counter
  ↓
Admin processes payment:
  - Verify user identity
  - Collect cash payment
  - Mark as paid in system
    ↓
    Status → REDEEMED
    ↓
    Shirt retrieved from inventory
    ↓
    Shirt returned to user
```

#### Renewing a Loan
```
Before due date arrives
  ↓
User goes to pawnshop counter
  ↓
Pays interest only to extend loan
  ↓
Admin creates new loan with same shirt:
  - New 30-day period
  - Same principal amount
  - Shirt stays in inventory
  ↓
Status remains → PAWNED (extended)
```

### 6. Dashboard Features
- **Wallet Balance**: Real-time balance display (for tracking, payments done at counter)
- **Active Pawns**: Count of currently pawned shirts
- **Due Soon**: Shirts with due date within 7 days
- **Recent Activity**: Last 10 transactions with status badges (all statuses: pending, approved, rejected, pawned, redeemed, forfeited)
- **Quick Actions**: Cash in/out (over counter), create pawn, view status

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
For each shirt request:
  - View shirt details (brand, size, condition)
  - View photos (front, back, tags)
  - Check requested amount
  - Assess brand authenticity from photos
  - Estimate resale value
  ↓
Decision:
  ├─ APPROVE → Set estimated loan value
  │            ↓
  │            Calculate loan terms:
  │            - Interest rate (default 5%)
  │            - Due date (30 days default)
  │            ↓
  │            Status → APPROVED
  │
  └─ REJECT → Provide reason (poor condition, fake brand, etc.)
               ↓
               Status → REJECTED
               ↓
               User notified
```

### 3. Item Validation & Loan Release
```
Admin Dashboard → Item Validation
  ↓
View all APPROVED shirts awaiting validation
  ↓
User brings physical shirt to counter
  ↓
Admin inspects shirt:
  - Brand tags and labels (authenticity check)
  - Stitching and material quality
  - Condition (stains, tears, fading)
  - Size and measurements
  - Match with submitted photos
  ↓
Click "Validate & Release"
  ↓
System creates loan:
  - Loan Amount (based on final appraisal)
  - Interest Amount
  - Due Date
  - Status → PAWNED
  ↓
Admin hands cash to user over counter
  ↓
Shirt tagged and stored in inventory
```

**Or Reject:**
```
If shirt doesn't match description
  ↓
Click "Reject"
  ↓
Enter reason (fake brand, poor condition, doesn't match photos)
  ↓
Status → REJECTED
  ↓
User notified, shirt returned
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
Shirt ownership transfers to pawnshop
  ↓
Shirt moved to thrift store inventory
  ↓
Shirt listed for resale at market price
  ↓
User loses shirt, no refund
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
View all shirts:
  - Active pawns (currently held for loans)
  - Forfeited shirts (moved to thrift inventory)
  - Shirts by category (T-shirt, Polo, Hoodie, etc.)
  - Shirts by brand (Supreme, Nike, Adidas, etc.)
  ↓
Thrift Store Management:
  - List forfeited shirts for resale
  - Set resale prices
  - Track sales
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

### 9. Thrift Store Resale Management
```
When loan is forfeited
  ↓
Shirt automatically moved to thrift inventory
  ↓
Admin Dashboard → Thrift Inventory
  ↓
View forfeited shirts:
  - Original pawn details
  - Loan amount not paid
  - Shirt condition and brand
  - Estimated resale value
  ↓
Set resale price:
  - Based on market value
  - Brand demand
  - Shirt condition
  ↓
List shirt in thrift catalog
  ↓
Options:
  ├─ Sell Online (if web store implemented)
  ├─ Sell In-Store (physical shop)
  └─ Export Inventory (for external platforms)
  ↓
Track sales revenue:
  - Original loan amount
  - Resale price
  - Profit margin
  - Inventory turnover
```

**Revenue Model:**
```
Example: Supreme Shirt Forfeited
  - Loan given to user: ₱5,000
  - User forfeits (doesn't pay ₱5,250)
  - Shirt market value: ₱6,500
  - Pawnshop sells in thrift store: ₱6,500
  - Profit: ₱1,500 (₱6,500 - ₱5,000)
  - Plus uncollected interest: ₱250
  - Total revenue: ₱1,750 per forfeited item
```

---

## COMPLETE PAWN LIFECYCLE EXAMPLE

### Scenario: User pawns a Supreme branded shirt

**User Actions:**
```
1. User logs in → Dashboard
2. Clicks "Create Pawn" → Fills form:
   - Item: "Supreme Box Logo T-Shirt"
   - Description: "Black, Size Large, 2023 release, like-new condition, authentic tags"
   - Category: T-Shirt
   - Requested Amount: ₱5,000
   - Upload 3 photos (front, back, tags)
3. Submits → Status: PENDING
```

**Admin Actions (Phase 1 - Review):**
```
4. Admin views in "Review Requests"
5. Reviews photos and details
6. Checks brand authenticity from photos
7. Verifies Supreme box logo looks legitimate
8. Checks market resale value (₱6,000-7,000)
9. Decides to APPROVE
10. Sets estimated value: ₱5,000
11. Sets terms:
    - Interest: 5% (₱250)
    - Total repayment: ₱5,250
    - Due date: Jan 7, 2026 (30 days)
12. Status → APPROVED
```

**Admin Actions (Phase 2 - Validation):**
```
13. User brings Supreme shirt to pawnshop counter
14. Shirt appears in "Item Validation" queue
15. Admin physically inspects shirt:
    - Verifies authentic Supreme tags and labels
    - Checks stitching quality and print
    - Confirms no stains, tears, or fading
    - Validates size and condition
16. Admin clicks "Validate & Release"
17. System creates loan:
    - Loan amount: ₱5,000
    - Interest: ₱250
    - Total due: ₱5,250
18. Status → PAWNED
19. Admin hands ₱5,000 cash to user (over counter)
20. Shirt tagged with pawn ID and stored in inventory
```

**User Actions (Redemption Option 1):**
```
21. User wants shirt back before due date
22. Goes to pawnshop counter with ₱5,250 cash
23. Admin verifies identity
24. Admin processes payment in system
25. Clicks "Process Payment" in Loan Manager
26. Status → REDEEMED
27. Admin retrieves Supreme shirt from inventory
28. User receives shirt back
```

**User Actions (Renewal Option 2):**
```
21. User cannot pay full amount yet
22. Goes to pawnshop counter before due date
23. Pays ₱250 (interest only) to renew
24. Admin creates new loan with same shirt
25. New due date: 30 days from renewal
26. Status remains → PAWNED
27. Shirt stays in inventory for another month
```

**Admin Actions (Forfeiture Option 3):**
```
21. Due date passed (Jan 8, 2026)
22. User hasn't redeemed or renewed
23. Admin goes to Loan Management
24. Finds overdue loan
25. Clicks "Forfeit"
26. Status → FORFEITED
27. Supreme shirt moved to thrift store inventory
28. Shirt listed for resale at ₱6,500-7,000
29. Pawnshop earns profit from resale
30. User loses shirt permanently
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
1. Only one active loan per shirt
2. Renewed loans extend the same loan (no new approval needed)
3. Rejected shirts cannot be resubmitted (must create new request)
4. Forfeited shirts cannot be redeemed and are moved to thrift inventory
5. Forfeited shirts are listed for resale at market value

### Admin Access Rules:
1. Admins cannot access user pages while logged in as admin
2. Users cannot access admin pages
3. Separate authentication sessions
4. All admin actions are logged with timestamp and admin ID

---

## NOTIFICATION FLOW

### User Notifications:
- Shirt pawn request approved/rejected
- Loan validated - bring ID to counter for cash
- Loan due soon (7 days before)
- Loan overdue - shirt will be forfeited
- Loan forfeited - shirt moved to thrift store
- Wallet transaction completed (cash in/out processed)

### Admin Notifications:
- New shirt pawn request submitted
- Shirt ready for physical validation
- Loan overdue (requires forfeiture action)
- Forfeited shirt added to thrift inventory

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
- Payment at counter required → Show "Please proceed to counter" message
- Invalid shirt photo upload → Show supported formats (JPG, PNG) and size limits
- Network error → Retry option with error message
- Session expired → Redirect to login
- Insufficient wallet balance → Redirect to counter for cash transaction

### Common Admin Errors:
- Duplicate validation → Prevent processing same shirt twice
- Invalid loan amount → Validate numeric input and reasonable shirt value
- Missing shirt condition details → Highlight required fields
- Permission denied → Check admin role
- Fake brand detected → Reject with authenticity reason

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
Create Shirt Pawn Request        Review Shirt Requests
(Upload photos + details)        (Check brand, condition, value)
    ↓                                   ↓
Status: PENDING ──────────────→ Approve/Reject
    ↓                                   ↓
Status: APPROVED                 Awaiting Physical Validation
    ↓                                   ↓
Bring Shirt to Counter ────────→ Inspect Shirt (tags, condition)
    ↓                                   ↓
Receive Cash Over Counter ←──── Validate & Create Loan
    ↓                                   ↓
Shirt Stored in Pawnshop         Tag & Store in Inventory
    ↓                                   ↓
Monitor Loan in Dashboard        Monitor Active Loans
    ↓                                   ↓
Bring Cash to Redeem ──────────→ Process Payment
    ↓                                   ↓
Receive Shirt Back ←─────────── Return Shirt to User
              OR                           OR
    ↓                                   ↓
Don't Pay by Due Date ─────────→ Forfeit Loan
    ↓                                   ↓
Lose Shirt Ownership             Move to Thrift Store Inventory
                                        ↓
                                   List for Resale at Market Price
```

---

**System Version**: 1.0  
**Last Updated**: December 8, 2025  
**Tech Stack**: Spring Boot, React, PostgreSQL/MySQL
