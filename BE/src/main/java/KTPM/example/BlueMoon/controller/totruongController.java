package KTPM.example.BlueMoon.controller;

import KTPM.example.BlueMoon.service.hokhauService;
import KTPM.example.BlueMoon.service.khoanthuService;
import KTPM.example.BlueMoon.service.payService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/totruong")
@RequiredArgsConstructor
public class totruongController {

    private final hokhauService hkService;
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
            Date ngaylamhokhau = sdf.parse(ngaylamhokhauStr);
            String tenchuho = request.get("tenchuho");
            int xemay = Integer.parseInt(request.get("xemay"));
            int oto = Integer.parseInt(request.get("oto"));
            Double dientich = Double.parseDouble(request.get("dientich"));

            if (hkService.addhokhau(sothanhvien, sonha, duong,phuong,quan, ngaylamhokhau, tenchuho,xemay,oto,dientich)) {
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
    public ResponseEntity<Map<String,Object>> upadatehokhau(@RequestBody Map<String, String> request){
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
            Date ngaylamhokhau = sdf.parse(ngaylamhokhauStr);
            String tenchuho = request.get("tenchuho");
            int xemay = Integer.parseInt(request.get("xemay"));
            int oto = Integer.parseInt(request.get("oto"));
            Double dientich = Double.parseDouble(request.get("dientich"));

            if (hkService.updatehokhau(hokhau_id,sothanhvien, sonha, duong,phuong,quan, ngaylamhokhau, tenchuho, xemay, oto, dientich)) {
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
        int hokhau_id = Integer.parseInt(request.get("hokhau_id"));
        if(hokhau_id == 0){
            response.put("status", "fail");
            return ResponseEntity.ok(response);
        }
        try {
            response.put("status", "success");
            response.put("hokhau", hkService.gethokhau(hokhau_id));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/getListhokhau") //chỉ tổ trưởng
    public ResponseEntity<Map<String, Object>> getListHokhau() {
        Map<String, Object> response = new HashMap<>();
        try {
            response.put("status", "success");
            response.put("listhokhau", hkService.getListhokhau());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
