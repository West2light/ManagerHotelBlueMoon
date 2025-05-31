package KTPM.example.BlueMoon.Iservice;

import KTPM.example.BlueMoon.model.Khoanthu;

import java.util.Date;
import java.util.List;
import java.util.Map;

public interface Ikhoanthu {
    Khoanthu addkhoanthu(Date thoihan, String tenkhoanthu, String ghichu, int tinhchat);
    boolean updatekhoanthu(int khoanthu_id, Date thoihan, String tenkhoanthu, String ghichu);
    boolean deletekhoanthu(int khoanthu_id);
    List<Map<String, Object>> getListkhoanthu();
}
