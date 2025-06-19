import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface NavigationContextType {
  isNavigationRestricted: boolean;
  restrictNavigation: (reason?: string) => void;
  allowNavigation: () => void;
  restrictionReason: string;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: React.ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [isNavigationRestricted, setIsNavigationRestricted] = useState(false);
  const [restrictionReason, setRestrictionReason] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const restrictNavigation = (reason: string = 'Assessment in progress') => {
    setIsNavigationRestricted(true);
    setRestrictionReason(reason);
  };

  const allowNavigation = () => {
    setIsNavigationRestricted(false);
    setRestrictionReason('');
  };

  // Block browser navigation (back/forward buttons and page refresh)
  useEffect(() => {
    if (!isNavigationRestricted) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'You have an assessment in progress. Are you sure you want to leave?';
      return e.returnValue;
    };

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      toast({
        title: "Navigation Restricted",
        description: restrictionReason + ". Please complete your assessment first.",
        variant: "destructive",
      });
      // Push the current state back to prevent navigation
      window.history.pushState(null, '', location.pathname + location.search);
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    // Push current state to history to enable popstate detection
    window.history.pushState(null, '', location.pathname + location.search);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isNavigationRestricted, restrictionReason, location]);

  const value: NavigationContextType = {
    isNavigationRestricted,
    restrictNavigation,
    allowNavigation,
    restrictionReason,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
