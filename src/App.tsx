import { HashRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { lazy, Suspense } from "react";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Records = lazy(() => import("@/pages/Records"));
const DailyLog = lazy(() => import("@/pages/DailyLog"));
const DailyLogForm = lazy(() => import("@/pages/DailyLogForm"));
const FeedForm = lazy(() => import("@/pages/FeedForm"));
const SleepForm = lazy(() => import("@/pages/SleepForm"));
const DiaperForm = lazy(() => import("@/pages/DiaperForm"));
const Growth = lazy(() => import("@/pages/Growth"));
const GrowthForm = lazy(() => import("@/pages/GrowthForm"));
const Vaccines = lazy(() => import("@/pages/Vaccines"));
const VaccineForm = lazy(() => import("@/pages/VaccineForm"));
const Milestones = lazy(() => import("@/pages/Milestones"));
const MilestoneForm = lazy(() => import("@/pages/MilestoneForm"));
const Journal = lazy(() => import("@/pages/Journal"));
const JournalForm = lazy(() => import("@/pages/JournalForm"));
const ProfilePage = lazy(() => import("@/pages/Profile"));
const Backup = lazy(() => import("@/pages/Backup"));

function Loading() {
  return (
    <div className="flex items-center justify-center h-40">
      <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="records" element={<Records />} />
            <Route path="daily-log" element={<DailyLog />} />
            <Route path="daily-log/new" element={<DailyLogForm />} />
            <Route path="daily-log/:date/edit" element={<DailyLogForm />} />
            <Route path="feed/new" element={<FeedForm />} />
            <Route path="feed/:id/edit" element={<FeedForm />} />
            <Route path="sleep/new" element={<SleepForm />} />
            <Route path="sleep/:id/edit" element={<SleepForm />} />
            <Route path="diaper/new" element={<DiaperForm />} />
            <Route path="diaper/:id/edit" element={<DiaperForm />} />
            <Route path="growth" element={<Growth />} />
            <Route path="growth/new" element={<GrowthForm />} />
            <Route path="growth/:id/edit" element={<GrowthForm />} />
            <Route path="vaccines" element={<Vaccines />} />
            <Route path="vaccines/new" element={<VaccineForm />} />
            <Route path="vaccines/:id/edit" element={<VaccineForm />} />
            <Route path="milestones" element={<Milestones />} />
            <Route path="milestones/new" element={<MilestoneForm />} />
            <Route path="milestones/:id/edit" element={<MilestoneForm />} />
            <Route path="journal" element={<Journal />} />
            <Route path="journal/new" element={<JournalForm />} />
            <Route path="journal/:id/edit" element={<JournalForm />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="backup" element={<Backup />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
