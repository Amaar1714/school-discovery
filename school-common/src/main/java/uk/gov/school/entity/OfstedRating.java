package uk.gov.school.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "ofsted_ratings", uniqueConstraints = @UniqueConstraint(columnNames = "urn"))
public class OfstedRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long urn;

    private String overallEffectiveness;
    private LocalDate inspectionDate;
    private String inspectionType;
    private String qualityOfEducation;
    private String behaviourAndAttitudes;
    private String personalDevelopment;
    private String leadershipAndManagement;

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
    public String getOverallEffectiveness() { return overallEffectiveness; }
    public void setOverallEffectiveness(String overallEffectiveness) { this.overallEffectiveness = overallEffectiveness; }
    public LocalDate getInspectionDate() { return inspectionDate; }
    public void setInspectionDate(LocalDate inspectionDate) { this.inspectionDate = inspectionDate; }
    public String getInspectionType() { return inspectionType; }
    public void setInspectionType(String inspectionType) { this.inspectionType = inspectionType; }
    public String getQualityOfEducation() { return qualityOfEducation; }
    public void setQualityOfEducation(String qualityOfEducation) { this.qualityOfEducation = qualityOfEducation; }
    public String getBehaviourAndAttitudes() { return behaviourAndAttitudes; }
    public void setBehaviourAndAttitudes(String behaviourAndAttitudes) { this.behaviourAndAttitudes = behaviourAndAttitudes; }
    public String getPersonalDevelopment() { return personalDevelopment; }
    public void setPersonalDevelopment(String personalDevelopment) { this.personalDevelopment = personalDevelopment; }
    public String getLeadershipAndManagement() { return leadershipAndManagement; }
    public void setLeadershipAndManagement(String leadershipAndManagement) { this.leadershipAndManagement = leadershipAndManagement; }
}
