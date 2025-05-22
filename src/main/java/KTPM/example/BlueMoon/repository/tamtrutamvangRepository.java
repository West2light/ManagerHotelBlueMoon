package KTPM.example.BlueMoon.repository;

import KTPM.example.BlueMoon.model.Tamtrutamvang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface tamtrutamvangRepository extends JpaRepository<Tamtrutamvang, Integer> {
}
