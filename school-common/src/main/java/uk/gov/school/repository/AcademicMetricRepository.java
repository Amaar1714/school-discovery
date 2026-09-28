package uk.gov.school.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uk.gov.school.entity.AcademicMetric;

import java.util.List;

public interface AcademicMetricRepository extends JpaRepository<AcademicMetric, Long> {

    List<AcademicMetric> findByUrn(Long urn);
    List<AcademicMetric> findByUrnIn(List<Long> urns);
}
