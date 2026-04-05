import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSubmitPublicFoodWish } from "../hooks/useQueries";

const CATEGORIES = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snack",
  "Drinks",
  "Kerala Special",
  "Nuts & Seeds",
  "Dairy",
  "Other",
];

function getStoredUser(): { name: string; phone: string } {
  try {
    const raw = localStorage.getItem("doitepic_user");
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        name: parsed.name ?? "",
        phone: parsed.username ?? parsed.phone ?? "",
      };
    }
  } catch {
    // ignore
  }
  return { name: "", phone: "" };
}

export default function SuggestFoodModal() {
  const [open, setOpen] = useState(false);
  const { mutateAsync: submitWish, isPending } = useSubmitPublicFoodWish();

  const storedUser = getStoredUser();
  const [foodName, setFoodName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [reason, setReason] = useState("");
  const [submitterName, setSubmitterName] = useState(storedUser.name);
  const [submitterPhone, setSubmitterPhone] = useState(storedUser.phone);

  const resetForm = () => {
    setFoodName("");
    setCategory("");
    setDescription("");
    setReason("");
    const u = getStoredUser();
    setSubmitterName(u.name);
    setSubmitterPhone(u.phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) {
      toast.error("Please enter a food name.");
      return;
    }
    if (!category) {
      toast.error("Please select a category.");
      return;
    }
    try {
      await submitWish({
        submitterName: submitterName.trim(),
        submitterPhone: submitterPhone.trim(),
        foodName: foodName.trim(),
        category,
        description: description.trim(),
        reason: reason.trim(),
      });
      toast.success("Your suggestion has been sent! 🎉");
      resetForm();
      setOpen(false);
    } catch {
      toast.error("Failed to submit suggestion. Please try again.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) {
          const u = getStoredUser();
          setSubmitterName(u.name);
          setSubmitterPhone(u.phone);
        }
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          data-ocid="food_log.suggest_food.open_modal_button"
          className="w-full flex items-center justify-center gap-2 py-2.5 mt-2 rounded-xl border-2 border-dashed border-amber-400/40 text-amber-500 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-sm font-medium transition-all group"
        >
          <Lightbulb
            size={15}
            className="group-hover:scale-110 transition-transform"
          />
          Suggest a Food
        </button>
      </DialogTrigger>

      <DialogContent
        className="max-w-md w-full rounded-2xl"
        data-ocid="food_log.suggest_food.modal"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <span className="text-2xl">💡</span>
            Suggest a Food
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Can't find a food? Tell us and we'll add it to the database!
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="suggest-food-name"
              className="text-sm font-semibold"
            >
              Food Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="suggest-food-name"
              data-ocid="food_log.suggest_food.input"
              placeholder="e.g. Malabar Biryani, Chakka Varatt…"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger data-ocid="food_log.suggest_food.select">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="suggest-food-desc"
              className="text-sm font-semibold"
            >
              Description{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="suggest-food-desc"
              data-ocid="food_log.suggest_food.textarea"
              placeholder="Describe the food, ingredients, how it's made…"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="suggest-food-reason"
              className="text-sm font-semibold"
            >
              Why should we add it?{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="suggest-food-reason"
              placeholder="Tell us why this food matters to you…"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="suggest-name" className="text-sm font-semibold">
                Your Name
              </Label>
              <Input
                id="suggest-name"
                placeholder="Name"
                value={submitterName}
                onChange={(e) => setSubmitterName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="suggest-phone" className="text-sm font-semibold">
                Phone
              </Label>
              <Input
                id="suggest-phone"
                placeholder="Phone"
                value={submitterPhone}
                onChange={(e) => setSubmitterPhone(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            data-ocid="food_log.suggest_food.submit_button"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white font-semibold"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {isPending ? "Sending…" : "Send Suggestion"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
