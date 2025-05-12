
// Import from sonner directly
import { toast } from "sonner";

// Re-export for compatibility with existing code
export { toast };

// Simple useToast wrapper for compatibility 
export const useToast = () => {
  return {
    toast,
    dismiss: (toastId?: string) => {
      if (toastId) toast.dismiss(toastId);
      else toast.dismiss();
    }
  };
};

export default useToast;
