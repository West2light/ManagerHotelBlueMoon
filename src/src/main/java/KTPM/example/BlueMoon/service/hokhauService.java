package KTPM.example.BlueMoon.service;

import KTPM.example.BlueMoon.Iservice.Ihokhau;
import KTPM.example.BlueMoon.model.Role;
import KTPM.example.BlueMoon.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import KTPM.example.BlueMoon.repository.hokhauRepository;
import KTPM.example.BlueMoon.model.Hokhau;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class hokhauService implements Ihokhau {

    @Autowired
    private hokhauRepository hokhauRepository;

    @Override
    public Map<String,Object> gethokhau(int hokhau_id){
        Hokhau hokhau= hokhauRepository.findByHokhauid(hokhau_id);
        if(hokhau==null) return null;
        Map<String,Object> hokhauchoice = Map.of(
                "hokhau_id",hokhau.getHokhauid(),
                "sothanhvien",hokhau.getSothanhvien()
        );
        return hokhauchoice;
    }

    @Override
    public boolean addhokhau(int sothanhvien, String sonha, String duong, String phuong, String quan, Date ngaylamhokhau, Date ngaythemnhankhau, String quanhevoichuho){
        if(sothanhvien != 0 && sonha != null && duong != null && phuong != null && quan != null && ngaylamhokhau != null && ngaythemnhankhau != null) {
            Hokhau hokhau= Hokhau.builder()
                    .sothanhvien(sothanhvien)
                    .sonha(sonha)
                    .duong(duong)
                    .phuong(phuong)
                    .quan(quan)
                    .ngaylamhokhau(ngaylamhokhau)
                    .ngaythemnhankhau(ngaythemnhankhau)
                    .quanhevoichuho(quanhevoichuho)
                    .build();
            hokhauRepository.save(hokhau);
            return true;
        }
        return false;
    }

    @Override
    public boolean updatehokhau(int hokhau_id,int sothanhvien, String sonha, String duong, String phuong, String quan, Date ngaylamhokhau, Date ngaythemnhankhau, String quanhevoichuho){
        if(hokhau_id != 0 && sothanhvien != 0 && sonha != null && duong != null && phuong != null && quan != null && ngaylamhokhau != null && ngaythemnhankhau != null) {
            Hokhau hokhau = hokhauRepository.findByHokhauid(hokhau_id);
            if(hokhau != null){
                hokhau.setSothanhvien(sothanhvien);
                hokhau.setSonha(sonha);
                hokhau.setDuong(duong);
                hokhau.setQuan(quan);
                hokhau.setPhuong(phuong);
                hokhau.setNgaylamhokhau(ngaylamhokhau);
                hokhau.setNgaythemnhankhau(ngaythemnhankhau);
                hokhau.setQuanhevoichuho(quanhevoichuho);
                hokhauRepository.save(hokhau);
                return true;
            }

        }
        return false;
    }


}
