package KTPM.example.BlueMoon.repository;

import KTPM.example.BlueMoon.model.Nhankhau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface nhankhauRepository extends JpaRepository<Nhankhau, Integer> {
    Nhankhau findByCccd(String cccd);

    List<Nhankhau> findByHokhau_Hokhauid(int hokhauId);


    List<Nhankhau> findByHoten(String hoten);

    Nhankhau findByHokhau_HokhauidAndCccd(int hokhauId, String cccd);

    Nhankhau findByCccdAndHoten(String cccd, String hoten);

    Nhankhau findByHokhau_HokhauidAndHoten(int hokhauId, String name);

    Nhankhau findByHokhau_HokhauidAndCccdAndHoten(int hokhauId, String cccd, String name);

    Nhankhau findByNhankhauid(int nhankhauid);
}
