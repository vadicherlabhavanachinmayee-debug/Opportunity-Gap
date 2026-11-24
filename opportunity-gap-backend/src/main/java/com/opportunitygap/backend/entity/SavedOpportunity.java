package com.opportunitygap.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "saved_opportunities")
public class SavedOpportunity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "saved_id")
    private Integer savedId;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "opportunity_id", nullable = false)
    private Integer opportunityId;

    @Column(name = "saved_at", insertable = false, updatable = false)
    private LocalDateTime savedAt;

    public SavedOpportunity() {}

    public Integer getSavedId() {
        return savedId;
    }

    public void setSavedId(Integer savedId) {
        this.savedId = savedId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Integer getOpportunityId() {
        return opportunityId;
    }

    public void setOpportunityId(Integer opportunityId) {
        this.opportunityId = opportunityId;
    }

    public LocalDateTime getSavedAt() {
        return savedAt;
    }
}