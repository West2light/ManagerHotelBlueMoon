package KTPM.example.BlueMoon.controller;

import KTPM.example.BlueMoon.repository.UserRepository;
import KTPM.example.BlueMoon.service.userService;
import jdk.jfr.Frequency;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import KTPM.example.BlueMoon.repository.hokhauRepository;
import KTPM.example.BlueMoon.service.hokhauService;
import KTPM.example.BlueMoon.service.nhankhauService;


import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.text.SimpleDateFormat;

@RestController
@RequestMapping("/ketoan")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ketoanController {
    private final hokhauService hkService;

    private final hokhauRepository hkRepository;

   private final nhankhauService nkService;

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
            String ngaythemnhankhauStr = request.get("ngaythemnhankhau");  // ví dụ: "2024-05-22"
            SimpleDateFormat sdf2 = new SimpleDateFormat("dd-MM-yyyy");
            Date ngaythemnhankhau = sdf2.parse(ngaythemnhankhauStr);
            String quanhevoichuho = request.get("quanhevoichuho");

            if (hkService.addhokhau(sothanhvien, sonha, duong,phuong,quan, ngaylamhokhau, ngaythemnhankhau, quanhevoichuho)) {
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
            String ngaythemnhankhauStr = request.get("ngaythemnhankhau");  // ví dụ: "2024-05-22"
            SimpleDateFormat sdf2 = new SimpleDateFormat("dd-MM-yyyy");
            Date ngaythemnhankhau = sdf2.parse(ngaythemnhankhauStr);
            String quanhevoichuho = request.get("quanhevoichuho");

            if (hkService.updatehokhau(hokhau_id,sothanhvien, sonha, duong,phuong,quan, ngaylamhokhau, ngaythemnhankhau, quanhevoichuho)) {
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
}
