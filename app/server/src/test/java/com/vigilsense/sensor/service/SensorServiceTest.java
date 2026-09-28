package com.vigilsense.sensor.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.vigilsense.common.exception.ResourceNotFoundException;
import com.vigilsense.sensor.dto.CreateSensorRequest;
import com.vigilsense.sensor.dto.ParameterValueRequest;
import com.vigilsense.sensor.dto.SensorResponse;
import com.vigilsense.sensor.entity.Sensor;
import com.vigilsense.sensor.entity.SensorStatus;
import com.vigilsense.sensor.repository.SensorRepository;
import com.vigilsense.sensor_profile.entity.SensorParameter;
import com.vigilsense.sensor_profile.entity.SensorProfile;
import com.vigilsense.sensor_profile.repository.SensorProfileRepository;
import com.vigilsense.site.entity.Site;
import com.vigilsense.site.repository.SiteRepository;

@ExtendWith(MockitoExtension.class)
class SensorServiceTest {

    @Mock
    private SensorRepository sensorRepository;

    @Mock
    private SiteRepository siteRepository;

    @Mock
    private SensorProfileRepository sensorProfileRepository;

    @InjectMocks
    private SensorService sensorService;

    private Site site;
    private SensorProfile fiberProfile;

    @BeforeEach
    void setUp() {
        site = new Site();
        site.setId(1L);
        site.setName("Industrial Site A");

        fiberProfile = new SensorProfile();
        fiberProfile.setId(10L);
        fiberProfile.setCode("FIBER_OPTIC_FENCE");
        fiberProfile.setName("Fiber-optic fence sensor");
        fiberProfile.setProfileVersion("1.0");
        fiberProfile.setRelevantWeatherFactors("WIND_SPEED");
        fiberProfile.setActive(true);
        fiberProfile.setParameters(List.of(
                parameter(fiberProfile, 100L, "sensitivity", 0, 100, 1),
                parameter(fiberProfile, 101L, "alarm_threshold", 0, 100, 2)));
    }

    @Test
    void createSensorRejectsUnsupportedParameter() {
        when(siteRepository.findById(1L)).thenReturn(Optional.of(site));
        when(sensorProfileRepository.findByIdWithParameters(10L)).thenReturn(Optional.of(fiberProfile));

        CreateSensorRequest request = new CreateSensorRequest(
                "North Fence 01",
                10L,
                null,
                null,
                "North",
                SensorStatus.ACTIVE,
                List.of(new ParameterValueRequest("detection_range", new BigDecimal("120"))));

        assertThatThrownBy(() -> sensorService.createSensor(1L, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Unsupported parameter")
                .hasMessageContaining("detection_range")
                .hasMessageContaining("sensitivity");
    }

    @Test
    void createSensorPersistsSupportedConfiguration() {
        when(siteRepository.findById(1L)).thenReturn(Optional.of(site));
        when(sensorProfileRepository.findByIdWithParameters(10L)).thenReturn(Optional.of(fiberProfile));
        when(sensorRepository.save(any(Sensor.class))).thenAnswer(invocation -> {
            Sensor sensor = invocation.getArgument(0);
            sensor.setId(5L);
            return sensor;
        });

        CreateSensorRequest request = new CreateSensorRequest(
                "North Fence 01",
                10L,
                "Acme",
                "FO-1",
                "North",
                SensorStatus.ACTIVE,
                List.of(new ParameterValueRequest("sensitivity", new BigDecimal("70"))));

        SensorResponse created = sensorService.createSensor(1L, request);

        assertThat(created.id()).isEqualTo(5L);
        assertThat(created.configuration()).hasSize(1);
        assertThat(created.configuration().get(0).parameterKey()).isEqualTo("sensitivity");
        assertThat(created.configuration().get(0).currentValue()).isEqualByComparingTo("70");
        verify(sensorRepository).save(any(Sensor.class));
    }

    @Test
    void createSensorRejectsValueOutsideRange() {
        when(siteRepository.findById(1L)).thenReturn(Optional.of(site));
        when(sensorProfileRepository.findByIdWithParameters(10L)).thenReturn(Optional.of(fiberProfile));

        CreateSensorRequest request = new CreateSensorRequest(
                "North Fence 01",
                10L,
                null,
                null,
                null,
                SensorStatus.ACTIVE,
                List.of(new ParameterValueRequest("sensitivity", new BigDecimal("140"))));

        assertThatThrownBy(() -> sensorService.createSensor(1L, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("above maximum");
    }

    @Test
    void createSensorFailsWhenSiteMissing() {
        when(siteRepository.findById(1L)).thenReturn(Optional.empty());

        CreateSensorRequest request = new CreateSensorRequest(
                "North Fence 01", 10L, null, null, null, SensorStatus.ACTIVE, List.of());

        assertThatThrownBy(() -> sensorService.createSensor(1L, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Site not found");
    }

    private static SensorParameter parameter(
            SensorProfile profile, Long id, String key, int min, int max, int order) {
        SensorParameter parameter = new SensorParameter();
        parameter.setId(id);
        parameter.setProfile(profile);
        parameter.setParameterKey(key);
        parameter.setDisplayName(key);
        parameter.setUnit("percent");
        parameter.setDataType("DECIMAL");
        parameter.setMinValue(BigDecimal.valueOf(min));
        parameter.setMaxValue(BigDecimal.valueOf(max));
        parameter.setSortOrder(order);
        return parameter;
    }
}
