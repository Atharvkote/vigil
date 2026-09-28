CREATE TABLE ai_analysis (
    id BIGSERIAL PRIMARY KEY,
    recommendation_id BIGINT NOT NULL REFERENCES calibration_recommendations(id) ON DELETE CASCADE,
    model_provider VARCHAR(64) NOT NULL,
    model_name VARCHAR(64) NOT NULL,
    prompt_version VARCHAR(32) NOT NULL,
    response_summary VARCHAR(500) NOT NULL,
    reasoning_summary VARCHAR(2000) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_ai_analysis_recommendation UNIQUE (recommendation_id)
);
