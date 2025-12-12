# Software Requirements Specification (SRS)
## ThriftShirt Pawnshop System

### 1. Introduction
**1.1 Purpose**
The purpose of the ThriftShirt Pawnshop System is to modernize and digitalize the operations of a traditional pawnshop. The system facilitates the preliminary assessment of items online while maintaining a secure "Face-to-Face" validation and payout process. It serves two primary user roles: Customers (Users) and Administrators (Staff).

**1.2 Scope**
- **User Module**: Registration, profile/avatar management, online pawn requests (photo upload), offer acceptance/rejection, and monitoring of active loans.
- **Admin Module**: Dashboard analytics, assessment of pawn requests (making offers), loan validation (finalizing cash payout), loan management (payments/redemption/forfeiture), inventory management, and user administration.
- **Workflow**: The system enforces a specific workflow: `Request` -> `Assessment (Offer)` -> `Acceptance` -> `Validation (Cash Payout)` -> `Active Loan` -> `Redemption/Forfeiture`.

### 2. Functional Requirements

#### 2.1 Authentication & User Management
- **FR-01**: Users and Admins must log in using secure currency-standard authentication (JWT).
- **FR-02**: New users can register for an account.
- **FR-03**: Users can update their profile, including uploading a profile avatar (stored via Cloudinary).
- **FR-04**: Admins can view, ban, unban, or delete user accounts.

#### 2.2 Pawn Request & Assessment
- **FR-05**: Users can create a pawn request by uploading item photos and details (Name, Brand, Description).
- **FR-06**: Admins can view pending requests and submit an **Assessment Offer** (Amount, Interest Rate, Remarks).
- **FR-07**: Users receive notifications of offers and can **Accept** or **Reject** them via the dashboard.

#### 2.3 Loan Management (Face-to-Face)
- **FR-08**: Upon user acceptance, Admins "Validate" the item in-store. This action creates an explicit **Loan** record and implies cash payout.
- **FR-09**: Admins can view all Active Loans and track due dates.
- **FR-10**: Admins can process **Loan Payments** (Redemption), marking the loan as Paid.
- **FR-11**: Admins can mark overdue loans as **Forfeited**, moving the item to Inventory.

#### 2.4 Inventory & Reporting
- **FR-12**: Forfeited items are automatically listed in the Admin Inventory.
- **FR-13**: The Admin Dashboard displays real-time statistics: Total Users, Active Pawns count, and Estimated Revenue.

### 3. Non-Functional Requirements
- **NFR-01 Security**: Passwords must be encrypted (BCrypt). API endpoints must be checking for valid JWTs.
- **NFR-02 Scalability**: Images must be offloaded to cloud storage (Cloudinary) to prevent server bog-down.
- **NFR-03 Performance**: The dashboard and lists should load within 2 seconds.
- **NFR-04 Reliability**: Critical transaction states (Loan Creation) must be atomic.

### 4. Use Cases

| Use Case ID | Use Case Name | Actor | Description |
| :--- | :--- | :--- | :--- |
| **UC-01** | Create Pawn Request | User | User uploads photos and item details for assessment. |
| **UC-02** | Assess Request | Admin | Admin reviews photos and proposes an Offer Amount and Interest Rate. |
| **UC-03** | Accept Offer | User | User agrees to the offered terms. Status moves to `ACCEPTED`. |
| **UC-04** | Validate & Payout | Admin | Admin verifies physical item matches photos. Creates official Loan. |
| **UC-05** | Process Redemption | Admin | Admin records repayment. Loan status becomes `PAID`. |
| **UC-06** | Forfeit Loan | Admin | Admin marks overdue loan as forfeited. Item moves to Inventory. |

### 5. System Architecture
**5.1 Technology Stack**
- **Frontend**: React.js, CSS3 (Custom Styles), Axios (API Client).
- **Backend**: Java Spring Boot, Spring Security (JWT), Hibernate/JPA.
- **Database**: MySQL (Relational Data).
- **Cloud Storage**: Cloudinary (Image Hosting).
- **Hosting**: Render (Backend/DB), Vercel (Frontend).

**5.2 Data Flow**
1.  Client sends JSON requests via REST API.
2.  Spring Boot Controller receives request.
3.  Service Layer validates business logic (Workflow checks).
4.  Repository Layer interacts with MySQL Database.
5.  Images are streamed directly to Cloudinary; URLs stored in DB.

### 6. API Requirements (Key Endpoints)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Public | Authenticate user and return JWT. |
| `POST` | `/pawn-requests/create` | User | Upload item details and photos. |
| `POST` | `/admin/pawn-requests/{id}/assess` | Admin | Submit offer amount and remarks. |
| `POST` | `/users/pawn-requests/{id}/response` | User | Accept or Reject admin offer. |
| `POST` | `/admin/pawn-requests/{id}/validate` | Admin | Finalize loan (Cash Payout). |
| `GET` | `/admin/dashboard` | Admin | Retrieve system statistics. |
| `POST` | `/file/upload` | Auth | Upload image to Cloudinary. |
