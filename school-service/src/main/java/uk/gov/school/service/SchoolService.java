package uk.gov.school.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.gov.school.client.PostcodesIoClient;
import uk.gov.school.dto.AcademicMetricDto;
import uk.gov.school.dto.SchoolDetailDto;
import uk.gov.school.dto.SchoolSummaryDto;
import uk.gov.school.entity.AcademicMetric;
import uk.gov.school.entity.OfstedRating;
import uk.gov.school.entity.School;
import uk.gov.school.repository.AcademicMetricRepository;
import uk.gov.school.repository.OfstedRatingRepository;
import uk.gov.school.repository.SchoolRepository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SchoolService {

    private static final int DEFAULT_SEARCH_LIMIT = 50;
    private static final double KM_TO_METERS = 1000.0;

    private final SchoolRepository schoolRepository;
    private final OfstedRatingRepository ofstedRatingRepository;
    private final AcademicMetricRepository academicMetricRepository;
    private final PostcodesIoClient postcodesIoClient;

    public SchoolService(SchoolRepository schoolRepository,
                         OfstedRatingRepository ofstedRatingRepository,
                         AcademicMetricRepository academicMetricRepository,
                         PostcodesIoClient postcodesIoClient) {
        this.schoolRepository = schoolRepository;
        this.ofstedRatingRepository = ofstedRatingRepository;
        this.academicMetricRepository = academicMetricRepository;
        this.postcodesIoClient = postcodesIoClient;
    }

    @Transactional(readOnly = true)
    public List<SchoolSummaryDto> search(String postcode, Double radiusKm, String type, String phase, String minRating) {
        Double lat = null;
        Double lon = null;
        double radiusMeters = radiusKm != null ? radiusKm * KM_TO_METERS : Double.MAX_VALUE;

        if (postcode != null && !postcode.isBlank()) {
            var result = postcodesIoClient.lookup(postcode);
            if (result != null) {
                lat = result.latitude();
                lon = result.longitude();
            }
        }

        if (radiusKm == null || radiusKm <= 0) {
            radiusMeters = 50000; // default 50km if postcode provided
        }

        String typeParam = (type == null || type.isBlank()) ? null : type;
        String phaseParam = (phase == null || phase.isBlank()) ? null : phase;
        String minRatingParam = (minRating == null || minRating.isBlank()) ? null : minRating;

        List<School> schools = schoolRepository.search(lat, lon, radiusMeters, typeParam, phaseParam, minRatingParam, DEFAULT_SEARCH_LIMIT);
        List<Long> urns = schools.stream().map(School::getUrn).toList();
        Map<Long, OfstedRating> ratings = ofstedRatingRepository.findByUrnIn(urns).stream()
                .collect(Collectors.toMap(OfstedRating::getUrn, r -> r));

        return schools.stream()
                .map(s -> toSummary(s, ratings.get(s.getUrn())))
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<SchoolDetailDto> getByUrn(Long urn) {
        return schoolRepository.findById(urn)
                .map(school -> {
                    OfstedRating rating = ofstedRatingRepository.findByUrnIn(List.of(urn)).stream().findFirst().orElse(null);
                    List<AcademicMetric> metrics = academicMetricRepository.findByUrn(urn);
                    return toDetail(school, rating, metrics);
                });
    }

    @Transactional(readOnly = true)
    public List<SchoolDetailDto> compare(List<Long> urns) {
        if (urns == null || urns.isEmpty()) return List.of();
        List<School> schools = schoolRepository.findAllById(urns);
        if (schools.size() != urns.size()) return List.of();

        Map<Long, OfstedRating> ratings = ofstedRatingRepository.findByUrnIn(urns).stream()
                .collect(Collectors.toMap(OfstedRating::getUrn, r -> r));
        Map<Long, List<AcademicMetric>> metricsByUrn = academicMetricRepository.findByUrnIn(urns).stream()
                .collect(Collectors.groupingBy(AcademicMetric::getUrn));

        return schools.stream()
                .map(s -> toDetail(s, ratings.get(s.getUrn()), metricsByUrn.getOrDefault(s.getUrn(), List.of())))
                .toList();
    }

    private SchoolSummaryDto toSummary(School s, OfstedRating r) {
        return new SchoolSummaryDto(
                s.getUrn(),
                s.getName(),
                s.getPostcode(),
                s.getAddress(),
                s.getPhaseOfEducation(),
                s.getType(),
                s.getLatitude(),
                s.getLongitude(),
                r != null ? r.getOverallEffectiveness() : null,
                s.getCapacity()
        );
    }

    private SchoolDetailDto toDetail(School s, OfstedRating r, List<AcademicMetric> metrics) {
        return new SchoolDetailDto(
                s.getUrn(),
                s.getName(),
                s.getPostcode(),
                s.getAddress(),
                s.getPhaseOfEducation(),
                s.getType(),
                s.getStatus(),
                s.getCapacity(),
                s.getLatitude(),
                s.getLongitude(),
                s.getSchoolWebsite(),
                s.getPhone(),
                s.getLocalAuthority(),
                r != null ? r.getOverallEffectiveness() : null,
                r != null ? r.getInspectionDate() : null,
                r != null ? r.getInspectionType() : null,
                r != null ? r.getQualityOfEducation() : null,
                r != null ? r.getBehaviourAndAttitudes() : null,
                r != null ? r.getPersonalDevelopment() : null,
                r != null ? r.getLeadershipAndManagement() : null,
                metrics.stream().map(m -> new AcademicMetricDto(m.getMetricName(), m.getValue(), m.getYear())).toList()
        );
    }
}
