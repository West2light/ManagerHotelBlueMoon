package KTPM.example.BlueMoon.repository;

import KTPM.example.BlueMoon.model.hokhau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface hokhauRepository extends JpaRepository<hokhau, Integer> {
}
