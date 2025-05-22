package KTPM.example.BlueMoon.repository;

import KTPM.example.BlueMoon.model.Nhankhau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface nhankhauRepository extends JpaRepository<Nhankhau, Integer> {

}
