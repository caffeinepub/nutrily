import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveUserProfile } from "../hooks/useQueries";

export default function ProfileSetup() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const { mutateAsync, isPending } = useSaveUserProfile();

  const isValid =
    name.trim().length > 0 &&
    phone.trim().length > 0 &&
    weightKg.trim().length > 0 &&
    heightCm.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    try {
      await mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
        weightKg: Number.parseFloat(weightKg),
        heightCm: Number.parseFloat(heightCm),
      });
      toast.success("Profile saved! Welcome to DOITEPIC.");
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
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-foreground">DOITEPIC</span>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-1 text-center">
          Set Up Your Profile
        </h2>
        <p className="text-sm text-muted-foreground mb-6 text-center">
          Fill in your details to get started
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Full Name
            </Label>
            <Input
              data-ocid="profile.input"
              id="name"
              placeholder="e.g. Arun Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 h-10"
              autoFocus
              autoComplete="name"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number
            </Label>
            <Input
              data-ocid="profile.phone_input"
              id="phone"
              type="tel"
              inputMode="numeric"
              placeholder="e.g. +91 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 h-10"
              autoComplete="tel"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="weight" className="text-sm font-medium">
                Weight (kg)
              </Label>
              <Input
                data-ocid="profile.weight_input"
                id="weight"
                type="number"
                inputMode="decimal"
                min="20"
                max="300"
                step="0.1"
                placeholder="e.g. 65"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="mt-1 h-10"
              />
            </div>
            <div>
              <Label htmlFor="height" className="text-sm font-medium">
                Height (cm)
              </Label>
              <Input
                data-ocid="profile.height_input"
                id="height"
                type="number"
                inputMode="decimal"
                min="100"
                max="250"
                step="0.1"
                placeholder="e.g. 170"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="mt-1 h-10"
              />
            </div>
          </div>

          <Button
            data-ocid="profile.submit_button"
            type="submit"
            disabled={!isValid || isPending}
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
