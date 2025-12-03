import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import useNotify from '../hooks/useNotify';

const AdminRouteProtection = ({ children }) => {
    const navigate = useNavigate();
    const { notifyError } = useNotify();
    
    // Immediate check - block before component renders
    const userToken = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    const isUserAuthenticated = apiService.auth.isAuthenticated();
    
    console.log('AdminRouteProtection check:', {
        userToken: !!userToken,
        isUserAuthenticated,
        blockingAccess: isUserAuthenticated || !!userToken
    });
    
    // If user is authenticated, block access immediately
    if (isUserAuthenticated || userToken) {
        console.log('🚫 AdminRouteProtection: BLOCKING admin access - user is authenticated');
        
        // Show error and redirect immediately
        useEffect(() => {
            const blockAccess = async () => {
                // Show error notification immediately
                notifyError('🚫 Access Denied: Cannot access admin portal while logged in as a regular user!');
                
                try {
                    // Also validate with backend
                    await apiService.auth.checkAdminAccess();
                } catch (error) {
                    console.log('✅ Backend confirmed: Admin access blocked', error.message);
                }
                
                // Redirect back to dashboard with error parameter
                setTimeout(() => {
                    console.log('🔄 Redirecting to dashboard...');
                    navigate('/dashboard?error=admin_access_denied', { replace: true });
                }, 2000);
            };
            
            blockAccess();
        }, [navigate, notifyError]);
        
        // Return access denied screen
        return (
            <div className="auth-page">
                <div className="auth-header-section">
                    <div className="logo-container">
                        <div className="logo-circle">
                            <svg className="person-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="15" y1="9" x2="9" y2="15"/>
                                <line x1="9" y1="9" x2="15" y2="15"/>
                            </svg>
                        </div>
                        <h1 className="business-name">Thrift Shirt Pawnshop</h1>
                        <p className="business-tagline">& Lending Service - Access Denied</p>
                    </div>
                </div>

                <div className="auth-content-section">
                    <div className="auth-form-card">
                        <div className="access-denied-content">
                            <div className="access-denied-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="15" y1="9" x2="9" y2="15"/>
                                    <line x1="9" y1="9" x2="15" y2="15"/>
                                </svg>
                            </div>
                            <h2>Access Denied</h2>
                            <p>You cannot access admin areas while logged in as a regular user.</p>
                            <p>Redirecting to login page...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // If no user is logged in, allow access to admin routes
    return children;
};

export default AdminRouteProtection;