package KTPM.example.BlueMoon.Iservice;

public interface Itamtrutamvang {
    boolean addlichsuthaydoi(int loaithaydoi, int hokhauid, String cccd, String qhevschuho);
    boolean updateLichsuthaydoi(int id, int loaithaydoi, String cccd, String qhevschuho);

    boolean addtamtrutamvang(String status, String address, String note, String cccd, int hokhauid);
    boolean updateTamtrutamvang(int id, String status, String address, String note, String cccd);
}