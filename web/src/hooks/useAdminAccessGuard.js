import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import useNotify from '../hooks/useNotify';

const useAdminAccessGuard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { notifyError } = useNotify();

    useEffect(() => {
        // Check if current path is an admin route
        if (location.pathname.startsWith('/admin')) {
            const userToken = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
            const isUserAuthenticated = apiService.auth.isAuthenticated();

            console.log('🔒 AdminAccessGuard triggered for:', location.pathname, {
                userToken: !!userToken,
                isUserAuthenticated
            });

            if (isUserAuthenticated || userToken) {
                console.log('🚫 BLOCKING admin route access from navigation guard');
                
                // Show immediate error
                notifyError('🚫 Unauthorized Access: Admin routes are blocked while logged in as a regular user!');
                
                // Redirect back to dashboard
                navigate('/dashboard?error=admin_access_denied', { replace: true });
            }
        }
    }, [location.pathname, navigate, notifyError]);
};

export default useAdminAccessGuard;