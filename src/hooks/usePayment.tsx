import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PaymentContextType {
  hasPaymentMethod: boolean;
  loading: boolean;
  checkPaymentMethod: () => Promise<void>;
  setupPaymentMethod: () => Promise<void>;
  refreshPaymentStatus: () => Promise<void>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export const PaymentProvider = ({ children }: { children: React.ReactNode }) => {
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, session } = useAuth();

  const checkPaymentMethod = async () => {
    if (!user || !session) {
      setHasPaymentMethod(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-payment-method', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking payment method:', error);
        setHasPaymentMethod(false);
      } else {
        setHasPaymentMethod(data?.hasPaymentMethod || false);
      }
    } catch (error) {
      console.error('Error checking payment method:', error);
      setHasPaymentMethod(false);
    } finally {
      setLoading(false);
    }
  };

  const setupPaymentMethod = async () => {
    if (!user || !session) return;

    try {
      const { data, error } = await supabase.functions.invoke('setup-payment-method', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        // Open Stripe setup in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error setting up payment method:', error);
      throw error;
    }
  };

  const refreshPaymentStatus = async () => {
    setLoading(true);
    await checkPaymentMethod();
  };

  useEffect(() => {
    // Check payment method status when user changes
    if (user) {
      checkPaymentMethod();
    } else {
      setHasPaymentMethod(false);
      setLoading(false);
    }
  }, [user, session]);

  // Listen for URL parameters to refresh status after setup
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment_setup') === 'success') {
      // Remove the parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Refresh payment status
      setTimeout(refreshPaymentStatus, 1000);
    }
  }, []);

  const value = {
    hasPaymentMethod,
    loading,
    checkPaymentMethod,
    setupPaymentMethod,
    refreshPaymentStatus,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};