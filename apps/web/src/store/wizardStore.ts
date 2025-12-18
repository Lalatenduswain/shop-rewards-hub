import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  WizardState,
  CompanySetup,
  AdminSetup,
  BrandingSetup,
  AppConfigSetup,
  SecuritySetup,
  SmtpConfig,
  DatabaseTarget,
  RbacSetup,
  OrganizationSetup,
  DataImport,
  BillingSetup,
  LaunchConfirmation,
} from '@shop-rewards/shared/validators';

/**
 * Extended Wizard State with UI-specific properties
 */
export interface WizardStoreState extends Partial<WizardState> {
  // Current wizard progress
  currentStep: number;
  completedSteps: number[];

  // Individual step data
  company?: CompanySetup;
  admin?: AdminSetup;
  branding?: BrandingSetup;
  appConfig?: AppConfigSetup;
  security?: SecuritySetup;
  smtp?: SmtpConfig;
  database?: DatabaseTarget;
  rbac?: RbacSetup;
  organization?: OrganizationSetup;
  dataImport?: DataImport;
  billing?: BillingSetup;
  launch?: LaunchConfirmation;

  // UI state
  isLoading: boolean;
  error: string | null;
  lastSaved: Date | null;

  // Actions
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  markStepCompleted: (step: number) => void;

  // Data setters for each step
  setCompanyData: (data: Partial<CompanySetup>) => void;
  setAdminData: (data: Partial<AdminSetup>) => void;
  setBrandingData: (data: Partial<BrandingSetup>) => void;
  setAppConfigData: (data: Partial<AppConfigSetup>) => void;
  setSecurityData: (data: Partial<SecuritySetup>) => void;
  setSmtpData: (data: Partial<SmtpConfig>) => void;
  setDatabaseData: (data: Partial<DatabaseTarget>) => void;
  setRbacData: (data: Partial<RbacSetup>) => void;
  setOrganizationData: (data: Partial<OrganizationSetup>) => void;
  setDataImportData: (data: Partial<DataImport>) => void;
  setBillingData: (data: Partial<BillingSetup>) => void;
  setLaunchData: (data: Partial<LaunchConfirmation>) => void;

  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetWizard: () => void;
  getProgress: () => number;
  canProceedToStep: (step: number) => boolean;
}

const TOTAL_STEPS = 12;

const initialState = {
  currentStep: 1,
  completedSteps: [],
  isLoading: false,
  error: null,
  lastSaved: null,
};

/**
 * Zustand wizard store with localStorage persistence
 *
 * Features:
 * - Persists wizard state to localStorage
 * - Auto-saves on every state change
 * - Supports draft save/resume
 * - Type-safe with Zod validators
 * - Step validation and navigation control
 */
export const useWizardStore = create<WizardStoreState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Navigation actions
      setCurrentStep: (step) => {
        if (step >= 1 && step <= TOTAL_STEPS) {
          set({ currentStep: step });
        }
      },

      nextStep: () => {
        const { currentStep } = get();
        if (currentStep < TOTAL_STEPS) {
          set({ currentStep: currentStep + 1 });
        }
      },

      previousStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 });
        }
      },

      markStepCompleted: (step) => {
        set((state) => ({
          completedSteps: [...new Set([...state.completedSteps, step])],
          lastSaved: new Date(),
        }));
      },

      // Data setters
      setCompanyData: (data) => {
        set((state) => ({
          company: { ...state.company, ...data } as CompanySetup,
          lastSaved: new Date(),
        }));
      },

      setAdminData: (data) => {
        set((state) => ({
          admin: { ...state.admin, ...data } as AdminSetup,
          lastSaved: new Date(),
        }));
      },

      setBrandingData: (data) => {
        set((state) => ({
          branding: { ...state.branding, ...data } as BrandingSetup,
          lastSaved: new Date(),
        }));
      },

      setAppConfigData: (data) => {
        set((state) => ({
          appConfig: { ...state.appConfig, ...data } as AppConfigSetup,
          lastSaved: new Date(),
        }));
      },

      setSecurityData: (data) => {
        set((state) => ({
          security: { ...state.security, ...data } as SecuritySetup,
          lastSaved: new Date(),
        }));
      },

      setSmtpData: (data) => {
        set((state) => ({
          smtp: { ...state.smtp, ...data } as SmtpConfig,
          lastSaved: new Date(),
        }));
      },

      setDatabaseData: (data) => {
        set((state) => ({
          database: { ...state.database, ...data } as DatabaseTarget,
          lastSaved: new Date(),
        }));
      },

      setRbacData: (data) => {
        set((state) => ({
          rbac: { ...state.rbac, ...data } as RbacSetup,
          lastSaved: new Date(),
        }));
      },

      setOrganizationData: (data) => {
        set((state) => ({
          organization: { ...state.organization, ...data } as OrganizationSetup,
          lastSaved: new Date(),
        }));
      },

      setDataImportData: (data) => {
        set((state) => ({
          dataImport: { ...state.dataImport, ...data } as DataImport,
          lastSaved: new Date(),
        }));
      },

      setBillingData: (data) => {
        set((state) => ({
          billing: { ...state.billing, ...data } as BillingSetup,
          lastSaved: new Date(),
        }));
      },

      setLaunchData: (data) => {
        set((state) => ({
          launch: { ...state.launch, ...data } as LaunchConfirmation,
          lastSaved: new Date(),
        }));
      },

      // Utility actions
      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      resetWizard: () => set(initialState),

      getProgress: () => {
        const { completedSteps } = get();
        return Math.round((completedSteps.length / TOTAL_STEPS) * 100);
      },

      canProceedToStep: (step) => {
        const { completedSteps } = get();
        // Can always go to step 1
        if (step === 1) return true;
        // Can proceed if previous step is completed
        return completedSteps.includes(step - 1);
      },
    }),
    {
      name: 'shop-rewards-wizard-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist wizard data, not UI state
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        company: state.company,
        admin: state.admin,
        branding: state.branding,
        appConfig: state.appConfig,
        security: state.security,
        smtp: state.smtp,
        database: state.database,
        rbac: state.rbac,
        organization: state.organization,
        dataImport: state.dataImport,
        billing: state.billing,
        launch: state.launch,
        lastSaved: state.lastSaved,
      }),
    }
  )
);

/**
 * Hook to get wizard completion status
 */
export function useWizardCompletion() {
  const completedSteps = useWizardStore((state) => state.completedSteps);
  const getProgress = useWizardStore((state) => state.getProgress);

  return {
    completedSteps,
    progress: getProgress(),
    isComplete: completedSteps.length === TOTAL_STEPS,
    remainingSteps: TOTAL_STEPS - completedSteps.length,
  };
}

/**
 * Hook to get current step validation status
 */
export function useStepValidation(step: number) {
  const canProceed = useWizardStore((state) => state.canProceedToStep(step));
  const isCompleted = useWizardStore((state) => state.completedSteps.includes(step));

  return {
    canAccess: canProceed,
    isCompleted,
    isLocked: !canProceed,
  };
}
