package com.greenbasket.nepal.domain.settings.service;

import com.greenbasket.nepal.domain.settings.dto.SettingRequest;
import com.greenbasket.nepal.domain.settings.dto.SettingResponse;

import java.util.List;

public interface SettingService {

    List<SettingResponse> getAllSettings();

    SettingResponse getSettingByKey(String key);

    SettingResponse updateSetting(Long id, SettingRequest request);

    void deleteSetting(Long id);
}
