import { toast as shadowToast } from "sonner";

// Re-export directly from sonner
export { toast } from "sonner";

// Keep basic toast utility function for compatibility
export const useToast = () => {
  return {
    toast: shadowToast,
    dismiss: (toastId?: string) => {
      if (toastId) shadowToast.dismiss(toastId);
      else shadowToast.dismiss();
    },
    toasts: [] as any[]
  };
};

export default useToast;
