package uk.gov.school.client;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class PostcodesIoClient {

    private static final String API_URL = "https://api.postcodes.io/postcodes/";
    private final RestTemplate restTemplate = new RestTemplate();

    public record PostcodeResult(double latitude, double longitude) {}

    public PostcodeResult lookup(String postcode) {
        if (postcode == null || postcode.isBlank()) {
            return null;
        }
        String normalized = postcode.replaceAll("\\s+", "").toUpperCase();
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> body = restTemplate.getForObject(API_URL + normalized, Map.class);
            if (body == null || !Integer.valueOf(200).equals(body.get("status"))) {
                return null;
            }
            @SuppressWarnings("unchecked")
            Map<String, Object> result = (Map<String, Object>) body.get("result");
            if (result == null) return null;
            Number lat = (Number) result.get("latitude");
            Number lon = (Number) result.get("longitude");
            if (lat == null || lon == null) return null;
            return new PostcodeResult(lat.doubleValue(), lon.doubleValue());
        } catch (Exception e) {
            return null;
        }
    }
}
