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
import { Textarea } from "@/components/ui/textarea";
import type { Principal } from "@icp-sdk/core/principal";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Database,
  Droplets,
  Dumbbell,
  FileText,
  Flag,
  Globe,
  Megaphone,
  Moon,
  Pencil,
  Phone,
  Ruler,
  Salad,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Target,
  Trash2,
  TrendingUp,
  Upload,
  UserX,
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
import { ProfileGoal } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddFoodItem,
  useAllAnnouncements,
  useAllArticles,
  useAllDietPlans,
  useAllFoodItems,
  useAllReports,
  useAllUserStreaks,
  useAllUsers,
  useAllUsersCheckIns,
  useApproveFoodSuggestion,
  useCreateAnnouncement,
  useCreateArticle,
  useCreateDietPlan,
  useDeleteAnnouncement,
  useDeleteArticle,
  useDeleteDietPlan,
  useDeleteFoodItem,
  useDeleteUserAccount,
  useDismissReport,
  useFlagUser,
  useFlaggedUsers,
  usePendingFoodSuggestions,
  useRejectFoodSuggestion,
  useResolveReport,
  useToggleAnnouncement,
  useUnflagUser,
  useUpdateAnnouncement,
  useUpdateArticle,
  useUpdateDietPlan,
  useUpdateFoodItem,
  useUserJoinTimes,
} from "../hooks/useQueries";
import type { Announcement, Article, DietPlan, UserReport } from "../types";
import { AnnouncementTarget, ReportStatus } from "../types";

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

const ARTICLE_CATEGORIES = [
  "Muscle Gain",
  "Fat Loss",
  "Maintenance",
  "General Health",
  "Recipes",
  "Workout Guides",
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

const EMPTY_PLAN: DietPlan = {
  id: 0n,
  name: "",
  goalType: ProfileGoal.weightLoss,
  description: "",
  dailyCalorieTarget: 2000,
  proteinTarget: 150,
  carbsTarget: 200,
  fatTarget: 65,
  recommendedFoods: [],
  mealTimingSuggestions: [],
};

const EMPTY_ARTICLE: Article = {
  id: 0n,
  title: "",
  category: "General Health",
  body: "",
  imageUrl: "",
  createdAt: 0n,
};

const EMPTY_ANNOUNCEMENT: Announcement = {
  id: 0n,
  title: "",
  message: "",
  targetGoal: AnnouncementTarget.all,
  createdAt: 0n,
  isActive: true,
};

function goalLabel(goal: ProfileGoal | undefined | string): string {
  if (!goal) return "—";
  if (goal === ProfileGoal.weightLoss || goal === "weightLoss")
    return "Weight Loss";
  if (goal === ProfileGoal.muscleGain || goal === "muscleGain")
    return "Muscle Gain";
  if (goal === ProfileGoal.maintenance || goal === "maintenance")
    return "Maintenance";
  return String(goal);
}

function goalColor(goal: ProfileGoal | undefined | string): string {
  if (goal === ProfileGoal.weightLoss || goal === "weightLoss")
    return "bg-red-600/20 text-red-400 border-red-600/40";
  if (goal === ProfileGoal.muscleGain || goal === "muscleGain")
    return "bg-blue-600/20 text-blue-400 border-blue-600/40";
  if (goal === ProfileGoal.maintenance || goal === "maintenance")
    return "bg-green-600/20 text-green-400 border-green-600/40";
  return "bg-gray-700 text-gray-400 border-gray-600";
}

function announcementTargetLabel(t: AnnouncementTarget | string): string {
  if (t === AnnouncementTarget.all || t === "all") return "All Users";
  if (t === AnnouncementTarget.weightLoss || t === "weightLoss")
    return "Weight Loss";
  if (t === AnnouncementTarget.muscleGain || t === "muscleGain")
    return "Muscle Gain";
  if (t === AnnouncementTarget.maintenance || t === "maintenance")
    return "Maintenance";
  return String(t);
}

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  if (ms === 0) return "—";
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function shortenPrincipal(p: string): string {
  if (p.length <= 12) return p;
  return `${p.slice(0, 6)}…${p.slice(-4)}`;
}

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
            {(
              [
                ["Calories / 100g", "caloriesPer100g"],
                ["Protein (g)", "protein"],
                ["Carbs (g)", "carbs"],
                ["Fat (g)", "fat"],
                ["Fiber (g)", "fiber"],
                ["Sugar (g)", "sugar"],
                ["Serving Size", "servingSize"],
              ] as [string, keyof FoodItem][]
            ).map(([label, field]) => (
              <div key={String(field)}>
                <Label className="text-gray-300 text-xs">{label}</Label>
                <Input
                  className="bg-gray-800 border-gray-600 text-white mt-1"
                  type="number"
                  min="0"
                  step="0.1"
                  value={form[field] as number}
                  onChange={(e) => set(field, num(e.target.value))}
                />
              </div>
            ))}
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

// ─── CheckIn Row ──────────────────────────────────────────────────────────────

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
        <span className="text-blue-300">{Number(checkIn.waterGlasses)} gl</span>
      </TableCell>
      <TableCell className="text-xs text-center">
        <span className="text-indigo-300">{checkIn.sleepHours}h</span>
      </TableCell>
    </TableRow>
  );
}

// ─── User Card ────────────────────────────────────────────────────────────────

function UserCard({
  principal,
  profile,
  checkIns,
  index,
  joinTime,
  streak,
  onFlag,
}: {
  principal: Principal;
  profile: UserProfile | undefined;
  checkIns: DailyCheckIn[];
  index: number;
  joinTime?: bigint;
  streak?: { currentStreak: bigint; totalPoints: bigint };
  onFlag: (principal: Principal, name: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const sorted = [...checkIns].sort((a, b) => b.date.localeCompare(a.date));
  const latest = sorted[0];
  const pid = principal.toString();

  return (
    <Card
      className="bg-gray-900 border-gray-800"
      data-ocid={`admin.user.item.${index + 1}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-white font-semibold text-sm truncate">
                {profile?.name ?? "Unknown User"}
              </h3>
              {profile?.goal && (
                <Badge
                  variant="outline"
                  className={`text-xs ${goalColor(profile.goal)}`}
                >
                  {goalLabel(profile.goal)}
                </Badge>
              )}
              {(profile as any)?.gender && (
                <Badge
                  variant="outline"
                  className="text-xs border-gray-600 text-gray-400"
                >
                  {(profile as any).gender}
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 font-mono truncate">
              {shortenPrincipal(pid)}
            </p>
            <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
              {profile?.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {profile.phone}
                </span>
              )}
              {profile?.weightKg && (
                <span className="flex items-center gap-1">
                  <Scale className="w-3 h-3" />
                  {profile.weightKg} kg
                </span>
              )}
              {profile?.heightCm && (
                <span className="flex items-center gap-1">
                  <Ruler className="w-3 h-3" />
                  {profile.heightCm} cm
                </span>
              )}
              {joinTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Joined {formatTimestamp(joinTime)}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className="text-xs border-gray-600 text-gray-300"
            >
              {checkIns.length} check-in{checkIns.length !== 1 ? "s" : ""}
            </Badge>
            {streak && (
              <Badge
                variant="outline"
                className="text-xs border-orange-600/40 text-orange-400 gap-1"
              >
                <span>🔥</span>
                {Number(streak.currentStreak)} day streak
              </Badge>
            )}
            {streak && (
              <Badge
                variant="outline"
                className="text-xs border-yellow-600/40 text-yellow-400 gap-1"
              >
                <span>⭐</span>
                {Number(streak.totalPoints)} pts
              </Badge>
            )}
            <Button
              data-ocid={`admin.user.toggle.${index + 1}`}
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-yellow-400 hover:bg-yellow-600/20 border border-yellow-600/30"
              onClick={() => onFlag(principal, profile?.name ?? "Unknown")}
            >
              <Flag className="w-3 h-3 mr-1" />
              Flag
            </Button>
            {checkIns.length > 0 && (
              <Button
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
                  P
                </TableHead>
                <TableHead className="text-gray-400 text-xs text-right">
                  C
                </TableHead>
                <TableHead className="text-gray-400 text-xs text-right">
                  F
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

  if (isLoading)
    return (
      <div className="space-y-3" data-ocid="admin.approvals.loading_state">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl bg-gray-800" />
        ))}
      </div>
    );

  if (suggestions.length === 0)
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
                      {formatTimestamp(suggestion.timestamp)}
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

// ─── Analytics Tab ────────────────────────────────────────────────────────────

function AnalyticsTab({
  usersData,
  checkInsData,
  joinTimes,
}: {
  usersData: Array<[Principal, UserProfile]>;
  checkInsData: Array<[Principal, DailyCheckIn[]]>;
  joinTimes: Array<[Principal, bigint]>;
}) {
  // Goal breakdown
  const goalCounts = { weightLoss: 0, muscleGain: 0, maintenance: 0, none: 0 };
  for (const [, profile] of usersData) {
    const g = profile.goal as string | undefined;
    if (g === "weightLoss") goalCounts.weightLoss++;
    else if (g === "muscleGain") goalCounts.muscleGain++;
    else if (g === "maintenance") goalCounts.maintenance++;
    else goalCounts.none++;
  }

  // DAU: users with check-in today
  const today = new Date().toISOString().slice(0, 10);
  let dau = 0;
  for (const [, cis] of checkInsData) {
    if (cis.some((c) => c.date === today)) dau++;
  }

  // User growth: registrations per day (last 14 days)
  const now = Date.now();
  const growth: Record<string, number> = {};
  for (let d = 13; d >= 0; d--) {
    const date = new Date(now - d * 86400000).toISOString().slice(0, 10);
    growth[date] = 0;
  }
  for (const [, ts] of joinTimes) {
    const date = new Date(Number(ts / 1_000_000n)).toISOString().slice(0, 10);
    if (date in growth) growth[date]++;
  }

  // Most active users: top 5 by check-in count
  const profileMap = new Map<string, UserProfile>();
  for (const [p, profile] of usersData) profileMap.set(p.toString(), profile);
  const topUsers = [...checkInsData]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 5)
    .map(([p, cis]) => ({
      pid: p.toString(),
      name: profileMap.get(p.toString())?.name ?? "Unknown",
      count: cis.length,
    }));

  const maxGrowth = Math.max(...Object.values(growth), 1);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {[
          {
            label: "Total Users",
            value: usersData.length,
            icon: Users,
            color: "text-red-400",
          },
          {
            label: "Active Today (DAU)",
            value: dau,
            icon: TrendingUp,
            color: "text-green-400",
          },
          {
            label: "Total Check-ins",
            value: checkInsData.reduce((s, [, c]) => s + c.length, 0),
            icon: CheckCircle,
            color: "text-blue-400",
          },
          {
            label: "Registered (14d)",
            value: Object.values(growth).reduce((s, v) => s + v, 0),
            icon: BarChart3,
            color: "text-yellow-400",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="bg-gray-900 border-gray-800">
            <CardContent className="pt-4 pb-4 text-center">
              <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
              <p className="text-2xl font-extrabold text-white">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Goal Breakdown */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-red-400" />
              Goal Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                label: "Weight Loss",
                count: goalCounts.weightLoss,
                color: "bg-red-500",
              },
              {
                label: "Muscle Gain",
                count: goalCounts.muscleGain,
                color: "bg-blue-500",
              },
              {
                label: "Maintenance",
                count: goalCounts.maintenance,
                color: "bg-green-500",
              },
              {
                label: "No Goal Set",
                count: goalCounts.none,
                color: "bg-gray-600",
              },
            ].map(({ label, count, color }) => {
              const pct =
                usersData.length > 0
                  ? Math.round((count / usersData.length) * 100)
                  : 0;
              return (
                <div key={label} data-ocid="admin.analytics.panel">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300">{label}</span>
                    <span className="text-gray-400">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Top Active Users */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-red-400" />
              Most Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topUsers.length === 0 ? (
              <p className="text-xs text-gray-500">No check-in data yet.</p>
            ) : (
              <div className="space-y-2">
                {topUsers.map(({ pid, name, count }, i) => (
                  <div
                    key={pid}
                    className="flex items-center gap-3"
                    data-ocid={`admin.analytics.item.${i + 1}`}
                  >
                    <span className="text-xs font-bold text-red-400 w-4">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">
                        {name}
                      </p>
                      <p className="text-[10px] text-gray-500 font-mono">
                        {shortenPrincipal(pid)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs border-gray-600 text-gray-300"
                    >
                      {count} check-ins
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Growth Chart */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-red-400" />
            User Registrations — Last 14 Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-24">
            {Object.entries(growth).map(([date, count]) => (
              <div
                key={date}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <motion.div
                  className="w-full bg-red-600 rounded-t"
                  initial={{ height: 0 }}
                  animate={{
                    height: `${Math.max((count / maxGrowth) * 80, count > 0 ? 4 : 0)}px`,
                  }}
                  transition={{ duration: 0.5 }}
                />
                <span className="text-[8px] text-gray-600 rotate-45 origin-left hidden sm:block">
                  {date.slice(5)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-gray-600 mt-1">
            <span>{Object.keys(growth)[0]?.slice(5)}</span>
            <span>{Object.keys(growth).at(-1)?.slice(5)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Diet Plans Tab ───────────────────────────────────────────────────────────

function DietPlansTab() {
  const { data: plans = [], isLoading } = useAllDietPlans();
  const { mutateAsync: createPlan, isPending: isCreating } =
    useCreateDietPlan();
  const { mutateAsync: updatePlan, isPending: isUpdating } =
    useUpdateDietPlan();
  const { mutateAsync: deletePlan, isPending: isDeleting } =
    useDeleteDietPlan();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [form, setForm] = useState<DietPlan>(EMPTY_PLAN);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  const set = (field: keyof DietPlan, value: string | number | ProfileGoal) =>
    setForm((prev) => ({ ...prev, [field]: value }));
  const num = (v: string) => Number.parseFloat(v) || 0;

  const openAdd = () => {
    setForm({ ...EMPTY_PLAN });
    setDialogMode("add");
    setDialogOpen(true);
  };
  const openEdit = (plan: DietPlan) => {
    setForm({
      ...plan,
      recommendedFoods: [...plan.recommendedFoods],
      mealTimingSuggestions: [...plan.mealTimingSuggestions],
    });
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Plan name is required.");
      return;
    }
    try {
      const payload: DietPlan = {
        ...form,
        recommendedFoods:
          typeof form.recommendedFoods === "string"
            ? (form.recommendedFoods as string)
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : form.recommendedFoods,
        mealTimingSuggestions:
          typeof form.mealTimingSuggestions === "string"
            ? (form.mealTimingSuggestions as string)
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : form.mealTimingSuggestions,
      };
      if (dialogMode === "add") {
        await createPlan(payload);
        toast.success("Diet plan created.");
      } else {
        await updatePlan(payload);
        toast.success("Diet plan updated.");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save diet plan.");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deletePlan(id);
      toast.success("Diet plan deleted.");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete diet plan.");
    }
  };

  if (isLoading)
    return (
      <div className="space-y-3" data-ocid="admin.plans.loading_state">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl bg-gray-800" />
        ))}
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {plans.length} plan{plans.length !== 1 ? "s" : ""} total
        </p>
        <Button
          data-ocid="admin.plans.open_modal_button"
          onClick={openAdd}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          + Add Diet Plan
        </Button>
      </div>

      {plans.length === 0 ? (
        <div
          className="text-center py-16 text-gray-500"
          data-ocid="admin.plans.empty_state"
        >
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No diet plans yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan, i) => (
            <motion.div
              key={String(plan.id)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              data-ocid={`admin.plans.item.${i + 1}`}
            >
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-white font-semibold text-sm">
                          {plan.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`text-xs ${goalColor(plan.goalType)}`}
                        >
                          {goalLabel(plan.goalType)}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">
                        {plan.description}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs">
                        <span className="text-gray-300">
                          🔥 {plan.dailyCalorieTarget} kcal/day
                        </span>
                        <span className="text-blue-300">
                          P: {plan.proteinTarget}g
                        </span>
                        <span className="text-yellow-300">
                          C: {plan.carbsTarget}g
                        </span>
                        <span className="text-red-300">
                          F: {plan.fatTarget}g
                        </span>
                      </div>
                      {plan.recommendedFoods.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Foods: {plan.recommendedFoods.slice(0, 4).join(", ")}
                          {plan.recommendedFoods.length > 4 ? " …" : ""}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {deleteId === plan.id ? (
                        <>
                          <span className="text-xs text-red-400">Delete?</span>
                          <Button
                            data-ocid={`admin.plans.confirm_button.${i + 1}`}
                            size="sm"
                            className="h-7 px-2 text-xs bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => handleDelete(plan.id)}
                            disabled={isDeleting}
                          >
                            Yes
                          </Button>
                          <Button
                            data-ocid={`admin.plans.cancel_button.${i + 1}`}
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-gray-400 hover:bg-gray-800"
                            onClick={() => setDeleteId(null)}
                          >
                            No
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            data-ocid={`admin.plans.edit_button.${i + 1}`}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
                            onClick={() => openEdit(plan)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            data-ocid={`admin.plans.delete_button.${i + 1}`}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-600/20"
                            onClick={() => setDeleteId(plan.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Plan Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(v) => !v && setDialogOpen(false)}
      >
        <DialogContent
          className="bg-gray-900 border-gray-700 text-white max-w-lg max-h-[90vh] overflow-y-auto"
          data-ocid="admin.plans.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-white">
              {dialogMode === "add" ? "Add Diet Plan" : "Edit Diet Plan"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-gray-300 text-xs">Plan Name *</Label>
              <Input
                data-ocid="admin.plans.input"
                className="bg-gray-800 border-gray-600 text-white mt-1"
                placeholder="e.g. Kerala Lean Bulk"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-gray-300 text-xs">Goal Type</Label>
              <Select
                value={form.goalType as string}
                onValueChange={(v) => set("goalType", v as ProfileGoal)}
              >
                <SelectTrigger
                  className="bg-gray-800 border-gray-600 text-white mt-1"
                  data-ocid="admin.plans.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem
                    value={ProfileGoal.weightLoss}
                    className="text-white hover:bg-gray-700"
                  >
                    Weight Loss
                  </SelectItem>
                  <SelectItem
                    value={ProfileGoal.muscleGain}
                    className="text-white hover:bg-gray-700"
                  >
                    Muscle Gain
                  </SelectItem>
                  <SelectItem
                    value={ProfileGoal.maintenance}
                    className="text-white hover:bg-gray-700"
                  >
                    Maintenance
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-300 text-xs">Description</Label>
              <Textarea
                className="bg-gray-800 border-gray-600 text-white mt-1 resize-none"
                rows={2}
                placeholder="Brief plan description"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  ["Daily Calorie Target", "dailyCalorieTarget"],
                  ["Protein Target (g)", "proteinTarget"],
                  ["Carbs Target (g)", "carbsTarget"],
                  ["Fat Target (g)", "fatTarget"],
                ] as [string, keyof DietPlan][]
              ).map(([label, field]) => (
                <div key={String(field)}>
                  <Label className="text-gray-300 text-xs">{label}</Label>
                  <Input
                    className="bg-gray-800 border-gray-600 text-white mt-1"
                    type="number"
                    min="0"
                    value={form[field] as number}
                    onChange={(e) => set(field, num(e.target.value))}
                  />
                </div>
              ))}
            </div>
            <div>
              <Label className="text-gray-300 text-xs">
                Recommended Foods (comma-separated)
              </Label>
              <Input
                className="bg-gray-800 border-gray-600 text-white mt-1"
                placeholder="Chicken, Rice, Eggs…"
                value={
                  Array.isArray(form.recommendedFoods)
                    ? form.recommendedFoods.join(", ")
                    : (form.recommendedFoods as string)
                }
                onChange={(e) => set("recommendedFoods", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-gray-300 text-xs">
                Meal Timing Suggestions (comma-separated)
              </Label>
              <Input
                className="bg-gray-800 border-gray-600 text-white mt-1"
                placeholder="8am Breakfast, 1pm Lunch…"
                value={
                  Array.isArray(form.mealTimingSuggestions)
                    ? form.mealTimingSuggestions.join(", ")
                    : (form.mealTimingSuggestions as string)
                }
                onChange={(e) => set("mealTimingSuggestions", e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              data-ocid="admin.plans.cancel_button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.plans.save_button"
              onClick={handleSave}
              disabled={isCreating || isUpdating}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isCreating || isUpdating
                ? "Saving…"
                : dialogMode === "add"
                  ? "Create Plan"
                  : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Content Tab ──────────────────────────────────────────────────────────────

function ContentTab() {
  const [section, setSection] = useState<"articles" | "announcements">(
    "articles",
  );

  // Articles
  const { data: articles = [], isLoading: articlesLoading } = useAllArticles();
  const { mutateAsync: createArticle, isPending: isCreatingArticle } =
    useCreateArticle();
  const { mutateAsync: updateArticle, isPending: isUpdatingArticle } =
    useUpdateArticle();
  const { mutateAsync: deleteArticle, isPending: isDeletingArticle } =
    useDeleteArticle();

  // Announcements
  const { data: announcements = [], isLoading: announcementsLoading } =
    useAllAnnouncements();
  const { mutateAsync: createAnnouncement, isPending: isCreatingAnn } =
    useCreateAnnouncement();
  const { mutateAsync: updateAnnouncement, isPending: isUpdatingAnn } =
    useUpdateAnnouncement();
  const { mutateAsync: deleteAnnouncement, isPending: isDeletingAnn } =
    useDeleteAnnouncement();
  const { mutateAsync: toggleAnnouncement } = useToggleAnnouncement();

  // Article state
  const [articleDialog, setArticleDialog] = useState(false);
  const [articleMode, setArticleMode] = useState<"add" | "edit">("add");
  const [articleForm, setArticleForm] = useState<Article>(EMPTY_ARTICLE);
  const [deleteArticleId, setDeleteArticleId] = useState<bigint | null>(null);

  // Announcement state
  const [annDialog, setAnnDialog] = useState(false);
  const [annMode, setAnnMode] = useState<"add" | "edit">("add");
  const [annForm, setAnnForm] = useState<Announcement>(EMPTY_ANNOUNCEMENT);
  const [deleteAnnId, setDeleteAnnId] = useState<bigint | null>(null);

  const setA = (field: keyof Article, value: string) =>
    setArticleForm((prev) => ({ ...prev, [field]: value }));
  const setAnn = (
    field: keyof Announcement,
    value: string | boolean | AnnouncementTarget,
  ) => setAnnForm((prev) => ({ ...prev, [field]: value }));

  const openAddArticle = () => {
    setArticleForm({ ...EMPTY_ARTICLE });
    setArticleMode("add");
    setArticleDialog(true);
  };
  const openEditArticle = (a: Article) => {
    setArticleForm({ ...a });
    setArticleMode("edit");
    setArticleDialog(true);
  };

  const handleSaveArticle = async () => {
    if (!articleForm.title.trim() || !articleForm.body.trim()) {
      toast.error("Title and body are required.");
      return;
    }
    try {
      if (articleMode === "add") {
        await createArticle(articleForm);
        toast.success("Article created.");
      } else {
        await updateArticle(articleForm);
        toast.success("Article updated.");
      }
      setArticleDialog(false);
    } catch {
      toast.error("Failed to save article.");
    }
  };

  const handleDeleteArticle = async (id: bigint) => {
    try {
      await deleteArticle(id);
      toast.success("Article deleted.");
      setDeleteArticleId(null);
    } catch {
      toast.error("Failed to delete article.");
    }
  };

  const openAddAnn = () => {
    setAnnForm({ ...EMPTY_ANNOUNCEMENT });
    setAnnMode("add");
    setAnnDialog(true);
  };
  const openEditAnn = (a: Announcement) => {
    setAnnForm({ ...a });
    setAnnMode("edit");
    setAnnDialog(true);
  };

  const handleSaveAnn = async () => {
    if (!annForm.title.trim() || !annForm.message.trim()) {
      toast.error("Title and message are required.");
      return;
    }
    try {
      if (annMode === "add") {
        await createAnnouncement(annForm);
        toast.success("Announcement created.");
      } else {
        await updateAnnouncement(annForm);
        toast.success("Announcement updated.");
      }
      setAnnDialog(false);
    } catch {
      toast.error("Failed to save announcement.");
    }
  };

  const handleDeleteAnn = async (id: bigint) => {
    try {
      await deleteAnnouncement(id);
      toast.success("Announcement deleted.");
      setDeleteAnnId(null);
    } catch {
      toast.error("Failed to delete announcement.");
    }
  };

  const handleToggleAnn = async (id: bigint) => {
    try {
      await toggleAnnouncement(id);
      toast.success("Announcement toggled.");
    } catch {
      toast.error("Failed to toggle announcement.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub-section tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-3">
        <button
          data-ocid="admin.content.tab"
          type="button"
          onClick={() => setSection("articles")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${section === "articles" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}
        >
          <BookOpen className="w-3.5 h-3.5 inline mr-1.5" />
          Articles
        </button>
        <button
          type="button"
          onClick={() => setSection("announcements")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${section === "announcements" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}
        >
          <Megaphone className="w-3.5 h-3.5 inline mr-1.5" />
          Announcements
        </button>
      </div>

      {/* Articles */}
      {section === "articles" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              {articles.length} article{articles.length !== 1 ? "s" : ""}
            </p>
            <Button
              data-ocid="admin.articles.open_modal_button"
              onClick={openAddArticle}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              + Add Article
            </Button>
          </div>
          {articlesLoading ? (
            <div className="space-y-3" data-ocid="admin.articles.loading_state">
              {[1, 2].map((i) => (
                <Skeleton
                  key={i}
                  className="h-24 w-full rounded-xl bg-gray-800"
                />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div
              className="text-center py-12 text-gray-500"
              data-ocid="admin.articles.empty_state"
            >
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No articles yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {articles.map((article, i) => (
                <motion.div
                  key={String(article.id)}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  data-ocid={`admin.articles.item.${i + 1}`}
                >
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-white font-semibold text-sm">
                              {article.title}
                            </h3>
                            <Badge
                              variant="outline"
                              className="text-xs border-purple-600/40 text-purple-400"
                            >
                              {article.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-2">
                            {article.body}
                          </p>
                          <p className="text-[10px] text-gray-600 mt-1">
                            {formatTimestamp(article.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {deleteArticleId === article.id ? (
                            <>
                              <span className="text-xs text-red-400">
                                Delete?
                              </span>
                              <Button
                                data-ocid={`admin.articles.confirm_button.${i + 1}`}
                                size="sm"
                                className="h-7 px-2 text-xs bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => handleDeleteArticle(article.id)}
                                disabled={isDeletingArticle}
                              >
                                Yes
                              </Button>
                              <Button
                                data-ocid={`admin.articles.cancel_button.${i + 1}`}
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs text-gray-400 hover:bg-gray-800"
                                onClick={() => setDeleteArticleId(null)}
                              >
                                No
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                data-ocid={`admin.articles.edit_button.${i + 1}`}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
                                onClick={() => openEditArticle(article)}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                data-ocid={`admin.articles.delete_button.${i + 1}`}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-600/20"
                                onClick={() => setDeleteArticleId(article.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Announcements */}
      {section === "announcements" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              {announcements.length} announcement
              {announcements.length !== 1 ? "s" : ""} — in-app only
            </p>
            <Button
              data-ocid="admin.ann.open_modal_button"
              onClick={openAddAnn}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              + Add Announcement
            </Button>
          </div>
          {announcementsLoading ? (
            <div className="space-y-3" data-ocid="admin.ann.loading_state">
              {[1, 2].map((i) => (
                <Skeleton
                  key={i}
                  className="h-24 w-full rounded-xl bg-gray-800"
                />
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div
              className="text-center py-12 text-gray-500"
              data-ocid="admin.ann.empty_state"
            >
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No announcements yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann, i) => (
                <motion.div
                  key={String(ann.id)}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  data-ocid={`admin.ann.item.${i + 1}`}
                >
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-white font-semibold text-sm">
                              {ann.title}
                            </h3>
                            <Badge
                              variant="outline"
                              className="text-xs border-blue-600/40 text-blue-400"
                            >
                              {announcementTargetLabel(ann.targetGoal)}
                            </Badge>
                            <Badge
                              className={`text-xs ${ann.isActive ? "bg-green-600/20 text-green-400 border border-green-600/40" : "bg-gray-700 text-gray-500 border border-gray-600"}`}
                            >
                              {ann.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-400">{ann.message}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-gray-400 hover:bg-gray-800 border border-gray-700"
                            onClick={() => handleToggleAnn(ann.id)}
                          >
                            {ann.isActive ? "Deactivate" : "Activate"}
                          </Button>
                          {deleteAnnId === ann.id ? (
                            <>
                              <span className="text-xs text-red-400">
                                Delete?
                              </span>
                              <Button
                                data-ocid={`admin.ann.confirm_button.${i + 1}`}
                                size="sm"
                                className="h-7 px-2 text-xs bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => handleDeleteAnn(ann.id)}
                                disabled={isDeletingAnn}
                              >
                                Yes
                              </Button>
                              <Button
                                data-ocid={`admin.ann.cancel_button.${i + 1}`}
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs text-gray-400 hover:bg-gray-800"
                                onClick={() => setDeleteAnnId(null)}
                              >
                                No
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                data-ocid={`admin.ann.edit_button.${i + 1}`}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
                                onClick={() => openEditAnn(ann)}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                data-ocid={`admin.ann.delete_button.${i + 1}`}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-600/20"
                                onClick={() => setDeleteAnnId(ann.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Article Dialog */}
      <Dialog
        open={articleDialog}
        onOpenChange={(v) => !v && setArticleDialog(false)}
      >
        <DialogContent
          className="bg-gray-900 border-gray-700 text-white max-w-lg max-h-[90vh] overflow-y-auto"
          data-ocid="admin.articles.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-white">
              {articleMode === "add" ? "Add Article" : "Edit Article"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-gray-300 text-xs">Title *</Label>
              <Input
                data-ocid="admin.articles.input"
                className="bg-gray-800 border-gray-600 text-white mt-1"
                placeholder="Article title"
                value={articleForm.title}
                onChange={(e) => setA("title", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-gray-300 text-xs">Category</Label>
              <Select
                value={articleForm.category}
                onValueChange={(v) => setA("category", v)}
              >
                <SelectTrigger
                  className="bg-gray-800 border-gray-600 text-white mt-1"
                  data-ocid="admin.articles.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {ARTICLE_CATEGORIES.map((c) => (
                    <SelectItem
                      key={c}
                      value={c}
                      className="text-white hover:bg-gray-700"
                    >
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-300 text-xs">Body *</Label>
              <Textarea
                data-ocid="admin.articles.textarea"
                className="bg-gray-800 border-gray-600 text-white mt-1 resize-none"
                rows={6}
                placeholder="Article content…"
                value={articleForm.body}
                onChange={(e) => setA("body", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-gray-300 text-xs">
                Image URL (optional)
              </Label>
              <Input
                className="bg-gray-800 border-gray-600 text-white mt-1"
                placeholder="https://…"
                value={articleForm.imageUrl}
                onChange={(e) => setA("imageUrl", e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              data-ocid="admin.articles.cancel_button"
              variant="outline"
              onClick={() => setArticleDialog(false)}
              className="border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.articles.submit_button"
              onClick={handleSaveArticle}
              disabled={isCreatingArticle || isUpdatingArticle}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isCreatingArticle || isUpdatingArticle
                ? "Saving…"
                : articleMode === "add"
                  ? "Publish"
                  : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Announcement Dialog */}
      <Dialog open={annDialog} onOpenChange={(v) => !v && setAnnDialog(false)}>
        <DialogContent
          className="bg-gray-900 border-gray-700 text-white max-w-md"
          data-ocid="admin.ann.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-white">
              {annMode === "add" ? "Add Announcement" : "Edit Announcement"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-gray-300 text-xs">Title *</Label>
              <Input
                data-ocid="admin.ann.input"
                className="bg-gray-800 border-gray-600 text-white mt-1"
                placeholder="Announcement title"
                value={annForm.title}
                onChange={(e) => setAnn("title", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-gray-300 text-xs">Message *</Label>
              <Textarea
                data-ocid="admin.ann.textarea"
                className="bg-gray-800 border-gray-600 text-white mt-1 resize-none"
                rows={3}
                placeholder="Announcement message…"
                value={annForm.message}
                onChange={(e) => setAnn("message", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-gray-300 text-xs">Target Audience</Label>
              <Select
                value={annForm.targetGoal as string}
                onValueChange={(v) =>
                  setAnn("targetGoal", v as AnnouncementTarget)
                }
              >
                <SelectTrigger
                  className="bg-gray-800 border-gray-600 text-white mt-1"
                  data-ocid="admin.ann.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem
                    value={AnnouncementTarget.all}
                    className="text-white hover:bg-gray-700"
                  >
                    All Users
                  </SelectItem>
                  <SelectItem
                    value={AnnouncementTarget.weightLoss}
                    className="text-white hover:bg-gray-700"
                  >
                    Weight Loss
                  </SelectItem>
                  <SelectItem
                    value={AnnouncementTarget.muscleGain}
                    className="text-white hover:bg-gray-700"
                  >
                    Muscle Gain
                  </SelectItem>
                  <SelectItem
                    value={AnnouncementTarget.maintenance}
                    className="text-white hover:bg-gray-700"
                  >
                    Maintenance
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              data-ocid="admin.ann.cancel_button"
              variant="outline"
              onClick={() => setAnnDialog(false)}
              className="border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.ann.submit_button"
              onClick={handleSaveAnn}
              disabled={isCreatingAnn || isUpdatingAnn}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isCreatingAnn || isUpdatingAnn
                ? "Saving…"
                : annMode === "add"
                  ? "Publish"
                  : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Moderation Tab ───────────────────────────────────────────────────────────

function ModerationTab({
  allUsers,
}: { allUsers: Array<[Principal, UserProfile]> }) {
  const { data: reports = [], isLoading: reportsLoading } = useAllReports();
  const { data: flagged = [], isLoading: flaggedLoading } = useFlaggedUsers();
  const { mutateAsync: resolveReport, isPending: isResolving } =
    useResolveReport();
  const { mutateAsync: dismissReport, isPending: isDismissing } =
    useDismissReport();
  const { mutateAsync: unflagUser, isPending: isUnflagging } = useUnflagUser();
  const { mutateAsync: deleteAccount, isPending: isDeletingAccount } =
    useDeleteUserAccount();
  const { mutateAsync: flagUser, isPending: isFlagging } = useFlagUser();

  const [section, setSection] = useState<"reports" | "flagged">("reports");
  const [deleteAccountPrincipal, setDeleteAccountPrincipal] =
    useState<Principal | null>(null);
  const [flagDialog, setFlagDialog] = useState(false);
  const [flagTarget, setFlagTarget] = useState("");
  const [flagReason, setFlagReason] = useState("");

  const profileMap = new Map<string, UserProfile>();
  for (const [p, profile] of allUsers) profileMap.set(p.toString(), profile);

  const handleResolve = async (id: bigint) => {
    try {
      await resolveReport(id);
      toast.success("Report resolved.");
    } catch {
      toast.error("Failed to resolve report.");
    }
  };
  const handleDismiss = async (id: bigint) => {
    try {
      await dismissReport(id);
      toast.success("Report dismissed.");
    } catch {
      toast.error("Failed to dismiss report.");
    }
  };
  const handleUnflag = async (user: Principal) => {
    try {
      await unflagUser(user);
      toast.success("User unflagged.");
    } catch {
      toast.error("Failed to unflag user.");
    }
  };
  const handleDeleteAccount = async (user: Principal) => {
    try {
      await deleteAccount(user);
      toast.success("Account deleted.");
      setDeleteAccountPrincipal(null);
    } catch {
      toast.error("Failed to delete account.");
    }
  };
  const handleFlagUser = async () => {
    if (!flagTarget || !flagReason.trim()) {
      toast.error("Select a user and enter a reason.");
      return;
    }
    const userEntry = allUsers.find(([p]) => p.toString() === flagTarget);
    if (!userEntry) {
      toast.error("User not found.");
      return;
    }
    try {
      await flagUser({ user: userEntry[0], reason: flagReason });
      toast.success("User flagged.");
      setFlagDialog(false);
      setFlagTarget("");
      setFlagReason("");
    } catch {
      toast.error("Failed to flag user.");
    }
  };

  const statusColor = (status: ReportStatus | string) => {
    if (status === ReportStatus.pending || status === "pending")
      return "border-yellow-600/40 text-yellow-400";
    if (status === ReportStatus.resolved || status === "resolved")
      return "border-green-600/40 text-green-400";
    return "border-gray-600 text-gray-400";
  };

  const pendingCount = reports.filter(
    (r) => r.status === ReportStatus.pending,
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-gray-800 pb-3">
        <button
          data-ocid="admin.moderation.tab"
          type="button"
          onClick={() => setSection("reports")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${section === "reports" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Reports
          {pendingCount > 0 && (
            <Badge className="bg-yellow-500 text-black text-xs px-1.5 py-0 h-4 ml-0.5">
              {pendingCount}
            </Badge>
          )}
        </button>
        <button
          type="button"
          onClick={() => setSection("flagged")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${section === "flagged" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Flagged Accounts
          {flagged.length > 0 && (
            <Badge className="bg-red-600 text-white text-xs px-1.5 py-0 h-4 ml-0.5">
              {flagged.length}
            </Badge>
          )}
        </button>
      </div>

      {/* Reports */}
      {section === "reports" && (
        <div className="space-y-3">
          {reportsLoading ? (
            <div data-ocid="admin.reports.loading_state">
              {[1, 2].map((i) => (
                <Skeleton
                  key={i}
                  className="h-20 w-full rounded-xl bg-gray-800 mb-2"
                />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div
              className="text-center py-12 text-gray-500"
              data-ocid="admin.reports.empty_state"
            >
              <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No user reports.</p>
            </div>
          ) : (
            reports.map((report: UserReport, i) => (
              <motion.div
                key={String(report.id)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                data-ocid={`admin.reports.item.${i + 1}`}
              >
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge
                            variant="outline"
                            className="text-xs border-orange-600/40 text-orange-400"
                          >
                            {report.reportType}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${statusColor(report.status)}`}
                          >
                            {typeof report.status === "string"
                              ? report.status
                              : String(report.status)}
                          </Badge>
                          {report.targetFoodName && (
                            <Badge
                              variant="outline"
                              className="text-xs border-gray-600 text-gray-400"
                            >
                              Food: {report.targetFoodName}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-300">
                          {report.description}
                        </p>
                        <p className="text-[10px] text-gray-600 mt-1">
                          By: {shortenPrincipal(report.reportedBy.toString())} ·{" "}
                          {formatTimestamp(report.createdAt)}
                        </p>
                      </div>
                      {report.status === ReportStatus.pending && (
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            data-ocid={`admin.reports.confirm_button.${i + 1}`}
                            size="sm"
                            className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleResolve(report.id)}
                            disabled={isResolving || isDismissing}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Resolve
                          </Button>
                          <Button
                            data-ocid={`admin.reports.cancel_button.${i + 1}`}
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-gray-400 hover:bg-gray-800 border border-gray-700"
                            onClick={() => handleDismiss(report.id)}
                            disabled={isResolving || isDismissing}
                          >
                            Dismiss
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Flagged Accounts */}
      {section === "flagged" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              {flagged.length} flagged account{flagged.length !== 1 ? "s" : ""}
            </p>
            <Button
              data-ocid="admin.moderation.open_modal_button"
              size="sm"
              onClick={() => setFlagDialog(true)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <Flag className="w-3.5 h-3.5 mr-1" />
              Flag User
            </Button>
          </div>
          {flaggedLoading ? (
            <div data-ocid="admin.flagged.loading_state">
              {[1, 2].map((i) => (
                <Skeleton
                  key={i}
                  className="h-16 w-full rounded-xl bg-gray-800 mb-2"
                />
              ))}
            </div>
          ) : flagged.length === 0 ? (
            <div
              className="text-center py-12 text-gray-500"
              data-ocid="admin.flagged.empty_state"
            >
              <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No flagged accounts.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {flagged.map(([principal, reason], i) => {
                const pid = principal.toString();
                const profile = profileMap.get(pid);
                return (
                  <motion.div
                    key={pid}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    data-ocid={`admin.flagged.item.${i + 1}`}
                  >
                    <Card className="bg-gray-900 border-red-900/30">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <UserX className="w-4 h-4 text-red-400" />
                              <span className="text-white text-sm font-medium">
                                {profile?.name ?? "Unknown"}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-500 font-mono">
                              {shortenPrincipal(pid)}
                            </p>
                            <p className="text-xs text-red-300 mt-1">
                              Reason: {reason}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              data-ocid={`admin.flagged.secondary_button.${i + 1}`}
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs text-gray-400 hover:bg-gray-800 border border-gray-700"
                              onClick={() => handleUnflag(principal)}
                              disabled={isUnflagging}
                            >
                              Unflag
                            </Button>
                            {deleteAccountPrincipal?.toString() === pid ? (
                              <>
                                <span className="text-xs text-red-400">
                                  Delete account?
                                </span>
                                <Button
                                  data-ocid={`admin.flagged.confirm_button.${i + 1}`}
                                  size="sm"
                                  className="h-7 px-2 text-xs bg-red-600 hover:bg-red-700 text-white"
                                  onClick={() => handleDeleteAccount(principal)}
                                  disabled={isDeletingAccount}
                                >
                                  Yes
                                </Button>
                                <Button
                                  data-ocid={`admin.flagged.cancel_button.${i + 1}`}
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs text-gray-400 hover:bg-gray-800"
                                  onClick={() =>
                                    setDeleteAccountPrincipal(null)
                                  }
                                >
                                  No
                                </Button>
                              </>
                            ) : (
                              <Button
                                data-ocid={`admin.flagged.delete_button.${i + 1}`}
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs text-red-400 hover:bg-red-600/20 border border-red-600/40"
                                onClick={() =>
                                  setDeleteAccountPrincipal(principal)
                                }
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete Account
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Flag User Dialog */}
      <Dialog
        open={flagDialog}
        onOpenChange={(v) => !v && setFlagDialog(false)}
      >
        <DialogContent
          className="bg-gray-900 border-gray-700 text-white max-w-sm"
          data-ocid="admin.moderation.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Flag className="w-4 h-4 text-yellow-400" />
              Flag a User
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-gray-300 text-xs">Select User</Label>
              <Select value={flagTarget} onValueChange={setFlagTarget}>
                <SelectTrigger
                  className="bg-gray-800 border-gray-600 text-white mt-1"
                  data-ocid="admin.moderation.select"
                >
                  <SelectValue placeholder="Choose a user…" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 max-h-48 overflow-y-auto">
                  {allUsers.map(([p, profile]) => (
                    <SelectItem
                      key={p.toString()}
                      value={p.toString()}
                      className="text-white hover:bg-gray-700"
                    >
                      {profile.name} ({shortenPrincipal(p.toString())})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-300 text-xs">Reason *</Label>
              <Textarea
                data-ocid="admin.moderation.textarea"
                className="bg-gray-800 border-gray-600 text-white mt-1 resize-none"
                rows={3}
                placeholder="Reason for flagging…"
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              data-ocid="admin.moderation.cancel_button"
              variant="outline"
              onClick={() => setFlagDialog(false)}
              className="border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.moderation.submit_button"
              onClick={handleFlagUser}
              disabled={isFlagging}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {isFlagging ? "Flagging…" : "Flag User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
  const { data: joinTimes = [] } = useUserJoinTimes();
  const { data: allUserStreaks = [] } = useAllUserStreaks();

  const streakMap = new Map<
    string,
    { currentStreak: bigint; totalPoints: bigint }
  >();
  for (const [p, s] of allUserStreaks) streakMap.set(p.toString(), s);

  const isLoading = usersLoading || checkInsLoading;

  const profileMap = new Map<string, UserProfile>();
  for (const [principal, profile] of usersData)
    profileMap.set(principal.toString(), profile);

  const checkInsMap = new Map<string, DailyCheckIn[]>();
  for (const [principal, cis] of checkInsData)
    checkInsMap.set(principal.toString(), cis);

  const joinTimeMap = new Map<string, bigint>();
  for (const [p, ts] of joinTimes) joinTimeMap.set(p.toString(), ts);

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

  const [flagDialogFromUser, setFlagDialogFromUser] = useState<{
    principal: Principal;
    name: string;
  } | null>(null);
  const [flagReasonFromUser, setFlagReasonFromUser] = useState("");
  const { mutateAsync: flagUser, isPending: isFlagging } = useFlagUser();

  const handleFlagFromUserCard = async () => {
    if (!flagDialogFromUser || !flagReasonFromUser.trim()) {
      toast.error("Enter a reason.");
      return;
    }
    try {
      await flagUser({
        user: flagDialogFromUser.principal,
        reason: flagReasonFromUser,
      });
      toast.success(`${flagDialogFromUser.name} flagged.`);
      setFlagDialogFromUser(null);
      setFlagReasonFromUser("");
    } catch {
      toast.error("Failed to flag user.");
    }
  };

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

        {/* Main Tabs — scrollable for 8 tabs */}
        <Tabs defaultValue="users" data-ocid="admin.tab">
          <div className="overflow-x-auto mb-6">
            <TabsList className="bg-gray-900 border border-gray-700 w-max min-w-full sm:w-auto inline-flex">
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400 flex items-center gap-1.5 whitespace-nowrap"
              >
                <Users className="w-3.5 h-3.5" />
                Users ({entries.length})
              </TabsTrigger>
              <TabsTrigger
                value="food"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400 flex items-center gap-1.5 whitespace-nowrap"
              >
                <Database className="w-3.5 h-3.5" />
                Food DB
              </TabsTrigger>
              <TabsTrigger
                value="approvals"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400 flex items-center gap-1.5 whitespace-nowrap"
              >
                <Globe className="w-3.5 h-3.5" />
                Approvals
                {pending.length > 0 && (
                  <Badge className="bg-yellow-500 text-black text-xs px-1.5 py-0 ml-1 h-4">
                    {pending.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400 flex items-center gap-1.5 whitespace-nowrap"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="plans"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400 flex items-center gap-1.5 whitespace-nowrap"
              >
                <Target className="w-3.5 h-3.5" />
                Diet Plans
              </TabsTrigger>
              <TabsTrigger
                value="content"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400 flex items-center gap-1.5 whitespace-nowrap"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Content
              </TabsTrigger>
              <TabsTrigger
                value="moderation"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400 flex items-center gap-1.5 whitespace-nowrap"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Moderation
              </TabsTrigger>
            </TabsList>
          </div>

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
                      joinTime={joinTimeMap.get(pid)}
                      streak={streakMap.get(pid)}
                      onFlag={(p, name) => {
                        setFlagDialogFromUser({ principal: p, name });
                        setFlagReasonFromUser("");
                      }}
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

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsTab
              usersData={usersData as Array<[Principal, UserProfile]>}
              checkInsData={checkInsData as Array<[Principal, DailyCheckIn[]]>}
              joinTimes={joinTimes as Array<[Principal, bigint]>}
            />
          </TabsContent>

          {/* Diet Plans Tab */}
          <TabsContent value="plans">
            <DietPlansTab />
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            <ContentTab />
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent value="moderation">
            <ModerationTab
              allUsers={usersData as Array<[Principal, UserProfile]>}
            />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-gray-900 border-t border-gray-800 py-4 px-6 text-center">
        <p className="text-xs text-gray-600">
          DOITEPIC Admin Panel &mdash; Restricted Access
        </p>
      </footer>

      {/* Quick Flag Dialog from User Card */}
      <Dialog
        open={!!flagDialogFromUser}
        onOpenChange={(v) => !v && setFlagDialogFromUser(null)}
      >
        <DialogContent
          className="bg-gray-900 border-gray-700 text-white max-w-sm"
          data-ocid="admin.user.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Flag className="w-4 h-4 text-yellow-400" />
              Flag {flagDialogFromUser?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Label className="text-gray-300 text-xs">Reason *</Label>
            <Textarea
              data-ocid="admin.user.textarea"
              className="bg-gray-800 border-gray-600 text-white mt-1 resize-none"
              rows={3}
              placeholder="Reason for flagging…"
              value={flagReasonFromUser}
              onChange={(e) => setFlagReasonFromUser(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              data-ocid="admin.user.cancel_button"
              variant="outline"
              onClick={() => setFlagDialogFromUser(null)}
              className="border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.user.submit_button"
              onClick={handleFlagFromUserCard}
              disabled={isFlagging}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {isFlagging ? "Flagging…" : "Flag User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
