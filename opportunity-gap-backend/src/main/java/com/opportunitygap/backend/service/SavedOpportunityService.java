
package com.opportunitygap.backend.service;

import com.opportunitygap.backend.entity.SavedOpportunity;
import com.opportunitygap.backend.repository.SavedOpportunityRepository;
import com.opportunitygap.backend.repository.OpportunityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SavedOpportunityService {

    private final SavedOpportunityRepository savedRepository;
    private final OpportunityRepository opportunityRepository;

    public SavedOpportunityService(
            SavedOpportunityRepository savedRepository,
            OpportunityRepository opportunityRepository) {
        this.savedRepository = savedRepository;
        this.opportunityRepository = opportunityRepository;
    }

    public List<SavedOpportunity> getSavedOpportunities(Integer userId) {
        return savedRepository.findByUserId(userId);
    }

    public SavedOpportunity saveOpportunity(Integer userId, Integer opportunityId) {

        if (!opportunityRepository.existsById(opportunityId)) {
            throw new RuntimeException("Opportunity not found");
        }

        if (savedRepository.findByUserIdAndOpportunityId(
                userId, opportunityId).isPresent()) {
            throw new RuntimeException("Opportunity already saved");
        }

        SavedOpportunity saved = new SavedOpportunity();
        saved.setUserId(userId);
        saved.setOpportunityId(opportunityId);

        return savedRepository.save(saved);
    }

    @Transactional
    public void removeSavedOpportunity(Integer userId, Integer opportunityId) {

        savedRepository.deleteByUserIdAndOpportunityId(
                userId, opportunityId);
    }
}
