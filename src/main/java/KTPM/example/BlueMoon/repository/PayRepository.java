package KTPM.example.BlueMoon.repository;

import KTPM.example.BlueMoon.model.Pay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PayRepository extends JpaRepository<Pay, Integer> {
}
