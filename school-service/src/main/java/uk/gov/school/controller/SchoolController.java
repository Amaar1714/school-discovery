package uk.gov.school.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uk.gov.school.dto.CompareRequest;
import uk.gov.school.dto.SchoolDetailDto;
import uk.gov.school.dto.SchoolSummaryDto;
import uk.gov.school.service.SchoolService;

import java.util.List;

@RestController
@RequestMapping("/schools")
@CrossOrigin(origins = "*")
public class SchoolController {

    private final SchoolService schoolService;

    public SchoolController(SchoolService schoolService) {
        this.schoolService = schoolService;
    }

    @GetMapping("/search")
    public List<SchoolSummaryDto> search(
            @RequestParam(required = false) String postcode,
            @RequestParam(required = false) Double radiusKm,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String phase,
            @RequestParam(required = false) String minRating) {
        return schoolService.search(postcode, radiusKm, type, phase, minRating);
    }

    @GetMapping("/{urn}")
    public ResponseEntity<SchoolDetailDto> getByUrn(@PathVariable Long urn) {
        return schoolService.getByUrn(urn)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/compare")
    public ResponseEntity<List<SchoolDetailDto>> compare(@RequestBody CompareRequest request) {
        List<SchoolDetailDto> result = schoolService.compare(request.urns());
        if (result.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(result);
    }
}
