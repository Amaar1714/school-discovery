package uk.gov.school.ingestion.client;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.*;
import java.util.zip.GZIPInputStream;

/**
 * Downloads school-level academic performance data from the DfE's Explore Education Statistics API.
 *
 * KS4 (secondary GCSE results) dataset ID: 19e39901-a96c-be76-b9c2-6af54ae076d2
 *   - Attainment 8, Progress 8, Grade 5+ English & Maths, EBacc entries, EBacc APS
 *   - Filter: breakdown_topic = "Total" (all-pupil overall result, one row per school)
 *
 * KS2 (primary SATs results) dataset ID: 019afee4-e5d0-72f9-9a8f-d7a1a56eac1d
 *   - % expected standard, % higher standard, average scaled score by subject
 *   - Filter: breakdown_topic = "All pupils", breakdown = "Total" (one row per school per subject)
 */
@Component
public class AcademicMetricsCsvClient {

    private static final Logger log = LoggerFactory.getLogger(AcademicMetricsCsvClient.class);

    private static final String EES_BASE = "https://api.education.gov.uk/statistics/v1/data-sets";
    private static final String KS4_DATASET_ID = "19e39901-a96c-be76-b9c2-6af54ae076d2";
    private static final String KS2_DATASET_ID = "019afee4-e5d0-72f9-9a8f-d7a1a56eac1d";

    public AcademicMetricsCsvClient() {
    }

    public List<Map<String, Object>> fetchKs4Metrics() {
        Map<String, Map<String, Object>> deduped = new LinkedHashMap<>();
        String url = EES_BASE + "/" + KS4_DATASET_ID + "/csv";

        try {
            log.info("Downloading KS4 performance CSV from EES...");
            try (InputStream is = openCsvStream(url);
                 InputStreamReader reader = new InputStreamReader(is);
                 CSVParser parser = buildParser(reader)) {

                for (CSVRecord record : parser) {
                    if (!isKs4TotalRow(record)) continue;
                    String urnStr = safeGet(record, "school_urn");
                    if (urnStr == null || urnStr.isBlank()) continue;
                    try {
                        long urn = Long.parseLong(urnStr.trim());
                        String year = formatYear(safeGet(record, "time_period"));
                        putMetric(deduped, urn, "Attainment 8", safeGet(record, "attainment8_average"), year);
                        putMetric(deduped, urn, "Progress 8", safeGet(record, "progress8_average"), year);
                        putMetric(deduped, urn, "Grade 5+ English & Maths (%)", safeGet(record, "engmath_95_percent"), year);
                        putMetric(deduped, urn, "EBacc Entries (%)", safeGet(record, "ebacc_entering_percent"), year);
                        putMetric(deduped, urn, "EBacc Avg Point Score", safeGet(record, "ebacc_aps_average"), year);
                    } catch (NumberFormatException ignored) {}
                }
            }
        } catch (Exception e) {
            log.warn("Failed to fetch KS4 CSV: {}", e.getMessage());
        }

        log.info("Parsed {} KS4 metric entries for {} schools",
                deduped.size(), deduped.values().stream().map(m -> m.get("urn")).distinct().count());
        return new ArrayList<>(deduped.values());
    }

    public List<Map<String, Object>> fetchKs2Metrics() {
        Map<String, Map<String, Object>> deduped = new LinkedHashMap<>();
        String url = EES_BASE + "/" + KS2_DATASET_ID + "/csv";

        try {
            log.info("Downloading KS2 performance CSV from EES (large file, please wait)...");
            try (InputStream is = openCsvStream(url);
                 InputStreamReader reader = new InputStreamReader(is);
                 CSVParser parser = buildParser(reader)) {

                for (CSVRecord record : parser) {
                    if (!isKs2TotalRow(record)) continue;
                    String urnStr = safeGet(record, "school_urn");
                    if (urnStr == null || urnStr.isBlank()) continue;
                    try {
                        long urn = Long.parseLong(urnStr.trim());
                        String year = formatYear(safeGet(record, "time_period"));
                        String subject = safeGet(record, "subject");
                        String prefix = ks2MetricPrefix(subject);
                        if (prefix == null) continue;

                        String expected = safeGet(record, "expected_standard_pupil_percent");
                        String higher = safeGet(record, "higher_standard_pupil_percent");
                        String avgScore = safeGet(record, "average_scaled_score");

                        if ("Reading, writing and maths".equalsIgnoreCase(subject)) {
                            putMetric(deduped, urn, prefix + " Expected (%)", expected, year);
                            putMetric(deduped, urn, prefix + " Higher (%)", higher, year);
                        } else {
                            putMetric(deduped, urn, prefix + " Expected (%)", expected, year);
                            putMetric(deduped, urn, prefix + " Avg Score", avgScore, year);
                        }
                    } catch (NumberFormatException ignored) {}
                }
            }
        } catch (Exception e) {
            log.warn("Failed to fetch KS2 CSV: {}", e.getMessage());
        }

        log.info("Parsed {} KS2 metric entries for {} schools",
                deduped.size(), deduped.values().stream().map(m -> m.get("urn")).distinct().count());
        return new ArrayList<>(deduped.values());
    }

    /**
     * Opens an HTTP connection that handles gzip-compressed responses from the EES API.
     */
    private InputStream openCsvStream(String urlStr) throws java.io.IOException {
        HttpURLConnection conn = (HttpURLConnection) new URL(urlStr).openConnection();
        conn.setRequestProperty("Accept", "text/csv");
        conn.setRequestProperty("Accept-Encoding", "gzip");
        conn.setConnectTimeout(30_000);
        conn.setReadTimeout(300_000);

        InputStream is = conn.getInputStream();
        String encoding = conn.getContentEncoding();
        if ("gzip".equalsIgnoreCase(encoding)) {
            is = new GZIPInputStream(is);
        }
        return is;
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private boolean isKs4TotalRow(CSVRecord record) {
        return "Total".equalsIgnoreCase(safeGet(record, "breakdown_topic"))
                && "Total".equalsIgnoreCase(safeGet(record, "breakdown"));
    }

    private boolean isKs2TotalRow(CSVRecord record) {
        return "All pupils".equalsIgnoreCase(safeGet(record, "breakdown_topic"))
                && "Total".equalsIgnoreCase(safeGet(record, "breakdown"));
    }

    private String ks2MetricPrefix(String subject) {
        if (subject == null) return null;
        return switch (subject.trim().toLowerCase()) {
            case "reading, writing and maths" -> "KS2 RWM";
            case "reading"  -> "KS2 Reading";
            case "maths"    -> "KS2 Maths";
            case "writing"  -> "KS2 Writing";
            default         -> null;
        };
    }

    /**
     * Stores a metric, keeping only the most recent year per urn+metricName combination.
     * Suppressed values ("z", "c", "x") are skipped.
     */
    private void putMetric(Map<String, Map<String, Object>> deduped, long urn,
                           String metricName, String value, String year) {
        if (value == null || value.isBlank() || isSuppressed(value)) return;
        String key = urn + "|" + metricName;
        Map<String, Object> existing = deduped.get(key);
        // Replace if this is a newer year (lexicographic comparison works: "202425" > "202324")
        if (existing == null || String.valueOf(year).compareTo(String.valueOf(existing.get("year"))) >= 0) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("urn", urn);
            entry.put("metricName", metricName);
            entry.put("value", value.trim());
            entry.put("year", year != null ? year : "");
            deduped.put(key, entry);
        }
    }

    private boolean isSuppressed(String v) {
        return "z".equalsIgnoreCase(v.trim()) || "c".equalsIgnoreCase(v.trim())
                || "x".equalsIgnoreCase(v.trim()) || ":".equals(v.trim());
    }

    private CSVParser buildParser(InputStreamReader reader) throws java.io.IOException {
        return CSVFormat.DEFAULT.builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .setIgnoreHeaderCase(true)
                .setTrim(true)
                .build()
                .parse(reader);
    }

    private String formatYear(String tp) {
        if (tp == null || tp.length() != 6) return tp;
        return tp.substring(0, 4) + "/" + tp.substring(4);
    }

    private String safeGet(CSVRecord record, String header) {
        try {
            return record.get(header);
        } catch (Exception e) {
            return null;
        }
    }
}
