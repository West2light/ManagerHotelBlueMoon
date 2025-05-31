package KTPM.example.BlueMoon.controller;

import KTPM.example.BlueMoon.service.hokhauService;
import KTPM.example.BlueMoon.service.nhankhauService;
import KTPM.example.BlueMoon.service.tamtrutamvangService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.*;
import java.sql.Date;

@RestController
@RequestMapping("/totruong")
@RequiredArgsConstructor
public class totruongController {

    private final hokhauService hkService;
    private final nhankhauService nkService;
    private final tamtrutamvangService tamtrutamvangService;

    @PostMapping("/addhokhau") //chỉ tổ trưởng
    public ResponseEntity<Map<String, Object>> addhokhau(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            int sothanhvien = Integer.parseInt(request.get("sothanhvien"));
            String sonha = request.get("sonha");
            String duong = request.get("duong");
            String phuong = request.get("phuong");
            String quan = request.get("quan");
            String ngaylamhokhauStr = request.get("ngaylamhokhau");  // ví dụ: "2024-05-22"
            SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy");
            Date ngaylamhokhau = (Date) sdf.parse(ngaylamhokhauStr);
            String tenchuho = request.get("tenchuho");
            int xemay = Integer.parseInt(request.get("xemay"));
            int oto = Integer.parseInt(request.get("oto"));
            Double dientich = Double.parseDouble(request.get("dientich"));

            if (hkService.addhokhau(sothanhvien, sonha, duong, phuong, quan, ngaylamhokhau, tenchuho, xemay, oto, dientich)) {
                response.put("status", "success");
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "fail");
                return ResponseEntity.status(400).body(response);
            }
        } catch (Exception e) {
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/updatehokhau")
    public ResponseEntity<Map<String, Object>> upadatehokhau(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            int hokhau_id = Integer.parseInt(request.get("hokhau_id"));
            int sothanhvien = Integer.parseInt(request.get("sothanhvien"));
            String sonha = request.get("sonha");
            String duong = request.get("duong");
            String phuong = request.get("phuong");
            String quan = request.get("quan");
            String ngaylamhokhauStr = request.get("ngaylamhokhau");  // ví dụ: "2024-05-22"
            SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy");
            Date ngaylamhokhau = (Date) sdf.parse(ngaylamhokhauStr);
            String tenchuho = request.get("tenchuho");
            int xemay = Integer.parseInt(request.get("xemay"));
            int oto = Integer.parseInt(request.get("oto"));
            Double dientich = Double.parseDouble(request.get("dientich"));

            if (hkService.updatehokhau(hokhau_id, sothanhvien, sonha, duong, phuong, quan, ngaylamhokhau, tenchuho, xemay, oto, dientich)) {
                response.put("status", "success");
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "fail");
                return ResponseEntity.status(400).body(response);
            }

        } catch (Exception e) {
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/gethokhau") //chỉ tổ trưởng
    public ResponseEntity<Map<String, Object>> getHokhau(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String hokhau_idStr = request.get("hokhau_id");

            if (hokhau_idStr == null || hokhau_idStr.trim().isEmpty()) {
                response.put("status", "success");
                response.put("listhokhau", hkService.getListhokhau());
                return ResponseEntity.ok(response);
            }

            int hokhau_id = Integer.parseInt(hokhau_idStr);
            response.put("status", "success");
            response.put("hokhau", hkService.gethokhau(hokhau_id));
            return ResponseEntity.ok(response);

        } catch (NumberFormatException e) {
            response.put("status", "fail");
            response.put("message", "Invalid hokhau_id format: " + e.getMessage());
            return ResponseEntity.status(400).body(response);
        } catch (Exception e) {
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/getNhankhau")
    public ResponseEntity<Map<String, Object>> getNhankhau(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Map<String, Object>> listnhankhau = new ArrayList<>();

            String hokhauidStr = request.get("hokhauid");
            Integer hokhauid = null;
            if (hokhauidStr != null && !hokhauidStr.trim().isEmpty()) {
                hokhauid = Integer.parseInt(hokhauidStr);
            }

            String cccd = request.get("cccd");
            String hoten = request.get("hoten");

            boolean ishokhauStrid = hokhauid != null;
            boolean iscccd = cccd != null && !cccd.trim().isEmpty();
            boolean ishoten = hoten != null && !hoten.trim().isEmpty();

            if (ishokhauStrid) {
                listnhankhau = nkService.getnhankhauByhokhau(hokhauid);
            } else if (iscccd) {
                listnhankhau.add(nkService.getnhankhauBycccd(cccd));
            } else if (ishoten) {
                listnhankhau = nkService.getnhankhauByname(hoten);
            } else if (ishokhauStrid && iscccd) {
                listnhankhau.add(nkService.getnhankhauBycccdAndhokhau(hokhauid, cccd));
            } else if (ishokhauStrid && ishoten) {
                listnhankhau.add(nkService.getnhankhauByhokhauAndname(hokhauid, hoten));
            } else if (iscccd && ishoten) {
                listnhankhau.add(nkService.getnhankhauBycccdAndname(cccd, hoten));
            } else if (ishokhauStrid && iscccd && ishoten) {
                listnhankhau.add(nkService.getnhankhauByhokhauAndcccdAndName(hokhauid, cccd, hoten));
            } else {
                listnhankhau = nkService.getnhankhau();
            }

            if (listnhankhau != null && !listnhankhau.isEmpty()) {
                response.put("status", "success");
                response.put("nhankhau", listnhankhau);
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "fail");
                return ResponseEntity.status(404).body(response);
            }
        } catch (NumberFormatException e) {
            response.put("status", "fail");
            response.put("message", "Invalid hokhauid format: " + e.getMessage());
            return ResponseEntity.status(400).body(response);
        } catch (Exception e) {
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/addNhanKhau")
    public ResponseEntity<Map<String, Object>> addNhanKhau(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try{
            //add bảng nhân khẩu
            String name = request.get("name");
            String dantoc = request.get("dantoc");
            String tongiao = request.get("tongiao");
            String cccd = request.get("cccd");
            String noicap = request.get("noicap");
            String nghenghiep = request.get("nghenghiep");
            String ghichu = request.get("ghichu");
            int hokhauID = Integer.parseInt(request.get("hokhauID"));
            boolean gioitinh = Boolean.parseBoolean(request.get("gioitinh"));
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            String dobStr = request.get("dob");
            Date dob = (Date) sdf.parse(dobStr); // Chuyển String -> Date

            String ngaycapStr = request.get("ngaycap");
            Date ngaycap = (Date) sdf.parse(ngaycapStr); // Chuyển String -> Date
        boolean add = nkService.addNhanKhau(name,dob,gioitinh,dantoc,tongiao,cccd,ngaycap,noicap,nghenghiep,ghichu,hokhauID);
        if(add){
            response.put("status","success");
            return ResponseEntity.ok(response);
        }
        else {
            response.put("status","fail");
            return ResponseEntity.status(400).body(response);
        }
        }catch (Exception e){
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    @PostMapping("/updateNhanKhau")
    public ResponseEntity<Map<String, Object>> updateNhanKhau(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try{
            int nhankhauID = Integer.parseInt(request.get("nhanKhauID"));
            String name = request.get("name");
            String dantoc = request.get("dantoc");
            String tongiao = request.get("tongiao");
            String cccd = request.get("cccd");
            String noicap = request.get("noicap");
            String nghenghiep = request.get("nghenghiep");
            String ghichu = request.get("ghichu");
            int hokhauID = Integer.parseInt(request.get("hokhauID"));
            boolean gioitinh = Boolean.parseBoolean(request.get("gioitinh"));
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            String dobStr = request.get("dob");
            Date dob = (Date) sdf.parse(dobStr); // Chuyển String -> Date

            String ngaycapStr = request.get("ngaycap");
            Date ngaycap = (Date) sdf.parse(ngaycapStr); // Chuyển String -> Date
            boolean update = nkService.updateNhanKhau(nhankhauID,name,dob,gioitinh,dantoc,tongiao,cccd,ngaycap,noicap,nghenghiep,ghichu,hokhauID);
            if(update){
                response.put("status","success");
                return ResponseEntity.ok(response);
            }
            else {
                response.put("status","fail");
                return ResponseEntity.status(400).body(response);
            }
        }catch (Exception e){
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    @DeleteMapping("/deleteNhanKhau/{nhankhauID}")
    public String deleteNhanKhau(@PathVariable int nhankhauID) {
        nkService.deleteNhanKhauID(nhankhauID);
        return "Delete Success";
    }

}
