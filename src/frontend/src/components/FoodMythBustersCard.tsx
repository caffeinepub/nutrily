import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const MYTHS = [
  {
    id: "m1",
    myth: "Coconut oil causes heart disease",
    icon: "🥥",
    fact: "Studies show virgin coconut oil raises HDL (good cholesterol). Kerala's traditional use of coconut oil in moderation is associated with lower heart disease rates. It's the quantity and context that matter.",
  },
  {
    id: "m2",
    myth: "Rice makes you fat",
    icon: "🍚",
    fact: "Matta rice (Kerala red rice) is high in fiber, vitamins, and minerals. Overeating causes weight gain — not rice itself. Pair rice with protein (fish, egg, kadala) and vegetables for a balanced meal.",
  },
  {
    id: "m3",
    myth: "Eating after 8 PM always turns to fat",
    icon: "🌙",
    fact: "Total daily calories matter more than timing. However, late heavy meals can disrupt sleep and digestion. A light dinner by 8 PM is good practice — but occasional late eating won't ruin your progress.",
  },
  {
    id: "m4",
    myth: "Skipping breakfast helps lose weight",
    icon: "🌅",
    fact: "Skipping breakfast often leads to overeating later and blood sugar swings. A Kerala breakfast of puttu or idli with kadala curry is actually metabolically excellent — low GI and high fiber.",
  },
  {
    id: "m5",
    myth: "Tender coconut water is just sugar water",
    icon: "🫗",
    fact: "Tender coconut water contains potassium, magnesium, and natural electrolytes. With only 5g sugar per 100ml vs 10–12g in fruit juice, it's one of the best natural hydration sources available in Kerala.",
  },
];

export default function FoodMythBustersCard() {
  return (
    <div
      className="bg-card rounded-xl border border-border p-4"
      data-ocid="myths.card"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">💥</span>
        <div>
          <p className="text-sm font-bold text-foreground">Food Myth Busters</p>
          <p className="text-xs text-muted-foreground">
            Kerala diet truths you need to know
          </p>
        </div>
      </div>
      <Accordion type="single" collapsible className="space-y-1">
        {MYTHS.map((m) => (
          <AccordionItem
            key={m.id}
            value={m.id}
            className="border border-border rounded-lg px-3 data-[state=open]:border-primary/40"
            data-ocid="myths.panel"
          >
            <AccordionTrigger className="text-sm py-2.5 hover:no-underline">
              <div className="flex items-center gap-2 text-left">
                <span>{m.icon}</span>
                <span className="font-medium">
                  <span className="text-red-500">Myth:</span>{" "}
                  <span className="text-foreground">{m.myth}</span>
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-3">
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold flex-shrink-0">
                  ✓ Fact:
                </span>
                <span>{m.fact}</span>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
