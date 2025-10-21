# Thrift Shirt Pawnshop & Lending System

The **Thrift Shirt Pawnshop & Lending System** is a comprehensive cross-platform solution designed to digitize pawnshop operations and streamline the thrift resale business. 

This modern system enables customers to:
- Upload item photos through a Kotlin Android mobile app
- Receive real-time digital appraisal updates
- Track loan due dates and payment schedules
- Browse and purchase items from the thrift catalog

**Key Features:**
- **Digital Loan Management**: Secure loan processing with automated due-date enforcement
- **Smart Inventory System**: Items not redeemed after the loan period are automatically moved to resale inventory
- **Administrative Dashboard**: ReactJS-powered interface for staff to manage customer profiles, loan records, and item listings
- **Robust Backend**: Spring Boot ensures reliable transaction logging and data security
- **Flexible Database**: Integrated with Supabase or MySQL for scalable data management

This solution modernizes traditional pawnshop operations by increasing customer transparency, streamlining administrative processes, and creating additional revenue streams through automated digital resale and penalty management.

## Tech Stack Used

| Component | Technology |
|-----------|------------|
| **Mobile** | Kotlin (Android) |
| **Web** | ReactJS |
| **Backend** | Spring Boot (Java) |
| **Database** | MySQL / Supabase |
| **APIs** | Firebase Cloud Messaging, Google Maps API, Gmail API |

## Setup & Run Instructions

### 🖥️ Backend (Spring Boot)

**Prerequisites**: Java 17+, Maven

```bash
cd backend
# Configure database connection in application.properties
mvn clean install
mvn spring-boot:run
```

**Server will run on**: `http://localhost:8080`

### 🌐 Web (ReactJS)

**Prerequisites**: Node.js 16+, npm

```bash
cd web
npm install
npm run dev
```

**Application will run on**: `http://localhost:3000`

### 📱 Mobile (Kotlin)

**Prerequisites**: Android Studio, Android SDK

1. **Open** Android Studio
2. **Import** the `/mobile` folder as an existing project  
3. **Sync** project with Gradle files
4. **Configure** API endpoints in app configuration
5. **Build and run** on emulator or physical device

## Team Members

| Name | Role | CIT-U Email | GitHub |
|------|------|-------------|---------|
| **Nicolo Francis L. Gabiana** | Project Manager / Developer | nicolofrancis.gabiana@cit.edu | [@NFGab](https://github.com/NFGab) |
| **Dale Christian C. Fortaleza** | Developer | dalechristian.fortaleza@cit.edu | [@daley2](https://github.com/daley2) |
| **Mark Christian Q. Garing** | Developer | markchristian.garing@cit.edu | [@k4iisel](https://github.com/k4iisel) |
| **Kaysean Miel** | Developer | kaysean.miel@cit.edu | [@kayseanmiel](https://github.com/kayseanmiel) |

## Deployed Link

*Deployment links will be added here once the applications are deployed to production.*

**🚀 Production URLs:**
- **Backend API**: TBD  
- **Web Application**: TBD  
- **Mobile APK**: TBD

**📋 Recommended Deployment Platforms:**
- **Backend**: Railway, Render, or Heroku
- **Web Frontend**: Netlify, Vercel, or Firebase Hosting  
- **Mobile**: Google Play Store or direct APK distribution