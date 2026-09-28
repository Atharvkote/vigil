package com.vigilsense.site.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.vigilsense.common.exception.ResourceNotFoundException;
import com.vigilsense.site.dto.CreateSiteRequest;
import com.vigilsense.site.dto.SiteResponse;
import com.vigilsense.site.dto.UpdateSiteRequest;
import com.vigilsense.site.entity.Site;
import com.vigilsense.site.repository.SiteRepository;

@ExtendWith(MockitoExtension.class)
class SiteServiceTest {

    @Mock
    private SiteRepository siteRepository;

    @InjectMocks
    private SiteService siteService;

    private Site existing;

    @BeforeEach
    void setUp() {
        existing = new Site();
        existing.setId(10L);
        existing.setName("Industrial Site A");
        existing.setLocationLabel("North perimeter");
        existing.setLatitude(new BigDecimal("19.0760000"));
        existing.setLongitude(new BigDecimal("72.8777000"));
    }

    @Test
    void listSitesReturnsMappedResponses() {
        when(siteRepository.findAll()).thenReturn(List.of(existing));

        List<SiteResponse> result = siteService.listSites();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).id()).isEqualTo(10L);
        assertThat(result.get(0).name()).isEqualTo("Industrial Site A");
    }

    @Test
    void getSiteThrowsWhenMissing() {
        when(siteRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> siteService.getSite(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void createSitePersistsTrimmedFields() {
        CreateSiteRequest request = new CreateSiteRequest(
                "  Plant B  ",
                "  Gate 2  ",
                new BigDecimal("12.9716"),
                new BigDecimal("77.5946"));
        when(siteRepository.save(any(Site.class))).thenAnswer(invocation -> {
            Site site = invocation.getArgument(0);
            site.setId(1L);
            return site;
        });

        SiteResponse created = siteService.createSite(request);

        ArgumentCaptor<Site> captor = ArgumentCaptor.forClass(Site.class);
        verify(siteRepository).save(captor.capture());
        assertThat(captor.getValue().getName()).isEqualTo("Plant B");
        assertThat(captor.getValue().getLocationLabel()).isEqualTo("Gate 2");
        assertThat(created.id()).isEqualTo(1L);
        assertThat(created.latitude()).isEqualByComparingTo("12.9716");
        assertThat(created.longitude()).isEqualByComparingTo("77.5946");
    }

    @Test
    void updateSiteReplacesCoordinates() {
        when(siteRepository.findById(10L)).thenReturn(Optional.of(existing));
        when(siteRepository.save(any(Site.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateSiteRequest request = new UpdateSiteRequest(
                "Industrial Site A",
                "South perimeter",
                new BigDecimal("18.5204"),
                new BigDecimal("73.8567"));

        SiteResponse updated = siteService.updateSite(10L, request);

        assertThat(updated.locationLabel()).isEqualTo("South perimeter");
        assertThat(updated.latitude()).isEqualByComparingTo("18.5204");
        assertThat(updated.longitude()).isEqualByComparingTo("73.8567");
    }

    @Test
    void deleteSiteRemovesExistingRow() {
        when(siteRepository.findById(10L)).thenReturn(Optional.of(existing));

        siteService.deleteSite(10L);

        verify(siteRepository).delete(existing);
    }

    @Test
    void deleteSiteThrowsWhenMissing() {
        when(siteRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> siteService.deleteSite(10L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
