package com.vigilsense.calibration.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vigilsense.calibration.entity.CalibrationRuleEntity;

public interface CalibrationRuleRepository extends JpaRepository<CalibrationRuleEntity, Long> {

    List<CalibrationRuleEntity> findByProfileIdAndActiveTrue(Long profileId);
}
