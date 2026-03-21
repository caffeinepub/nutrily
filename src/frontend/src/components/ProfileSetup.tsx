import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveUserProfile } from "../hooks/useQueries";

export default function ProfileSetup() {
  const [name, setName] = useState("");
  const { mutateAsync, isPending } = useSaveUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await mutateAsync({ name: name.trim() });
      toast.success("Profile saved! Welcome to Nutrily.");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-10"
      >
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl hero-gradient flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-foreground">Nutrily</span>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-1 text-center">
          Set Up Your Profile
        </h2>
        <p className="text-sm text-muted-foreground mb-6 text-center">
          Just one more step to get started
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Your Name
            </Label>
            <Input
              data-ocid="profile.input"
              id="name"
              placeholder="e.g. Alex R."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 h-10"
              autoFocus
            />
          </div>
          <Button
            data-ocid="profile.submit_button"
            type="submit"
            disabled={!name.trim() || isPending}
            className="w-full h-11 rounded-full hero-gradient text-white font-semibold border-0 hover:opacity-90"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Get Started"
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
