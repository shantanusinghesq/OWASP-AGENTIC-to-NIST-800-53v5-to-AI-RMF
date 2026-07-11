/**
 * AssessmentContext — working-assessment state + persistence
 *
 * Reducer-driven state for the assessment tray: which crosswalk mappings are
 * selected, per-mapping annotations, and the assessment's identity (name/id).
 * The provider lazy-initializes from localStorage (pruning refs that no longer
 * resolve against the current data) and autosaves on every change.
 *
 * Two consumer hooks (provider-tolerance rule):
 *   - useAssessment()      → throws without a provider. For the tray/exports,
 *                            which always render under the provider.
 *   - useAssessmentMaybe() → returns null without a provider. For opt-in UI
 *                            embedded in components that are also rendered
 *                            provider-less (e.g. RiskDetail in tests).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { CROSSWALK, CROSSWALK_DATA_VERSION } from "@/data/crosswalk";
import {
  blankAnnotation,
  DEFAULT_ASSESSMENT_NAME,
  mappingKey,
  type Assessment,
  type MappingAnnotation,
  type MappingRef,
} from "./types";
import * as storage from "./storage";

// ─── Reducer ────────────────────────────────────────────────────────

export type AssessmentAction =
  | { type: "toggle"; refr: MappingRef }
  | { type: "setAsiSelected"; asiId: string; selected: boolean }
  | { type: "rename"; name: string }
  | { type: "annotate"; mkey: string; patch: Partial<MappingAnnotation> }
  | { type: "clear" }
  | { type: "load"; assessment: Assessment }
  | { type: "new" };

const blankAssessment = (): Assessment => {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: DEFAULT_ASSESSMENT_NAME,
    createdAt: now,
    updatedAt: now,
    dataVersion: CROSSWALK_DATA_VERSION,
    selections: [],
    annotations: {},
  };
};

/** All mapping refs the crosswalk offers for one ASI (both frameworks). */
const asiRefs = (asiId: string): MappingRef[] => {
  const entry = CROSSWALK[asiId];
  if (!entry) return [];
  return [
    ...entry.nist53.map((m): MappingRef => ({ asiId, framework: "nist", familyOrFunc: m.family })),
    ...entry.aiRmf.map((m): MappingRef => ({ asiId, framework: "aiRmf", familyOrFunc: m.func })),
  ];
};

const touch = (a: Assessment): Assessment => ({ ...a, updatedAt: new Date().toISOString() });

export function assessmentReducer(state: Assessment, action: AssessmentAction): Assessment {
  switch (action.type) {
    case "toggle": {
      const key = mappingKey(action.refr);
      const exists = state.selections.some((r) => mappingKey(r) === key);
      if (exists) {
        const annotations = { ...state.annotations };
        delete annotations[key];
        return touch({
          ...state,
          selections: state.selections.filter((r) => mappingKey(r) !== key),
          annotations,
        });
      }
      return touch({ ...state, selections: [...state.selections, action.refr] });
    }
    case "setAsiSelected": {
      const refs = asiRefs(action.asiId);
      if (action.selected) {
        const have = new Set(state.selections.map(mappingKey));
        const additions = refs.filter((r) => !have.has(mappingKey(r)));
        if (additions.length === 0) return state;
        return touch({ ...state, selections: [...state.selections, ...additions] });
      }
      const dropKeys = new Set(refs.map(mappingKey));
      const selections = state.selections.filter((r) => !dropKeys.has(mappingKey(r)));
      if (selections.length === state.selections.length) return state;
      const annotations: Assessment["annotations"] = {};
      for (const [key, ann] of Object.entries(state.annotations)) {
        if (!dropKeys.has(key)) annotations[key] = ann;
      }
      return touch({ ...state, selections, annotations });
    }
    case "rename":
      return touch({ ...state, name: action.name });
    case "annotate": {
      const current = state.annotations[action.mkey] ?? blankAnnotation();
      return touch({
        ...state,
        annotations: { ...state.annotations, [action.mkey]: { ...current, ...action.patch } },
      });
    }
    case "clear":
      return touch({ ...state, selections: [], annotations: {} });
    case "load":
      return action.assessment;
    case "new":
      return blankAssessment();
    default:
      return state;
  }
}

// ─── Context ────────────────────────────────────────────────────────

export interface SavedAssessmentMeta {
  id: string;
  name: string;
  updatedAt: string;
  count: number;
}

interface AssessmentContextValue {
  assessment: Assessment;
  selectedKeys: Set<string>;
  toggle: (refr: MappingRef) => void;
  setAsiSelected: (asiId: string, selected: boolean) => void;
  rename: (name: string) => void;
  annotate: (mkey: string, patch: Partial<MappingAnnotation>) => void;
  clear: () => void;
  newAssessment: () => void;
  loadAssessment: (assessment: Assessment) => void;
  saved: SavedAssessmentMeta[];
  saveCurrent: () => void;
  loadSaved: (id: string) => void;
  deleteSaved: (id: string) => void;
}

const AssessmentContext = createContext<AssessmentContextValue | null>(null);

const toMeta = (a: Assessment): SavedAssessmentMeta => ({
  id: a.id,
  name: a.name,
  updatedAt: a.updatedAt,
  count: a.selections.length,
});

interface InitResult {
  assessment: Assessment;
  droppedCount: number;
}

const initWorking = (): InitResult => {
  try {
    const stored = storage.loadWorking();
    if (!stored) return { assessment: blankAssessment(), droppedCount: 0 };
    return storage.pruneStale(stored);
  } catch {
    return { assessment: blankAssessment(), droppedCount: 0 };
  }
};

// ─── Provider ───────────────────────────────────────────────────────

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const initRef = useRef<InitResult | null>(null);
  if (initRef.current === null) initRef.current = initWorking();

  const [assessment, dispatch] = useReducer(
    assessmentReducer,
    initRef.current.assessment,
  );
  const [savedList, setSavedList] = useState<Assessment[]>(() => {
    try {
      return storage.loadSaved();
    } catch {
      return [];
    }
  });

  // One-time notice when stale refs were pruned out of the restored session.
  useEffect(() => {
    const dropped = initRef.current?.droppedCount ?? 0;
    if (dropped > 0) {
      toast.warning(
        `${dropped} selection${dropped === 1 ? "" : "s"} referenced mappings that changed and ${dropped === 1 ? "was" : "were"} dropped.`,
      );
    }
  }, []);

  // Autosave the working assessment on every change (storage is try/catch'd).
  useEffect(() => {
    storage.saveWorking(assessment);
  }, [assessment]);

  const selectedKeys = useMemo(
    () => new Set(assessment.selections.map(mappingKey)),
    [assessment.selections],
  );

  const toggle = useCallback((refr: MappingRef): void => dispatch({ type: "toggle", refr }), []);
  const setAsiSelected = useCallback(
    (asiId: string, selected: boolean): void => dispatch({ type: "setAsiSelected", asiId, selected }),
    [],
  );
  const rename = useCallback((name: string): void => dispatch({ type: "rename", name }), []);
  const annotate = useCallback(
    (mkey: string, patch: Partial<MappingAnnotation>): void =>
      dispatch({ type: "annotate", mkey, patch }),
    [],
  );
  const clear = useCallback((): void => dispatch({ type: "clear" }), []);
  const newAssessment = useCallback((): void => dispatch({ type: "new" }), []);
  const loadAssessment = useCallback(
    (a: Assessment): void => dispatch({ type: "load", assessment: a }),
    [],
  );

  const saveCurrent = useCallback((): void => {
    storage.saveNamed(assessment);
    setSavedList(storage.loadSaved());
  }, [assessment]);

  const loadSavedById = useCallback(
    (id: string): void => {
      const found = savedList.find((a) => a.id === id);
      if (!found) return;
      const { assessment: pruned, droppedCount } = storage.pruneStale(found);
      dispatch({ type: "load", assessment: pruned });
      if (droppedCount > 0) {
        toast.warning(
          `${droppedCount} selection${droppedCount === 1 ? "" : "s"} referenced mappings that changed and ${droppedCount === 1 ? "was" : "were"} dropped.`,
        );
      }
    },
    [savedList],
  );

  const deleteSavedById = useCallback((id: string): void => {
    storage.deleteSaved(id);
    setSavedList(storage.loadSaved());
  }, []);

  const value = useMemo<AssessmentContextValue>(
    () => ({
      assessment,
      selectedKeys,
      toggle,
      setAsiSelected,
      rename,
      annotate,
      clear,
      newAssessment,
      loadAssessment,
      saved: savedList.map(toMeta),
      saveCurrent,
      loadSaved: loadSavedById,
      deleteSaved: deleteSavedById,
    }),
    [
      assessment,
      selectedKeys,
      toggle,
      setAsiSelected,
      rename,
      annotate,
      clear,
      newAssessment,
      loadAssessment,
      savedList,
      saveCurrent,
      loadSavedById,
      deleteSavedById,
    ],
  );

  return <AssessmentContext.Provider value={value}>{children}</AssessmentContext.Provider>;
}

// ─── Hooks ──────────────────────────────────────────────────────────

/** Strict consumer — for components that always render under the provider. */
export function useAssessment(): AssessmentContextValue {
  const ctx = useContext(AssessmentContext);
  if (!ctx) throw new Error("useAssessment must be used within AssessmentProvider");
  return ctx;
}

/**
 * Tolerant consumer — returns null without a provider so embedded opt-in UI
 * (e.g. SelectToggle inside MappingCard) can no-op when a host renders
 * provider-less (RiskDetail.validation.test.tsx does exactly that).
 */
export function useAssessmentMaybe(): AssessmentContextValue | null {
  return useContext(AssessmentContext);
}
