package uk.gov.school.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import uk.gov.school.dto.SchoolDetailDto;
import uk.gov.school.dto.SchoolSummaryDto;
import uk.gov.school.service.SchoolService;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class SchoolControllerTest {

    private MockMvc mockMvc;

    @Mock
    private SchoolService schoolService;

    @InjectMocks
    private SchoolController schoolController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(schoolController).build();
    }

    @Test
    void search_withNoParams_returns200() throws Exception {
        when(schoolService.search(any(), any(), any(), any(), any()))
                .thenReturn(List.of());

        mockMvc.perform(get("/schools/search"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test
    void search_withPostcode_returns200WithResults() throws Exception {
        SchoolSummaryDto summary = new SchoolSummaryDto(
                100000L, "Test School", "HA3 7JT", "Test Road",
                "Primary", "Academy", 51.5, -0.1, "Good", 300
        );
        when(schoolService.search(eq("HA3 7JT"), any(), any(), any(), any()))
                .thenReturn(List.of(summary));

        mockMvc.perform(get("/schools/search").param("postcode", "HA3 7JT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test School"))
                .andExpect(jsonPath("$[0].overallEffectiveness").value("Good"));
    }

    @Test
    void getByUrn_withValidUrn_returns200() throws Exception {
        SchoolDetailDto detail = new SchoolDetailDto(
                100000L, "Test School", "HA3 7JT", "Test Road",
                "Primary", "Academy", "Open", 300,
                51.5, -0.1, null, null, "Harrow",
                "Good", null, null,
                null, null, null, null,
                List.of()
        );
        when(schoolService.getByUrn(100000L)).thenReturn(Optional.of(detail));

        mockMvc.perform(get("/schools/100000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test School"))
                .andExpect(jsonPath("$.localAuthority").value("Harrow"));
    }

    @Test
    void getByUrn_withUnknownUrn_returns404() throws Exception {
        when(schoolService.getByUrn(99999999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/schools/99999999"))
                .andExpect(status().isNotFound());
    }
}
