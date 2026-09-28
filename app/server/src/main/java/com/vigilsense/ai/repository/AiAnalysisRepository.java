package com.vigilsense.ai.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.vigilsense.ai.entity.AiAnalysis;

@Repository
public interface AiAnalysisRepository extends JpaRepository<AiAnalysis, Long> {
    Optional<AiAnalysis> findByRecommendationId(Long recommendationId);
}
