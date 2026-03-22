import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Lock, Shield, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  trigger?: React.ReactNode;
}

export default function PrivacySettingsModal({ trigger }: Props) {
  const [open, setOpen] = useState(false);

  const handleDeleteAccount = () => {
    const keysToDelete: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("doitepic_")) {
        keysToDelete.push(key);
      }
    }
    for (const k of keysToDelete) {
      localStorage.removeItem(k);
    }
    toast.success("Account deleted. Goodbye! 👋", { duration: 4000 });
    setOpen(false);
    setTimeout(() => window.location.reload(), 2000);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-muted-foreground"
            data-ocid="privacy.open_modal_button"
          >
            <Lock size={12} />
            Privacy & Data
          </Button>
        )}
      </SheetTrigger>
      <SheetContent
        className="w-full sm:max-w-md overflow-y-auto"
        data-ocid="privacy.sheet"
      >
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <Shield className="w-5 h-5 text-primary" />
            Your Data, Your Control
          </SheetTitle>
          <div className="flex items-center gap-2 mt-1">
            <Badge className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200">
              🔒 Secure & Private
            </Badge>
            <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200">
              ⛓️ Blockchain-backed
            </Badge>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          <section>
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              📋 What We Store
            </h3>
            <ul className="space-y-2">
              {[
                { icon: "👤", text: "Name & phone (for login only)" },
                { icon: "🍽️", text: "Food logs & daily check-ins" },
                { icon: "🎯", text: "Health goals & body metrics" },
                { icon: "🔥", text: "Streak history & points" },
              ].map((item) => (
                <li
                  key={item.text}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="text-base leading-none mt-0.5">
                    {item.icon}
                  </span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl p-4">
            <h3 className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Data Ownership
            </h3>
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              All your data is stored securely on the Internet Computer
              blockchain. Only you can access it — no third-party servers, no
              data selling, no advertisements based on your health data.
            </p>
          </section>

          <section>
            <h3 className="text-sm font-bold text-foreground mb-2">
              🛡️ Our Promise
            </h3>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>✅ We collect only what's needed for the app to work</li>
              <li>✅ No location tracking or device fingerprinting</li>
              <li>✅ No ads, ever</li>
              <li>✅ You can delete everything at any time</li>
            </ul>
          </section>

          <section className="border border-destructive/20 rounded-xl p-4 bg-destructive/5">
            <h3 className="text-sm font-bold text-destructive mb-2 flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Delete My Data
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Permanently remove your account and all associated health data.
              This action cannot be undone.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                  data-ocid="privacy.delete_button"
                >
                  <Trash2 size={14} />
                  Delete Account & All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent data-ocid="privacy.dialog">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account and all health
                    data including food logs, check-ins, goals, and streaks.
                    This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-ocid="privacy.cancel_button">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    data-ocid="privacy.confirm_button"
                  >
                    Yes, Delete Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
