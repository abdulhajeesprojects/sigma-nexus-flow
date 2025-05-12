
// Import from the shadcn implementation
import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast";
import { toast as shadowToast } from "sonner";

const TOAST_LIMIT = 10;
const TOAST_REMOVE_DELAY = 1000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;
const toasts: ToasterToast[] = [];

const useToast = () => {
  return {
    toast: ({ ...props }: Omit<ToasterToast, "id">) => {
      const id = String(Date.now());
      shadowToast(props.title as string, {
        id,
        description: props.description,
        variant: props.variant,
      });
      return { id };
    },
    dismiss: (toastId?: string) => {
      shadowToast.dismiss(toastId);
    },
    toasts: [] as ToasterToast[],
  };
};

// Re-export with our own implementation
export { useToast, shadowToast as toast };

export default useToast;
