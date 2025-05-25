package KTPM.example.BlueMoon.controller;

import KTPM.example.BlueMoon.model.Hokhau;
import KTPM.example.BlueMoon.model.Khoanthu;
import KTPM.example.BlueMoon.repository.UserRepository;
import KTPM.example.BlueMoon.service.*;
import jdk.jfr.Frequency;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.text.SimpleDateFormat;

@RestController
@RequestMapping("/ketoan")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ketoanController {
    private final hokhauService hkService;
    private final khoanthuService ktService;

    @PostMapping("addkhoanthu")
    public ResponseEntity<Map<String, Object>> addkhoanthu(@RequestBody Map<String, String> request){
        Map<String, Object> response = new HashMap<>();
        try {
            Date thoihan = new SimpleDateFormat("dd-MM-yyyy").parse(request.get("thoihan"));

            String tenkhoanthu = request.get("tenkhoanthu"); // lấy tên khoản thu
            String ghichu = request.get("ghichu"); // lấy ghichu
            int tinhchat = Integer.parseInt(request.get("tinhchat")); //lay tinhchat (1 bắt buộc, 2 tựnguyeenjn)
            Khoanthu newkhoanthu = ktService.addkhoanthu( thoihan, tenkhoanthu, ghichu, tinhchat);
            if(newkhoanthu != null){
                List<Map<String, Object>> hokhaus = hkService.getListhokhau();
                response.put("khoanthu",newkhoanthu);
                response.put("listhokhau",hokhaus);
                return ResponseEntity.ok(response);
            }
            response.put("message","fail to add khoanthu");
            return ResponseEntity.status(400).body(response);
        } catch (Exception e) {
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("updatekhoanthu")
    public ResponseEntity<Map<String, Object>> updatekhoanthu(@RequestBody Map<String, String> request){
        Map<String, Object> response = new HashMap<>();
        try {
            int khoanthu_id = Integer.parseInt(request.get("khoanthu_id"));
            Date thoihan = new SimpleDateFormat("dd-MM-yyyy").parse(request.get("thoihan"));
            String tenkhoanthu = request.get("tenkhoanthu"); // lấy tên khoản thu
            String ghichu = request.get("ghichu"); // lấy ghichu
            if(ktService.updatekhoanthu( khoanthu_id,thoihan, tenkhoanthu, ghichu)){
                response.put("message","update success");
                return ResponseEntity.ok(response);
            }
            response.put("message","fail to add khoanthu");
            return ResponseEntity.status(400).body(response);
        } catch (Exception e) {
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/deletekhoanthu")
    public ResponseEntity<Map<String, Object>> deletekhoanthu(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            int khoanthu_id = Integer.parseInt(request.get("khoanthu_id"));
            boolean deleted = ktService.deletekhoanthu(khoanthu_id);
            if (deleted) {
                response.put("message", "Delete success");
                return ResponseEntity.ok(response);
            } else {
                response.put("message", "Khoản thu không tồn tại");
                return ResponseEntity.status(400).body(response);
            }
        } catch (Exception e) {
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/getListKhoanthu") //chỉ tổ trưởng
    public ResponseEntity<Map<String, Object>> getListKhoanthu() {
        Map<String, Object> response = new HashMap<>();
        try {
            response.put("status", "success");
            response.put("listkhoanthu", ktService.getListkhoanthu());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
