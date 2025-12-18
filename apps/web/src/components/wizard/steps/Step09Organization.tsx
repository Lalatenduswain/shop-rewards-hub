'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { organizationSchema, type Organization } from '@shop-rewards/shared';
import { useWizardStore } from '@/store/wizardStore';
import { useEffect, useState } from 'react';

export function Step09Organization() {
  const organization = useWizardStore((state) => state.organization);
  const setOrganizationData = useWizardStore((state) => state.setOrganizationData);
  const markStepCompleted = useWizardStore((state) => state.markStepCompleted);
  const [departments, setDepartments] = useState<string[]>(organization?.departments || []);
  const [locations, setLocations] = useState<string[]>(organization?.locations || []);
  const [newDepartment, setNewDepartment] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<Organization>({
    resolver: zodResolver(organizationSchema),
    defaultValues: organization,
    mode: 'onChange',
  });

  useEffect(() => {
    if (isValid) {
      markStepCompleted(9);
    }
  }, [isValid, markStepCompleted]);

  // Save form data including departments and locations
  const saveFormData = (data: Organization) => {
    setOrganizationData({ ...data, departments, locations });
  };

  // Save when departments or locations change
  useEffect(() => {
    handleSubmit(saveFormData)();
  }, [departments, locations]);

  const addDepartment = () => {
    if (newDepartment.trim() && !departments.includes(newDepartment.trim())) {
      const updated = [...departments, newDepartment.trim()];
      setDepartments(updated);
      setNewDepartment('');
    }
  };

  const removeDepartment = (index: number) => {
    setDepartments(departments.filter((_, i) => i !== index));
  };

  const addLocation = () => {
    if (newLocation.trim() && !locations.includes(newLocation.trim())) {
      const updated = [...locations, newLocation.trim()];
      setLocations(updated);
      setNewLocation('');
    }
  };

  const removeLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit(saveFormData)} className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Define your organization structure with departments and locations (optional). This helps with reporting and access control.
        </p>
      </div>

      {/* Departments */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Departments</h3>

        {/* Add Department */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newDepartment}
            onChange={(e) => setNewDepartment(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDepartment())}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Sales, Marketing, Operations"
          />
          <button
            type="button"
            onClick={addDepartment}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
          >
            Add
          </button>
        </div>

        {/* Departments List */}
        {departments.length > 0 ? (
          <div className="space-y-2">
            {departments.map((dept, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <span className="text-sm text-gray-900 dark:text-white">{dept}</span>
                <button
                  type="button"
                  onClick={() => removeDepartment(index)}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No departments added yet. Add departments to organize your team.
            </p>
          </div>
        )}
      </div>

      {/* Locations */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Locations</h3>

        {/* Add Location */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., New York HQ, London Office, Tokyo Branch"
          />
          <button
            type="button"
            onClick={addLocation}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
          >
            Add
          </button>
        </div>

        {/* Locations List */}
        {locations.length > 0 ? (
          <div className="space-y-2">
            {locations.map((loc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <span className="text-sm text-gray-900 dark:text-white">{loc}</span>
                <button
                  type="button"
                  onClick={() => removeLocation(index)}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No locations added yet. Add physical or regional locations.
            </p>
          </div>
        )}
      </div>

      {/* Skip Option */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You can skip this step and add departments/locations later from the admin dashboard.
          </p>
        </div>
      </div>

      {/* Validation Status */}
      {isValid && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ Organization structure configured ({departments.length} departments, {locations.length} locations). Click "Next" to continue.
          </p>
        </div>
      )}
    </form>
  );
}
