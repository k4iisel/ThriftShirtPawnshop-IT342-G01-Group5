# Authentication Setup Guide

## Overview
This document provides instructions for setting up and using the login and register pages for the Pawn/Thrift Shop web application.

## Installation

### 1. Install Dependencies
First, you need to install the required dependency for routing:

```bash
npm install react-router-dom
```

**Note:** If you encounter PowerShell execution policy errors, you can:
- Run PowerShell as Administrator and execute: `Set-ExecutionPolicy RemoteSigned`
- Or use Command Prompt instead of PowerShell
- Or run: `npm install react-router-dom --force`

### 2. Start the Development Server
```bash
npm run dev
```

## Features Implemented

### Login Page (`/login`)
- **Email validation**: Checks for valid email format
- **Password validation**: Minimum 6 characters required
- **Show/Hide password**: Toggle visibility
- **Remember me**: Checkbox for persistent login (UI only)
- **Forgot password**: Link to password recovery (placeholder)
- **Navigation**: Link to registration page
- **Form validation**: Real-time error messages
- **Responsive design**: Mobile-friendly layout

### Register Page (`/register`)
- **Multi-field form**:
  - First Name
  - Last Name
  - Email Address
  - Phone Number
  - Password
  - Confirm Password
- **Comprehensive validation**:
  - Required field checks
  - Email format validation
  - Phone number format validation
  - Password strength check (minimum 6 characters)
  - Password confirmation matching
  - Terms and conditions agreement
- **Show/Hide password**: Toggle for both password fields
- **Terms acceptance**: Required checkbox with links
- **Navigation**: Link to login page
- **Responsive design**: Adapts to all screen sizes

## File Structure

```
web/
├── src/
│   ├── pages/
│   │   ├── Login.jsx          # Login page component
│   │   └── Register.jsx       # Register page component
│   ├── styles/
│   │   └── Auth.css           # Shared authentication styles
│   ├── App.jsx                # Main app with routing
│   └── main.jsx               # Entry point
└── package.json
```

## Routes

- `/` - Redirects to `/login`
- `/login` - Login page
- `/register` - Registration page

## Design Features

### Visual Design
- **Gradient background**: Purple gradient (from #667eea to #764ba2)
- **Card-based layout**: Clean white cards with shadow
- **Smooth animations**: Slide-up animation on page load
- **Modern UI**: Rounded corners, proper spacing, and typography

### UX Features
- **Real-time validation**: Errors appear as users type
- **Clear error messages**: Specific feedback for each field
- **Accessible forms**: Proper labels and ARIA attributes
- **Password visibility toggle**: User-friendly password input
- **Responsive design**: Works on desktop, tablet, and mobile

## Next Steps (Backend Integration)

To connect these pages to your backend:

1. **Update the `handleSubmit` functions** in both `Login.jsx` and `Register.jsx`
2. **Replace the TODO comments** with actual API calls
3. **Example for Login**:
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (validateForm()) {
    try {
      const response = await fetch('http://your-backend-url/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store token, redirect to dashboard
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        // Handle error
        setErrors({ general: data.message });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'An error occurred. Please try again.' });
    }
  }
};
```

4. **Example for Register**:
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (validateForm()) {
    try {
      const response = await fetch('http://your-backend-url/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Redirect to login or auto-login
        navigate('/login');
      } else {
        // Handle error
        setErrors({ general: data.message });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'An error occurred. Please try again.' });
    }
  }
};
```

## Customization

### Colors
To change the color scheme, edit `src/styles/Auth.css`:
- Background gradient: `.auth-container` background property
- Primary button: `.btn-primary` background property
- Links and accents: `.auth-link`, `.inline-link`, `.forgot-password` color properties

### Validation Rules
To modify validation rules, edit the `validateForm()` function in each component:
- Password length: Change the number in `formData.password.length < 6`
- Email pattern: Modify the regex in `!/\S+@\S+\.\S+/.test(formData.email)`
- Phone pattern: Modify the regex in `!/^[\d\s\-\+\(\)]+$/.test(formData.phone)`

## Troubleshooting

### Issue: Routes not working
**Solution**: Make sure `react-router-dom` is installed: `npm install react-router-dom`

### Issue: Styles not loading
**Solution**: Check that `Auth.css` is properly imported in both Login.jsx and Register.jsx

### Issue: PowerShell execution policy error
**Solution**: Use Command Prompt or run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy RemoteSigned
```

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility
- Semantic HTML elements
- Proper form labels
- ARIA attributes for password toggles
- Keyboard navigation support
- Focus indicators
- Error announcements

## Security Considerations
- Passwords are never logged or displayed
- Form data is validated client-side before submission
- HTTPS should be used in production
- Implement CSRF protection on backend
- Use secure password hashing on backend (bcrypt, argon2)
- Implement rate limiting for login attempts
- Add email verification for new accounts
