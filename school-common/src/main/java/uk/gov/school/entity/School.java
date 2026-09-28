package uk.gov.school.entity;

import jakarta.persistence.*;
import org.locationtech.jts.geom.Point;

import java.time.Instant;

@Entity
@Table(name = "schools")
public class School {

    @Id
    private Long urn;

    @Column(nullable = false)
    private String name;

    private String postcode;
    private String address;
    private String phaseOfEducation;
    private String type;
    private String status;
    private Integer capacity;
    private Double latitude;
    private Double longitude;

    @Column(columnDefinition = "geometry(Point,4326)")
    private Point location;

    private String schoolWebsite;
    private String phone;
    private String localAuthority;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public Long getUrn() { return urn; }
    public void setUrn(Long urn) { this.urn = urn; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPostcode() { return postcode; }
    public void setPostcode(String postcode) { this.postcode = postcode; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getPhaseOfEducation() { return phaseOfEducation; }
    public void setPhaseOfEducation(String phaseOfEducation) { this.phaseOfEducation = phaseOfEducation; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public Point getLocation() { return location; }
    public void setLocation(Point location) { this.location = location; }
    public String getSchoolWebsite() { return schoolWebsite; }
    public void setSchoolWebsite(String schoolWebsite) { this.schoolWebsite = schoolWebsite; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getLocalAuthority() { return localAuthority; }
    public void setLocalAuthority(String localAuthority) { this.localAuthority = localAuthority; }
}
