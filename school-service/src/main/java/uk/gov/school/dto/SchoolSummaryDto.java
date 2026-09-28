package uk.gov.school.dto;

public record SchoolSummaryDto(
        Long urn,
        String name,
        String postcode,
        String address,
        String phaseOfEducation,
        String type,
        Double latitude,
        Double longitude,
        String overallEffectiveness,
        Integer capacity
) {}
