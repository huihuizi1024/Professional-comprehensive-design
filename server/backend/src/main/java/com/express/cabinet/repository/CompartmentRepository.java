package com.express.cabinet.repository;

import com.express.cabinet.entity.Compartment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CompartmentRepository extends JpaRepository<Compartment, Long> {
    List<Compartment> findByCabinetId(Long cabinetId);
    Optional<Compartment> findByCabinetIdAndCompartmentNo(Long cabinetId, Integer compartmentNo);
    List<Compartment> findByCabinetIdAndStatus(Long cabinetId, Integer status);
    void deleteByCabinetId(Long cabinetId);

    long countByStatus(Integer status);

    long countByHasItem(Integer hasItem);
}

