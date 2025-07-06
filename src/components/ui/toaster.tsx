
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { Download, Check, AlertCircle } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  const getToastIcon = (variant?: string) => {
    switch (variant) {
      case "destructive":
        return <AlertCircle className="h-5 w-5 text-destructive" />
      case "success":
        return <Check className="h-5 w-5 text-green-500" />
      case "download":
        return <Download className="h-5 w-5 text-blue-500" />
      default:
        return null
    }
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, variant, action, ...props }) {
        return (
          <Toast key={id} variant={variant} className="pointer-events-auto" {...props}>
            <div className="flex">
              {getToastIcon(variant) && (
                <div className="flex items-center mr-3">
                  {getToastIcon(variant)}
                </div>
              )}
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
