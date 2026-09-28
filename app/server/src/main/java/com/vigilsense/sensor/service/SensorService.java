package com.vigilsense.sensor.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vigilsense.common.exception.ResourceNotFoundException;
import com.vigilsense.sensor.dto.CreateSensorRequest;
import com.vigilsense.sensor.dto.ParameterValueRequest;
import com.vigilsense.sensor.dto.SensorResponse;
import com.vigilsense.sensor.dto.UpdateSensorRequest;
import com.vigilsense.sensor.entity.Sensor;
import com.vigilsense.sensor.entity.SensorConfiguration;
import com.vigilsense.sensor.entity.SensorStatus;
import com.vigilsense.sensor.repository.SensorRepository;
import com.vigilsense.sensor_profile.dto.SensorProfileResponse;
import com.vigilsense.sensor_profile.entity.SensorParameter;
import com.vigilsense.sensor_profile.entity.SensorProfile;
import com.vigilsense.sensor_profile.repository.SensorProfileRepository;
import com.vigilsense.site.entity.Site;
import com.vigilsense.site.repository.SiteRepository;

@Service
@Transactional(readOnly = true)
public class SensorService {

    private final SensorRepository sensorRepository;
    private final SiteRepository siteRepository;
    private final SensorProfileRepository sensorProfileRepository;

    public SensorService(
            SensorRepository sensorRepository,
            SiteRepository siteRepository,
            SensorProfileRepository sensorProfileRepository) {
        this.sensorRepository = sensorRepository;
        this.siteRepository = siteRepository;
        this.sensorProfileRepository = sensorProfileRepository;
    }

    public List<SensorResponse> listBySite(Long siteId) {
        requireSite(siteId);
        return sensorRepository.findAllBySiteIdWithDetails(siteId).stream()
                .map(SensorResponse::from)
                .toList();
    }

    public SensorResponse getSensor(Long id) {
        return SensorResponse.from(requireSensor(id));
    }

    public SensorProfileResponse getProfile(Long sensorId) {
        Sensor sensor = requireSensor(sensorId);
        return sensorProfileRepository.findByIdWithParameters(sensor.getProfile().getId())
                .map(SensorProfileResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Sensor profile not found: " + sensor.getProfile().getId()));
    }

    @Transactional
    public SensorResponse createSensor(Long siteId, CreateSensorRequest request) {
        Site site = requireSite(siteId);
        String name = request.name().trim();
        if (sensorRepository.existsBySiteIdAndNameIgnoreCase(siteId, name)) {
            throw new IllegalArgumentException("A sensor named '" + name + "' already exists at this site");
        }
        SensorProfile profile = requireActiveProfile(request.sensorProfileId());

        Sensor sensor = new Sensor();
        sensor.setSite(site);
        sensor.setProfile(profile);
        sensor.setName(name);
        sensor.setManufacturer(trimToNull(request.manufacturer()));
        sensor.setModel(trimToNull(request.model()));
        sensor.setInstallationZone(trimToNull(request.installationZone()));
        sensor.setStatus(request.status() == null ? SensorStatus.ACTIVE : request.status());
        replaceConfiguration(sensor, profile, request.configuration());
        return SensorResponse.from(sensorRepository.save(sensor));
    }

    @Transactional
    public SensorResponse updateSensor(Long id, UpdateSensorRequest request) {
        Sensor sensor = requireSensor(id);
        String name = request.name().trim();
        if (sensorRepository.existsBySiteIdAndNameIgnoreCaseAndIdNot(sensor.getSite().getId(), name, id)) {
            throw new IllegalArgumentException("A sensor named '" + name + "' already exists at this site");
        }
        sensor.setName(name);
        sensor.setManufacturer(trimToNull(request.manufacturer()));
        sensor.setModel(trimToNull(request.model()));
        sensor.setInstallationZone(trimToNull(request.installationZone()));
        sensor.setStatus(request.status());
        if (request.configuration() != null) {
            SensorProfile profile = sensorProfileRepository.findByIdWithParameters(sensor.getProfile().getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Sensor profile not found: " + sensor.getProfile().getId()));
            replaceConfiguration(sensor, profile, request.configuration());
        }
        return SensorResponse.from(sensorRepository.save(sensor));
    }

    private void replaceConfiguration(
            Sensor sensor,
            SensorProfile profile,
            List<ParameterValueRequest> submitted) {
        List<ParameterValueRequest> values = submitted == null ? List.of() : submitted;
        Map<String, SensorParameter> supported = profile.getParameters().stream()
                .collect(Collectors.toMap(SensorParameter::getParameterKey, Function.identity()));

        List<String> unsupported = values.stream()
                .map(item -> item.parameterKey().trim())
                .filter(key -> !supported.containsKey(key))
                .distinct()
                .toList();
        if (!unsupported.isEmpty()) {
            String supportedKeys = supported.keySet().stream().sorted().collect(Collectors.joining(", "));
            throw new IllegalArgumentException(
                    "Unsupported parameter(s) for profile " + profile.getCode() + ": "
                            + String.join(", ", unsupported)
                            + ". Supported: " + supportedKeys);
        }

        LinkedHashSet<String> seen = new LinkedHashSet<>();
        for (ParameterValueRequest item : values) {
            String key = item.parameterKey().trim();
            if (!seen.add(key)) {
                throw new IllegalArgumentException("Duplicate parameter in configuration: " + key);
            }
            SensorParameter parameter = supported.get(key);
            validateRange(parameter, item.value());
        }

        sensor.getConfigurations().clear();
        Instant capturedAt = Instant.now();
        for (ParameterValueRequest item : values) {
            SensorParameter parameter = supported.get(item.parameterKey().trim());
            SensorConfiguration configuration = new SensorConfiguration();
            configuration.setSensor(sensor);
            configuration.setParameter(parameter);
            configuration.setCurrentValue(item.value());
            configuration.setCapturedAt(capturedAt);
            sensor.getConfigurations().add(configuration);
        }
    }

    private static void validateRange(SensorParameter parameter, BigDecimal value) {
        if (parameter.getMinValue() != null && value.compareTo(parameter.getMinValue()) < 0) {
            throw new IllegalArgumentException(
                    "Value for " + parameter.getParameterKey() + " is below minimum "
                            + parameter.getMinValue());
        }
        if (parameter.getMaxValue() != null && value.compareTo(parameter.getMaxValue()) > 0) {
            throw new IllegalArgumentException(
                    "Value for " + parameter.getParameterKey() + " is above maximum "
                            + parameter.getMaxValue());
        }
    }

    private Sensor requireSensor(Long id) {
        return sensorRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sensor not found: " + id));
    }

    private Site requireSite(Long siteId) {
        return siteRepository.findById(siteId)
                .orElseThrow(() -> new ResourceNotFoundException("Site not found: " + siteId));
    }

    private SensorProfile requireActiveProfile(Long profileId) {
        SensorProfile profile = sensorProfileRepository.findByIdWithParameters(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Sensor profile not found: " + profileId));
        if (!profile.isActive()) {
            throw new IllegalArgumentException("Sensor profile is not active: " + profile.getCode());
        }
        return profile;
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
