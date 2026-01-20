package com.express.cabinet.controller;

import com.express.cabinet.dto.ApiResponse;
import com.express.cabinet.entity.Cabinet;
import com.express.cabinet.entity.Compartment;
import com.express.cabinet.service.CabinetService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/cabinets")
@RequiredArgsConstructor
public class CabinetController {
    private final CabinetService cabinetService;

    @GetMapping
    public ApiResponse<List<Cabinet>> getAllCabinets() {
        return ApiResponse.success(cabinetService.getAllCabinets());
    }

    @GetMapping("/{id}")
    public ApiResponse<Cabinet> getCabinetById(@PathVariable Long id) {
        try {
            return ApiResponse.success(cabinetService.getCabinetById(id));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/code/{cabinetCode}")
    public ApiResponse<Cabinet> getCabinetByCode(@PathVariable String cabinetCode) {
        try {
            return ApiResponse.success(cabinetService.getCabinetByCode(cabinetCode));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/nearby")
    public ApiResponse<List<Cabinet>> getNearbyCabinets(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(required = false) Double radius
    ) {
        return ApiResponse.success(cabinetService.findNearbyCabinets(latitude, longitude, radius));
    }

    @GetMapping("/sort-by-distance")
    public ApiResponse<List<Cabinet>> sortCabinetsByDistance(
            @RequestParam Double latitude,
            @RequestParam Double longitude
    ) {
        return ApiResponse.success(cabinetService.sortCabinetsByDistance(latitude, longitude));
    }

    @GetMapping("/{cabinetId}/compartments")
    public ApiResponse<List<Compartment>> getCompartments(@PathVariable Long cabinetId) {
        return ApiResponse.success(cabinetService.getCompartmentsByCabinetId(cabinetId));
    }

    @GetMapping("/{cabinetId}/compartments/available")
    public ApiResponse<List<Compartment>> getAvailableCompartments(@PathVariable Long cabinetId) {
        return ApiResponse.success(cabinetService.getAvailableCompartments(cabinetId));
    }

    @PostMapping
    public ApiResponse<Cabinet> createCabinet(@RequestBody Cabinet cabinet) {
        try {
            return ApiResponse.success("创建成功", cabinetService.createCabinet(cabinet));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ApiResponse<Cabinet> updateCabinetStatus(@PathVariable Long id, @RequestBody Map<String, Integer> request) {
        try {
            Integer status = request.get("status");
            return ApiResponse.success(cabinetService.updateCabinetStatus(id, status));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ApiResponse<Cabinet> updateCabinet(@PathVariable Long id, @RequestBody Cabinet update) {
        return ApiResponse.success("更新成功", cabinetService.updateCabinet(id, update));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteCabinet(@PathVariable Long id) {
        cabinetService.deleteCabinet(id);
        return ApiResponse.success("删除成功");
    }

    @PutMapping("/compartments/{compartmentId}/status")
    public ApiResponse<Compartment> updateCompartmentStatus(@PathVariable Long compartmentId, @RequestBody Map<String, Integer> request) {
        try {
            Integer status = request.get("status");
            return ApiResponse.success(cabinetService.updateCompartmentStatus(compartmentId, status));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/compartments/{compartmentId}/open")
    public ApiResponse<String> openCompartment(@PathVariable Long compartmentId) {
        try {
            cabinetService.openCompartment(compartmentId);
            return ApiResponse.success("开仓成功");
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}

