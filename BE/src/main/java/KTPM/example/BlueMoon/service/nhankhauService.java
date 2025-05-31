package KTPM.example.BlueMoon.service;

import KTPM.example.BlueMoon.Iservice.Inhankhau;
import KTPM.example.BlueMoon.model.Hokhau;
import KTPM.example.BlueMoon.model.Nhankhau;
import KTPM.example.BlueMoon.repository.hokhauRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import KTPM.example.BlueMoon.repository.nhankhauRepository;

import java.util.*;

@Service
@RequiredArgsConstructor
public class nhankhauService implements Inhankhau {

    @Autowired
    private nhankhauRepository nhankhauRepository;

    @Autowired
    private hokhauRepository hokhauRepository;


    @Override
    public boolean addNhanKhau(String name, Date dob, boolean gioitinh, String dantoc, String tongiao, String cccd, Date ngaycap, String noicap, String nghenghiep, String ghichu, int hokhauID) {
        Hokhau hokhau = hokhauRepository.findByHokhauid(hokhauID);
        if(hokhau == null){
            return false;
        }
        Nhankhau nhankhau = Nhankhau.builder()
                .hoten(name)
                .dantoc(dantoc)
                .ngaysinh(dob)
                .ghichu(ghichu)
                .hokhau(hokhau)
                .cccd(cccd)
                .gioitinh(gioitinh)
                .nghenghiep(nghenghiep)
                .ngaycap(ngaycap)
                .noicap(noicap)
                .tongiao(tongiao)
                .build();
        nhankhauRepository.save(nhankhau);
        return true;
    }

    @Override
    public boolean updateNhanKhau(int nhankhauID, String name, Date dob, boolean gioitinh, String dantoc, String tongiao, String cccd, Date ngaycap, String noicap, String nghenghiep, String ghichu, int hokhauID) {
        Hokhau hokhau = hokhauRepository.findByHokhauid(hokhauID);
        if(hokhau == null){
            return false;
        }
        Nhankhau nhankhau = nhankhauRepository.findByNhankhauid(nhankhauID);
        if (nhankhau != null) {

            nhankhau.setHoten(name);
            nhankhau.setNgaysinh(dob);
            nhankhau.setGioitinh(gioitinh);
            nhankhau.setDantoc(dantoc);
            nhankhau.setTongiao(tongiao);
            nhankhau.setCccd(cccd);
            nhankhau.setNgaycap(ngaycap);
            nhankhau.setNoicap(noicap);
            nhankhau.setNghenghiep(nghenghiep);
            nhankhau.setGhichu(ghichu);
            nhankhau.setHokhau(hokhau);

            nhankhauRepository.save(nhankhau);
            return true;
        } else {
            return false; // Không tìm thấy nhân khẩu
        }
    }

    @Override
    public void deleteNhanKhauID(int nhankhauID) {
    nhankhauRepository.deleteById(nhankhauID);
    }

    @Override
    public Map<String,Object> getnhankhauBycccd(String cccd) {
        Nhankhau nhankhau = nhankhauRepository.findByCccd(cccd);
        if (nhankhau == null) {
            return null;
        }
        Map<String,Object> response = new HashMap<>();
        response.put("hokhauid", nhankhau.getHokhau().getHokhauid());
        response.put("hoten", nhankhau.getHoten());
        response.put("ngaysinh", nhankhau.getNgaysinh());
        response.put("gioitinh", nhankhau.isGioitinh());
        response.put("dantoc", nhankhau.getDantoc());
        response.put("tongiao", nhankhau.getTongiao());
        response.put("cccd", nhankhau.getCccd());
        response.put("ngaycap", nhankhau.getNgaycap());
        response.put("noicap", nhankhau.getNoicap());
        response.put("nghenghiep", nhankhau.getNghenghiep());
        response.put("ghichu", nhankhau.getGhichu());
        return response;
    }

    @Override
    public Map<String, Object> getnhankhauBycccdAndhokhau(int hokhauId, String cccd) {
        Nhankhau nhankhau = nhankhauRepository.findByHokhau_HokhauidAndCccd(hokhauId, cccd);
        if (nhankhau == null) {
            return null;
        }
        Map<String, Object> response = new HashMap<>();
        response.put("hokhauid", nhankhau.getHokhau().getHokhauid());
        response.put("hoten", nhankhau.getHoten());
        response.put("ngaysinh", nhankhau.getNgaysinh());
        response.put("gioitinh", nhankhau.isGioitinh());
        response.put("dantoc", nhankhau.getDantoc());
        response.put("tongiao", nhankhau.getTongiao());
        response.put("cccd", nhankhau.getCccd());
        response.put("ngaycap", nhankhau.getNgaycap());
        response.put("noicap", nhankhau.getNoicap());
        response.put("nghenghiep", nhankhau.getNghenghiep());
        response.put("ghichu", nhankhau.getGhichu());
        return response;
    }

    @Override
    public Map<String, Object> getnhankhauBycccdAndname(String cccd, String name) {
        Nhankhau nhankhau = nhankhauRepository.findByCccdAndHoten(cccd, name);
        if (nhankhau == null) {
            return null;
        }
        Map<String, Object> response = new HashMap<>();
        response.put("hokhauid", nhankhau.getHokhau().getHokhauid());
        response.put("hoten", nhankhau.getHoten());
        response.put("ngaysinh", nhankhau.getNgaysinh());
        response.put("gioitinh", nhankhau.isGioitinh());
        response.put("dantoc", nhankhau.getDantoc());
        response.put("tongiao", nhankhau.getTongiao());
        response.put("cccd", nhankhau.getCccd());
        response.put("ngaycap", nhankhau.getNgaycap());
        response.put("noicap", nhankhau.getNoicap());
        response.put("nghenghiep", nhankhau.getNghenghiep());
        response.put("ghichu", nhankhau.getGhichu());
        return response;
    }

    @Override
    public Map<String, Object> getnhankhauByhokhauAndname(int hokhauId, String name) {
        Nhankhau nhankhau = nhankhauRepository.findByHokhau_HokhauidAndHoten(hokhauId, name);
        if (nhankhau == null) {
            return null;
        }
        Map<String, Object> response = new HashMap<>();
        response.put("hokhauid", nhankhau.getHokhau().getHokhauid());
        response.put("hoten", nhankhau.getHoten());
        response.put("ngaysinh", nhankhau.getNgaysinh());
        response.put("gioitinh", nhankhau.isGioitinh());
        response.put("dantoc", nhankhau.getDantoc());
        response.put("tongiao", nhankhau.getTongiao());
        response.put("cccd", nhankhau.getCccd());
        response.put("ngaycap", nhankhau.getNgaycap());
        response.put("noicap", nhankhau.getNoicap());
        response.put("nghenghiep", nhankhau.getNghenghiep());
        response.put("ghichu", nhankhau.getGhichu());
        return response;
    }

    @Override
    public Map<String, Object> getnhankhauByhokhauAndcccdAndName(int hokhauId, String cccd, String name) {
        Nhankhau nhankhau = nhankhauRepository.findByHokhau_HokhauidAndCccdAndHoten(hokhauId, cccd, name);
        if (nhankhau == null) {
            return null;
        }
        Map<String, Object> response = new HashMap<>();
        response.put("hokhauid", nhankhau.getHokhau().getHokhauid());
        response.put("hoten", nhankhau.getHoten());
        response.put("ngaysinh", nhankhau.getNgaysinh());
        response.put("gioitinh", nhankhau.isGioitinh());
        response.put("dantoc", nhankhau.getDantoc());
        response.put("tongiao", nhankhau.getTongiao());
        response.put("cccd", nhankhau.getCccd());
        response.put("ngaycap", nhankhau.getNgaycap());
        response.put("noicap", nhankhau.getNoicap());
        response.put("nghenghiep", nhankhau.getNghenghiep());
        response.put("ghichu", nhankhau.getGhichu());
        return response;
    }

    @Override
    public List<Map<String, Object>> getnhankhauByhokhau(int hokhauId) {
        List<Nhankhau> nhankhaus = nhankhauRepository.findByHokhau_Hokhauid(hokhauId);
        if (nhankhaus == null || nhankhaus.isEmpty()) {
            return null;
        }
        List<Map<String, Object>> listnhankhau = new ArrayList<>();
        for (Nhankhau nhankhau : nhankhaus) {
            Map<String, Object> response = new HashMap<>();
            response.put("hokhauid", nhankhau.getHokhau().getHokhauid());
            response.put("hoten", nhankhau.getHoten());
            response.put("ngaysinh", nhankhau.getNgaysinh());
            response.put("gioitinh", nhankhau.isGioitinh());
            response.put("dantoc", nhankhau.getDantoc());
            response.put("tongiao", nhankhau.getTongiao());
            response.put("cccd", nhankhau.getCccd());
            response.put("ngaycap", nhankhau.getNgaycap());
            response.put("noicap", nhankhau.getNoicap());
            response.put("nghenghiep", nhankhau.getNghenghiep());
            response.put("ghichu", nhankhau.getGhichu());
            listnhankhau.add(response);
        }
        return listnhankhau;
    }

    @Override
    public List<Map<String, Object>> getnhankhauByname(String name) {
        List<Nhankhau> nhankhaus = nhankhauRepository.findByHoten(name);
        if (nhankhaus == null || nhankhaus.isEmpty()) {
            return null;
        }
        List<Map<String, Object>> listnhankhau = new ArrayList<>();
        for (Nhankhau nhankhau : nhankhaus) {
            Map<String, Object> response = new HashMap<>();
            response.put("hokhauid", nhankhau.getHokhau().getHokhauid());
            response.put("hoten", nhankhau.getHoten());
            response.put("ngaysinh", nhankhau.getNgaysinh());
            response.put("gioitinh", nhankhau.isGioitinh());
            response.put("dantoc", nhankhau.getDantoc());
            response.put("tongiao", nhankhau.getTongiao());
            response.put("cccd", nhankhau.getCccd());
            response.put("ngaycap", nhankhau.getNgaycap());
            response.put("noicap", nhankhau.getNoicap());
            response.put("nghenghiep", nhankhau.getNghenghiep());
            response.put("ghichu", nhankhau.getGhichu());
            listnhankhau.add(response);
        }
        return listnhankhau;
    }

    @Override
    public List<Map<String, Object>> getnhankhau() {
        List<Nhankhau> nhankhaus = nhankhauRepository.findAll();
        if (nhankhaus == null || nhankhaus.isEmpty()) {
            return null;
        }
        List<Map<String, Object>> listnhankhau = new ArrayList<>();
        for (Nhankhau nhankhau : nhankhaus) {
            Map<String, Object> response = new HashMap<>();
            response.put("hokhauid", nhankhau.getHokhau().getHokhauid());
            response.put("hoten", nhankhau.getHoten());
            response.put("ngaysinh", nhankhau.getNgaysinh());
            response.put("gioitinh", nhankhau.isGioitinh());
            response.put("dantoc", nhankhau.getDantoc());
            response.put("tongiao", nhankhau.getTongiao());
            response.put("cccd", nhankhau.getCccd());
            response.put("ngaycap", nhankhau.getNgaycap());
            response.put("noicap", nhankhau.getNoicap());
            response.put("nghenghiep", nhankhau.getNghenghiep());
            response.put("ghichu", nhankhau.getGhichu());
            listnhankhau.add(response);
        }
        return listnhankhau;
    }
}
