
import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
  action?: React.ReactNode;
};

export const toast = (props: ToastProps | string) => {
  if (typeof props === "string") {
    return sonnerToast(props);
  }
  
  const { title, description, variant, duration, action } = props;
  
  if (variant === "destructive") {
    return sonnerToast.error(title, {
      description,
      duration,
      action,
    });
  }

  return sonnerToast(title, {
    description,
    duration,
    action,
  });
};

export const useToast = () => {
  return {
    toast,
    dismiss: (toastId?: string) => {
      if (toastId) sonnerToast.dismiss(toastId);
      else sonnerToast.dismiss();
    },
    toasts: [] as any[]
  };
};

export default useToast;
