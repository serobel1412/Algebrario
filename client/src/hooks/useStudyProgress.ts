import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "algebrario-progress-v1";
type StoredProgress = { completed: string[]; answered: number; correct: number; lastTopic?: string };
const initial: StoredProgress = { completed: [], answered: 0, correct: 0 };

function readProgress(): StoredProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...initial, ...JSON.parse(raw) } : initial;
  } catch {
    return initial;
  }
}

export function useStudyProgress() {
  const [progress, setProgress] = useState<StoredProgress>(readProgress);
  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)), [progress]);

  const toggleCompleted = useCallback((slug: string) => {
    setProgress((current) => {
      const completed = current.completed.includes(slug)
        ? current.completed.filter((item) => item !== slug)
        : [...current.completed, slug];
      return { ...current, completed, lastTopic: slug };
    });
  }, []);

  const recordAnswer = useCallback((correct: boolean, slug?: string) => {
    setProgress((current) => ({ ...current, answered: current.answered + 1, correct: current.correct + (correct ? 1 : 0), lastTopic: slug ?? current.lastTopic }));
  }, []);

  const completion = useMemo(() => Math.round((progress.completed.length / 15) * 100), [progress.completed.length]);
  return { progress, completion, toggleCompleted, recordAnswer };
}
