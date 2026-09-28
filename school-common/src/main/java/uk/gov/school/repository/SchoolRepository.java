package uk.gov.school.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import uk.gov.school.entity.School;

import java.util.List;

public interface SchoolRepository extends JpaRepository<School, Long> {

    @Query(value = """
        SELECT s.* FROM schools s
        LEFT JOIN ofsted_ratings o ON o.urn = s.urn
        WHERE (:lat IS NULL OR :lon IS NULL OR ST_DWithin(CAST(s.location AS geography),
            CAST(ST_SetSRID(ST_MakePoint(:lon, :lat), 4326) AS geography), :radiusMeters))
        AND (COALESCE(CAST(:type AS TEXT), '') = '' OR s.type = :type)
        AND (COALESCE(CAST(:phase AS TEXT), '') = '' OR s.phase_of_education = :phase)
        AND (COALESCE(CAST(:minRating AS TEXT), '') = '' OR o.overall_effectiveness = :minRating)
        AND s.location IS NOT NULL
        AND s.status = 'Open'
        ORDER BY (CASE WHEN :lat IS NOT NULL AND :lon IS NOT NULL
            THEN ST_Distance(CAST(s.location AS geography), CAST(ST_SetSRID(ST_MakePoint(:lon, :lat), 4326) AS geography))
            ELSE 0 END)
        LIMIT :limit
        """, nativeQuery = true)
    List<School> search(
            @Param("lat") Double lat,
            @Param("lon") Double lon,
            @Param("radiusMeters") double radiusMeters,
            @Param("type") String type,
            @Param("phase") String phase,
            @Param("minRating") String minRating,
            @Param("limit") int limit
    );
}
