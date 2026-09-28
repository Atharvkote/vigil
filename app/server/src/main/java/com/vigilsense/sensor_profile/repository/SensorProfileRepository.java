package com.vigilsense.sensor_profile.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vigilsense.sensor_profile.entity.SensorProfile;

public interface SensorProfileRepository extends JpaRepository<SensorProfile, Long> {

    @Query("""
            SELECT DISTINCT p
            FROM SensorProfile p
            LEFT JOIN FETCH p.parameters
            WHERE p.active = true
            """)
    List<SensorProfile> findAllActiveWithParameters();

    @Query("""
            SELECT DISTINCT p
            FROM SensorProfile p
            LEFT JOIN FETCH p.parameters
            WHERE p.id = :id
            """)
    Optional<SensorProfile> findByIdWithParameters(@Param("id") Long id);
}
