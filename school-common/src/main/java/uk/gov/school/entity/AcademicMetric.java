package uk.gov.school.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "academic_metrics")
public class AcademicMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long urn;

    @Column(nullable = false)
    private String metricName;

    private String value;
    private String year;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUrn() { return urn; }
    public void setUrn(Long urn) { this.urn = urn; }
    public String getMetricName() { return metricName; }
    public void setMetricName(String metricName) { this.metricName = metricName; }
    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }
}
