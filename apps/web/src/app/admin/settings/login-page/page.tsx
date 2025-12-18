'use client';

/**
 * Login Page Customization
 *
 * Admin control panel for customizing login template.
 * Features:
 * - Template selection (5 templates)
 * - Color customization
 * - Logo and image uploads
 * - Text content editing
 * - Testimonials management
 * - Feature toggles
 * - Live preview panel
 * - Save/Reset/Publish actions
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';
import TemplateSelector from '@/components/admin/login-page/TemplateSelector';
import CustomizationForm from '@/components/admin/login-page/CustomizationForm';
import LivePreview from '@/components/admin/login-page/LivePreview';
import { Save, RotateCcw, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import type { LoginTemplateConfig, UpdateLoginTemplate } from '@shop-rewards/shared';

export default function LoginPageCustomization() {
  const { user } = useAuth();
  const [previewConfig, setPreviewConfig] = useState<LoginTemplateConfig | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch current template configuration
  const { data, isLoading, refetch } = trpc.loginTemplate.getTemplate.useQuery(
    {},
    { refetchOnWindowFocus: false }
  );

  // Save global template mutation (super admin only)
  const saveGlobalMutation = trpc.loginTemplate.saveGlobalTemplate.useMutation({
    onSuccess: () => {
      setSaveSuccess(true);
      setHasUnsavedChanges(false);
      refetch();
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  // Initialize preview config when data loads
  useEffect(() => {
    if (data?.config) {
      setPreviewConfig(data.config);
    }
  }, [data]);

  /**
   * Handle template type change
   */
  const handleTemplateChange = (templateType: LoginTemplateConfig['templateType']) => {
    if (!previewConfig) return;

    setPreviewConfig({
      ...previewConfig,
      templateType,
    });
    setHasUnsavedChanges(true);
  };

  /**
   * Handle configuration changes from customization form
   */
  const handleConfigChange = (updates: Partial<UpdateLoginTemplate>) => {
    if (!previewConfig) return;

    setPreviewConfig({
      ...previewConfig,
      ...updates,
      colors: updates.colors ? { ...previewConfig.colors, ...updates.colors } : previewConfig.colors,
      text: updates.text ? { ...previewConfig.text, ...updates.text } : previewConfig.text,
      features: updates.features ? { ...previewConfig.features, ...updates.features } : previewConfig.features,
      logo: updates.logo || previewConfig.logo,
      backgroundImage: updates.backgroundImage || previewConfig.backgroundImage,
    });
    setHasUnsavedChanges(true);
  };

  /**
   * Save changes to database
   */
  const handleSave = () => {
    if (!previewConfig) return;

    saveGlobalMutation.mutate(previewConfig);
  };

  /**
   * Reset to original configuration
   */
  const handleReset = () => {
    if (data?.config && confirm('Discard all unsaved changes?')) {
      setPreviewConfig(data.config);
      setHasUnsavedChanges(false);
    }
  };

  // Loading state
  if (isLoading || !previewConfig) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading template configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Login Page Customization
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Customize your login page template, colors, branding, and content
            </p>
          </div>

          {/* Save/Reset Actions */}
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <button
                type="button"
                onClick={handleReset}
                disabled={saveGlobalMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={!hasUnsavedChanges || saveGlobalMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saveGlobalMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Unsaved Changes Warning */}
        {hasUnsavedChanges && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                You have unsaved changes
              </p>
              <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
                Your changes are being previewed but not yet saved. Click "Save Changes" to apply them.
              </p>
            </div>
          </div>
        )}

        {/* Save Success Message */}
        {saveSuccess && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Changes saved successfully!
              </p>
              <p className="mt-1 text-xs text-green-700 dark:text-green-300">
                Your login page has been updated. Visit the login page to see the changes.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {saveGlobalMutation.isError && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Failed to save changes
              </p>
              <p className="mt-1 text-xs text-red-700 dark:text-red-300">
                {saveGlobalMutation.error?.message || 'An error occurred while saving. Please try again.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar - Template Selector */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5 sticky top-6">
            <TemplateSelector
              currentTemplate={previewConfig.templateType}
              onSelect={handleTemplateChange}
            />
          </div>
        </div>

        {/* Center - Customization Form */}
        <div className="lg:col-span-5">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5">
            <CustomizationForm
              config={previewConfig}
              onChange={handleConfigChange}
            />
          </div>
        </div>

        {/* Right - Live Preview */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5 sticky top-6 h-[calc(100vh-8rem)]">
            <LivePreview config={previewConfig} />
          </div>
        </div>
      </div>

      {/* Bottom Action Bar (Mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between shadow-lg">
        {hasUnsavedChanges && (
          <button
            type="button"
            onClick={handleReset}
            disabled={saveGlobalMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={!hasUnsavedChanges || saveGlobalMutation.isPending}
          className="flex-1 ml-3 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saveGlobalMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
