package uk.gov.school.ingestion.scheduler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import uk.gov.school.ingestion.service.IngestionService;

@Component
public class IngestionScheduler {

    private static final Logger log = LoggerFactory.getLogger(IngestionScheduler.class);
    private final IngestionService ingestionService;

    public IngestionScheduler(IngestionService ingestionService) {
        this.ingestionService = ingestionService;
    }

    @Scheduled(cron = "${ingestion.cron:0 0 5 * * ?}")
    public void runDailyIngestion() {
        log.info("Starting scheduled data ingestion");
        IngestionService.IngestionResult result = ingestionService.runIngestion();
        log.info("Scheduled ingestion complete: {} schools, {} Ofsted ratings",
                result.schoolsProcessed(), result.ofstedProcessed());
    }
}
