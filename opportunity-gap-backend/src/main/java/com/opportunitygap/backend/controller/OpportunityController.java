
package com.opportunitygap.backend.controller;

import com.opportunitygap.backend.entity.Opportunity;
import com.opportunitygap.backend.repository.OpportunityRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/opportunities")
@CrossOrigin(origins = "http://localhost:5173")
public class OpportunityController {

    private final OpportunityRepository opportunityRepository;

    public OpportunityController(OpportunityRepository opportunityRepository) {
        this.opportunityRepository = opportunityRepository;
    }

    @GetMapping
    public List<Opportunity> getAllOpportunities() {
        return opportunityRepository.findAll();
    }

    @GetMapping("/{id}")
    public Opportunity getOpportunityById(@PathVariable Integer id) {
        return opportunityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Opportunity not found"));
    }
}
