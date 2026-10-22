import { useEffect } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/Home";
import { NotationPage } from "./pages/Notation";
import { CoursePage, LessonPage } from "./pages/Course";
import { AlgorithmsPage } from "./pages/Algorithms";
import { ScramblerPage } from "./pages/Scrambler";
import { TrainingPage } from "./pages/Training";
import { TimerPage } from "./pages/Timer";
import { TrainerPage } from "./pages/Trainer";
import { QuizPage } from "./pages/Quiz";
import { SettingsPage } from "./pages/Settings";
import { useStore } from "./store/useStore";

export function App() {
  const theme = useStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#0b0d12" : "#f4f6fa");
  }, [theme]);

  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="notation" element={<NotationPage />} />
          <Route path="parcours" element={<CoursePage />} />
          <Route path="parcours/:id" element={<LessonPage />} />
          <Route path="algorithmes" element={<AlgorithmsPage />} />
          <Route path="melangeur" element={<ScramblerPage />} />
          <Route path="entrainement" element={<TrainingPage />} />
          <Route path="entrainement/chrono" element={<TimerPage />} />
          <Route path="entrainement/algos" element={<TrainerPage />} />
          <Route path="entrainement/quiz" element={<QuizPage />} />
          <Route path="reglages" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
