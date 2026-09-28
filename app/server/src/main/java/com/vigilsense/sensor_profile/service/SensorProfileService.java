package com.vigilsense.sensor_profile.service;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vigilsense.common.exception.ResourceNotFoundException;
import com.vigilsense.sensor_profile.dto.SensorProfileResponse;
import com.vigilsense.sensor_profile.repository.SensorProfileRepository;

@Service
@Transactional(readOnly = true)
public class SensorProfileService {

    private final SensorProfileRepository sensorProfileRepository;

    public SensorProfileService(SensorProfileRepository sensorProfileRepository) {
        this.sensorProfileRepository = sensorProfileRepository;
    }

    public List<SensorProfileResponse> listProfiles() {
        return sensorProfileRepository.findAllActiveWithParameters().stream()
                .sorted(Comparator.comparing(profile -> profile.getName(), String.CASE_INSENSITIVE_ORDER))
                .map(SensorProfileResponse::from)
                .toList();
    }

    public SensorProfileResponse getProfile(Long id) {
        return sensorProfileRepository.findByIdWithParameters(id)
                .map(SensorProfileResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Sensor profile not found: " + id));
    }
}
