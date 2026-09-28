package com.vigilsense.sensorprofile;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Set;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.vigilsense.sensor_profile.dto.SensorProfileResponse;
import com.vigilsense.sensor_profile.service.SensorProfileService;

@SpringBootTest
@ActiveProfiles("test")
class SensorProfileSeedTest {

    @Autowired
    private SensorProfileService sensorProfileService;

    @Test
    void flywaySeedLoadsThreeDemonstrationProfiles() {
        var profiles = sensorProfileService.listProfiles();

        assertThat(profiles).extracting(SensorProfileResponse::code)
                .containsExactlyInAnyOrder("FIBER_OPTIC_FENCE", "MICROWAVE", "INFRARED_BEAM");

        SensorProfileResponse fiber = byCode(profiles, "FIBER_OPTIC_FENCE");
        assertThat(fiber.parameters()).extracting(parameter -> parameter.parameterKey())
                .containsExactly("sensitivity", "alarm_threshold");

        SensorProfileResponse microwave = byCode(profiles, "MICROWAVE");
        assertThat(microwave.parameters()).extracting(parameter -> parameter.parameterKey())
                .containsExactly("detection_range", "alarm_delay");
        assertThat(microwave.parameters()).extracting(parameter -> parameter.parameterKey())
                .doesNotContain("sensitivity");

        SensorProfileResponse infrared = byCode(profiles, "INFRARED_BEAM");
        assertThat(infrared.parameters()).extracting(parameter -> parameter.parameterKey())
                .containsExactly("beam_threshold", "alarm_delay");
        assertThat(Set.copyOf(infrared.parameters().stream()
                .map(parameter -> parameter.parameterKey())
                .toList())).doesNotContain("sensitivity");
    }

    private static SensorProfileResponse byCode(java.util.List<SensorProfileResponse> profiles, String code) {
        return profiles.stream()
                .filter(profile -> code.equals(profile.code()))
                .findFirst()
                .orElseThrow();
    }
}
