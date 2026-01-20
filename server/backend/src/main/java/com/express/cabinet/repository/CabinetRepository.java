package com.express.cabinet.repository;

import com.express.cabinet.entity.Cabinet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CabinetRepository extends JpaRepository<Cabinet, Long> {
    Optional<Cabinet> findByCabinetCode(String cabinetCode);

    long countByStatus(Integer status);
}

