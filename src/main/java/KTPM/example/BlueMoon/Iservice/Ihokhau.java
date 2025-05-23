package KTPM.example.BlueMoon.Iservice;

import java.util.Date;
import java.util.List;
import java.util.Map;

public interface Ihokhau {
    public Map<String,Object> gethokhau(int hokhau_id);
    public boolean addhokhau(int sothanhvien, String sonha, String duong, String phuong, String quan, Date ngaylamhokhau, Date ngaythemnhankhau, String quanhevoichuho);
    public boolean updatehokhau(int hokhau_id,int sothanhvien, String sonha, String duong, String phuong, String quan, Date ngaylamhokhau, Date ngaythemnhankhau, String quanhevoichuho);

}
