import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageCircle, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useGetPublicReviews, useSubmitReview } from "../hooks/useQueries";

export default function ReviewSection() {
  const [tab, setTab] = useState<"review" | "question">("review");
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const { data: reviews = [], isLoading } = useGetPublicReviews();
  const { mutateAsync, isPending } = useSubmitReview();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    try {
      await mutateAsync({
        authorName: name.trim(),
        text: text.trim(),
        reviewType: tab,
      });
      toast.success(
        tab === "review" ? "Review submitted!" : "Question submitted!",
      );
      setName("");
      setText("");
    } catch {
      toast.error("Failed to submit. Please try again.");
    }
  };

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-foreground mb-1">
        Reviews &amp; Q&amp;A
      </h2>
      <p className="text-sm text-muted-foreground mb-5">
        Share your experience or ask us anything
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Submit form */}
        <div className="bg-card rounded-xl border border-border shadow-card p-5">
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setTab("review")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                tab === "review"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              ⭐ Leave a Review
            </button>
            <button
              type="button"
              onClick={() => setTab("question")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                tab === "question"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              ❓ Ask a Question
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label className="text-sm">Your Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label className="text-sm">
                {tab === "review" ? "Your Review" : "Your Question"}
              </Label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  tab === "review"
                    ? "Tell us about your experience with DoitEpic..."
                    : "What would you like to know?"
                }
                className="mt-1 min-h-[100px]"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={!name.trim() || !text.trim() || isPending}
              className="w-full hero-gradient text-white border-0 hover:opacity-90"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Submitting...
                </>
              ) : tab === "review" ? (
                "Submit Review"
              ) : (
                "Submit Question"
              )}
            </Button>
          </form>
        </div>

        {/* Reviews list */}
        <div className="bg-card rounded-xl border border-border shadow-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Community ({reviews.length})
          </h3>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No reviews yet. Be the first!
            </p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {[...reviews].reverse().map((r) => (
                <div
                  key={`${r.authorName}-${String(r.timestamp)}`}
                  className="p-3 rounded-lg bg-muted/50 border border-border"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {r.reviewType === "review" ? (
                      <Star
                        size={13}
                        className="text-yellow-500 fill-yellow-500"
                      />
                    ) : (
                      <MessageCircle size={13} className="text-primary" />
                    )}
                    <span className="text-xs font-semibold text-foreground">
                      {r.authorName}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        r.reviewType === "review"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}
                    >
                      {r.reviewType === "review" ? "Review" : "Question"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {r.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
