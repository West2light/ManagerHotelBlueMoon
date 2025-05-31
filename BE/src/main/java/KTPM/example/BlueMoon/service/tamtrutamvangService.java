package KTPM.example.BlueMoon.service;

import KTPM.example.BlueMoon.Iservice.Itamtrutamvang;
import KTPM.example.BlueMoon.model.Lichsuthaydoi;
import KTPM.example.BlueMoon.model.Tamtrutamvang;
import KTPM.example.BlueMoon.model.Nhankhau;
import KTPM.example.BlueMoon.model.Hokhau;
import KTPM.example.BlueMoon.repository.lichsuthaydoiRepository;
import KTPM.example.BlueMoon.repository.tamtrutamvangRepository;
import KTPM.example.BlueMoon.repository.nhankhauRepository;
import KTPM.example.BlueMoon.repository.hokhauRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
@RequiredArgsConstructor
public class tamtrutamvangService implements Itamtrutamvang {
    private final lichsuthaydoiRepository lichsuthaydoiRepository;
    private final tamtrutamvangRepository tamtrutamvangRepository;
    private final nhankhauRepository nhankhauRepository;
    private final hokhauRepository hokhauRepository;

    @Override
    public boolean addlichsuthaydoi(int loaithaydoi, int hokhauid, String cccd, String qhevschuho) {
        try {
            Nhankhau nhankhau = nhankhauRepository.findByCccd(cccd);
            Hokhau hokhau = hokhauRepository.findById(hokhauid).orElse(null);
            if (nhankhau == null || hokhau == null) return false;
            if (nhankhau.getHokhau() == null || nhankhau.getHokhau().getHokhauid() != hokhauid) return false;
            Lichsuthaydoi record = Lichsuthaydoi.builder()
                    .nhankhau(nhankhau)
                    .hokhau(hokhau)
                    .thoigian(new java.sql.Date(new Date().getTime()))
                    .loaithaydoi(loaithaydoi)
                    .quanhevoichuho(qhevschuho)
                    .build();
            lichsuthaydoiRepository.save(record);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public boolean updateLichsuthaydoi(int id, int loaithaydoi, String cccd, String qhevschuho) {
        try {
            if (id == 0) return false;
            Lichsuthaydoi record = lichsuthaydoiRepository.findById(id).orElse(null);
            if (record == null) return false;

            if (cccd != null && !cccd.isEmpty()) {
                Nhankhau nhankhau = nhankhauRepository.findByCccd(cccd);
                if (nhankhau == null) return false;
                record.setNhankhau(nhankhau);
            }
            if (loaithaydoi != 0) record.setLoaithaydoi(loaithaydoi);
            if (qhevschuho != null && !qhevschuho.isEmpty()) record.setQuanhevoichuho(qhevschuho);

            record.setThoigian(new java.sql.Date(new Date().getTime()));
            lichsuthaydoiRepository.save(record);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public boolean addtamtrutamvang(String status, String address, String note, String cccd, int hokhauid) {
        try {
            Nhankhau nhankhau = nhankhauRepository.findByCccd(cccd);
            Hokhau hokhau = hokhauRepository.findById(hokhauid).orElse(null);
            if (nhankhau == null || hokhau == null) return false;
            Tamtrutamvang record = Tamtrutamvang.builder()
                    .nhankhau(nhankhau)
                    .trangthai(status)
                    .diachitamtrutamvang(address)
                    .noidungdenghi(note)
                    .thoigian(new java.sql.Date(new Date().getTime()))
                    .build();
            tamtrutamvangRepository.save(record);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public boolean updateTamtrutamvang(int id, String status, String address, String note, String cccd) {
        try {
            if (id == 0) return false;
            Tamtrutamvang record = tamtrutamvangRepository.findById(id).orElse(null);
            if (record == null) return false;

            if (cccd != null && !cccd.isEmpty()) {
                Nhankhau nhankhau = nhankhauRepository.findByCccd(cccd);
                if (nhankhau == null) return false;
                record.setNhankhau(nhankhau);
            }
            if (status != null && !status.isEmpty()) record.setTrangthai(status);
            if (address != null && !address.isEmpty()) record.setDiachitamtrutamvang(address);
            if (note != null && !note.isEmpty()) record.setNoidungdenghi(note);

            record.setThoigian(new java.sql.Date(new Date().getTime()));
            tamtrutamvangRepository.save(record);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}