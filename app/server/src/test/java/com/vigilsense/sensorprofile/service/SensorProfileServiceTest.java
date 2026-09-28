package com.vigilsense.sensorprofile.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.vigilsense.common.exception.ResourceNotFoundException;
import com.vigilsense.sensor_profile.dto.SensorProfileResponse;
import com.vigilsense.sensor_profile.entity.SensorParameter;
import com.vigilsense.sensor_profile.entity.SensorProfile;
import com.vigilsense.sensor_profile.repository.SensorProfileRepository;
import com.vigilsense.sensor_profile.service.SensorProfileService;

@ExtendWith(MockitoExtension.class)
class SensorProfileServiceTest {

    @Mock
    private SensorProfileRepository sensorProfileRepository;

    @InjectMocks
    private SensorProfileService sensorProfileService;

    @Test
    void listProfilesMapsParametersAndWeatherFactors() {
        when(sensorProfileRepository.findAllActiveWithParameters())
                .thenReturn(List.of(fiberProfile(), microwaveProfile()));

        List<SensorProfileResponse> result = sensorProfileService.listProfiles();

        assertThat(result).extracting(SensorProfileResponse::code)
                .containsExactly("FIBER_OPTIC_FENCE", "MICROWAVE");
        assertThat(result.get(0).parameters())
                .extracting(parameter -> parameter.parameterKey())
                .containsExactly("sensitivity", "alarm_threshold");
        assertThat(result.get(1).parameters())
                .extracting(parameter -> parameter.parameterKey())
                .containsExactly("detection_range", "alarm_delay")
                .doesNotContain("sensitivity");
        assertThat(result.get(0).relevantWeatherFactors()).contains("WIND_SPEED", "RAINFALL");
    }

    @Test
    void getProfileThrowsWhenMissing() {
        when(sensorProfileRepository.findByIdWithParameters(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sensorProfileService.getProfile(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    private static SensorProfile fiberProfile() {
        SensorProfile profile = new SensorProfile();
        profile.setId(1L);
        profile.setCode("FIBER_OPTIC_FENCE");
        profile.setName("Fiber-optic fence sensor");
        profile.setProfileVersion("1.0");
        profile.setRelevantWeatherFactors("WIND_SPEED,RAINFALL");
        profile.setActive(true);
        profile.setParameters(List.of(
                parameter(profile, "sensitivity", 1),
                parameter(profile, "alarm_threshold", 2)));
        return profile;
    }

    private static SensorProfile microwaveProfile() {
        SensorProfile profile = new SensorProfile();
        profile.setId(2L);
        profile.setCode("MICROWAVE");
        profile.setName("Microwave barrier sensor");
        profile.setProfileVersion("1.0");
        profile.setRelevantWeatherFactors("RAINFALL,STORM");
        profile.setActive(true);
        profile.setParameters(List.of(
                parameter(profile, "detection_range", 1),
                parameter(profile, "alarm_delay", 2)));
        return profile;
    }

    private static SensorParameter parameter(SensorProfile profile, String key, int order) {
        SensorParameter parameter = new SensorParameter();
        parameter.setId((long) order);
        parameter.setProfile(profile);
        parameter.setParameterKey(key);
        parameter.setDisplayName(key);
        parameter.setUnit("unit");
        parameter.setDataType("DECIMAL");
        parameter.setMinValue(BigDecimal.ZERO);
        parameter.setMaxValue(new BigDecimal("100"));
        parameter.setDefaultValue(new BigDecimal("50"));
        parameter.setSortOrder(order);
        return parameter;
    }
}
