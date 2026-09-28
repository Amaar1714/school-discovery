package uk.gov.school.ingestion.service;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.gov.school.entity.AcademicMetric;
import uk.gov.school.entity.OfstedRating;
import uk.gov.school.entity.School;
import uk.gov.school.ingestion.client.AcademicMetricsCsvClient;
import uk.gov.school.ingestion.client.GiasClient;
import uk.gov.school.ingestion.client.OfstedCsvClient;
import uk.gov.school.repository.AcademicMetricRepository;
import uk.gov.school.repository.OfstedRatingRepository;
import uk.gov.school.repository.SchoolRepository;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
public class IngestionService {

    private static final Logger log = LoggerFactory.getLogger(IngestionService.class);
    private static final GeometryFactory GEOMETRY_FACTORY = new GeometryFactory(new PrecisionModel(), 4326);
    private static final int BATCH_SIZE = 500;

    private final GiasClient giasClient;
    private final OfstedCsvClient ofstedCsvClient;
    private final AcademicMetricsCsvClient academicMetricsCsvClient;
    private final SchoolRepository schoolRepository;
    private final OfstedRatingRepository ofstedRatingRepository;
    private final AcademicMetricRepository academicMetricRepository;

    public IngestionService(GiasClient giasClient, OfstedCsvClient ofstedCsvClient,
                            AcademicMetricsCsvClient academicMetricsCsvClient,
                            SchoolRepository schoolRepository,
                            OfstedRatingRepository ofstedRatingRepository,
                            AcademicMetricRepository academicMetricRepository) {
        this.giasClient = giasClient;
        this.ofstedCsvClient = ofstedCsvClient;
        this.academicMetricsCsvClient = academicMetricsCsvClient;
        this.schoolRepository = schoolRepository;
        this.ofstedRatingRepository = ofstedRatingRepository;
        this.academicMetricRepository = academicMetricRepository;
    }

    public IngestionResult runIngestion() {
        int schoolsProcessed = ingestSchoolsFromGias();
        int ofstedProcessed = ingestOfstedFromCsv();
        clearAcademicMetrics();
        int ks4Processed = ingestKs4Metrics();
        int ks2Processed = ingestKs2Metrics();
        return new IngestionResult(schoolsProcessed, ofstedProcessed, ks4Processed, ks2Processed);
    }

    @Transactional
    public void clearAcademicMetrics() {
        academicMetricRepository.deleteAllInBatch();
        log.info("Cleared existing academic metrics");
    }

    @Transactional
    public int ingestSchoolsFromGias() {
        List<Map<String, Object>> rows = giasClient.fetchAllSchools();
        List<School> batch = new ArrayList<>(BATCH_SIZE);
        int count = 0;

        for (Map<String, Object> row : rows) {
            School school = mapGiasToSchool(row);
            if (school != null) {
                batch.add(school);
                count++;
            }
            if (batch.size() >= BATCH_SIZE) {
                schoolRepository.saveAll(batch);
                batch.clear();
            }
        }
        if (!batch.isEmpty()) {
            schoolRepository.saveAll(batch);
        }

        log.info("Ingested {} schools from GIAS", count);
        return count;
    }

    @Transactional
    public int ingestOfstedFromCsv() {
        List<Map<String, Object>> rows = ofstedCsvClient.fetchOfstedRatings();

        // Load all existing school URNs in one query
        Set<Long> existingUrns = StreamSupport
                .stream(schoolRepository.findAll().spliterator(), false)
                .map(School::getUrn)
                .collect(Collectors.toSet());

        List<OfstedRating> batch = new ArrayList<>();
        for (Map<String, Object> row : rows) {
            try {
                Long urn = (Long) row.get("urn");
                if (urn == null || !existingUrns.contains(urn)) continue;

                String effectiveness = (String) row.get("overallEffectiveness");
                String inspectionDateStr = (String) row.get("inspectionDate");
                String inspectionTypeStr = (String) row.get("inspectionType");

                OfstedRating rating = new OfstedRating();
                rating.setUrn(urn);
                rating.setOverallEffectiveness(effectiveness);
                rating.setInspectionDate(parseDate(inspectionDateStr));
                rating.setInspectionType(inspectionTypeStr != null && !inspectionTypeStr.isBlank() ? inspectionTypeStr : null);
                rating.setQualityOfEducation((String) row.get("qualityOfEducation"));
                rating.setBehaviourAndAttitudes((String) row.get("behaviourAndAttitudes"));
                rating.setPersonalDevelopment((String) row.get("personalDevelopment"));
                rating.setLeadershipAndManagement((String) row.get("leadershipAndManagement"));
                batch.add(rating);
            } catch (Exception e) {
                log.debug("Failed to map Ofsted rating: {}", e.getMessage());
            }
        }

        ofstedRatingRepository.deleteAllInBatch();
        ofstedRatingRepository.saveAll(batch);
        log.info("Ingested {} Ofsted ratings from CSV", batch.size());
        return batch.size();
    }

    private School mapGiasToSchool(Map<String, Object> row) {
        Long urn = getLong(row, "urn");
        if (urn == null) return null;

        String name = getString(row, "name");
        if (name == null || name.isBlank()) return null;

        // Only ingest open schools — closed establishments (e.g. pre-academy URNs) have outdated Ofsted data
        String status = getString(row, "status");
        if (status == null || !"Open".equalsIgnoreCase(status.trim())) return null;

        School school = new School();
        school.setUrn(urn);
        school.setName(name);
        school.setPostcode(getString(row, "postcode"));
        school.setAddress(buildAddress(row));
        school.setPhaseOfEducation(getString(row, "phase_of_education"));
        school.setType(getString(row, "type"));
        school.setStatus(getString(row, "status"));
        school.setSchoolWebsite(getString(row, "school_website"));
        school.setPhone(getString(row, "phone"));
        school.setLocalAuthority(getString(row, "local_authority"));

        Double lat = getDouble(row, "latitude");
        Double lon = getDouble(row, "longitude");
        if (lat != null && lon != null) {
            school.setLatitude(lat);
            school.setLongitude(lon);
            school.setLocation(GEOMETRY_FACTORY.createPoint(new Coordinate(lon, lat)));
        }

        return school;
    }

    private String buildAddress(Map<String, Object> row) {
        StringBuilder sb = new StringBuilder();
        append(sb, getString(row, "address_1"));
        append(sb, getString(row, "address_2"));
        append(sb, getString(row, "address_3"));
        append(sb, getString(row, "county"));
        append(sb, getString(row, "postcode"));
        return sb.toString().trim();
    }

    private void append(StringBuilder sb, String s) {
        if (s != null && !s.isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(s);
        }
    }

    private LocalDate parseDate(String s) {
        if (s == null || s.isBlank()) return null;
        try {
            return LocalDate.parse(s, DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        } catch (Exception e) {
            try {
                return LocalDate.parse(s, DateTimeFormatter.ISO_LOCAL_DATE);
            } catch (Exception e2) {
                return null;
            }
        }
    }

    private Long getLong(Map<String, Object> m, String key) {
        Object v = m.get(key);
        if (v == null) return null;
        if (v instanceof Number n) return n.longValue();
        try {
            return Long.parseLong(String.valueOf(v));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Double getDouble(Map<String, Object> m, String key) {
        Object v = m.get(key);
        if (v == null) return null;
        if (v instanceof Number n) return n.doubleValue();
        try {
            return Double.parseDouble(String.valueOf(v));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String getString(Map<String, Object> m, String key) {
        Object v = m.get(key);
        return v != null ? String.valueOf(v).trim() : null;
    }

    @Transactional
    public int ingestKs4Metrics() {
        List<Map<String, Object>> rows = academicMetricsCsvClient.fetchKs4Metrics();
        return saveAcademicMetricBatch(rows, "KS4");
    }

    @Transactional
    public int ingestKs2Metrics() {
        List<Map<String, Object>> rows = academicMetricsCsvClient.fetchKs2Metrics();
        return saveAcademicMetricBatch(rows, "KS2");
    }

    private int saveAcademicMetricBatch(List<Map<String, Object>> rows, String label) {
        Set<Long> existingUrns = StreamSupport
                .stream(schoolRepository.findAll().spliterator(), false)
                .map(School::getUrn)
                .collect(Collectors.toSet());

        List<AcademicMetric> batch = new ArrayList<>();
        int count = 0;
        for (Map<String, Object> row : rows) {
            try {
                Long urn = toLong(row.get("urn"));
                if (urn == null || !existingUrns.contains(urn)) continue;

                AcademicMetric metric = new AcademicMetric();
                metric.setUrn(urn);
                metric.setMetricName((String) row.get("metricName"));
                metric.setValue((String) row.get("value"));
                metric.setYear((String) row.get("year"));
                batch.add(metric);
                count++;

                if (batch.size() >= BATCH_SIZE) {
                    academicMetricRepository.saveAll(batch);
                    batch.clear();
                }
            } catch (Exception e) {
                log.debug("Failed to map {} metric: {}", label, e.getMessage());
            }
        }
        if (!batch.isEmpty()) {
            academicMetricRepository.saveAll(batch);
        }
        log.info("Ingested {} {} academic metrics", count, label);
        return count;
    }

    private Long toLong(Object v) {
        if (v == null) return null;
        if (v instanceof Long l) return l;
        if (v instanceof Number n) return n.longValue();
        try { return Long.parseLong(String.valueOf(v)); } catch (Exception e) { return null; }
    }

    public record IngestionResult(int schoolsProcessed, int ofstedProcessed, int ks4Processed, int ks2Processed) {}
}
