package KTPM.example.BlueMoon.repository;

import KTPM.example.BlueMoon.model.Lichsuthaydoi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberRepository extends JpaRepository<Lichsuthaydoi, Integer> {
}
