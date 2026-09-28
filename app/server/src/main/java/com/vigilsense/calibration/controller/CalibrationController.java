package com.vigilsense.calibration.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vigilsense.calibration.dto.CalibrationResponse;
import com.vigilsense.calibration.service.CalibrationService;
import com.vigilsense.common.response.ApiResponse;

@RestController
@RequestMapping("/api/v1/sensors/{sensorId}/calibration")
public class CalibrationController {

    private final CalibrationService calibrationService;

    public CalibrationController(CalibrationService calibrationService) {
        this.calibrationService = calibrationService;
    }

    @GetMapping("/current")
    public ResponseEntity<ApiResponse<CalibrationResponse>> current(@PathVariable Long sensorId) {
        CalibrationResponse response = calibrationService.current(sensorId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/evaluate")
    public ResponseEntity<ApiResponse<CalibrationResponse>> evaluate(@PathVariable Long sensorId) {
        CalibrationResponse response = calibrationService.evaluate(sensorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Recommendation generated", response));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<CalibrationResponse>>> history(@PathVariable Long sensorId) {
        List<CalibrationResponse> responses = calibrationService.history(sensorId);
        return ResponseEntity.ok(ApiResponse.ok(responses));
    }
}
