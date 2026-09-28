package uk.gov.school.ingestion.client;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Fetches school inspection outcomes from Ofsted's published management information CSV.
 *
 * The CSV is published monthly at:
 * https://www.gov.uk/government/statistical-data-sets/monthly-management-information-ofsteds-school-inspections-outcomes
 *
 * The "Overall effectiveness" column contains numeric codes:
 *   1 = Outstanding, 2 = Good, 3 = Requires Improvement, 4 = Inadequate
 */
@Component
public class OfstedCsvClient {

    private static final Logger log = LoggerFactory.getLogger(OfstedCsvClient.class);

    private static final Map<String, String> GRADE_MAP = Map.of(
            "1", "Outstanding",
            "2", "Good",
            "3", "Requires Improvement",
            "4", "Inadequate"
    );

    private final String csvUrl;
    private final RestTemplate restTemplate = new RestTemplate();

    public OfstedCsvClient(
            @Value("${ofsted.csv-url}") String csvUrl) {
        this.csvUrl = csvUrl;
    }

    public List<Map<String, Object>> fetchOfstedRatings() {
        List<Map<String, Object>> result = new ArrayList<>();
        try {
            String csv = restTemplate.getForObject(csvUrl, String.class);
            if (csv == null || csv.isBlank()) {
                log.warn("Ofsted CSV response was empty");
                return result;
            }
            result = parseCsv(csv);
            log.info("Parsed {} Ofsted ratings from CSV", result.size());
        } catch (Exception e) {
            log.warn("Failed to fetch Ofsted CSV from {}: {}", csvUrl, e.getMessage());
        }
        return result;
    }

    private List<Map<String, Object>> parseCsv(String csv) throws Exception {
        List<Map<String, Object>> result = new ArrayList<>();

        try (CSVParser parser = CSVFormat.DEFAULT
                .builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .setIgnoreHeaderCase(true)
                .setTrim(true)
                .build()
                .parse(new StringReader(csv))) {

            for (CSVRecord record : parser) {
                try {
                    String urnStr = record.get("URN");
                    String gradeCode = record.get("Overall effectiveness");
                    String inspectionDate = safeGet(record, "Inspection start date");
                    String inspectionType = safeGet(record, "Inspection type");

                    Long urn = Long.parseLong(urnStr.trim());
                    String rating = GRADE_MAP.get(gradeCode.trim());
                    if (rating != null) {
                        java.util.HashMap<String, Object> row = new java.util.HashMap<>();
                        row.put("urn", urn);
                        row.put("overallEffectiveness", rating);
                        row.put("inspectionDate", inspectionDate != null ? inspectionDate : "");
                        row.put("inspectionType", inspectionType != null ? inspectionType : "");

                        String qoe = safeGet(record, "Quality of education");
                        String baa = safeGet(record, "Behaviour and attitudes");
                        String pd  = safeGet(record, "Personal development");
                        String lam = safeGet(record, "Effectiveness of leadership and management");
                        row.put("qualityOfEducation",      qoe != null ? GRADE_MAP.getOrDefault(qoe.trim(), null) : null);
                        row.put("behaviourAndAttitudes",   baa != null ? GRADE_MAP.getOrDefault(baa.trim(), null) : null);
                        row.put("personalDevelopment",     pd  != null ? GRADE_MAP.getOrDefault(pd.trim(),  null) : null);
                        row.put("leadershipAndManagement", lam != null ? GRADE_MAP.getOrDefault(lam.trim(), null) : null);

                        result.add(row);
                    }
                } catch (Exception ignored) {
                    // Skip rows with missing/malformed data
                }
            }
        }
        return result;
    }

    private String safeGet(CSVRecord record, String header) {
        try {
            return record.get(header);
        } catch (Exception e) {
            return null;
        }
    }
}
