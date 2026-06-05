package com.greenbasket.nepal.domain.settings.controller;

import com.greenbasket.nepal.common.dto.ApiResponse;
import com.greenbasket.nepal.domain.settings.dto.SettingRequest;
import com.greenbasket.nepal.domain.settings.dto.SettingResponse;
import com.greenbasket.nepal.domain.settings.service.SettingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingService settingService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<SettingResponse>>> getAllSettings() {
        List<SettingResponse> settings = settingService.getAllSettings();
        return ResponseEntity.ok(ApiResponse.success("Settings retrieved successfully", settings));
    }

    @GetMapping("/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SettingResponse>> getSettingByKey(@PathVariable String key) {
        SettingResponse setting = settingService.getSettingByKey(key);
        return ResponseEntity.ok(ApiResponse.success("Setting retrieved successfully", setting));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SettingResponse>> updateSetting(
            @PathVariable Long id,
            @Valid @RequestBody SettingRequest request) {
        SettingResponse setting = settingService.updateSetting(id, request);
        return ResponseEntity.ok(ApiResponse.success("Setting updated successfully", setting));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSetting(@PathVariable Long id) {
        settingService.deleteSetting(id);
        return ResponseEntity.ok(ApiResponse.success("Setting deleted successfully", null));
    }
}
