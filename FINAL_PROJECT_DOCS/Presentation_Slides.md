# Final Project Presentation: ThriftShirt Pawnshop System

## Slide 1: Title Slide
**Title**: ThriftShirt Pawnshop System
**Subtitle**: Digitalizing the Pawnshop Experience
**Team**: Group 5
**Course**: IT342

> **Speaker Notes**: Good [morning/afternoon]. We are Group 5, and today we are presenting our final project: The ThriftShirt Pawnshop System, a web-based solution designed to modernize traditional pawnshop operations.

---

## Slide 2: Project Overview & Purpose
**Problem**: Traditional pawnshops rely on manual, in-person initial assessments which are time-consuming and inefficient for both customers and staff.
**Solution**: A "Face-to-Face First" digital hybrid system.
- **Online Assessment**: Users get an initial offer online by uploading photos.
- **Streamlined Visits**: physical visits are only for final verification and cash payout.
- **Target Users**: People in need of quick cash (Customers) and Pawnshop Staff (Admins).

---

## Slide 3: System Architecture
**Diagram**: [Show High-Level Architecture Diagram]
**Tech Stack**:
- **Frontend**: React.js (Responsive SPA), CSS3.
- **Backend**: Java Spring Boot (REST API).
- **Database**: MySQL (Relational Data).
- **Storage**: Cloudinary (Cloud Image Hosting).
- **Security**: Spring Security + JWT Authentication.

> **Speaker Notes**: We built a decoupled system. The React frontend communicates with the Spring Boot backend via RESTful APIs. We use MySQL for structured data like loans and users, but we offload heavy images to Cloudinary to ensure our application remains fast and scalable.

---

## Slide 4: Database Design (ERD)
**Visual**: [Display ERD Image]
**Key Entities**:
- **User**: Secure handling of customer data and roles.
- **PawnRequest**: The core entity tracking items from "Pending" to "Accepted".
- **Loan**: Represents the financial agreement created after validation.
- **Relationships**: A 1-to-1 relationship between a Pawn Request and a Loan ensures strict audit trails.

---

## Slide 5: Key Features - User
1.  **Digital Pawn Request**: Users upload photos and description (No estimation required).
2.  **Offer Management**: Users receive real-time admin offers and can Accept/Reject instantly.
3.  **Active Dashboard**: Track pawn status, due dates, and offers in one view.
4.  **Profile Avatar**: Personalized experience with image capability.

---

## Slide 6: Key Features - Admin
1.  **Assessment Hub**: Review photos and submit financial offers.
2.  **Validation & Payout**: One-click conversion of "Accepted" requests into "Active Loans" upon physical verify.
3.  **Loan Management**: Process payments (Redeem) or Forfeit overdue items.
4.  **Inventory**: Automatic listing of forfeited items.
5.  **User Management**: Ban/Unban logic for security.

---

## Slide 7: UI Demonstration (Screenshots)
**Visuals to Show**:
1.  **Login/Register**: Showing secure entry.
2.  **User Dashboard**: Showing "Active Pawns" & "Welcome" message.
3.  **Create Pawn**: The photo upload form.
4.  **Admin Assessment**: The "Make Offer" modal.
5.  **Admin Validate**: The table showing "Accepted" offers ready to be processed.

---

## Slide 8: Testing Summary
**Strategy**:
- **Unit Testing**: Verified critical Service logic (Calculations, State Transitions).
- **Integration Testing**: Tested API endpoints (Postman) to ensure Database <-> Backend connectivity.
- **User Acceptance**: Verified the "Happy Path" (Request -> Offer -> Accept -> Loan).
**Results**:
- 100% of Critical Workflows passed.
- Fixed major bugs regarding Image Uploads and Session State persistence.

---

## Slide 9: Challenges & Lessons Learned
**Challenge 1: Image Handling**
- *Issue*: Storing images in DB caused performance lag.
- *Solution*: Integrated **Cloudinary** for optimized CDN delivery.
**Challenge 2: State Synchronization**
- *Issue*: Dashboard wouldn't update after Profile changes.
- *Solution*: Implemented robust session storage updates and optimistic UI rendering.
**Lesson**: clear separation of concerns (Frontend vs Backend) makes debugging significantly easier.

---

## Slide 10: Conclusion
The ThriftShirt Pawnshop System successfully bridges the gap between digital convenience and physical security. It reduces in-store wait times by handling assessments online, providing a modern, efficient workflow for the pawn industry.

**Thank You! Q&A.**
