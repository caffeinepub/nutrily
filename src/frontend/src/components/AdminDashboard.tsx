import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Principal } from "@icp-sdk/core/principal";
import {
  ChevronDown,
  ChevronUp,
  Droplets,
  Dumbbell,
  Leaf,
  Moon,
  Phone,
  Ruler,
  Salad,
  Scale,
  ShieldCheck,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { DailyCheckIn, UserProfile } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAllUsers, useAllUsersCheckIns } from "../hooks/useQueries";
import Footer from "./Footer";

function CheckInRow({
  checkIn,
  index,
}: {
  checkIn: DailyCheckIn;
  index: number;
}) {
  return (
    <TableRow data-ocid={`admin.checkin.item.${index + 1}`}>
      <TableCell className="text-xs font-medium">{checkIn.date}</TableCell>
      <TableCell
        className="text-xs max-w-[160px] truncate"
        title={checkIn.dietNotes}
      >
        {checkIn.dietNotes || <span className="text-muted-foreground">—</span>}
      </TableCell>
      <TableCell
        className="text-xs max-w-[160px] truncate"
        title={checkIn.exercisesDone}
      >
        {checkIn.exercisesDone || (
          <span className="text-muted-foreground">—</span>
        )}
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

function UserFollowUpCard({
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
      className="border-border shadow-card"
      data-ocid={`admin.user.item.${index + 1}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-7 h-7 rounded-full hero-gradient flex items-center justify-center text-white text-xs font-bold shrink-0">
                {profile?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              {profile?.name ?? shortPid}
            </CardTitle>
            {profile && (
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
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
            <Badge variant="outline" className="text-xs">
              {checkIns.length} check-in{checkIns.length !== 1 ? "s" : ""}
            </Badge>
            {checkIns.length > 0 && (
              <Button
                data-ocid={`admin.user.toggle.${index + 1}`}
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
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
                    Show history
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
            <div className="bg-muted/40 rounded-lg p-2 text-center">
              <p className="text-[10px] text-muted-foreground">Latest</p>
              <p className="text-xs font-semibold text-foreground">
                {latest.date}
              </p>
            </div>
            <div className="bg-muted/40 rounded-lg p-2 text-center flex flex-col items-center gap-0.5">
              <Droplets className="w-3 h-3 text-blue-500" />
              <p className="text-xs font-semibold">
                {Number(latest.waterGlasses)} glasses
              </p>
            </div>
            <div className="bg-muted/40 rounded-lg p-2 text-center flex flex-col items-center gap-0.5">
              <Moon className="w-3 h-3 text-indigo-400" />
              <p className="text-xs font-semibold">
                {latest.sleepHours}h sleep
              </p>
            </div>
            <div className="bg-muted/40 rounded-lg p-2 text-center">
              <p className="text-[10px] text-muted-foreground">Status</p>
              <Badge
                className="text-[10px] py-0"
                variant={checkIns.length > 0 ? "default" : "outline"}
              >
                {checkIns.length > 0 ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          {latest.dietNotes && (
            <div className="flex items-start gap-2 text-xs bg-green-50 rounded-lg p-2 mb-2">
              <Salad className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-foreground">Diet: </span>
                <span className="text-muted-foreground">
                  {latest.dietNotes}
                </span>
              </div>
            </div>
          )}
          {latest.exercisesDone && (
            <div className="flex items-start gap-2 text-xs bg-blue-50 rounded-lg p-2 mb-2">
              <Dumbbell className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-foreground">Exercise: </span>
                <span className="text-muted-foreground">
                  {latest.exercisesDone}
                </span>
              </div>
            </div>
          )}

          <AnimatePresence>
            {expanded && sorted.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 border border-border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-xs py-2">Date</TableHead>
                        <TableHead className="text-xs py-2">Diet</TableHead>
                        <TableHead className="text-xs py-2">Exercise</TableHead>
                        <TableHead className="text-xs py-2 text-center">
                          Water
                        </TableHead>
                        <TableHead className="text-xs py-2 text-center">
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
            className="text-xs text-muted-foreground italic"
            data-ocid={`admin.user.empty_state.${index + 1}`}
          >
            No check-ins yet
          </p>
        </CardContent>
      )}
    </Card>
  );
}

export default function AdminDashboard() {
  const { clear } = useInternetIdentity();
  const { data: usersData = [], isLoading: usersLoading } = useAllUsers();
  const { data: checkInsData = [], isLoading: checkInsLoading } =
    useAllUsersCheckIns();

  const isLoading = usersLoading || checkInsLoading;

  // Build maps
  const profileMap = new Map<string, UserProfile>();
  for (const [principal, profile] of usersData) {
    profileMap.set(principal.toString(), profile);
  }

  const checkInsMap = new Map<string, DailyCheckIn[]>();
  for (const [principal, cis] of checkInsData) {
    checkInsMap.set(principal.toString(), cis);
  }

  // Merge: show all principals that have either a profile or check-ins
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="hero-gradient py-6 px-6" data-ocid="admin.page">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white">
                Nutrily Admin
              </h1>
              <p className="text-white/70 text-xs">Follow-Up Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-white/20 text-white border-white/30 text-xs flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Admin
            </Badge>
            <Button
              data-ocid="admin.logout_button"
              variant="outline"
              size="sm"
              onClick={clear}
              className="text-white border-white/40 bg-white/10 hover:bg-white/20 h-8 text-xs"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-4 md:px-6 py-8 flex-1">
        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <Card className="text-center">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-2xl font-extrabold text-foreground">
                  {entries.length}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <CheckInIcon />
                <span className="text-2xl font-extrabold text-foreground">
                  {activeUsers}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Active Trackers</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Salad className="w-4 h-4 text-primary" />
                <span className="text-2xl font-extrabold text-foreground">
                  {totalCheckIns}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Total Check-ins</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* User list */}
        <div className="mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">User Follow-Up</h2>
        </div>

        {isLoading ? (
          <div className="space-y-4" data-ocid="admin.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div
            className="text-center py-16 text-muted-foreground"
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
                <UserFollowUpCard
                  principal={principal}
                  profile={profileMap.get(pid)}
                  checkIns={checkInsMap.get(pid) ?? []}
                  index={i}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function CheckInIcon() {
  return <ShieldCheck className="w-4 h-4 text-primary" />;
}
