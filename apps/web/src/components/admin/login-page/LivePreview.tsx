'use client';

/**
 * LivePreview Component
 *
 * Live preview panel for login template customization.
 * Features:
 * - Device size tabs (Desktop, Tablet, Mobile)
 * - Real-time rendering with TemplateRenderer
 * - CSS transform scaling for zoom-to-fit
 * - "Test Live" button (opens actual login page)
 * - Loading state during render
 * - Border to indicate preview mode
 *
 * Used in: Admin Login Page (/admin/settings/login-page)
 */

import { useState, useEffect } from 'react';
import { Monitor, Tablet, Smartphone, ExternalLink, Loader2 } from 'lucide-react';
import TemplateRenderer from '@/components/login/templates/TemplateRenderer';
import type { LoginTemplateConfig } from '@shop-rewards/shared';

interface LivePreviewProps {
  /** Current template configuration */
  config: LoginTemplateConfig;
  /** Optional className for wrapper */
  className?: string;
}

type DeviceSize = 'desktop' | 'tablet' | 'mobile';

const DEVICE_SIZES = {
  desktop: { width: 1920, height: 1080, label: 'Desktop', icon: Monitor },
  tablet: { width: 768, height: 1024, label: 'Tablet', icon: Tablet },
  mobile: { width: 375, height: 667, label: 'Mobile', icon: Smartphone },
};

export default function LivePreview({ config, className = '' }: LivePreviewProps) {
  const [device, setDevice] = useState<DeviceSize>('desktop');
  const [isRendering, setIsRendering] = useState(false);
  const [scale, setScale] = useState(1);

  // Calculate scale to fit preview in container
  useEffect(() => {
    const updateScale = () => {
      const container = document.getElementById('preview-container');
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const deviceWidth = DEVICE_SIZES[device].width;
      const deviceHeight = DEVICE_SIZES[device].height;

      // Calculate scale to fit both width and height with padding
      const scaleX = (containerWidth - 40) / deviceWidth;
      const scaleY = (containerHeight - 40) / deviceHeight;
      const newScale = Math.min(scaleX, scaleY, 1); // Don't scale up, max 1:1

      setScale(newScale);
    };

    updateScale();

    // Recalculate on window resize
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [device]);

  // Trigger rendering state when config changes
  useEffect(() => {
    setIsRendering(true);
    const timer = setTimeout(() => {
      setIsRendering(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [config]);

  const openLiveTest = () => {
    window.open('/login', '_blank');
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Live Preview
        </h3>
        <button
          type="button"
          onClick={openLiveTest}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Test Live</span>
        </button>
      </div>

      {/* Device Tabs */}
      <div className="flex-shrink-0 flex items-center gap-2 mb-4">
        {(Object.entries(DEVICE_SIZES) as [DeviceSize, typeof DEVICE_SIZES.desktop][]).map(
          ([size, { label, icon: Icon }]) => (
            <button
              key={size}
              type="button"
              onClick={() => setDevice(size)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                device === size
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          )
        )}
      </div>

      {/* Preview Container */}
      <div
        id="preview-container"
        className="flex-1 relative bg-gray-100 dark:bg-gray-950 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-800"
      >
        {/* Loading Overlay */}
        {isRendering && (
          <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Rendering preview...</p>
            </div>
          </div>
        )}

        {/* Preview Viewport */}
        <div className="absolute inset-0 flex items-center justify-center p-4 overflow-auto">
          <div
            className="relative bg-white dark:bg-gray-900 shadow-2xl"
            style={{
              width: `${DEVICE_SIZES[device].width}px`,
              height: `${DEVICE_SIZES[device].height}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
              transition: 'transform 0.3s ease-in-out',
            }}
          >
            {/* Preview Mode Badge */}
            <div className="absolute top-4 right-4 z-50 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-full shadow-lg">
              PREVIEW
            </div>

            {/* Render Template */}
            <div className="w-full h-full overflow-hidden">
              <TemplateRenderer config={config} />
            </div>
          </div>
        </div>

        {/* Device Info Overlay */}
        <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/70 backdrop-blur-sm text-white text-xs font-mono rounded-lg">
          {DEVICE_SIZES[device].width} × {DEVICE_SIZES[device].height}px • {Math.round(scale * 100)}%
        </div>
      </div>

      {/* Helper Text */}
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
        Changes update in real-time. Click "Test Live" to see the actual login page.
      </p>
    </div>
  );
}
