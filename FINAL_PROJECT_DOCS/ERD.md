# Entity Relationship Diagram (ERD)

## Schema Overview
The database consists of 5 main tables: `users`, `pawn_request`, `loan`, `notification`, and `transaction_log`.

### Mermaid Diagram
```mermaid
erDiagram
    USERS ||--o{ PAWN_REQUEST : "initiates"
    USERS ||--o{ NOTIFICATION : "receives"
    USERS ||--o{ TRANSACTION_LOG : "has"
    PAWN_REQUEST ||--|{ LOAN : "becomes"
    LOAN ||--o{ TRANSACTION_LOG : "generates"

    USERS {
        Long id PK
        String username
        String email
        String password
        String firstName
        String lastName
        String role "USER/ADMIN"
        String profileImage
        Boolean enabled
    }

    PAWN_REQUEST {
        Long pawnId PK
        Long user_id FK
        String itemName
        String description
        String photos "JSON/URL"
        BigDecimal offeredAmount
        String status "PENDING/OFFER_MADE/ACCEPTED/PAWNED"
        String adminRemarks
        LocalDateTime createdAt
    }

    LOAN {
        Long loanId PK
        Long pawn_id FK
        BigDecimal loanAmount
        Integer interestRate
        LocalDate dueDate
        String status "ACTIVE/PAID/FORFEITED"
        BigDecimal penalty
        LocalDate dateRedeemed
    }

    NOTIFICATION {
        Long notifId PK
        Long user_id FK
        String message
        String type
        Boolean read
        LocalDateTime timestamp
    }

    TRANSACTION_LOG {
        Long id PK
        Long user_id FK
        Long loan_id FK
        String type "PAYMENT/DISBURSAL"
        BigDecimal amount
        LocalDateTime timestamp
    }
```

## Key Relationships
1.  **User to PawnRequest (1:N)**: A single user can have multiple pawn requests.
2.  **PawnRequest to Loan (1:1)**: A pawn request becomes exactly one Loan once validated. The `pawn_id` allows tracking the item's journey from request to loan.
3.  **Loan to TransactionLog (1:N)**: A loan can have multiple associated transactions (e.g., initial payout, partial payments, full redemption).

## Data Dictionary

| Table | Column | Type | Description |
| :--- | :--- | :--- | :--- |
| **users** | `role` | ENUM | Distinguishes between 'USER' (Customer) and 'ADMIN' (Staff). |
| **pawn_request** | `status` | VARCHAR | Tracks the workflow state. Key states: `OFFER_MADE` (Admin sets price), `ACCEPTED` (User agrees), `PAWNED` (Item is in custody). |
| **loan** | `loanAmount` | DECIMAL | The final principal amount disbursed to the user. |
| **loan** | `dueDate` | DATE | Calculated based on `proposedLoanDuration` (Default 30 days). |
