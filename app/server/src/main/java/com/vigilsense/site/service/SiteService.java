package com.vigilsense.site.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vigilsense.common.exception.ResourceNotFoundException;
import com.vigilsense.site.dto.CreateSiteRequest;
import com.vigilsense.site.dto.SiteResponse;
import com.vigilsense.site.dto.UpdateSiteRequest;
import com.vigilsense.site.entity.Site;
import com.vigilsense.site.repository.SiteRepository;

@Service
@Transactional(readOnly = true)
public class SiteService {

    private final SiteRepository siteRepository;

    public SiteService(SiteRepository siteRepository) {
        this.siteRepository = siteRepository;
    }

    public List<SiteResponse> listSites() {
        return siteRepository.findAll().stream().map(SiteResponse::from).toList();
    }

    public SiteResponse getSite(Long id) {
        return SiteResponse.from(requireSite(id));
    }

    @Transactional
    public SiteResponse createSite(CreateSiteRequest request) {
        Site site = new Site();
        site.setName(request.name().trim());
        site.setLocationLabel(trimToNull(request.locationLabel()));
        site.setLatitude(request.latitude());
        site.setLongitude(request.longitude());
        return SiteResponse.from(siteRepository.save(site));
    }

    @Transactional
    public SiteResponse updateSite(Long id, UpdateSiteRequest request) {
        Site site = requireSite(id);
        site.setName(request.name().trim());
        site.setLocationLabel(trimToNull(request.locationLabel()));
        site.setLatitude(request.latitude());
        site.setLongitude(request.longitude());
        return SiteResponse.from(siteRepository.save(site));
    }

    @Transactional
    public void deleteSite(Long id) {
        Site site = requireSite(id);
        siteRepository.delete(site);
    }

    private Site requireSite(Long id) {
        return siteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Site not found: " + id));
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
