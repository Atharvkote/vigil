package com.vigilsense.ai.client;

import org.springframework.stereotype.Component;

import com.vigilsense.ai.dto.AiCalibrationRequest;
import com.vigilsense.ai.dto.AiCalibrationResponse;

@Component
public class LlmAiClient implements AiClient {

    @Override
    public AiCalibrationResponse generateExplanation(AiCalibrationRequest request) {
        // In a real implementation, this would call OpenAI, Anthropic, or a custom model
        // For demonstration, we construct a structured contextual explanation
        String summary = String.format("%s %s is recommended based on environmental factors.", 
                request.action().equals("INCREASE") ? "Increased" : 
                (request.action().equals("DECREASE") ? "Reduced" : "A stabilized"), 
                request.parameter());
                
        String reason = String.format(
                "Current conditions include wind at %s km/h and rainfall of %s mm. " +
                "These factors elevate the risk of environmental disturbances for a %s sensor. " +
                "The deterministic rule engine recommends a %s range of %s to mitigate this risk.",
                request.windSpeed(),
                request.rainfall(),
                request.sensorType(),
                request.parameter(),
                request.recommendedRange()
        );

        return new AiCalibrationResponse(summary, reason);
    }
}
