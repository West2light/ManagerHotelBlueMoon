package KTPM.example.BlueMoon.repository;

import KTPM.example.BlueMoon.model.Khoanthu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface khoanthuRepository extends JpaRepository<Khoanthu, Integer> {
    Khoanthu findByKhoanthuid(int khoanthu_id);
    void deleteByKhoanthuid(int khoanthu_id);

}
