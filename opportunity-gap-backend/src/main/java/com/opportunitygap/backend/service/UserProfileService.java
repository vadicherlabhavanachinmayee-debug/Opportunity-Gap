
package com.opportunitygap.backend.service;

import com.opportunitygap.backend.entity.UserProfile;
import com.opportunitygap.backend.repository.UserProfileRepository;
import org.springframework.stereotype.Service;

@Service
public class UserProfileService {

    private final UserProfileRepository profileRepository;

    public UserProfileService(UserProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    public UserProfile getProfile(Integer userId) {
        return profileRepository.findByUserId(userId).orElse(null);
    }

    public UserProfile saveProfile(UserProfile profile) {
        UserProfile existing = profileRepository
                .findByUserId(profile.getUserId())
                .orElse(null);

        if (existing != null) {
            existing.setHighestQualification(profile.getHighestQualification());
            existing.setDegree(profile.getDegree());
            existing.setFieldOfStudy(profile.getFieldOfStudy());
            existing.setGraduationYear(profile.getGraduationYear());
            existing.setLocation(profile.getLocation());
            existing.setPreferredWorkMode(profile.getPreferredWorkMode());
            existing.setSkills(profile.getSkills());
            existing.setInterests(profile.getInterests());

            return profileRepository.save(existing);
        }

        return profileRepository.save(profile);
    }
}
