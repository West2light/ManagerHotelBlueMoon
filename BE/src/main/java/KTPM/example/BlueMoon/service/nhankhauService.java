package KTPM.example.BlueMoon.service;

import KTPM.example.BlueMoon.Iservice.Inhankhau;
import KTPM.example.BlueMoon.model.Hokhau;
import KTPM.example.BlueMoon.model.Nhankhau;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import KTPM.example.BlueMoon.repository.nhankhauRepository;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class nhankhauService implements Inhankhau {

    @Autowired
    private nhankhauRepository nhankhauRepository;

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
