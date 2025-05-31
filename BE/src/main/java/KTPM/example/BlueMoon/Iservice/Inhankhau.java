package KTPM.example.BlueMoon.Iservice;


import java.sql.Date;
import java.util.List;
import java.util.Map;

public interface Inhankhau {

    //thêm
    boolean addNhanKhau(String name, Date dob, boolean gioitinh, String dantoc, String tongiao,String cccd,Date ngaycap, String noicap, String nghenghiep,String ghichu,int hokhauID);

    // sửa
    boolean updateNhanKhau(int nhankhauID,String name, Date dob, boolean gioitinh, String dantoc, String tongiao,String cccd,Date ngaycap, String noicap, String nghenghiep,String ghichu,int hokhauID);

    //xoa
    void deleteNhanKhauID(int nhankhauID);

    //tìm
    Map<String,Object> getnhankhauBycccd(String cccd);
    Map<String,Object> getnhankhauBycccdAndhokhau(int hokhauId, String cccd);
    Map<String,Object> getnhankhauBycccdAndname(String cccd, String name);
    Map<String,Object> getnhankhauByhokhauAndname(int hokhauId, String name);
    Map<String,Object> getnhankhauByhokhauAndcccdAndName(int hokhauId, String cccd,String name);
    List<Map<String,Object>> getnhankhauByhokhau(int hokhauId);
    List<Map<String,Object>> getnhankhauByname(String name);
    List<Map<String,Object>> getnhankhau();
}
