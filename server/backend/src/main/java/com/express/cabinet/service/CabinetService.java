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
}

