import { useToast as useToastOriginal } from "@/components/ui/toast";

export function useToast() {
  const toast = useToastOriginal();

  return {
    toast: ({
      title,
      description,
      variant,
    }: {
      title: string;
      description?: string;
      variant?: "success" | "error" | "warning" | "info" | "destructive";
    }) => {
      // Map "destructive" to "error" for compatibility
      const mappedVariant = variant === "destructive" ? "error" : variant || "info";
      toast.addToast({
        title,
        description,
        variant: mappedVariant,
      });
    },
  };
}
