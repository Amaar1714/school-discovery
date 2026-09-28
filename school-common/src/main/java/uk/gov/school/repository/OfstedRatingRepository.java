package uk.gov.school.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uk.gov.school.entity.OfstedRating;

import java.util.List;
import java.util.Optional;

public interface OfstedRatingRepository extends JpaRepository<OfstedRating, Long> {

    List<OfstedRating> findByUrnIn(List<Long> urns);
    Optional<OfstedRating> findByUrn(Long urn);
}
