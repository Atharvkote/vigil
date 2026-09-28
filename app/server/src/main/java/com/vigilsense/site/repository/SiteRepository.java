package com.vigilsense.site.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vigilsense.site.entity.Site;

public interface SiteRepository extends JpaRepository<Site, Long> {
}
