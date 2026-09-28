package com.vigilsense.sensor.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vigilsense.sensor.entity.Sensor;

public interface SensorRepository extends JpaRepository<Sensor, Long> {

    boolean existsBySiteIdAndNameIgnoreCase(Long siteId, String name);

    boolean existsBySiteIdAndNameIgnoreCaseAndIdNot(Long siteId, String name, Long id);

    @Query("""
            SELECT DISTINCT s
            FROM Sensor s
            JOIN FETCH s.site
            JOIN FETCH s.profile
            LEFT JOIN FETCH s.configurations c
            LEFT JOIN FETCH c.parameter
            WHERE s.site.id = :siteId
            """)
    List<Sensor> findAllBySiteIdWithDetails(@Param("siteId") Long siteId);

    @Query("""
            SELECT DISTINCT s
            FROM Sensor s
            JOIN FETCH s.site
            JOIN FETCH s.profile
            LEFT JOIN FETCH s.configurations c
            LEFT JOIN FETCH c.parameter
            WHERE s.id = :id
            """)
    Optional<Sensor> findByIdWithDetails(@Param("id") Long id);
}
