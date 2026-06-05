package com.greenbasket.nepal.domain.settings.service.impl;

import com.greenbasket.nepal.domain.settings.dto.SettingRequest;
import com.greenbasket.nepal.domain.settings.dto.SettingResponse;
import com.greenbasket.nepal.domain.settings.entity.Setting;
import com.greenbasket.nepal.domain.settings.repository.SettingRepository;
import com.greenbasket.nepal.domain.settings.service.SettingService;
import com.greenbasket.nepal.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SettingServiceImpl implements SettingService {

    private final SettingRepository settingRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SettingResponse> getAllSettings() {
        return settingRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SettingResponse getSettingByKey(String key) {
        Setting setting = settingRepository.findBySettingKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("Setting not found with key: " + key));
        return toResponse(setting);
    }

    @Override
    @Transactional
    public SettingResponse updateSetting(Long id, SettingRequest request) {
        Setting setting = settingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Setting not found with id: " + id));

        if (request.getSettingValue() != null) {
            setting.setSettingValue(request.getSettingValue());
        }
        if (request.getDescription() != null) {
            setting.setDescription(request.getDescription());
        }

        Setting saved = settingRepository.save(setting);
        log.info("Setting updated: {} = {}", saved.getSettingKey(), saved.getSettingValue());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteSetting(Long id) {
        Setting setting = settingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Setting not found with id: " + id));
        settingRepository.delete(setting);
        log.info("Setting deleted: {}", setting.getSettingKey());
    }

    private SettingResponse toResponse(Setting setting) {
        return SettingResponse.builder()
                .id(setting.getId())
                .settingKey(setting.getSettingKey())
                .settingValue(setting.getSettingValue())
                .description(setting.getDescription())
                .createdAt(setting.getCreatedAt())
                .updatedAt(setting.getUpdatedAt())
                .build();
    }
}
