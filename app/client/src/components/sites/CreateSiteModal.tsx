import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { sitesApi } from '../../api/sites.api';
import { weatherApi } from '../../api/weather.api';
import { useToast } from '../../context/ToastContext';
import { MapPin, CheckCircle2 } from 'lucide-react';

export interface CreateSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateSiteModal({ isOpen, onClose, onCreated }: CreateSiteModalProps) {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Site name is required.';
    if (!locationLabel.trim()) errs.locationLabel = 'Address or location label is required.';
    
    const lat = parseFloat(latitude);
    if (!latitude || isNaN(lat) || lat < -90 || lat > 90) {
      errs.latitude = 'Latitude must be a valid coordinate between -90.0 and 90.0.';
    }

    const lon = parseFloat(longitude);
    if (!longitude || isNaN(lon) || lon < -180 || lon > 180) {
      errs.longitude = 'Longitude must be a valid coordinate between -180.0 and 180.0.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const created = await sitesApi.create({
        name: name.trim(),
        locationLabel: locationLabel.trim(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      });

      // Automatically trigger initial weather fetch for coordinates
      try {
        await weatherApi.refresh(created.id);
      } catch (wErr) {
        console.warn('Initial weather fetch delayed', wErr);
      }

      showToast('success', 'Site Registered', `Perimeter facility "${created.name}" established.`);
      onCreated();
      onClose();
      // Reset form
      setName('');
      setLocationLabel('');
      setLatitude('');
      setLongitude('');
      setErrors({});
    } catch (err: any) {
      showToast('error', 'Registration Error', err.message || 'Failed to create perimeter site.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register Perimeter Site"
      description="Deploy a new monitored facility with geographic coordinates for live atmospheric correlation."
      size="md"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            leftIcon={<CheckCircle2 size={14} />}
          >
            Deploy Facility
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Site Name"
          placeholder="e.g. Mumbai Refinery Facility"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
          }}
          error={errors.name}
          required
        />

        <Input
          label="Geographic Address / Location Label"
          placeholder="e.g. Mahul, Trombay, Mumbai, Maharashtra, India"
          value={locationLabel}
          onChange={(e) => {
            setLocationLabel(e.target.value);
            if (errors.locationLabel) setErrors((prev) => ({ ...prev, locationLabel: '' }));
          }}
          error={errors.locationLabel}
          leftIcon={<MapPin size={14} />}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Latitude (°)"
            placeholder="e.g. 19.0760"
            value={latitude}
            onChange={(e) => {
              setLatitude(e.target.value);
              if (errors.latitude) setErrors((prev) => ({ ...prev, latitude: '' }));
            }}
            error={errors.latitude}
            helperText="-90.0 to 90.0"
            required
          />

          <Input
            label="Longitude (°)"
            placeholder="e.g. 72.8777"
            value={longitude}
            onChange={(e) => {
              setLongitude(e.target.value);
              if (errors.longitude) setErrors((prev) => ({ ...prev, longitude: '' }));
            }}
            error={errors.longitude}
            helperText="-180.0 to 180.0"
            required
          />
        </div>

        <div className="p-3 rounded border border-border bg-surface-secondary/30 text-xs text-muted leading-relaxed">
          Open-Meteo weather models correlate wind velocity, precipitation, and thermal metrics to these exact coordinates for sensor calibration.
        </div>
      </form>
    </Modal>
  );
}
