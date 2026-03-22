import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Principal } from "@icp-sdk/core/principal";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Database,
  Droplets,
  Dumbbell,
  FileText,
  Globe,
  Moon,
  Pencil,
  Phone,
  Ruler,
  Salad,
  Scale,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type {
  DailyCheckIn,
  FoodItem,
  FoodSuggestion,
  UserProfile,
} from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddFoodItem,
  useAllFoodItems,
  useAllUsers,
  useAllUsersCheckIns,
  useApproveFoodSuggestion,
  useDeleteFoodItem,
  usePendingFoodSuggestions,
  useRejectFoodSuggestion,
  useUpdateFoodItem,
} from "../hooks/useQueries";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const REGIONS = [
  "Kerala",
  "South India",
  "North India",
  "Chinese",
  "Arabian",
  "Global",
  "Other",
];

const EMPTY_FOOD: FoodItem = {
  name: "",
  category: "",
  region: "Global",
  caloriesPer100g: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
  servingSize: 100,
  servingUnit: "g",
};

// ─── Food Form Dialog ─────────────────────────────────────────────────────────

function FoodFormDialog({
  open,
  onClose,
  initialData,
  mode,
  onSave,
  isSaving,
}: {
  open: boolean;
  onClose: () => void;
  initialData: FoodItem;
  mode: "add" | "edit";
  onSave: (food: FoodItem) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<FoodItem>(initialData);

  // Reset when dialog opens with new data
  const prevOpen = useRef(false);
  if (open && !prevOpen.current) {
    prevOpen.current = true;
    if (JSON.stringify(form) !== JSON.stringify(initialData)) {
      setForm(initialData);
    }
  }
  if (!open && prevOpen.current) {
    prevOpen.current = false;
  }

  const set = (field: keyof FoodItem, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const num = (v: string) => Number.parseFloat(v) || 0;

  const handleSave = () => {
    if (!form.name.trim() || !form.category.trim()) {
      toast.error("Name and category are required.");
      return;
    }
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="bg-gray-900 border-gray-700 text-white max-w-lg max-h-[90vh] overflow-y-auto"
        data-ocid="admin.food.dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-white">
            {mode === "add" ? "Add New Food Item" : "Edit Food Item"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-gray-300 text-xs">Food Name *</Label>
              <Input
                data-ocid="admin.food.input"
                className="bg-gray-800 border-gray-600 text-white mt-1"
                placeholder="e.g. Chicken Breast"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-gray-300 text-xs">Category *</Label>
              <Input
                className="bg-gray-800 border-gray-600 text-white mt-1"
                placeholder="e.g. Protein"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-gray-300 text-xs">Region</Label>
              <Select
                value={form.region}
                onValueChange={(v) => set("region", v)}
              >
                <SelectTrigger
                  className="bg-gray-800 border-gray-600 text-white mt-1"
                  data-ocid="admin.food.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {REGIONS.map((r) => (
                    <SelectItem
                      key={r}
                      value={r}
                      className="text-white hover:bg-gray-700"
                    >
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-300 text-xs">Calories / 100g</Label>
              <Input
                className="bg-gray-800 border-gray-600 text-white mt-1"
                type="number"
                min="0"
                value={form.caloriesPer100g}
                onChange={(e) => set("caloriesPer100g", num(e.target.value))}
              />
            </div>
            <div>
              <Label className="text-gray-300 text-xs">Protein (g)</Label>
              <Input
                className="bg-gray-800 border-gray-600 text-white mt-1"
                type="number"
                min="0"
                step="0.1"
                value={form.protein}
                onChange={(e) => set("protein", num(e.target.value))}
              />
            </div>
            <div>
              <Label className="text-gray-300 text-xs">Carbs (g)</Label>
              <Input
                className="bg-gray-800 border-gray-600 text-white mt-1"
                type="number"
                min="0"
                step="0.1"
                value={form.carbs}
                onChange={(e) => set("carbs", num(e.target.value))}
              />
            </div>
            <div>
              <Label className="text-gray-300 text-xs">Fat (g)</Label>
              <Input
                className="bg-gray-800 border-gray-600 text-white mt-1"
                type="number"
                min="0"
                step="0.1"
                value={form.fat}
                onChange={(e) => set("fat", num(e.target.value))}
              />
            </div>
            <div>
              <Label className="text-gray-300 text-xs">Fiber (g)</Label>
              <Input
                className="bg-gray-800 border-gray-600 text-white mt-1"
                type="number"
                min="0"
                step="0.1"
                value={form.fiber}
                onChange={(e) => set("fiber", num(e.target.value))}
              />
            </div>
            <div>
              <Label className="text-gray-300 text-xs">Sugar (g)</Label>
              <Input
                className="bg-gray-800 border-gray-600 text-white mt-1"
                type="number"
                min="0"
                step="0.1"
                value={form.sugar}
                onChange={(e) => set("sugar", num(e.target.value))}
              />
            </div>
            <div>
              <Label className="text-gray-300 text-xs">Serving Size</Label>
              <Input
                className="bg-gray-800 border-gray-600 text-white mt-1"
                type="number"
                min="1"
                value={form.servingSize}
                onChange={(e) => set("servingSize", num(e.target.value))}
              />
            </div>
            <div>
              <Label className="text-gray-300 text-xs">Serving Unit</Label>
              <Input
                className="bg-gray-800 border-gray-600 text-white mt-1"
                placeholder="g / piece / cup"
                value={form.servingUnit}
                onChange={(e) => set("servingUnit", e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            data-ocid="admin.food.cancel_button"
            variant="outline"
            onClick={onClose}
            className="border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            data-ocid="admin.food.save_button"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSaving
              ? "Saving..."
              : mode === "add"
                ? "Add Food"
                : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Users Tab ───────────────────────────────────────────────────────────────

function CheckInRow({
  checkIn,
  index,
}: { checkIn: DailyCheckIn; index: number }) {
  return (
    <TableRow data-ocid={`admin.checkin.item.${index + 1}`}>
      <TableCell className="text-xs font-medium">{checkIn.date}</TableCell>
      <TableCell
        className="text-xs max-w-[160px] truncate"
        title={checkIn.dietNotes}
      >
        {checkIn.dietNotes || <span className="text-gray-500">—</span>}
      </TableCell>
      <TableCell
        className="text-xs max-w-[160px] truncate"
        title={checkIn.exercisesDone}
      >
        {checkIn.exercisesDone || <span className="text-gray-500">—</span>}
      </TableCell>
      <TableCell className="text-xs text-center">
        <span className="flex items-center gap-1 justify-center">
          <Droplets className="w-3 h-3 text-blue-500" />
          {Number(checkIn.waterGlasses)}
        </span>
      </TableCell>
      <TableCell className="text-xs text-center">
        <span className="flex items-center gap-1 justify-center">
          <Moon className="w-3 h-3 text-indigo-400" />
          {checkIn.sleepHours}h
        </span>
      </TableCell>
    </TableRow>
  );
}

function UserCard({
  principal,
  profile,
  checkIns,
  index,
}: {
  principal: Principal;
  profile: UserProfile | undefined;
  checkIns: DailyCheckIn[];
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const sorted = [...checkIns].sort((a, b) => b.date.localeCompare(a.date));
  const latest = sorted[0];
  const pid = principal.toString();
  const shortPid = `${pid.slice(0, 8)}...${pid.slice(-4)}`;

  return (
    <Card
      className="bg-gray-900 border-gray-800"
      data-ocid={`admin.user.item.${index + 1}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2 text-white">
              <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {profile?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              {profile?.name ?? shortPid}
            </CardTitle>
            {profile && (
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {profile.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Scale className="w-3 h-3" />
                  {profile.weightKg} kg
                </span>
                <span className="flex items-center gap-1">
                  <Ruler className="w-3 h-3" />
                  {profile.heightCm} cm
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-xs border-gray-600 text-gray-300"
            >
              {checkIns.length} check-in{checkIns.length !== 1 ? "s" : ""}
            </Badge>
            {checkIns.length > 0 && (
              <Button
                data-ocid={`admin.user.toggle.${index + 1}`}
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-gray-300 hover:bg-gray-800"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5 mr-1" />
                    Hide
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5 mr-1" />
                    History
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {latest && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            <div className="bg-gray-800 rounded-lg p-2 text-center">
              <p className="text-[10px] text-gray-500">Latest</p>
              <p className="text-xs font-semibold text-white">{latest.date}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-2 text-center flex flex-col items-center gap-0.5">
              <Droplets className="w-3 h-3 text-blue-500" />
              <p className="text-xs font-semibold text-white">
                {Number(latest.waterGlasses)} gl
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-2 text-center flex flex-col items-center gap-0.5">
              <Moon className="w-3 h-3 text-indigo-400" />
              <p className="text-xs font-semibold text-white">
                {latest.sleepHours}h
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-2 text-center">
              <p className="text-[10px] text-gray-500">Status</p>
              <Badge className="text-[10px] py-0 bg-red-600/20 text-red-400 border-red-600/40">
                Active
              </Badge>
            </div>
          </div>

          <AnimatePresence>
            {expanded && sorted.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 border border-gray-700 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-800 border-gray-700">
                        <TableHead className="text-xs py-2 text-gray-400">
                          Date
                        </TableHead>
                        <TableHead className="text-xs py-2 text-gray-400">
                          Diet
                        </TableHead>
                        <TableHead className="text-xs py-2 text-gray-400">
                          Exercise
                        </TableHead>
                        <TableHead className="text-xs py-2 text-center text-gray-400">
                          Water
                        </TableHead>
                        <TableHead className="text-xs py-2 text-center text-gray-400">
                          Sleep
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sorted.map((ci, i) => (
                        <CheckInRow key={ci.date} checkIn={ci} index={i} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      )}

      {checkIns.length === 0 && (
        <CardContent className="pt-0">
          <p
            className="text-xs text-gray-500 italic"
            data-ocid={`admin.user.empty_state.${index + 1}`}
          >
            No check-ins yet
          </p>
        </CardContent>
      )}
    </Card>
  );
}

// ─── Food Database Tab ────────────────────────────────────────────────────────

function FoodDatabaseTab() {
  const { data: foods = [], isLoading } = useAllFoodItems();
  const { mutateAsync: addFood, isPending: isAdding } = useAddFoodItem();
  const { mutateAsync: updateFood, isPending: isUpdating } =
    useUpdateFoodItem();
  const { mutateAsync: deleteFood, isPending: isDeleting } =
    useDeleteFoodItem();

  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editingFood, setEditingFood] = useState<FoodItem>(EMPTY_FOOD);
  const [deleteConfirmName, setDeleteConfirmName] = useState<string | null>(
    null,
  );

  // CSV state
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [csvRows, setCsvRows] = useState<FoodItem[]>([]);
  const [importing, setImporting] = useState(false);

  const filtered = foods.filter((f) => {
    const matchSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase());
    const matchRegion = regionFilter === "All" || f.region === regionFilter;
    return matchSearch && matchRegion;
  });

  const uniqueRegions = [...new Set(foods.map((f) => f.region))];
  const uniqueCategories = [...new Set(foods.map((f) => f.category))];

  const openAdd = () => {
    setEditingFood({ ...EMPTY_FOOD });
    setDialogMode("add");
    setDialogOpen(true);
  };

  const openEdit = (food: FoodItem) => {
    setEditingFood({ ...food });
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleSave = async (food: FoodItem) => {
    try {
      if (dialogMode === "add") {
        await addFood(food);
        toast.success(`"${food.name}" added to database.`);
      } else {
        await updateFood(food);
        toast.success(`"${food.name}" updated.`);
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save food item.");
    }
  };

  const handleDelete = async (name: string) => {
    try {
      await deleteFood(name);
      toast.success(`"${name}" deleted.`);
      setDeleteConfirmName(null);
    } catch {
      toast.error("Failed to delete food item.");
    }
  };

  const handleCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());
      const rows: FoodItem[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim());
        if (cols.length < 11) continue;
        rows.push({
          name: cols[0],
          category: cols[1],
          region: cols[2] || "Global",
          caloriesPer100g: Number.parseFloat(cols[3]) || 0,
          protein: Number.parseFloat(cols[4]) || 0,
          carbs: Number.parseFloat(cols[5]) || 0,
          fat: Number.parseFloat(cols[6]) || 0,
          fiber: Number.parseFloat(cols[7]) || 0,
          sugar: Number.parseFloat(cols[8]) || 0,
          servingSize: Number.parseFloat(cols[9]) || 100,
          servingUnit: cols[10] || "g",
        });
      }
      setCsvRows(rows);
    };
    reader.readAsText(file);
  };

  const handleImportAll = async () => {
    if (csvRows.length === 0) return;
    setImporting(true);
    let success = 0;
    let failed = 0;
    for (const row of csvRows) {
      try {
        await addFood(row);
        success++;
      } catch {
        failed++;
      }
    }
    setImporting(false);
    setCsvRows([]);
    if (csvInputRef.current) csvInputRef.current.value = "";
    toast.success(
      `Imported ${success} items${failed > 0 ? `, ${failed} failed` : ""}.`,
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gray-900 border-gray-800 text-center">
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-extrabold text-white">{foods.length}</p>
            <p className="text-xs text-gray-400 mt-1">Total Foods</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800 text-center">
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-extrabold text-white">
              {uniqueRegions.length}
            </p>
            <p className="text-xs text-gray-400 mt-1">Regions</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800 text-center">
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-extrabold text-white">
              {uniqueCategories.length}
            </p>
            <p className="text-xs text-gray-400 mt-1">Categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <Input
          data-ocid="admin.food.search_input"
          placeholder="Search foods…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 max-w-xs"
        />
        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger
            className="bg-gray-800 border-gray-600 text-white w-44"
            data-ocid="admin.food.region.select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="All" className="text-white hover:bg-gray-700">
              All Regions
            </SelectItem>
            {REGIONS.map((r) => (
              <SelectItem
                key={r}
                value={r}
                className="text-white hover:bg-gray-700"
              >
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          data-ocid="admin.food.open_modal_button"
          onClick={openAdd}
          className="bg-red-600 hover:bg-red-700 text-white ml-auto"
        >
          + Add Food Item
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2" data-ocid="admin.food.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded bg-gray-800" />
          ))}
        </div>
      ) : (
        <div className="border border-gray-700 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-800 border-gray-700">
                <TableHead className="text-gray-400 text-xs">Name</TableHead>
                <TableHead className="text-gray-400 text-xs">
                  Category
                </TableHead>
                <TableHead className="text-gray-400 text-xs">Region</TableHead>
                <TableHead className="text-gray-400 text-xs text-right">
                  Cal/100g
                </TableHead>
                <TableHead className="text-gray-400 text-xs text-right">
                  Protein
                </TableHead>
                <TableHead className="text-gray-400 text-xs text-right">
                  Carbs
                </TableHead>
                <TableHead className="text-gray-400 text-xs text-right">
                  Fat
                </TableHead>
                <TableHead className="text-gray-400 text-xs text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-10 text-gray-500"
                    data-ocid="admin.food.empty_state"
                  >
                    No food items found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((food, i) => (
                  <TableRow
                    key={food.name}
                    className="border-gray-800 hover:bg-gray-800/50"
                    data-ocid={`admin.food.item.${i + 1}`}
                  >
                    <TableCell className="text-white text-sm font-medium">
                      {food.name}
                    </TableCell>
                    <TableCell className="text-gray-300 text-xs">
                      {food.category}
                    </TableCell>
                    <TableCell className="text-gray-300 text-xs">
                      <Badge
                        variant="outline"
                        className="text-xs border-gray-600 text-gray-400"
                      >
                        {food.region}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-200 text-xs text-right">
                      {food.caloriesPer100g}
                    </TableCell>
                    <TableCell className="text-blue-300 text-xs text-right">
                      {food.protein}g
                    </TableCell>
                    <TableCell className="text-yellow-300 text-xs text-right">
                      {food.carbs}g
                    </TableCell>
                    <TableCell className="text-red-300 text-xs text-right">
                      {food.fat}g
                    </TableCell>
                    <TableCell className="text-center">
                      {deleteConfirmName === food.name ? (
                        <span className="flex items-center justify-center gap-1">
                          <span className="text-xs text-red-400">Confirm?</span>
                          <Button
                            data-ocid={`admin.food.confirm_button.${i + 1}`}
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs text-red-400 hover:bg-red-600/20"
                            onClick={() => handleDelete(food.name)}
                            disabled={isDeleting}
                          >
                            Yes
                          </Button>
                          <Button
                            data-ocid={`admin.food.cancel_button.${i + 1}`}
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs text-gray-400 hover:bg-gray-700"
                            onClick={() => setDeleteConfirmName(null)}
                          >
                            No
                          </Button>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1">
                          <Button
                            data-ocid={`admin.food.edit_button.${i + 1}`}
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                            onClick={() => openEdit(food)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            data-ocid={`admin.food.delete_button.${i + 1}`}
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-gray-400 hover:text-red-400 hover:bg-red-600/20"
                            onClick={() => setDeleteConfirmName(food.name)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* CSV Upload */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Upload className="w-4 h-4 text-red-400" />
            Bulk CSV Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-gray-400">
            CSV columns:{" "}
            <code className="text-gray-300 bg-gray-800 px-1 rounded">
              name, category, region, caloriesPer100g, protein, carbs, fat,
              fiber, sugar, servingSize, servingUnit
            </code>
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Input
              data-ocid="admin.food.upload_button"
              ref={csvInputRef}
              type="file"
              accept=".csv"
              onChange={handleCsvFile}
              className="bg-gray-800 border-gray-600 text-white file:text-gray-300 file:bg-gray-700 file:border-0 file:rounded file:px-2 file:py-1 file:text-xs max-w-xs"
            />
            {csvRows.length > 0 && (
              <>
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  {csvRows.length} rows found
                </span>
                <Button
                  data-ocid="admin.food.primary_button"
                  size="sm"
                  onClick={handleImportAll}
                  disabled={importing}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {importing ? "Importing…" : "Import All"}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <FoodFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        initialData={editingFood}
        mode={dialogMode}
        onSave={handleSave}
        isSaving={isAdding || isUpdating}
      />
    </div>
  );
}

// ─── Approvals Tab ────────────────────────────────────────────────────────────

function ApprovalsTab() {
  const { data: suggestions = [], isLoading } = usePendingFoodSuggestions();
  const { mutateAsync: approve, isPending: isApproving } =
    useApproveFoodSuggestion();
  const { mutateAsync: reject, isPending: isRejecting } =
    useRejectFoodSuggestion();

  const handleApprove = async (index: number) => {
    try {
      await approve(BigInt(index));
      toast.success("Food suggestion approved and added to database.");
    } catch {
      toast.error("Failed to approve suggestion.");
    }
  };

  const handleReject = async (index: number) => {
    try {
      await reject(BigInt(index));
      toast.success("Food suggestion rejected.");
    } catch {
      toast.error("Failed to reject suggestion.");
    }
  };

  const formatTime = (ts: bigint) => {
    const ms = Number(ts / 1_000_000n);
    return new Date(ms).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3" data-ocid="admin.approvals.loading_state">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl bg-gray-800" />
        ))}
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div
        className="text-center py-16 text-gray-500"
        data-ocid="admin.approvals.empty_state"
      >
        <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm font-medium">No pending suggestions</p>
        <p className="text-xs mt-1">
          User-submitted food items will appear here for review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(suggestions as FoodSuggestion[]).map((suggestion, i) => (
        <motion.div
          key={`${suggestion.foodItem.name}-${i}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          data-ocid={`admin.approvals.item.${i + 1}`}
        >
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-white font-semibold text-sm">
                      {suggestion.foodItem.name}
                    </h3>
                    <Badge
                      variant="outline"
                      className="text-xs border-yellow-600/40 text-yellow-400"
                    >
                      Pending
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-2">
                    <span>{suggestion.foodItem.category}</span>
                    <span className="text-gray-600">•</span>
                    <span>{suggestion.foodItem.region}</span>
                    <span className="text-gray-600">•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(suggestion.timestamp)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <span className="text-gray-300">
                      {suggestion.foodItem.caloriesPer100g} kcal
                    </span>
                    <span className="text-blue-300">
                      P: {suggestion.foodItem.protein}g
                    </span>
                    <span className="text-yellow-300">
                      C: {suggestion.foodItem.carbs}g
                    </span>
                    <span className="text-red-300">
                      F: {suggestion.foodItem.fat}g
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    data-ocid={`admin.approvals.confirm_button.${i + 1}`}
                    size="sm"
                    onClick={() => handleApprove(i)}
                    disabled={isApproving || isRejecting}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs h-8"
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    Approve
                  </Button>
                  <Button
                    data-ocid={`admin.approvals.delete_button.${i + 1}`}
                    size="sm"
                    onClick={() => handleReject(i)}
                    disabled={isApproving || isRejecting}
                    className="bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/40 text-xs h-8"
                    variant="outline"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { clear } = useInternetIdentity();
  const { data: usersData = [], isLoading: usersLoading } = useAllUsers();
  const { data: checkInsData = [], isLoading: checkInsLoading } =
    useAllUsersCheckIns();
  const { data: foods = [] } = useAllFoodItems();
  const { data: pending = [] } = usePendingFoodSuggestions();

  const isLoading = usersLoading || checkInsLoading;

  const profileMap = new Map<string, UserProfile>();
  for (const [principal, profile] of usersData) {
    profileMap.set(principal.toString(), profile);
  }

  const checkInsMap = new Map<string, DailyCheckIn[]>();
  for (const [principal, cis] of checkInsData) {
    checkInsMap.set(principal.toString(), cis);
  }

  const allPrincipals = new Map<string, Principal>();
  for (const [p] of usersData) allPrincipals.set(p.toString(), p);
  for (const [p] of checkInsData) allPrincipals.set(p.toString(), p);

  const entries = Array.from(allPrincipals.entries());
  const totalCheckIns = [...checkInsMap.values()].reduce(
    (s, v) => s + v.length,
    0,
  );
  const activeUsers = [...checkInsMap.values()].filter(
    (v) => v.length > 0,
  ).length;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header
        className="bg-gray-900 border-b border-gray-800 py-5 px-6"
        data-ocid="admin.page"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-wide">
                DOITEPIC
              </h1>
              <p className="text-gray-400 text-xs flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Secret Admin Panel
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-red-600/20 text-red-400 border-red-600/40 text-xs flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Admin
            </Badge>
            <Button
              data-ocid="admin.logout_button"
              variant="outline"
              size="sm"
              onClick={clear}
              className="text-gray-300 border-gray-700 bg-gray-800 hover:bg-gray-700 h-8 text-xs"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-4 md:px-6 py-8 flex-1">
        {/* Top stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
        >
          <Card className="bg-gray-900 border-gray-800 text-center">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-4 h-4 text-red-400" />
                <span className="text-2xl font-extrabold text-white">
                  {entries.length}
                </span>
              </div>
              <p className="text-xs text-gray-400">Total Users</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800 text-center">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-red-400" />
                <span className="text-2xl font-extrabold text-white">
                  {activeUsers}
                </span>
              </div>
              <p className="text-xs text-gray-400">Active Trackers</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800 text-center">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Salad className="w-4 h-4 text-red-400" />
                <span className="text-2xl font-extrabold text-white">
                  {totalCheckIns}
                </span>
              </div>
              <p className="text-xs text-gray-400">Total Check-ins</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800 text-center">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Database className="w-4 h-4 text-red-400" />
                <span className="text-2xl font-extrabold text-white">
                  {foods.length}
                </span>
              </div>
              <p className="text-xs text-gray-400">Food Items</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Tabs */}
        <Tabs defaultValue="users" data-ocid="admin.tab">
          <TabsList className="bg-gray-900 border border-gray-700 mb-6 w-full sm:w-auto">
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400 flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Users ({entries.length})
            </TabsTrigger>
            <TabsTrigger
              value="food"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400 flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              Food Database
            </TabsTrigger>
            <TabsTrigger
              value="approvals"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400 flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              Approvals
              {pending.length > 0 && (
                <Badge className="bg-yellow-500 text-black text-xs px-1.5 py-0 ml-1 h-4">
                  {pending.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            {isLoading ? (
              <div className="space-y-4" data-ocid="admin.loading_state">
                {[1, 2, 3].map((i) => (
                  <Skeleton
                    key={i}
                    className="h-32 w-full rounded-xl bg-gray-800"
                  />
                ))}
              </div>
            ) : entries.length === 0 ? (
              <div
                className="text-center py-16 text-gray-500"
                data-ocid="admin.empty_state"
              >
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No users registered yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.map(([pid, principal], i) => (
                  <motion.div
                    key={pid}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <UserCard
                      principal={principal}
                      profile={profileMap.get(pid)}
                      checkIns={checkInsMap.get(pid) ?? []}
                      index={i}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Food Database Tab */}
          <TabsContent value="food">
            <FoodDatabaseTab />
          </TabsContent>

          {/* Approvals Tab */}
          <TabsContent value="approvals">
            <ApprovalsTab />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-gray-900 border-t border-gray-800 py-4 px-6 text-center">
        <p className="text-xs text-gray-600">
          DOITEPIC Admin Panel &mdash; Restricted Access
        </p>
      </footer>
    </div>
  );
}
