import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { useSearchFood } from "../../hooks/useQueries";
import type { FoodItem } from "../../types";

interface Props {
  allFoods: FoodItem[];
  onFoodSelect: (food: FoodItem) => void;
  onAddToLog: (food: FoodItem) => void;
}

const FEATURED = [
  "Idli Plain",
  "Chicken Biryani",
  "Puttu Rice",
  "Kerala Matta Rice",
  "Avial",
  "Dosa Plain",
];

export default function FoodSearchCard({
  allFoods,
  onFoodSelect,
  onAddToLog,
}: Props) {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const { data: results = [], isFetching } = useSearchFood(submitted);

  const featuredFoods = allFoods
    .filter((f) =>
      FEATURED.some((n) => f.name.toLowerCase().includes(n.toLowerCase())),
    )
    .slice(0, 4);
  const displayFeatured =
    featuredFoods.length > 0 ? featuredFoods : allFoods.slice(0, 4);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(query);
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Food Search
      </h3>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <Input
          data-ocid="food_search.search_input"
          placeholder="Search 300+ Indian foods..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-9 text-sm"
        />
        <Button
          data-ocid="food_search.submit_button"
          type="submit"
          size="sm"
          className="h-9 px-3 hero-gradient text-white border-0 hover:opacity-90 flex-shrink-0"
        >
          <Search size={14} />
        </Button>
      </form>

      {submitted && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {isFetching ? "Searching..." : `Results (${results.length})`}
          </p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {results.map((food) => (
              <FoodRow
                key={food.name}
                food={food}
                onSelect={onFoodSelect}
                onAdd={onAddToLog}
              />
            ))}
            {!isFetching && results.length === 0 && (
              <p
                data-ocid="food_search.empty_state"
                className="text-xs text-muted-foreground py-2"
              >
                No foods found
              </p>
            )}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Featured Foods
        </p>
        <div className="space-y-1">
          {displayFeatured.map((food) => (
            <FoodRow
              key={food.name}
              food={food}
              onSelect={onFoodSelect}
              onAdd={onAddToLog}
            />
          ))}
          {displayFeatured.length === 0 && (
            <p
              data-ocid="food_search.featured.empty_state"
              className="text-xs text-muted-foreground py-2"
            >
              No foods in database yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function FoodRow({
  food,
  onSelect,
  onAdd,
}: {
  food: FoodItem;
  onSelect: (f: FoodItem) => void;
  onAdd: (f: FoodItem) => void;
}) {
  return (
    <div className="flex items-center gap-2 py-1.5 hover:bg-muted rounded-lg px-1.5 group">
      <button
        type="button"
        className="flex-1 flex items-center gap-2 min-w-0 text-left"
        onClick={() => onSelect(food)}
      >
        <div className="w-7 h-7 rounded bg-accent flex items-center justify-center text-xs flex-shrink-0">
          🥦
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground truncate">
            {food.name}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {Math.round(food.caloriesPer100g)} kcal/100g
          </p>
        </div>
      </button>
      <button
        type="button"
        onClick={() => onAdd(food)}
        className="text-[10px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded bg-accent flex-shrink-0"
      >
        + Log
      </button>
    </div>
  );
}
