package KTPM.example.BlueMoon.service;

import KTPM.example.BlueMoon.Iservice.Ihokhau;
import KTPM.example.BlueMoon.model.Nhankhau;
import KTPM.example.BlueMoon.model.Role;
import KTPM.example.BlueMoon.model.User;
import KTPM.example.BlueMoon.repository.nhankhauRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import KTPM.example.BlueMoon.repository.hokhauRepository;
import KTPM.example.BlueMoon.model.Hokhau;

import java.util.*;

@Service
@RequiredArgsConstructor
public class hokhauService implements Ihokhau {

    @Autowired
    private hokhauRepository hokhauRepository;
    @Autowired
    private nhankhauRepository nhankhauRepository;

    @Override
    public Map<String, Object> gethokhau(int hokhau_id) {
        Hokhau hokhau = hokhauRepository.findByHokhauid(hokhau_id);
        List<Nhankhau> listnhankhau = nhankhauRepository.findByHokhau_Hokhauid(hokhau_id);
        if (hokhau != null) {
            Map<String, Object> newhokhau = new HashMap<>();
            newhokhau.put("hokhauid", hokhau.getHokhauid());
            newhokhau.put("sothanhvien", hokhau.getSothanhvien());
            newhokhau.put("sonha", hokhau.getSonha());
            newhokhau.put("ngaylamhokhau", hokhau.getNgaylamhokhau());
            newhokhau.put("tenchuho", hokhau.getTenchuho());
            newhokhau.put("xemay", hokhau.getXemay());
            newhokhau.put("oto", hokhau.getOto());
            newhokhau.put("dientich", hokhau.getDientich());
            return newhokhau;
        }
        return null; // Trả về null nếu không tìm thấy hộ khẩu
    }

    @Override
    public List<Map<String, Object>> getListhokhau(){
        List<Hokhau> hokhaus= hokhauRepository.findAll();
        List<Map<String, Object>> listhokhau = new ArrayList<>();
        for (Hokhau hokhau : hokhaus) {
            Map<String, Object> lshokhau = new HashMap<>();
            lshokhau.put("hokhauid", hokhau.getHokhauid());
            lshokhau.put("sothanhvien", hokhau.getSothanhvien());
            lshokhau.put("duong", hokhau.getDuong());
            lshokhau.put("quan", hokhau.getQuan());
            lshokhau.put("phuong", hokhau.getPhuong());
            lshokhau.put("sonha", hokhau.getSonha());
            lshokhau.put("ngaylamhokhau", hokhau.getNgaylamhokhau());
            lshokhau.put("tenchuho", hokhau.getTenchuho());
            lshokhau.put("xemay", hokhau.getXemay());
            lshokhau.put("oto", hokhau.getOto());
            lshokhau.put("dientich", hokhau.getDientich());
            listhokhau.add(lshokhau);
        }
        return listhokhau;
    }

    @Override
    public boolean addhokhau(int sothanhvien, String sonha, String duong, String phuong, String quan, Date ngaylamhokhau, String tenchuho, int xemay, int oto, Double dientich){
        if(sothanhvien != 0 && sonha != null && duong != null && phuong != null && quan != null && ngaylamhokhau != null ) {
            Hokhau hokhau= Hokhau.builder()
                    .sothanhvien(sothanhvien)
                    .sonha(sonha)
                    .duong(duong)
                    .phuong(phuong)
                    .quan(quan)
                    .ngaylamhokhau(ngaylamhokhau)
                    .tenchuho(tenchuho)
                    .dientich(dientich)
                    .oto(oto)
                    .xemay(xemay)
                    .build();
            hokhauRepository.save(hokhau);
            return true;
        }
        return false;
    }

    @Override
    public boolean updatehokhau(int hokhau_id,int sothanhvien, String sonha, String duong, String phuong, String quan, Date ngaylamhokhau, String tenchuho, int xemay, int oto, Double dientich){
        if(hokhau_id != 0 && sothanhvien != 0 && sonha != null && duong != null && phuong != null && quan != null && ngaylamhokhau != null ) {
            Hokhau hokhau = hokhauRepository.findByHokhauid(hokhau_id);
            if(hokhau != null){
                hokhau.setSothanhvien(sothanhvien);
                hokhau.setSonha(sonha);
                hokhau.setDuong(duong);
                hokhau.setQuan(quan);
                hokhau.setPhuong(phuong);
                hokhau.setNgaylamhokhau(ngaylamhokhau);
                hokhau.setTenchuho(tenchuho);
                hokhau.setOto(oto);
                hokhau.setXemay(xemay);
                hokhau.setDientich(dientich);
                hokhauRepository.save(hokhau);
                return true;
            }

        }
        return false;
    }


}
