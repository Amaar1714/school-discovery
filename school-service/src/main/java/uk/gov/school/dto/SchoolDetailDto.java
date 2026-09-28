package uk.gov.school.dto;

import java.time.LocalDate;
import java.util.List;

public record SchoolDetailDto(
        Long urn,
        String name,
        String postcode,
        String address,
        String phaseOfEducation,
        String type,
        String status,
        Integer capacity,
        Double latitude,
        Double longitude,
        String schoolWebsite,
        String phone,
        String localAuthority,
        String overallEffectiveness,
        LocalDate inspectionDate,
        String inspectionType,
        String qualityOfEducation,
        String behaviourAndAttitudes,
        String personalDevelopment,
        String leadershipAndManagement,
        List<AcademicMetricDto> academicMetrics
) {}
