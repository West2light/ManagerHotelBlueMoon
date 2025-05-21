package KTPM.example.BlueMoon.repository;

import KTPM.example.BlueMoon.model.Khoanthu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface khoanthuRepository extends JpaRepository<Khoanthu, Integer> {
}
