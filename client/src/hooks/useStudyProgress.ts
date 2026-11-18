import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Difficulty } from "@/data/topics";
import { trpc } from "@/lib/trpc";

const STORAGE_KEY = "algebrario-progress-v1";
export type TopicProgress = { mastery: number; streak: number; difficulty: Difficulty };
type StoredProgress = {
  completed: string[];
  answered: number;
  correct: number;
  lastTopic?: string;
  topics: Record<string, TopicProgress>;
};
const initial: StoredProgress = { completed: [], answered: 0, correct: 0, topics: {} };

function readProgress(): StoredProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as Partial<StoredProgress>;
    return { ...initial, ...parsed, topics: parsed.topics ?? {} };
  } catch {
    return initial;
  }
}

export function useStudyProgress(isAuthenticated = false) {
  const [progress, setProgress] = useState<StoredProgress>(readProgress);
  const { mutate: saveRemoteProgress } = trpc.progress.save.useMutation();
  const remoteProgress = trpc.progress.list.useQuery(undefined, { enabled: isAuthenticated, retry: false, staleTime: Infinity });
  const hydrated = useRef(false);
  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)), [progress]);
  useEffect(() => {
    if (!isAuthenticated) { hydrated.current = false; return; }
    if (hydrated.current || !remoteProgress.data) return;
    hydrated.current = true;
    setProgress(current => {
      const topics = { ...current.topics };
      const completed = new Set(current.completed);
      remoteProgress.data.forEach(row => {
        topics[row.topicId] = { mastery: row.mastery, streak: row.streak, difficulty: row.difficulty };
        if (row.mastery >= 100) completed.add(row.topicId);
      });
      return { ...current, topics, completed: [...completed] };
    });
  }, [isAuthenticated, remoteProgress.data]);
  useEffect(() => {
    const slug = progress.lastTopic;
    if (!slug || typeof window === "undefined") return;
    try {
      if (!isAuthenticated || !localStorage.getItem("manus-runtime-user-info")) return;
      const detail = progress.topics[slug];
      if (!detail) return;
      saveRemoteProgress({ topicId: slug, ...detail, attempts: progress.answered, correct: progress.correct });
    } catch {
      // La práctica local sigue funcionando aunque el backend no esté disponible.
    }
  }, [isAuthenticated, progress, saveRemoteProgress]);

  const toggleCompleted = useCallback((slug: string) => {
    setProgress((current) => {
      const completed = current.completed.includes(slug)
        ? current.completed.filter((item) => item !== slug)
        : [...current.completed, slug];
      return { ...current, completed, lastTopic: slug };
    });
  }, []);

  const recordAnswer = useCallback((correct: boolean, slug?: string) => {
    setProgress((current) => {
      if (!slug) return { ...current, answered: current.answered + 1, correct: current.correct + (correct ? 1 : 0) };
      const previous = current.topics[slug] ?? { mastery: 0, streak: 0, difficulty: "Básico" as Difficulty };
      const streak = correct ? previous.streak + 1 : 0;
      const difficulty: Difficulty = correct && streak >= 3
        ? previous.difficulty === "Básico" ? "Intermedio" : "Reto"
        : previous.difficulty;
      const mastery = Math.min(100, Math.max(0, previous.mastery + (correct ? 5 : -1)));
      const topics = { ...current.topics, [slug]: { mastery, streak, difficulty } };
      return {
        ...current,
        answered: current.answered + 1,
        correct: current.correct + (correct ? 1 : 0),
        lastTopic: slug,
        topics,
      };
    });
  }, []);

  const getTopicProgress = useCallback((slug: string): TopicProgress => progress.topics[slug] ?? { mastery: 0, streak: 0, difficulty: "Básico" }, [progress.topics]);
  const completion = useMemo(() => Math.round((progress.completed.length / 15) * 100), [progress.completed.length]);
  return { progress, completion, toggleCompleted, recordAnswer, getTopicProgress };
}
