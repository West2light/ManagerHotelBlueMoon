package KTPM.example.BlueMoon.controller;

import KTPM.example.BlueMoon.model.Hokhau;
import KTPM.example.BlueMoon.model.Khoanthu;
import KTPM.example.BlueMoon.model.Nhankhau;
import KTPM.example.BlueMoon.model.Pay;
import KTPM.example.BlueMoon.service.hokhauService;
import KTPM.example.BlueMoon.service.khoanthuService;
import KTPM.example.BlueMoon.service.payService;
import KTPM.example.BlueMoon.repository.PayRepository;
import KTPM.example.BlueMoon.repository.hokhauRepository;
import KTPM.example.BlueMoon.repository.khoanthuRepository;
import KTPM.example.BlueMoon.repository.nhankhauRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/ketoan")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ketoanController {
    private final hokhauService hkService;
    private final khoanthuService ktService;
    private final payService payService;
    private final PayRepository payRepository;
    private final khoanthuRepository ktRepository;
    private final hokhauRepository hkRepository;
    private final nhankhauRepository nkRepository;

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

    @PostMapping("addNopTien")
    public ResponseEntity<Map<String, Object>> addNopTien(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String ktIdStr = request.get("khoanthu_id");
            String nkIdStr = request.get("nhankhau_id");
            String ngaythuStr = request.get("ngaythu");
            String nguoinop = request.get("nguoinop");
            if (ktIdStr == null || ktIdStr.isBlank()) {
                response.put("message", "Vui lòng nhập khoản thu hợp lí!");
                return ResponseEntity.status(400).body(response);
            }
            if (nkIdStr == null || nkIdStr.isBlank()) {
                response.put("message", "Vui lòng nhập mã người đóng tiền hợp lí!");
                return ResponseEntity.status(400).body(response);
            }
            if (nguoinop == null || nguoinop.isBlank()) {
                response.put("message", "Vui lòng nhập tên người nộp!");
                return ResponseEntity.status(400).body(response);
            }
            int khoanthuId = Integer.parseInt(ktIdStr);
            int nhankhauId = Integer.parseInt(nkIdStr);
            if (payRepository.existsByKhoanthu_KhoanthuidAndNhankhau_Nhankhauid(khoanthuId, nhankhauId)) {
                response.put("message", "Người này đã từng nộp khoản phí này!");
                return ResponseEntity.status(400).body(response);
            }
            Date ngaythu = new SimpleDateFormat("dd-MM-yyyy").parse(ngaythuStr);
            Khoanthu kt = ktRepository.findByKhoanthuid(khoanthuId);
            Nhankhau nk = nkRepository.findById(nhankhauId).orElse(null);
            if (kt == null) {
                response.put("message", "Khoản thu không tồn tại");
                return ResponseEntity.status(400).body(response);
            }
            if (nk == null) {
                response.put("message", "Nhân khẩu không tồn tại");
                return ResponseEntity.status(400).body(response);
            }
            if (!nk.getHoten().equalsIgnoreCase(nguoinop)) {
                response.put("message", "Tên người nộp không khớp với nhân khẩu đã chọn");
                return ResponseEntity.status(400).body(response);
            }
            Float soTienInput = null;
            if (request.containsKey("sotien") && !request.get("sotien").isBlank()) {
                soTienInput = Float.parseFloat(request.get("sotien"));
            }
            boolean added = payService.addpay(nhankhauId, kt, ngaythu, nguoinop, soTienInput);
            if (!added) {
                response.put("message", "Nộp tiền thất bại");
                return ResponseEntity.status(400).body(response);
            }
            response.put("message", "Thêm nộp tiền thành công");
            return ResponseEntity.ok(response);
        } catch (NumberFormatException e) {
            response.put("message", "Dữ liệu đầu vào không hợp lệ");
            return ResponseEntity.status(400).body(response);
        } catch (Exception e) {
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/thongKe")
    public ResponseEntity<Map<String, Object>> thongKe() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Khoanthu> khoanthus = ktRepository.findAll();
            List<Pay> pays = payRepository.findAll();
            List<Hokhau> hokhaus = hkRepository.findAll();

            List<Map<String, Object>> result = new ArrayList<>();

            for (Khoanthu kt : khoanthus) {
                Map<Integer, List<Pay>> paysByHokhau = pays.stream()
                        .filter(p -> p.getKhoanthu().getKhoanthuid() == kt.getKhoanthuid())
                        .collect(Collectors.groupingBy(p -> p.getNhankhau().getHokhau().getHokhauid()));

                long tongSoTien = paysByHokhau.values().stream()
                        .flatMap(List::stream)
                        .mapToLong(Pay::getTien)
                        .sum();

                int soHoDaNop = paysByHokhau.keySet().size();

                List<Map<String, Object>> chiTietHo = new ArrayList<>();
                for (Map.Entry<Integer, List<Pay>> entry : paysByHokhau.entrySet()) {
                    int hokhauid = entry.getKey();
                    Hokhau hk = hokhaus.stream().filter(h -> h.getHokhauid() == hokhauid).findFirst().orElse(null);
                    Map<String, Object> hoInfo = new HashMap<>();
                    hoInfo.put("hokhauid", hokhauid);
                    hoInfo.put("tenChuHo", hk != null ? hk.getTenchuho() : "");
                    hoInfo.put("tongTienHoNop", entry.getValue().stream().mapToLong(Pay::getTien).sum());
                    hoInfo.put("dsNopTien", entry.getValue().stream().map(p -> {
                        Map<String, Object> tv = new HashMap<>();
                        tv.put("nhankhauid", p.getNhankhau().getNhankhauid());
                        tv.put("hoTen", p.getNguoinop());
                        tv.put("tien", p.getTien());
                        tv.put("ngaythu", p.getNgaythu());
                        return tv;
                    }).collect(Collectors.toList()));
                    chiTietHo.add(hoInfo);
                }

                List<Map<String, Object>> hoChuaNop = hokhaus.stream()
                        .filter(hk -> !paysByHokhau.containsKey(hk.getHokhauid()))
                        .map(hk -> {
                            Map<String, Object> m = new HashMap<>();
                            m.put("hokhauid", hk.getHokhauid());
                            m.put("tenChuHo", hk.getTenchuho());
                            return m;
                        }).collect(Collectors.toList());

                Map<String, Object> item = new HashMap<>();
                item.put("khoanthuid", kt.getKhoanthuid());
                item.put("tenKhoanThu", kt.getTenkhoanthu());
                item.put("thoihan", kt.getThoihan());
                item.put("ghichu", kt.getGhichu());
                item.put("tinhchat", kt.getTinhchat());
                item.put("tongSoTien", tongSoTien);
                item.put("soHoDaNop", soHoDaNop);
                item.put("chiTietHo", chiTietHo);
                item.put("hoChuaNop", hoChuaNop);

                result.add(item);
            }

            response.put("status", "success");
            response.put("data", result);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/traCuuThuPhi")
    public ResponseEntity<Map<String, Object>> traCuuThuPhi(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String hokhauIdStr = request.get("hokhauid");
            String khoanthuIdStr = request.get("khoanthuid");

            Integer hokhauid = (hokhauIdStr != null && !hokhauIdStr.isBlank()) ? Integer.parseInt(hokhauIdStr) : null;
            Integer khoanthuid = (khoanthuIdStr != null && !khoanthuIdStr.isBlank()) ? Integer.parseInt(khoanthuIdStr) : null;

            List<Hokhau> hokhaus;
            List<Khoanthu> khoanthus;

            if (hokhauid != null) {
                hokhaus = hkRepository.findAll().stream()
                        .filter(h -> h.getHokhauid() == hokhauid)
                        .collect(Collectors.toList());
            } else {
                hokhaus = hkRepository.findAll();
            }

            if (khoanthuid != null) {
                khoanthus = ktRepository.findAll().stream()
                        .filter(k -> k.getKhoanthuid() == khoanthuid)
                        .collect(Collectors.toList());
            } else {
                khoanthus = ktRepository.findAll();
            }

            List<Pay> pays = payRepository.findAll();

            List<Map<String, Object>> result = new ArrayList<>();

            for (Hokhau hk : hokhaus) {
                for (Khoanthu kt : khoanthus) {
                    List<Pay> paysForThis = pays.stream()
                            .filter(p -> p.getNhankhau().getHokhau().getHokhauid() == hk.getHokhauid()
                                    && p.getKhoanthu().getKhoanthuid() == kt.getKhoanthuid())
                            .collect(Collectors.toList());

                    Map<String, Object> item = new HashMap<>();
                    item.put("hokhauid", hk.getHokhauid());
                    item.put("tenChuHo", hk.getTenchuho());
                    item.put("khoanthuid", kt.getKhoanthuid());
                    item.put("tenKhoanThu", kt.getTenkhoanthu());

                    if (paysForThis.isEmpty()) {
                        item.put("dsNopTien", Collections.emptyList());
                        item.put("trangThai", "Chưa nộp");
                    } else {
                        item.put("dsNopTien", paysForThis.stream().map(p -> {
                            Map<String, Object> tv = new HashMap<>();
                            tv.put("nhankhauid", p.getNhankhau().getNhankhauid());
                            tv.put("hoTen", p.getNguoinop());
                            tv.put("tien", p.getTien());
                            tv.put("ngaythu", p.getNgaythu());
                            return tv;
                        }).collect(Collectors.toList()));
                        item.put("trangThai", "Đã nộp");
                    }
                    result.add(item);
                }
            }

            response.put("status", "success");
            response.put("data", result);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

}
