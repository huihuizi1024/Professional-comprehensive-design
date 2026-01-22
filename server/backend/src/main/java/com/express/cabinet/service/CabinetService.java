package com.express.cabinet.service;

import com.express.cabinet.entity.Cabinet;
import com.express.cabinet.entity.Compartment;
import com.express.cabinet.repository.CabinetRepository;
import com.express.cabinet.repository.CompartmentRepository;
import com.express.cabinet.repository.ExpressOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CabinetService {
    private final CabinetRepository cabinetRepository;
    private final CompartmentRepository compartmentRepository;
    private final ExpressOrderRepository expressOrderRepository;

    public List<Cabinet> getAllCabinets() {
        List<Cabinet> cabinets = cabinetRepository.findAll();
        cabinets.forEach(cabinet -> {
            long count = compartmentRepository.findByCabinetIdAndStatus(cabinet.getId(), 1)
                    .stream()
                    .filter(c -> c.getHasItem() == 0)
                    .count();
            cabinet.setAvailableCompartments((int) count);
        });
        return cabinets;
    }

    public Cabinet getCabinetById(Long id) {
        return cabinetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("快递柜不存在"));
    }

    public Cabinet getCabinetByCode(String cabinetCode) {
        return cabinetRepository.findByCabinetCode(cabinetCode)
                .orElseThrow(() -> new RuntimeException("快递柜不存在"));
    }

    public List<Compartment> getCompartmentsByCabinetId(Long cabinetId) {
        return compartmentRepository.findByCabinetId(cabinetId);
    }

    public List<Compartment> getAvailableCompartments(Long cabinetId) {
        return compartmentRepository.findByCabinetIdAndStatus(cabinetId, 1)
                .stream()
                .filter(c -> c.getHasItem() == 0)
                .collect(Collectors.toList());
    }

    @Transactional
    public Cabinet createCabinet(Cabinet cabinet) {
        if (cabinet == null) {
            throw new RuntimeException("参数不能为空");
        }
        if (cabinet.getCabinetCode() == null || cabinet.getCabinetCode().trim().isEmpty()) {
            throw new RuntimeException("快递柜编号不能为空");
        }
        cabinet.setCabinetCode(cabinet.getCabinetCode().trim());

        if (cabinet.getStatus() == null) {
            cabinet.setStatus(1);
        }
        if (cabinet.getTotalCompartments() == null) {
            cabinet.setTotalCompartments(8);
        }
        if (cabinet.getTotalCompartments() <= 0) {
            throw new RuntimeException("总仓数必须大于0");
        }
        if (cabinet.getPowerConsumption() == null) {
            cabinet.setPowerConsumption(BigDecimal.ZERO);
        }

        if (cabinetRepository.findByCabinetCode(cabinet.getCabinetCode()).isPresent()) {
            throw new RuntimeException("快递柜编号已存在");
        }
        Cabinet saved = cabinetRepository.save(cabinet);

        for (int i = 1; i <= saved.getTotalCompartments(); i++) {
            Compartment compartment = new Compartment();
            compartment.setCabinetId(saved.getId());
            compartment.setCompartmentNo(i);
            compartment.setStatus(1);
            compartment.setHasItem(0);
            
            // Assign size based on compartment number pattern
            // For 8 compartments: 1-2 Large, 3-5 Medium, 6-8 Small
            // For others: Default to Medium (1)
            if (saved.getTotalCompartments() == 8) {
                if (i <= 2) {
                    compartment.setSizeType(2); // Large
                } else if (i <= 5) {
                    compartment.setSizeType(1); // Medium
                } else {
                    compartment.setSizeType(0); // Small
                }
            } else {
                compartment.setSizeType(1); // Default Medium
            }
            
            compartmentRepository.save(compartment);
        }

        return saved;
    }

    @Transactional
    public Cabinet updateCabinetStatus(Long id, Integer status) {
        if (status == null || (status != 0 && status != 1)) {
            throw new RuntimeException("状态参数不正确");
        }
        Cabinet cabinet = getCabinetById(id);
        cabinet.setStatus(status);
        return cabinetRepository.save(cabinet);
    }

    @Transactional
    public Compartment updateCompartmentStatus(Long compartmentId, Integer status) {
        if (status == null || (status != 0 && status != 1)) {
            throw new RuntimeException("状态参数不正确");
        }
        Compartment compartment = compartmentRepository.findById(compartmentId)
                .orElseThrow(() -> new RuntimeException("仓门不存在"));
        compartment.setStatus(status);
        return compartmentRepository.save(compartment);
    }

    @Transactional
    public Cabinet updateCabinet(Long id, Cabinet update) {
        if (update == null) {
            throw new RuntimeException("参数不能为空");
        }
        Cabinet cabinet = getCabinetById(id);

        if (update.getLocation() != null) {
            cabinet.setLocation(update.getLocation());
        }
        if (update.getPowerConsumption() != null) {
            cabinet.setPowerConsumption(update.getPowerConsumption());
        }
        return cabinetRepository.save(cabinet);
    }

    @Transactional
    public void deleteCabinet(Long id) {
        Cabinet cabinet = getCabinetById(id);
        if (!expressOrderRepository.findByCabinetId(id).isEmpty()) {
            throw new RuntimeException("该快递柜存在关联订单，无法删除");
        }
        compartmentRepository.deleteByCabinetId(id);
        cabinetRepository.delete(cabinet);
    }

    @Transactional
    public void openCompartment(Long compartmentId) {
        Compartment compartment = compartmentRepository.findById(compartmentId)
                .orElseThrow(() -> new RuntimeException("仓门不存在"));
        if (compartment.getStatus() == 0) {
            throw new RuntimeException("仓门故障，无法打开");
        }
        // 模拟开仓操作
        // 实际应该调用硬件接口
    }

    public List<Cabinet> findNearbyCabinets(Double latitude, Double longitude, Double radius) {
        if (latitude == null || longitude == null) {
            throw new RuntimeException("经纬度不能为空");
        }
        // 默认半径 5km
        double searchRadius = (radius == null || radius <= 0) ? 5.0 : radius;

        return cabinetRepository.findAll().stream()
                .filter(c -> {
                    if (c.getLatitude() == null || c.getLongitude() == null) return false;
                    double dist = getDistance(latitude, longitude, c.getLatitude(), c.getLongitude());
                    return dist <= searchRadius;
                })
                .collect(Collectors.toList());
    }

    public List<Cabinet> sortCabinetsByDistance(Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            throw new RuntimeException("经纬度不能为空");
        }
        return cabinetRepository.findAll().stream()
                .sorted((c1, c2) -> {
                    double d1 = (c1.getLatitude() == null || c1.getLongitude() == null) ? Double.MAX_VALUE :
                            getDistance(latitude, longitude, c1.getLatitude(), c1.getLongitude());
                    double d2 = (c2.getLatitude() == null || c2.getLongitude() == null) ? Double.MAX_VALUE :
                            getDistance(latitude, longitude, c2.getLatitude(), c2.getLongitude());
                    return Double.compare(d1, d2);
                })
                .collect(Collectors.toList());
    }

    // 计算两点距离（Haversine公式），返回单位：公里
    private double getDistance(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371; // 地球半径 km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}

