package KTPM.example.BlueMoon.Iservice;

import KTPM.example.BlueMoon.model.Hokhau;

import java.util.Date;
import java.util.List;
import java.util.Map;

public interface Ihokhau {
    Map<String, Object> gethokhau(int hokhau_id);
    List<Map<String, Object>> getListhokhau();
    boolean addhokhau(int sothanhvien, String sonha, String duong, String phuong, String quan, Date ngaylamhokhau, String tenchuho, int xemay, int oto, Double dientich);
    boolean updatehokhau(int hokhau_id,int sothanhvien, String sonha, String duong, String phuong, String quan, Date ngaylamhokhau, String tenchuho, int xemay, int oto, Double dientich);

}
