package com.express.cabinet.service;

import com.express.cabinet.entity.Cabinet;
import com.express.cabinet.entity.Compartment;
import com.express.cabinet.repository.CabinetRepository;
import com.express.cabinet.repository.CompartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CabinetService {
    private final CabinetRepository cabinetRepository;
    private final CompartmentRepository compartmentRepository;

    public List<Cabinet> getAllCabinets() {
        return cabinetRepository.findAll();
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
        if (cabinetRepository.findByCabinetCode(cabinet.getCabinetCode()).isPresent()) {
            throw new RuntimeException("快递柜编号已存在");
        }
        Cabinet saved = cabinetRepository.save(cabinet);
        
        // 创建仓门
        for (int i = 1; i <= saved.getTotalCompartments(); i++) {
            Compartment compartment = new Compartment();
            compartment.setCabinetId(saved.getId());
            compartment.setCompartmentNo(i);
            compartment.setStatus(1);
            compartment.setHasItem(0);
            compartmentRepository.save(compartment);
        }
        
        return saved;
    }

    @Transactional
    public Cabinet updateCabinetStatus(Long id, Integer status) {
        Cabinet cabinet = getCabinetById(id);
        cabinet.setStatus(status);
        return cabinetRepository.save(cabinet);
    }

    @Transactional
    public Compartment updateCompartmentStatus(Long compartmentId, Integer status) {
        Compartment compartment = compartmentRepository.findById(compartmentId)
                .orElseThrow(() -> new RuntimeException("仓门不存在"));
        compartment.setStatus(status);
        return compartmentRepository.save(compartment);
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
}

