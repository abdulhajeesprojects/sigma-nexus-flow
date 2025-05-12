
// Import from the shadcn implementation
import { useToast as useShadcnToast } from "@/components/ui/toast";
import { toast as shadowToast } from "sonner";

// Re-export with our own implementation
export const useToast = useShadcnToast;
export const toast = shadowToast;

export default useToast;
