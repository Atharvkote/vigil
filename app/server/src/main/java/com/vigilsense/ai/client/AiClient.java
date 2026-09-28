package com.vigilsense.ai.client;

import com.vigilsense.ai.dto.AiCalibrationRequest;
import com.vigilsense.ai.dto.AiCalibrationResponse;

public interface AiClient {
    AiCalibrationResponse generateExplanation(AiCalibrationRequest request);
}
