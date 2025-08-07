import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, emailConfirmed, confirmEmail } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleConfirmEmail = async () => {
    try {
      const { error } = await confirmEmail();
      if (error) {
        toast({
          title: "Error",
          description: "Error al confirmar email: " + (error.message || error),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Éxito",
          description: "Email confirmado correctamente. Recargando página...",
        });
        // Recargar la página después de confirmar para que se actualice el estado
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error('Error confirming email:', error);
      toast({
        title: "Error",
        description: "Error inesperado al confirmar email",
        variant: "destructive",
      });
    }
  };

  // Auto-confirmar email si el usuario existe pero email no está confirmado
  useEffect(() => {
    if (user && !emailConfirmed && !loading) {
      // Pequeño delay para evitar conflictos con otros useEffect
      const timer = setTimeout(() => {
        handleConfirmEmail();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, emailConfirmed, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!emailConfirmed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Email no confirmado</h2>
            <p className="text-muted-foreground">
              Tu email aún no ha sido confirmado. Necesitas confirmar tu email para acceder a la plataforma.
            </p>
          </div>
          <button 
            onClick={handleConfirmEmail}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Confirmar Email
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;