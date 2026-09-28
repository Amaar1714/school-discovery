package uk.gov.school.ingestion.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uk.gov.school.ingestion.service.IngestionService;

@RestController
@RequestMapping("/ingest")
@CrossOrigin(origins = "*")
public class IngestionController {

    private final IngestionService ingestionService;

    public IngestionController(IngestionService ingestionService) {
        this.ingestionService = ingestionService;
    }

    @PostMapping
    public ResponseEntity<IngestionService.IngestionResult> triggerIngestion() {
        IngestionService.IngestionResult result = ingestionService.runIngestion();
        return ResponseEntity.ok(result);
    }
}
