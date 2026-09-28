package uk.gov.school.ingestion.client;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Component
public class GiasClient {

    private final String url;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GiasClient(@Value("${gias.url:https://dfe-digital.github.io/gias-data/schools.json}") String url) {
        this.url = url;
    }

    public List<Map<String, Object>> fetchAllSchools() {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> list = restTemplate.getForObject(url, List.class);
        return list != null ? list : List.of();
    }
}
