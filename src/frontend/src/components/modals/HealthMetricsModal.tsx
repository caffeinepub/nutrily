import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useLogHealthMetrics,
  useTodayHealthMetrics,
} from "../../hooks/useQueries";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function HealthMetricsModal({ open, onClose }: Props) {
  const { data: existing } = useTodayHealthMetrics();
  const { mutateAsync, isPending } = useLogHealthMetrics();

  const [weight, setWeight] = useState("");
  const [steps, setSteps] = useState("");
  const [heartRate, setHeartRate] = useState("");

  const handleOpen = () => {
    if (existing) {
      setWeight(String(existing.weight));
      setSteps(String(existing.steps));
      setHeartRate(String(existing.heartRate));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutateAsync({
        weight: Number(weight),
        steps: BigInt(steps || "0"),
        heartRate: Number(heartRate),
        timestamp: BigInt(Date.now()) * 1_000_000n,
      });
      toast.success("Health metrics saved!");
      onClose();
    } catch {
      toast.error("Failed to save metrics.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v) handleOpen();
        else onClose();
      }}
    >
      <DialogContent data-ocid="health_metrics.dialog" className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Update Health Metrics</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm">Weight (kg)</Label>
            <Input
              data-ocid="health_metrics.weight_input"
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g. 74.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm">Steps Today</Label>
            <Input
              data-ocid="health_metrics.steps_input"
              type="number"
              min="0"
              placeholder="e.g. 8500"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm">Heart Rate (bpm)</Label>
            <Input
              data-ocid="health_metrics.heart_rate_input"
              type="number"
              min="0"
              placeholder="e.g. 72"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              className="mt-1"
            />
          </div>

          <DialogFooter>
            <Button
              data-ocid="health_metrics.cancel_button"
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              data-ocid="health_metrics.submit_button"
              type="submit"
              disabled={isPending}
              className="hero-gradient text-white border-0 hover:opacity-90"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Metrics"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
