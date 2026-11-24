package com.opportunitygap.backend.repository;

import com.opportunitygap.backend.entity.SavedOpportunity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SavedOpportunityRepository
        extends JpaRepository<SavedOpportunity, Integer> {

    List<SavedOpportunity> findByUserId(Integer userId);

    Optional<SavedOpportunity> findByUserIdAndOpportunityId(
            Integer userId, Integer opportunityId);

    void deleteByUserIdAndOpportunityId(
            Integer userId, Integer opportunityId);
}